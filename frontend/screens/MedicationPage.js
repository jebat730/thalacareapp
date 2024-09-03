import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_BASE_URL } from 'react-native-dotenv';
import Icon from 'react-native-vector-icons/FontAwesome5';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment-timezone';
import * as Notifications from 'expo-notifications';
//sdsdssdssfs
const MedicationPage = () => {
  const [medications, setMedications] = useState([]);
  const [newMedication, setNewMedication] = useState({
    medID: null,
    medType: '',
    medColor: '#000000',
    medName: '',
    mealTiming: 'Before',
    dose: '',
    doseUnit: 'mg',
    medStartDate: new Date(),
    medEndDate: new Date(),
    medFrequency: '',
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedColorLabel, setSelectedColorLabel] = useState('Black');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [showTimePickerIndex, setShowTimePickerIndex] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(null);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [optionsVisible, setOptionsVisible] = useState(false);

  useEffect(() => {
    fetchMedications();
    configureNotifications();
  }, []);

  const configureNotifications = async () => {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permission required', 'Please grant notifications permissions to receive reminders.');
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  };

  const fetchMedications = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/medications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMedications(response.data);
    } catch (error) {
      console.error('Error fetching medications:', error);
      Alert.alert('Error', 'Failed to fetch medications. Please try again later.');
    }
  };

  const addMedication = async () => {
    if (
      !newMedication.medType ||
      !newMedication.medName ||
      !newMedication.dose ||
      !newMedication.medStartDate ||
      !newMedication.medEndDate ||
      !newMedication.medFrequency
    ) {
      Alert.alert('Error', 'Please fill out all fields before adding medication.');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    const startMoment = moment(newMedication.medStartDate);
    const endMoment = moment(newMedication.medEndDate);
    const frequency = parseInt(newMedication.medFrequency);

    if (endMoment.isBefore(startMoment)) {
      Alert.alert('Error', 'End date must be after start date.');
      return;
    }

    // Store the medication name before resetting the state
    const medName = newMedication.medName;

    if (newMedication.medID) {
      await axios.put(`${API_BASE_URL}/medications/${newMedication.medID}`, newMedication, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await axios.post(`${API_BASE_URL}/medications`, newMedication, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    setNewMedication({
      medID: null,
      medType: 'Capsule',
      medColor: '#000000',
      medName: '',
      mealTiming: 'Before',
      dose: '',
      doseUnit: 'mg',
      medStartDate: new Date(),
      medEndDate: new Date(),
      medFrequency: '',
    });

    scheduleReminders(startMoment, endMoment, frequency, medName);

    fetchMedications();
    setShowAddMedication(false);
  };

  const scheduleReminders = async (startMoment, endMoment, timeSlots, medName) => {
    let currentMoment = startMoment.clone();

    while (currentMoment.isSameOrBefore(endMoment)) {
      for (let i = 0; i < timeSlots.length; i++) {
        const reminderMoment = currentMoment.clone().set({
          hour: timeSlots[i].getHours(),
          minute: timeSlots[i].getMinutes(),
          second: 0,
        });

        console.log('Scheduling reminder for:', reminderMoment.toDate());

        // Log whether the scheduling function is being called
        console.log('Scheduling reminders...');

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Medication Reminder",
            body: `It's time to take your medication: ${medName}`,
            sound: 'default',
          },
          trigger: {
            date: reminderMoment.toDate(),
          },
        }).then(id => console.log('Notification scheduled with id:', id))
          .catch(error => console.error('Error scheduling notification:', error));

      }
      currentMoment.add(1, 'days');
    }

    Alert.alert('Reminders Scheduled', `Reminders for ${medName} have been scheduled.`);
  };

  const deleteMedication = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/medications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchMedications();
    } catch (error) {
      console.error('Error deleting medication:', error);
      Alert.alert('Error', 'Failed to delete medication. Please try again.');
    }
  };

  const editMedication = (medication) => {
    setNewMedication({
      medID: medication.medID,
      medType: medication.medType,
      medColor: medication.medColor,
      medName: medication.medName,
      mealTiming: medication.mealTiming,
      dose: medication.dose.toString(),
      doseUnit: medication.doseUnit,
      medStartDate: new Date(medication.medStartDate),
      medEndDate: new Date(medication.medEndDate),
      medFrequency: medication.medFrequency.toString(),
    });
    setShowAddMedication(true);
    setOptionsVisible(false); // Hide the options modal
  };

  const showOptions = (medicationID) => {
    setSelectedMedication(medicationID);
    setOptionsVisible(true);
  };

  const handleEdit = () => {
    const medication = medications.find(med => med.medID === selectedMedication);
    editMedication(medication);
  };

  const handleDelete = () => {
    deleteMedication(selectedMedication);
    setOptionsVisible(false); // Hide the options modal
  };

  const calculateTotalDoseIntake = (dose, frequency, startDate, endDate) => {
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);
    const daysDifference = endMoment.diff(startMoment, 'days') + 1; // Include both start and end days

    const totalDose = dose * frequency * daysDifference;

    return totalDose;
  };

  const renderMedications = () => {
    return medications.map((medication) => (
      <TouchableOpacity
        key={medication.medID}
        style={[styles.medicationContainer, { backgroundColor: medication.medColor }]}
        onPress={() => setSelectedMedication(medication.medID === selectedMedication ? null : medication.medID)}
      >
        <View style={styles.medicationHeader}>
          <Text style={styles.medicationName}>{medication.medName}</Text>
          <TouchableOpacity onPress={() => showOptions(medication.medID)} style={styles.moreOptionsButton}>
            <Icon name="ellipsis-v" size={20} color="#333" />
          </TouchableOpacity>
        </View>
        {medication.medID === selectedMedication && (
          <View style={styles.medicationDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailText}>{medication.medType}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Meal:</Text>
              <Text style={styles.detailText}>{medication.mealTiming}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Dose:</Text>
              <Text style={styles.detailText}>{medication.dose} {medication.doseUnit}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Start Date:</Text>
              <Text style={styles.detailText}>{formatDate(new Date(medication.medStartDate))}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>End Date:</Text>
              <Text style={styles.detailText}>{formatDate(new Date(medication.medEndDate))}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Frequency:</Text>
              <Text style={styles.detailText}>{medication.medFrequency} times a day</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Estimate Total Dose Intake:</Text>
              <Text style={styles.detailText}>
              {calculateTotalDoseIntake(medication.dose, parseInt(medication.medFrequency), new Date(medication.medStartDate), new Date(medication.medEndDate))} {medication.doseUnit}
            </Text>
          </View>
          </View>
        )}
      </TouchableOpacity>
    ));
  };

  const handleFrequencyChange = (itemValue) => {
    const frequency = parseInt(itemValue);
    setNewMedication({ ...newMedication, medFrequency: itemValue });

    // Create an array with the number of time slots equal to the frequency
    const slots = Array(frequency).fill(null).map(() => new Date());
    setTimeSlots(slots);
  };

  const handleTimeChange = (event, selectedDate, index) => {
    const currentDate = selectedDate || timeSlots[index];
    const newTimeSlots = [...timeSlots];
    newTimeSlots[index] = currentDate;

    // Convert the selected date to Kuala Lumpur timezone
    const klDateTime = moment(currentDate).tz('Asia/Kuala_Lumpur').toDate();

    setTimeSlots(newTimeSlots);

    // Close the time picker
    setShowTimePickerIndex(null); // Update the state to close the picker
  };

  const handleTimePickerCancel = () => {
    // Close the time picker when cancelled
    setShowTimePickerIndex(null); // Update the state to close the picker
  };

  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const formattedMonth = month < 10 ? `0${month}` : `${month}`;

    return `${formattedDay}/${formattedMonth}/${year}`;
  };

  const ColorPickerModal = () => {
    const colorOptions = [
      { color: '#FBF3D5', label: 'White' },
      { color: '#3C5B6F', label: 'Blue' },
      { color: '#FFFAB7', label: 'Yellow' },
      { color: '#4F6F52', label: 'Green' },
      { color: '#A34343', label: 'Red' },
      { color: '#FFC0CB', label: 'Pink' },
      { color: '#FFA500', label: 'Orange' },
      { color: '#912BBC', label: 'Purple' },
    ];


    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.colorPickerModal}>
            <Text style={styles.modalTitle}>Select Color</Text>
            <View style={styles.colorOptionsContainer}>
              {colorOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.colorOption}
                  onPress={() => {
                    setNewMedication({ ...newMedication, medColor: option.color });
                    setSelectedColorLabel(option.label);
                    setModalVisible(false);
                  }}
                  underlayColor="#CCC"
                >
                  <View style={styles.colorBoxContainer}>
                    <Text style={styles.colorLabel}>{option.label}</Text>
                    <View style={[styles.colorBox, { backgroundColor: option.color }]} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(!modalVisible)}
              style={styles.cancelButton}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Medication Records</Text>
        {!showAddMedication && (
          <TouchableOpacity
            onPress={() => setShowAddMedication(true)}
            style={styles.addButtonContainer}
          >
            <Text style={styles.addButtonLabel}>Add Medication</Text>
            <Icon name="plus-circle" size={20} color="#334257" />
          </TouchableOpacity>
        )}

        {showAddMedication && (
          <View>
            <Text style={styles.sectionLabel}>Medication Types</Text>
            <Picker
              selectedValue={newMedication.medType}
              onValueChange={(itemValue) => setNewMedication({ ...newMedication, medType: itemValue })}
              style={styles.picker}
            >
              <Picker.Item label="Capsule" value="Capsule" />
              <Picker.Item label="Tablet" value="Tablet" />
              <Picker.Item label="Liquid" value="Liquid" />
              <Picker.Item label="Injections" value="Injections" />
              <Picker.Item label="Powders" value="Powders" />
              <Picker.Item label="Sublingual Tablets" value="Sublingual Tablets" />
              <Picker.Item label="Other" value="Other" />
            </Picker>

            <Text style={styles.sectionLabel}>Medication Color</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.colorPickerButton}>
              <View style={[styles.colorBox, { backgroundColor: newMedication.medColor }]} />
              <Text>{selectedColorLabel}</Text>
            </TouchableOpacity>

            <Text style={styles.sectionLabel}>Medication Name</Text>
            <TextInput
              placeholder="Medication Name"
              value={newMedication.medName}
              onChangeText={(text) => setNewMedication({ ...newMedication, medName: text })}
              style={styles.textInput}
            />

            <Text style={styles.sectionLabel}>Meal Timing:</Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={[styles.radioButton, newMedication.mealTiming === 'Before' && styles.selectedRadioButton]}
                onPress={() => setNewMedication({ ...newMedication, mealTiming: 'Before' })}
              >
                <Text style={styles.radioButtonText}>Before</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioButton, newMedication.mealTiming === 'With' && styles.selectedRadioButton]}
                onPress={() => setNewMedication({ ...newMedication, mealTiming: 'With' })}
              >
                <Text style={styles.radioButtonText}>With</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioButton, newMedication.mealTiming === 'After' && styles.selectedRadioButton]}
                onPress={() => setNewMedication({ ...newMedication, mealTiming: 'After' })}
              >
                <Text style={styles.radioButtonText}>After</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>Medicine Dose</Text>
            <View style={styles.doseContainer}>
              <TextInput
                placeholder="Dose"
                value={newMedication.dose.toString()}
                onChangeText={(text) => setNewMedication({ ...newMedication, dose: text })}
                style={[styles.textInput, styles.doseInput]}
                keyboardType="numeric"
              />

              <Picker
                selectedValue={newMedication.doseUnit}
                onValueChange={(itemValue) => setNewMedication({ ...newMedication, doseUnit: itemValue })}
                style={[styles.picker, styles.unitDropdown]}
              >
                <Picker.Item label="mg" value="mg" />
                <Picker.Item label="mL" value="mL" />
                <Picker.Item label="g" value="g" />
                <Picker.Item label="UI" value="UI" />
                <Picker.Item label="mcg" value="mcg" />
                <Picker.Item label="mcg/ml" value="mcg/ml" />
                <Picker.Item label="mg/ml" value="mg/ml" />
                <Picker.Item label="mEq" value="mEq" />
                <Picker.Item label="mg/m" value="mg/m" />
                <Picker.Item label="%" value="%" />
              </Picker>
            </View>

            <Text style={styles.sectionLabel}>Start Date</Text>
            <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.datePickerButton}>
              <Text>{newMedication.medStartDate ? newMedication.medStartDate.toLocaleDateString() : 'Select Start Date'}</Text>
            </TouchableOpacity>

            {showStartDatePicker && (
              <DateTimePicker
                value={newMedication.medStartDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  const currentDate = selectedDate || newMedication.medStartDate;
                  setShowStartDatePicker(false);
                  setNewMedication({ ...newMedication, medStartDate: currentDate });
                }}
              />
            )}

            <Text style={styles.sectionLabel}>End Date</Text>
            <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.datePickerButton}>
              <Text>{newMedication.medEndDate ? newMedication.medEndDate.toLocaleDateString() : 'Select End Date'}</Text>
            </TouchableOpacity>

            {showEndDatePicker && (
              <DateTimePicker
                value={newMedication.medEndDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  const currentDate = selectedDate || newMedication.medEndDate;
                  setShowEndDatePicker(false);
                  setNewMedication({ ...newMedication, medEndDate: currentDate });
                }}
              />
            )}

            <Text style={styles.sectionLabel}>Frequency</Text>
            <Picker
              selectedValue={newMedication.medFrequency}
              onValueChange={handleFrequencyChange}
              style={styles.picker}
            >
              <Picker.Item label="1 time a day" value="1" />
              <Picker.Item label="2 times a day" value="2" />
              <Picker.Item label="3 times a day" value="3" />
              <Picker.Item label="4 times a day" value="4" />
              <Picker.Item label="5 times a day" value="5" />
              <Picker.Item label="6 times a day" value="6" />
              <Picker.Item label="7 times a day" value="7" />
              <Picker.Item label="8 times a day" value="8" />
              <Picker.Item label="9 times a day" value="9" />
            </Picker>

            {timeSlots.map((timeSlot, index) => (
              <View key={index}>
                <Text style={styles.sectionLabel}>Time Slot {index + 1}</Text>
                <TouchableOpacity onPress={() => setShowTimePickerIndex(index)} style={styles.datePickerButton}>
                  <Text>{timeSlot ? timeSlot.toLocaleTimeString() : 'Select Time'}</Text>
                </TouchableOpacity>
                {showTimePickerIndex === index && (
                  <DateTimePicker
                    value={timeSlot || new Date()}
                    mode="time"
                    display="default"
                    onChange={(event, selectedDate) => handleTimeChange(event, selectedDate, index)}
                    onCancel={handleTimePickerCancel} // Handle cancel event
                  />
                )}
              </View>
            ))}


            <TouchableOpacity onPress={addMedication} style={styles.actionButton}>
              <Text style={styles.buttonText}>Add Medication</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowAddMedication(false)} style={styles.cancelButton}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.medicationList}>
          <Text style={styles.sectionLabel}>Medications</Text>
          {renderMedications()}
        </View>

        <ColorPickerModal />
      </ScrollView>

      <Modal visible={optionsVisible} transparent={true} animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.optionsModal}>
            <TouchableOpacity onPress={handleEdit} style={styles.optionButton}>
              <Text style={styles.optionButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.optionButton}>
              <Text style={styles.optionButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOptionsVisible(false)} style={styles.optionButton}>
              <Text style={styles.optionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  addButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonLabel: {
    marginRight: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334257',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  textInput: {
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 10,
  },
  colorPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    marginRight: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  selectedRadioButton: {
    borderColor: '#334257',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  radioButtonText: {
    marginLeft: 5,
    color: '#333',
  },
  doseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  doseInput: {
    flex: 2,
  },
  picker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    marginBottom: 10,
  },
  unitDropdown: {
    flex: 1,
  },
  datePickerButton: {
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 10,
  },
  actionButton: {
    backgroundColor: '#334257',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#E74C3C',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  medicationList: {
    marginTop: 20,
  },
  medicationContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden', // Clip the overflow to hide details initially
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F0F0F0',
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  medicationDetails: {
    padding: 15,
    backgroundColor: '#FFFFFF',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  detailText: {
    flex: 1,
  },
  moreOptionsButton: {
    padding: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  colorPickerModal: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  colorOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  colorOption: {
    margin: 5,
  },
  colorBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorLabel: {
    marginRight: 10,
    color: '#333',
  },
  optionButton: {
    padding: 10,
    alignItems: 'center',
  },
  optionButtonText: {
    fontSize: 16,
    color: '#333',
  },
  optionsModal: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
});

export default MedicationPage;
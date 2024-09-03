import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_BASE_URL } from 'react-native-dotenv';
import Icon from 'react-native-vector-icons/FontAwesome5';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createChannel, scheduleNotification } from '../Medicine/NotificationService';

const MedicationReminderPage = () => {
  const [medications, setMedications] = useState([]);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    createChannel();
    fetchMedications();
  }, []);

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

  const setReminder = () => {
    if (!selectedMedication || !reminderDate) {
      Alert.alert('Error', 'Please select a medication and date.');
      return;
    }

    const message = `Time to take your medication: ${selectedMedication.medName}`;
    scheduleNotification(reminderDate, message);
    Alert.alert('Success', 'Reminder set successfully!');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Set Medication Reminder</Text>

        <Text style={styles.sectionLabel}>Select Medication</Text>
        <Picker
          selectedValue={selectedMedication}
          onValueChange={(itemValue) => setSelectedMedication(itemValue)}
          style={styles.picker}
        >
          {medications.map((medication) => (
            <Picker.Item key={medication.medID} label={medication.medName} value={medication} />
          ))}
        </Picker>

        <Text style={styles.sectionLabel}>Reminder Date and Time</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
          <Text>{reminderDate ? reminderDate.toLocaleString() : 'Select Date and Time'}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={reminderDate}
            mode="datetime"
            display="default"
            onChange={(event, selectedDate) => {
              const currentDate = selectedDate || reminderDate;
              setShowDatePicker(false);
              setReminderDate(currentDate);
            }}
          />
        )}

        <TouchableOpacity onPress={setReminder} style={styles.actionButton}>
          <Text style={styles.buttonText}>Set Reminder</Text>
        </TouchableOpacity>
      </ScrollView>
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
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  picker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    marginBottom: 10,
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
});

export default MedicationReminderPage;

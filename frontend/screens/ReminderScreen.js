import React, { useState, useEffect } from 'react';
import { View, FlatList, Alert, Modal, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from 'react-native-dotenv';
import moment from 'moment-timezone';
import { notificationService } from './NotificationService';
import { TextInput, Button, Text, Portal, Provider, FAB, Card, Avatar, IconButton, Menu } from 'react-native-paper';
//asasssdssdssd
const ReminderScreen = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [appointmentType, setAppointmentType] = useState('');
  const [notes, setNotes] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [token, setToken] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [visibleMenuId, setVisibleMenuId] = useState(null); // State to manage menu visibility for each appointment
  const [editingAppointment, setEditingAppointment] = useState(null); // State to track the appointment being edited

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        fetchAppointments(storedToken);
      } else {
        Alert.alert('Authentication Error', 'No token found, please log in.');
      }
    };
    fetchToken();
  }, []);

  const fetchAppointments = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch appointments: ' + error.message);
    }
  };

  const handleConfirm = (selectedDate) => {
    setDate(selectedDate);
    setDatePickerVisibility(false);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const saveAppointment = async () => {
    if (!token) {
      Alert.alert('Authentication Error', 'You must be logged in to set an appointment.');
      return;
    }
  
    const formattedDate = moment(date).tz('Asia/Kuala_Lumpur').format();
  
    try {
      if (editingAppointment) {
        await axios.put(`${API_BASE_URL}/appointments/${editingAppointment.appointmentID}`, {
          title,
          appointmentDate: formattedDate,
          appointmentType,
          notes
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        notificationService.scheduleNotification(title, `Reminder for ${title}`, date);
        Alert.alert('Success', 'Appointment updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/appointments`, {
          title,
          appointmentDate: formattedDate,
          appointmentType,
          notes
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        notificationService.scheduleNotification(title, `Reminder for ${title}`, date);
        Alert.alert('Success', 'Appointment saved successfully!');
      }
      setTitle('');
      setAppointmentType('');
      setNotes('');
      setDate(new Date());
      setModalVisible(false);
      fetchAppointments(token);
    } catch (error) {
      Alert.alert('Error', `Failed to save appointment: ${error.message}`);
    }
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setTitle(appointment.title);
    setAppointmentType(appointment.appointmentType);
    setNotes(appointment.notes);
    setDate(new Date(appointment.appointmentDate));
    setModalVisible(true);
  };

  const handleDeleteAppointment = async (appointmentID) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this appointment?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE_URL}/appointments/${appointmentID}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              fetchAppointments(token);
              Alert.alert('Success', 'Appointment deleted successfully!');
            } catch (error) {
              Alert.alert('Error', `Failed to delete appointment: ${error.message}`);
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  const renderItem = ({ item }) => {
    const isMenuVisible = visibleMenuId === item.appointmentID;
    const openMenu = () => setVisibleMenuId(item.appointmentID);
    const closeMenu = () => setVisibleMenuId(null);

    return (
      <View>
        <Card style={styles.card}>
          <Card.Title
            title={item.title}
            subtitle={`Date: ${moment(item.appointmentDate).tz('Asia/Kuala_Lumpur').format('LLLL')}`}
            left={(props) => <Avatar.Icon {...props} icon="calendar" color="#ffffff" style={{ backgroundColor: '#334257' }} />}
            right={() => (
              <Menu
                visible={isMenuVisible}
                onDismiss={closeMenu}
                anchor={<IconButton icon="dots-vertical" onPress={openMenu} />}
              >
                <Menu.Item onPress={() => handleEditAppointment(item)} title="Edit" />
                <Menu.Item onPress={() => handleDeleteAppointment(item.appointmentID)} title="Delete" />
              </Menu>
            )}
          />
          <Card.Content>
            <Text>Type: {item.appointmentType}</Text>
            <Text>Notes: {item.notes}</Text>
          </Card.Content>
        </Card>
      </View>
    );
  };

  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.heading}>Upcoming Appointments</Text>
        <FlatList
          data={appointments}
          renderItem={renderItem}
          keyExtractor={(item) => item.appointmentID.toString()}
          style={styles.appointmentsList}
        />
        <FAB
          style={styles.fab}
          small
          icon="plus"
          onPress={() => setModalVisible(true)}
        />
        <Portal>
          <Modal
            visible={isModalVisible}
            onDismiss={() => setModalVisible(false)}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalHeading}>Set Appointment Reminder</Text>
                <TextInput
                  label="Appointment Title"
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                />
                <Button mode="contained" onPress={showDatePicker} style={styles.datePickerButton}>
                  Pick Date and Time
                </Button>
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="datetime"
                  onConfirm={handleConfirm}
                  onCancel={hideDatePicker}
                />
                <TextInput
                  label="Appointment Type"
                  value={appointmentType}
                  onChangeText={setAppointmentType}
                  style={styles.input}
                />
                <TextInput
                  label="Notes"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  style={styles.input}
                />
                <Text style={styles.selectedDateText}>
                  {`Selected Date and Time: ${moment(date).tz('Asia/Kuala_Lumpur').format('LLLL')}`}
                </Text>
                <Button mode="contained" onPress={saveAppointment} style={styles.saveButton}>
                  Save Appointment
                </Button>
                <Button mode="text" onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  Close
                </Button>
              </View>
            </View>
          </Modal>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff', // Set the main background to white or any other color as needed
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#000000', // Black or another contrasting color for the heading
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#ffffff', // Keep input fields white for better readability
    color: '#000000', // Black text for inputs
  },
  datePickerButton: {
    marginBottom: 20,
    backgroundColor: '#334257', // Use the specified color for all buttons
    color: '#ffffff', // White text on buttons for readability
  },
  selectedDateText: {
    fontSize: 16,
    color: '#000000', // Black or another contrasting color for better visibility
    marginBottom: 20,
  },
  appointmentsList: {
    marginTop: 20,
  },
  card: {
    marginVertical: 10,
    elevation: 3,
    backgroundColor: 'white', // Use the specified color for all cards
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#334257', // Use the specified color for the Floating Action Button (FAB)
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay for modal
  },
  modalContainer: {
    width: '80%',
    padding: 30,
    backgroundColor: '#ffffff', // Keep modal background white or light for contrast
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeading: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#000000', 
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#334257', 
    color: '#ffffff' 
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: 'red', 
    color: '#ffffff' 
  },
});

export default ReminderScreen;

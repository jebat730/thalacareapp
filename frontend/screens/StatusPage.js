import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Switch, List } from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL } from 'react-native-dotenv';
///sdsdsassdsdsdsdsasasd
const StatusPage = () => {
  const [symptoms, setSymptoms] = useState({
    fatigue: false,
    weakness: false,
    breathShortness: false,
    paleSkin: false,
    jaundice: false
  });
  const [healthStatus, setHealthStatus] = useState('Healthy');
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchSymptomRecords();
  }, []);

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); 
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const evaluateHealthStatus = (symptoms) => {
    let score = 0;
    if (symptoms.fatigue) score += 1;
    if (symptoms.weakness) score += 1;
    if (symptoms.breathShortness) score += 2;
    if (symptoms.paleSkin) score += 1;
    if (symptoms.jaundice) score += 3;

    return score >= 5 ? "Severe" : score >= 3 ? "Moderate" : score > 0 ? "Mild" : "Healthy";
  };

  const fetchSymptomRecords = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'Authentication token not found');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/symptomRecords`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedRecords = response.data.map(record => ({
        ...record,
        date: formatDate(record.date),
        historyID: record.historyID
      }));
      setRecords(fetchedRecords);
    } catch (error) {
      console.error('Error fetching symptom records:', error);
      Alert.alert('Error', 'Failed to fetch symptom records. Please try again later.');
    }
  };

  const saveSymptomRecord = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'Authentication token not found');
      return;
    }

    const updatedHealthStatus = evaluateHealthStatus(symptoms);
    setHealthStatus(updatedHealthStatus);

    try {
      const formattedDate = getCurrentDate();
      const response = await axios.post(`${API_BASE_URL}/saveSymptoms`, {
        symptoms,
        measurement_date: formattedDate,
        health_status: updatedHealthStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const savedHealthStatus = response.data.health_status;
      setHealthStatus(savedHealthStatus);
      Alert.alert('Success', 'Symptom record saved successfully.');
      fetchSymptomRecords();
    } catch (error) {
      console.error('Error saving symptom record:', error);
      Alert.alert('Error', 'Failed to save symptom record. Please try again later.');
    }
  };

  const deleteSymptomRecord = async (historyId) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'Authentication token not found');
      return;
    }
  
  
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this record?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE_URL}/symptomRecords/${historyId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert('Success', 'Symptom record deleted successfully.');
              fetchSymptomRecords();
            } catch (error) {
              console.error('Error deleting symptom record:', error);
              Alert.alert('Error', 'Failed to delete symptom record. Please try again later.');
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Healthy': return 'green';
      case 'Mild': return 'orange';
      case 'Moderate': return '#FFD700';
      case 'Severe': return 'red';
      default: return 'black';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.fixedSection}>
        <Text style={styles.header}>How do you feel today?</Text>
        {Object.keys(symptoms).map((symptom, index) => (
          <List.Item
            key={index}
            title={symptom}
            right={() => (
              <Switch
                value={symptoms[symptom]}
                onValueChange={() => setSymptoms(prevState => ({ ...prevState, [symptom]: !prevState[symptom] }))}
              />
            )}
          />
        ))}
        <Button mode="contained" onPress={saveSymptomRecord} style={styles.button}>
          Save Record
        </Button>
      </View>
      <Text style={styles.header}>Symptom Records</Text>
      <ScrollView style={styles.scrollSection}>
        {records.map((record, index) => (
          <List.Item
            key={index}
            title={`Health Status: ${record.health_status}`}
            description={`Record Date: ${record.date}`}
            titleStyle={{ color: getStatusColor(record.health_status) }}
            right={() => (
              <Button
                onPress={() => deleteSymptomRecord(record.historyID)}
                mode="outlined"
                color="red"
                style={styles.deleteButton}
              >
                Delete
              </Button>
            )}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  fixedSection: {
    marginBottom: 20,
  },
  scrollSection: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    marginVertical: 10,
  },
  deleteButton: {
    marginTop: 10,
  },
});

export default StatusPage;

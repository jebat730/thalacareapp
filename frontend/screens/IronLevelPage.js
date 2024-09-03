import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { IconButton, Button } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { API_BASE_URL } from 'react-native-dotenv';
import { Swipeable } from 'react-native-gesture-handler';
//dsdssdsds
const IronLevelPage = () => {
  const [ironLevels, setIronLevels] = useState([]);
  const [newIronLevel, setNewIronLevel] = useState('');
  const [newMeasurementDate, setNewMeasurementDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editIronLevelData, setEditIronLevelData] = useState(null);

  useEffect(() => {
    fetchIronLevels();
  }, []);

  const fetchIronLevels = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/DisplayIron`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });
      setIronLevels(response.data);
    } catch (error) {
      console.error('Error fetching iron levels:', error);
      Alert.alert('Error', 'Failed to fetch iron levels. Please try again later.');
    }
  };

  const addIronLevel = async () => {
    if (!newIronLevel || !newMeasurementDate) {
      Alert.alert('Error', 'Please enter iron level and measurement date.');
      return;
    }

    const formattedDate = formatMeasurementDate(newMeasurementDate);

    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/AddIron`, {
        iron_level: parseFloat(newIronLevel),
        measurement_date: formattedDate,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });

      fetchIronLevels();
      setNewIronLevel('');
      setNewMeasurementDate(new Date());
      Alert.alert('Success', 'Iron level added successfully.');
    } catch (error) {
      console.error('Error adding iron level:', error);
      Alert.alert('Error', 'Failed to add iron level. Please try again later.');
    }
  };

  const formatMeasurementDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const confirmDelete = (iron_level_ID) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this iron level?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => deleteIronLevel(iron_level_ID) },
      ],
      { cancelable: false }
    );
  };

  const deleteIronLevel = async (iron_level_ID) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/DeleteIron/${iron_level_ID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });

      if (response.status === 200) {
        fetchIronLevels();
        Alert.alert('Success', 'Iron level deleted successfully.');
      } else {
        throw new Error('Failed to delete iron level');
      }
    } catch (error) {
      console.error('Error deleting iron level:', error);
      Alert.alert('Error', 'Failed to delete iron level. Please try again later.');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || newMeasurementDate;
    setShowDatePicker(false);
    setNewMeasurementDate(currentDate);
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const openEditForm = (iron_level_ID, iron_level, measurement_date) => {
    setEditIronLevelData({
      iron_level_ID,
      iron_level: iron_level.toString(),
      measurement_date: new Date(measurement_date),
    });
  };

  const handleEditIronLevel = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/EditIron/${editIronLevelData.iron_level_ID}`, {
        iron_level: parseFloat(editIronLevelData.iron_level),
        measurement_date: formatMeasurementDate(editIronLevelData.measurement_date),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });
      fetchIronLevels();
      Alert.alert('Success', 'Iron level updated successfully.');
      setEditIronLevelData(null);
    } catch (error) {
      console.error('Error updating iron level:', error);
      Alert.alert('Error', 'Failed to update iron level. Please try again later.');
    }
  };

  const handleCancel = () => {
    setEditIronLevelData(null);
  };

  const renderChart = () => {
    const chartData = {
      labels: ironLevels.map(item => new Date(item.measurement_date).toLocaleDateString()),
      datasets: [
        {
          data: ironLevels.map(item => item.iron_level),
          strokeWidth: 2,
        },
      ],
    };

    return (
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#334257',
          backgroundGradientFrom: '#334257',
          backgroundGradientTo: '#334257',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    );
  };

  const renderItem = ({ item }) => (
    <Swipeable
    renderLeftActions={() => (
      // Render edit button when swiping left
      <View style={styles.leftAction}>
        <IconButton icon="pencil" color="blue" size={24} onPress={() => openEditForm(item.iron_level_ID, item.iron_level, item.measurement_date)} />
      </View>
    )}
    renderRightActions={() => (
      // Render delete button when swiping right
      <View style={styles.rightAction}>
        <IconButton icon="delete" color="red" size={24} onPress={() => confirmDelete(item.iron_level_ID)} />
      </View>
    )}
    
    >
      <View style={styles.cardContainer}>
        <View style={styles.cardContent}>
          <Text style={styles.cardText}>Iron Level: {item.iron_level} mg/dL</Text>
          <Text style={styles.cardText}>Measurement Date: {new Date(item.measurement_date).toLocaleDateString()}</Text>
        </View>
      </View>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={ironLevels}
        renderItem={renderItem}
        keyExtractor={(item) => item.iron_level_ID.toString()}
        ListHeaderComponent={
          <>
            <Text style={styles.header}>Iron Level Records</Text>
            {ironLevels.length > 0 && renderChart()}
          </>
        }
      />
  
      {editIronLevelData && (
        <View style={styles.editFormContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Iron Level"
            value={editIronLevelData.iron_level}
            onChangeText={(text) => setEditIronLevelData({ ...editIronLevelData, iron_level: text })}
            keyboardType="numeric"
          />
          <TouchableOpacity onPress={showDatePickerModal}>
            <Text style={styles.datePickerText}>{editIronLevelData.measurement_date.toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={editIronLevelData.measurement_date}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={(event, selectedDate) => setEditIronLevelData({ ...editIronLevelData, measurement_date: selectedDate })}
            />
          )}
          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={handleEditIronLevel}>Save</Button>
            <Button mode="outlined" onPress={handleCancel}>Cancel</Button>
          </View>
        </View>
      )}
  
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Iron Level"
          value={newIronLevel}
          onChangeText={(text) => setNewIronLevel(text)}
          keyboardType="numeric"
        />
        <TouchableOpacity onPress={showDatePickerModal}>
          <Text style={styles.datePickerText}>{newMeasurementDate.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={newMeasurementDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={handleDateChange}
          />
        )}
        <Button mode="contained" onPress={addIronLevel}>Add Record</Button>
      </View>
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  cardContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    justifyContent: 'flex-end',
  },
  cardContent: {
    marginTop: 5,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  datePickerText: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  editFormContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  formContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
});

export default IronLevelPage;

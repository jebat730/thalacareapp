import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Button as PaperButton, IconButton } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { API_BASE_URL } from 'react-native-dotenv';
import { Swipeable } from 'react-native-gesture-handler';
//sdsasasdsddsdsd
const BloodTransfusion = () => {
  const [transfusions, setTransfusions] = useState([]);
  const [transfusionDate, setTransfusionDate] = useState(new Date());
  const [transfusionType, setTransfusionType] = useState('PRBC');
  const [transfusionQuantity, setTransfusionQuantity] = useState('');
  const [transfusionNote, setTransfusionNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransfusion, setEditingTransfusion] = useState(null);

  useEffect(() => {
    fetchTransfusions();
  }, []);

  const fetchTransfusions = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/transfusions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTransfusions(response.data);
    } catch (error) {
      console.error('Error fetching transfusions:', error);
    }
  };

  const handleAddTransfusion = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/transfusions`,
        {
          transfusion_date: transfusionDate.toISOString(),
          transfusion_type: transfusionType,
          transfusion_quantity: transfusionQuantity,
          note: transfusionNote,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      fetchTransfusions();
      resetForm();
      showAlert('Success', 'Transfusion record added successfully');
    } catch (error) {
      console.error('Error adding transfusion record:', error);
    }
  };

  const handleEditTransfusion = (transfusion) => {
    setTransfusionDate(new Date(transfusion.transfusion_date));
    setTransfusionType(transfusion.transfusion_type);
    setTransfusionQuantity(transfusion.transfusion_quantity);
    setTransfusionNote(transfusion.note);
    setEditingTransfusion(transfusion);
    setShowAddForm(true);
  };

  const handleEditSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/transfusions/${editingTransfusion.transfusion_ID}`,
        {
          transfusion_date: transfusionDate.toISOString(),
          transfusion_type: transfusionType,
          transfusion_quantity: transfusionQuantity,
          note: transfusionNote,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      fetchTransfusions();
      resetForm();
      showAlert('Success', 'Transfusion record edited successfully');
    } catch (error) {
      console.error('Error editing transfusion record:', error);
    }
  };

  const handleDeleteTransfusion = async (transfusion_ID) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/Deletetransfusion/${transfusion_ID}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        fetchTransfusions();
        showAlert('Success', 'Blood Transfusion deleted successfully.');
      } else {
        throw new Error('Failed to delete Blood Transfusion');
      }
    } catch (error) {
      console.error('Error deleting transfusion record:', error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || transfusionDate;
    setShowDatePicker(false);
    setTransfusionDate(currentDate);
  };

  const resetForm = () => {
    setTransfusionDate(new Date());
    setTransfusionType('PRBC');
    setTransfusionQuantity('');
    setTransfusionNote('');
    setEditingTransfusion(null);
    setShowAddForm(false);
  };

  const showAlert = (title, message) => {
    Alert.alert(title, message);
  };

  const renderChart = () => {
    const chartData = {
      labels: transfusions.map(item => new Date(item.transfusion_date).toLocaleDateString()),
      datasets: [
        {
          data: transfusions.map(item => item.transfusion_quantity),
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
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
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
        <View style={styles.leftAction}>
          <IconButton icon="pencil" onPress={() => handleEditTransfusion(item)} />
        </View>
      )}
      renderRightActions={() => (
        <View style={styles.rightAction}>
          <IconButton icon="delete" onPress={() => handleDeleteTransfusion(item.transfusion_ID)} />
        </View>
      )}
    >
      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, { width: '30%' }]}>{item.transfusion_date.slice(8, 10)}-{item.transfusion_date.slice(5, 7)}-{item.transfusion_date.slice(0, 4)}</Text>
        <Text style={[styles.tableCell, { width: '30%' }]}>{item.transfusion_type}</Text>
        <Text style={[styles.tableCell, { width: '20%' }]}>{item.transfusion_quantity}</Text>
        <Text style={[styles.tableCell, { width: '20%' }]}>{item.note}</Text>
      </View>
    </Swipeable>
  );

  const renderHeader = () => (
    <>
      <Text style={styles.heading}>Blood Transfusion Records</Text>
      {!showAddForm && (
        <View style={styles.addForm}>
          <PaperButton
            icon="plus"
            mode="contained"
            onPress={() => setShowAddForm(true)}
          >
            Add Transfusion
          </PaperButton>
        </View>
      )}
      {showAddForm && (
        <View style={styles.form}>
          <PaperButton mode="contained" onPress={() => setShowDatePicker(true)}>
            Select Transfusion Date
          </PaperButton>
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={transfusionDate}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={handleDateChange}
            />
          )}
          <Text style={styles.selectedDate}>Selected Date: {transfusionDate.getDate().toString().padStart(2, '0')}-{(transfusionDate.getMonth() + 1).toString().padStart(2, '0')}-{transfusionDate.getFullYear()}</Text>
          <Text style={styles.transfusionTypeLabel}>Transfusion Type:</Text>
          <Picker
            selectedValue={transfusionType}
            style={styles.picker}
            onValueChange={(itemValue) => setTransfusionType(itemValue)}
          >
            <Picker.Item label="Packed Red Blood Cell (PRBC)" value="PRBC" />
            <Picker.Item label="Leukoreduced Red Blood Cell Transfusions" value="Leukoreduced" />
            <Picker.Item label="Red Blood Cell Exchange Transfusion" value="Exchange" />
            <Picker.Item label="Directed Donor Blood Transfusion" value="Directed" />
          </Picker>
          <Text style={styles.transfusionTypeLabel}>Transfusion Quantity:</Text>
          <TextInput
            style={styles.input}
            placeholder="Transfusion Quantity"
            value={transfusionQuantity.toString()}
            onChangeText={setTransfusionQuantity}
            keyboardType="numeric"
          />
          <Text style={styles.transfusionTypeLabel}>Add Some Notes:</Text>
          <TextInput
            style={styles.input}
            placeholder="Note"
            value={transfusionNote}
            onChangeText={setTransfusionNote}
          />
          <PaperButton mode="contained" onPress={editingTransfusion ?
            handleEditSubmit : handleAddTransfusion}>
            {editingTransfusion ? 'Save Changes' : 'Add Transfusion'}
          </PaperButton>
          <PaperButton mode="contained" style={styles.cancelButton} onPress={resetForm}>
            Cancel
          </PaperButton>
        </View>
      )}
      {transfusions.length > 0 && renderChart()}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { width: '30%' }]}>Date</Text>
        <Text style={[styles.tableHeaderText, { width: '30%' }]}>Type</Text>
        <Text style={[styles.tableHeaderText, { width: '20%' }]}>Quantity (ml)</Text>
        <Text style={[styles.tableHeaderText, { width: '20%' }]}>Notes</Text>
      </View>
    </>
  );

  return (
    <FlatList
      style={styles.container}
      data={transfusions}
      keyExtractor={(item) => item.transfusion_ID.toString()}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  addForm: {
    marginBottom: 20,
    alignItems: 'center',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  selectedDate: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  transfusionTypeLabel: {
    fontSize: 18,
    marginBottom: 5,
    color: '#333',
  },
  picker: {
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelButton: {
    marginTop: 15,
    backgroundColor: 'red',
  },
  tableContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  leftAction: {
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
  },
  rightAction: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
  },
});

export default BloodTransfusion;

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from 'react-native-dotenv';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';
//wewewesddsdsddsd
const ReportPage = () => {
  const [user, setUser] = useState(null);
  const [ironLevels, setIronLevels] = useState([]);
  const [transfusions, setTransfusions] = useState([]);
  const [symptomRecords, setSymptomRecords] = useState([]);
  const [medications, setMedications] = useState([]);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await fetchUserInfo();
    await fetchIronLevels();
    await fetchTransfusions();
    await fetchSymptomRecords();
    await fetchMedications();
  };

  const fetchUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token not found');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });

      if (response.status === 200) {
        setUser(response.data);
      } else {
        console.error('Failed to fetch user information');
      }
    } catch (error) {
      console.error('Error fetching user information:', error);
    }
  };

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
    }
  };

  const fetchTransfusions = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/transfusions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });
      setTransfusions(response.data);
    } catch (error) {
      console.error('Error fetching transfusions:', error);
    }
  };

  const fetchSymptomRecords = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/symptomRecords`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });
      setSymptomRecords(response.data);
    } catch (error) {
      console.error('Error fetching symptom records:', error);
    }
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
  

  

  const generatePdf = async () => {
    try {
      if (!user) {
        console.error('User data not available');
        return;
      }

      const getColor = (status) => {
        switch (status) {
          case 'Healthy':
            return 'green';
          case 'Moderate':
            return 'yellow';
          case 'Mild':
            return 'orange';
          case 'Severe':
            return 'red';
          default:
            return 'black';
        }
      };

      const html = `
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        max-width: 800px;
        margin: 20px auto;
        padding: 20px;
        background-color: #f0f0f0;
      }
      header, footer {
        background-color: #333;
        color: #fff;
        text-align: center;
        padding: 10px 0;
      }
      h1, h2 {
        color: #333;
        border-bottom: 1px solid #333;
        padding-bottom: 5px;
      }
      h2 {
        margin-top: 20px;
      }
      p {
        margin: 8px 0;
      }
      strong {
        font-weight: bold;
      }
      ul {
        padding-left: 20px;
      }
      li {
        margin-bottom: 10px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        margin-bottom: 20px;
      }
      th, td {
        border: 1px solid #333;
        padding: 8px;
        text-align: left;
      }
      .health-status {
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>Patient Health Report</h1>
    </header>
    
    <main>
      <h2>User Information</h2>
      <p><strong>Username:</strong> ${user.username}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Name:</strong> ${user.first_name} ${user.last_name}</p>
      <p><strong>Gender:</strong> ${user.gender}</p>
      <p><strong>Age:</strong> ${user.age}</p>
      <p><strong>Address:</strong> ${user.address}</p>
      <p><strong>Phone Number:</strong> ${user.num_phone}</p>
      
      <h2>Iron Levels</h2>
      <ul>
        ${ironLevels.map(level => `
          <li>
            Iron Level: ${level.iron_level} mg/dL<br>
            Measurement Date: ${new Date(level.measurement_date).toLocaleDateString()}
          </li>
        `).join('')}
      </ul>
      
      <h2>Blood Transfusions</h2>
      <table>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Quantity (ml)</th>
          <th>Note</th>
        </tr>
        ${transfusions.map(transfusion => `
          <tr>
            <td>${new Date(transfusion.transfusion_date).toLocaleDateString()}</td>
            <td>${transfusion.transfusion_type}</td>
            <td>${transfusion.transfusion_quantity}</td>
            <td>${transfusion.note}</td>
          </tr>
        `).join('')}
      </table>

      <h2>Symptom Records</h2>
      <ul>
        ${symptomRecords.map(record => `
          <li>
            <span class="health-status" style="color: ${getColor(record.health_status)};">Health Status: ${record.health_status}</span><br>
            Record Date: ${new Date(record.date).toLocaleDateString()}
          </li>
        `).join('')}
      </ul>
      
      <h2>Medications</h2>
      <ul>
        ${medications.map(medication => `
          <li>
            <strong>${medication.medName}</strong><br>
            Medication Type: ${medication.medType}<br>
            Meal Timing: ${medication.mealTiming}<br>
            Dosage: ${medication.dose} ${medication.doseUnit}<br>
            Start Date: ${new Date(medication.medStartDate).toLocaleDateString()}<br>
            End Date: ${new Date(medication.medEndDate).toLocaleDateString()}<br>
            Frequency: ${medication.medFrequency}<br>
          </li>
        `).join('')}
      </ul>
    </main>
    
    <footer>
      <p>&copy; ${new Date().getFullYear()} Patient Health Report</p>
    </footer>
  </body>
</html>
`;



      const file = await printToFileAsync({
        html: html,
        base64: false
      });

      await shareAsync(file.uri);
    } catch (error) {
      console.error('Error generating or sharing PDF:', error);
      // Handle error (e.g., show alert)
    }
  };

  const getHealthStatusStyle = (status) => {
    switch (status) {
      case 'Healthy':
        return { color: 'green' };
      case 'Moderate':
        return { color: '#FFD700' };
      case 'Mild':
        return { color: 'orange' };
      case 'Severe':
        return { color: 'red' };
      default:
        return { color: 'black' };
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.heading}>Report Page</Text>
        {user && (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfo}>Username: {user.username}</Text>
            <Text style={styles.userInfo}>Email: {user.email}</Text>
            <Text style={styles.userInfo}>First Name: {user.first_name}</Text>
            <Text style={styles.userInfo}>Last Name: {user.last_name}</Text>
            <Text style={styles.userInfo}>Gender: {user.gender}</Text>
            <Text style={styles.userInfo}>Age: {user.age}</Text>
            <Text style={styles.userInfo}>Address: {user.address}</Text>
            <Text style={styles.userInfo}>Phone Number: {user.num_phone}</Text>
          </View>
        )}
        
        <View style={styles.ironLevelContainer}>
          <Text style={styles.subHeading}>Iron Levels</Text>
          <FlatList
            data={ironLevels}
            renderItem={({ item }) => (
              <View style={styles.ironLevelItem}>
                <Text>Iron Level: {item.iron_level} mg/dL</Text>
                <Text>Measurement Date: {new Date(item.measurement_date).toLocaleDateString()}</Text>
              </View>
            )}
            keyExtractor={(item) => item.iron_level_ID.toString()}
          />
        </View>

        <View style={styles.transfusionContainer}>
          <Text style={styles.subHeading}>Blood Transfusions</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHeader]}>Date</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Type</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Quantity (ml)</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Note</Text>
            </View>
            {transfusions.map((transfusion) => (
              <View key={transfusion.transfusion_ID} style={styles.tableRow}>
                <Text style={styles.tableCell}>{new Date(transfusion.transfusion_date).toLocaleDateString()}</Text>
                <Text style={styles.tableCell}>{transfusion.transfusion_type}</Text>
                <Text style={styles.tableCell}>{transfusion.transfusion_quantity}</Text>
                <Text style={styles.tableCell}>{transfusion.note}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.symptomRecordContainer}>
          <Text style={styles.subHeading}>Symptom Records</Text>
          <FlatList
            data={symptomRecords}
            renderItem={({ item }) => (
              <View style={styles.symptomRecordItem}>
                <Text style={getHealthStatusStyle(item.health_status)}>Health Status: {item.health_status}</Text>
                <Text>Record Date: {new Date(item.date).toLocaleDateString()}</Text>
              </View>
            )}
            keyExtractor={(item) => item.historyID.toString()}
          />
        </View>

        <Text style={styles.subHeading}>Medicine Records</Text>
        <FlatList
          data={medications}
          renderItem={({ item }) => {
            return (
              <View style={styles.medicationItem}>
                <Text>{item.medName}</Text>
                <Text>Medication Type: {item.medType}</Text>
                <Text>Meal Timing: {item.mealTiming}</Text>
                <Text>Dosage: {item.dose} {item.doseUnit}</Text>
                <Text>Start Date: {new Date(item.medStartDate).toLocaleDateString()}</Text>
                <Text>End Date: {new Date(item.medEndDate).toLocaleDateString()}</Text>
                <Text>Frequency: {item.medFrequency}</Text>
              </View>
            );
          }}
          keyExtractor={(item, index) => item.medication_id ? item.medication_id.toString() : index.toString()}
        />



        <Button title="Generate PDF" onPress={generatePdf} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 600, // Example max width for content
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  userInfoContainer: {
    marginBottom: 20,
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 10,
  },
  ironLevelContainer: {
    marginTop: 20,
    width: '100%',
  },
  transfusionContainer: {
    marginTop: 20,
    width: '100%',
  },
  table: {
    borderWidth: 1,
    borderColor: '#000',
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  symptomRecordContainer: {
    marginTop: 20,
    width: '100%',
  },
  subHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ironLevelItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  transfusionItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  symptomRecordItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  medicationItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default ReportPage;

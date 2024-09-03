import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from 'react-native-dotenv';

const Emergo = ({ route }) => {
  const [emergoData, setEmergoData] = useState([]);
  const { dataType } = route.params;
//sdsdfdsdssassds
  useEffect(() => {
    fetchEmergoData();
  }, []);

  const fetchEmergoData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/emergo/${dataType}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEmergoData(response.data);
    } catch (error) {
      console.error('Error fetching emergo data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Emergo</Text>
      <FlatList
        data={emergoData}
        keyExtractor={(item) => item.emergoID.toString()}
        renderItem={({ item }) => (
          <View style={styles.emergoItem}>
            <Text style={styles.emergoTitle}>{item.emergoTitle}</Text>
            <Text style={styles.emergoContent}>{item.emergoContent}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  emergoItem: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emergoID: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  emergoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007bff',
  },
  emergoContent: {
    fontSize: 14,
    color: '#333',
    textAlign: 'justify',
  },
});

export default Emergo;

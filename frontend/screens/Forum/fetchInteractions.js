import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from 'react-native-dotenv';
//sdsdsdsasdsddcd
export const fetchInteractions = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      const response = await axios.get(`${API_BASE_URL}/interactions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data; // This returns an array of interaction objects
    } else {
      console.log('Token not found');
      return [];
    }
  } catch (error) {
    console.error('Error fetching interactions:', error.message);
    return [];
  }
};

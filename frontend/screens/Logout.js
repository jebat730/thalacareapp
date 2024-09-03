import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Logout = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Are you sure you want to logout?</Text>
      <Button title="Logout" onPress={handleLogout} color="#ff5c5c" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  text: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});

export default Logout;

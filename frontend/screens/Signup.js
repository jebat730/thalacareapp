import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import axios from 'axios';
import Card from '../shared/card';
import { globalStyle } from '../../styles/global';
import { API_BASE_URL } from 'react-native-dotenv';
//sasdsadsdsdadsd
const windowWidth = Dimensions.get('window').width;

const genders = ['Male', 'Female', 'Other'];

const Signup = ({ navigation }) => {
  const [patientData, setPatientData] = useState({
    email: '',
    username: '',
    password: ''
  });

  const handleChange = (attribute, value) => {
    setPatientData({ ...patientData, [attribute]: value });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, patientData, {
        timeout: 10000
      });
  
      
      if (response.status === 200) {
        Alert.alert('Registration Successful', 'Please Login.');
        navigation.navigate('Login');
      }
    } catch (error) {
      // Check if the error response contains a status code of 409 (Conflict)
      if (error.response && error.response.status === 409) {
        Alert.alert('Registration Failed', 'Username already exists. Please choose a different one.');
      } else {
        // Handle other errors
        console.error('Registration Error:', error);
        Alert.alert('Registration Failed', 'An error occurred during registration.');
      }
    }
  };
  
  

  const handleLogin = () => {
    navigation.navigate('Login');
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <Card style={[globalStyle.card, { maxWidth: windowWidth * 0.9 }]}>

        <Text style={globalStyle.customText}>
            Register with us!
        </Text>
        <Text style={globalStyle.additionalText}>
            Your information is safe with us
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={text => handleChange('email', text)}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          onChangeText={text => handleChange('username', text)}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          onChangeText={text => handleChange('password', text)}
          secureTextEntry={true}
        />
        <TouchableOpacity style={globalStyle.button} onPress={handleSubmit}>
          <Text style={globalStyle.buttonText}>Register</Text>
        </TouchableOpacity>
        <View style={styles.signupContainer}>
        <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink} onPress={handleLogin}>Login here</Text></Text>
        </View>
        
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingVertical: 20,
  },
  card: {
    width: '100%',
    padding: 20,
  },
  input: {
    width: '100%',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: 'bold'
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  radioButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  radioButtonSelected: {
    backgroundColor: 'lightblue'
  },
  radioButtonText: {
    fontSize: 16
  },
  boldText: {
    fontWeight: 'bold'
  },
  loginText: {
    marginTop: 10,
    fontSize: 16
  },
  loginLink: {
    color: 'blue',
    textDecorationLine: 'underline'
  },
  signupContainer: {
    marginTop: 5,
    alignItems: 'center'
  }
});

export default Signup;

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet, Text, Image, ScrollView, Dimensions } from 'react-native';
import axios from 'axios';
import { globalStyle } from '../../styles/global';
import Card from '../shared/card';
import { API_BASE_URL } from 'react-native-dotenv';
import AsyncStorage from '@react-native-async-storage/async-storage';
//dssdsdsdssdssdsas
const windowWidth = Dimensions.get('window').width;

const Login = ({ navigation, onLoginSuccess, onAdminLoginSuccess }) => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const handleChange = (attribute, value) => {
    setLoginData({ ...loginData, [attribute]: value });
  };

  const handleLogin = async () => {
    try {
      if (!loginData.username || !loginData.password) {
        Alert.alert('Login Failed', 'Please enter both username and password.');
        return;
      }
  
      let endpoint;
      let role;
  
      // Determine endpoint and role based on username
      if (loginData.username.startsWith('admin')) {
        endpoint = `${API_BASE_URL}/admin/login`;
        role = 'admin';
      } else {
        endpoint = `${API_BASE_URL}/patient/login`;
        role = 'patient';
      }
  
      const response = await axios.post(endpoint, loginData, { timeout: 10000 });
  
      if (response.status === 200) {
        const token = response.data.token;
        if (token) {
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('userRole', role); // Store the role in AsyncStorage
  
          Alert.alert('Login Successful', `You are now logged in as ${role}`);
  
          // Navigate based on role
          if (role === 'admin') {
            onAdminLoginSuccess();
          } else {
            onLoginSuccess();
          }
        } else {
          Alert.alert('Login Failed', 'Token not received from server.');
        }
      } else if (response.status === 401) {
        Alert.alert('Login Failed', 'Invalid username or password.');
      } else {
        Alert.alert('Login Failed', 'An error occurred during login. Please try again later.');
      }
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid username or password.');
    }
  };
  

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={[globalStyle.card, { maxWidth: windowWidth * 0.9 }]}>
        <Text style={globalStyle.customText}>Welcome Back!</Text>
        <Image 
          source={require('../../assets/images/undraw_doctor_kw5l.png')}
          style={{ width: 300, height: 300, alignSelf: 'center', justifyContent: 'center' }}
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
        <TouchableOpacity style={globalStyle.button} onPress={handleLogin}>
          <Text style={globalStyle.buttonText}>Login</Text>
        </TouchableOpacity>
        <View style={styles.signupContainer}>
          <Text style={styles.loginText}>Don't have an account yet? <Text style={styles.loginLink} onPress={handleSignup}>Register here</Text></Text>
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
  loginText: {
    fontSize: 16
  },
  loginLink: {
    color: 'blue',
    textDecorationLine: 'underline'
  },
  signupContainer: {
    marginTop: 10,
    alignItems: 'center'
  }
});

export default Login;

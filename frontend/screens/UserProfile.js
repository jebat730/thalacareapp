import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, Image, TouchableOpacity } from 'react-native';
import { Card, Button as PaperButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { API_BASE_URL } from 'react-native-dotenv';
import Icon from 'react-native-vector-icons/MaterialIcons';
//sdsdssasfdfdfd
const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [editedUser, setEditedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [formValid, setFormValid] = useState(true);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    fetchUserInfo();
  }, []);

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
        setEditedUser(response.data);
        setProfileImage(response.data.profile_image);
      } else {
        console.error('Failed to fetch user information');
      }
    } catch (error) {
      console.error('Error fetching user information:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token not found');
        return;
      }

      const response = await axios.put(`${API_BASE_URL}/profile/update`, editedUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setUser(editedUser);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        console.error('Failed to update user information');
      }
    } catch (error) {
      console.error('Error updating user information:', error);
    }
  };

  const handleChange = (field, value) => {
    setEditedUser({ ...editedUser, [field]: value });
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (email) => {
    handleChange('email', email);
    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      setFormValid(false);
    } else {
      setEmailError('');
      setFormValid(true);
    }
  };

  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.cancelled) {
        handleImageUpload(result.assets[0]); 
      }
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  const handleImageUpload = async (imageResult) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token not found');
        return;
      }

      const formData = new FormData();
      formData.append('image', {
        uri: imageResult.uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });

      const response = await axios.post(`${API_BASE_URL}/profile/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        const imageUrl = `${API_BASE_URL}/uploads/${response.data.filename}`;
        setProfileImage(imageUrl);
        Alert.alert('Success', 'Profile picture updated successfully');
      } else {
        console.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!isEditing && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Patient Profile</Text>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer} onTouchStart={selectImage}>
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              </View>
              <Text style={styles.username}>{user && user.username}</Text>
            </View>

            {user && (
              <>
                <ProfileInfoSection label="Patient ID" value={user.patientID} />
                <ProfileInfoSection label="First Name" value={user.first_name} />
                <ProfileInfoSection label="Last Name" value={user.last_name} />
                <ProfileInfoSection label="Gender" value={user.gender} />
                <ProfileInfoSection label="Age" value={user.age} />
                <ProfileInfoSection label="Address" value={user.address} />
                <ProfileInfoSection label="Email" value={user.email} />
                <ProfileInfoSection label="Phone Number" value={user.num_phone} />
              </>
            )}
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            <PaperButton mode="contained" onPress={handleEdit} style={styles.editButton}>
              Edit
            </PaperButton>
          </Card.Actions>
        </Card>
      )}
      {isEditing && (
        <View style={styles.editContainer}>
          <ProfileEditSection
            label="First Name"
            value={editedUser ? editedUser.first_name : ''}
            onChangeText={(text) => handleChange('first_name', text)}
          />

          <ProfileEditSection
            label="Last Name"
            value={editedUser ? editedUser.last_name : ''}
            onChangeText={(text) => handleChange('last_name', text)}
          />

          <View style={styles.inputContainer}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Picker
              selectedValue={editedUser ? editedUser.gender : ''}
              onValueChange={(itemValue) => handleChange('gender', itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
            </Picker>
          </View>

          <ProfileEditSection
            label="Age"
            value={editedUser ? editedUser.age.toString() : ''}
            onChangeText={(text) => handleChange('age', text)}
            keyboardType="numeric"
          />

          <ProfileEditSection
            label="Address"
            value={editedUser ? editedUser.address : ''}
            onChangeText={(text) => handleChange('address', text)}
          />

          <ProfileEditSection
            label="Email"
            value={editedUser ? editedUser.email : ''}
            onChangeText={handleEmailChange}
            error={emailError}
          />

          <ProfileEditSection
            label="Phone Number"
            value={editedUser ? editedUser.num_phone : ''}
            onChangeText={(text) => handleChange('num_phone', text)}
          />

          <View style={styles.buttonContainer}>
            <PaperButton mode="contained" onPress={handleUpdate} disabled={!formValid}>
              Update
            </PaperButton>
            <PaperButton mode="outlined" onPress={() => setIsEditing(false)} style={styles.cancelButton}>
              Cancel
            </PaperButton>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const ProfileInfoSection = ({ label, value }) => (
  <View style={styles.infoBox}>
    <Icon name={getIconName(label)} size={20} color="#666" style={styles.icon} />
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const getIconName = (label) => {
  switch (label) {
    case 'Patient ID':
      return 'person';
    case 'First Name':
      return 'person';
    case 'Last Name':
      return 'person';
    case 'Gender':
      return 'wc';
    case 'Age':
      return 'calendar-today';
    case 'Address':
      return 'location-on';
    case 'Email':
      return 'email';
    case 'Phone Number':
      return 'phone';
    default:
      return 'info';
  }
};

const ProfileEditSection = ({ label, value, onChangeText, keyboardType, error }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.infoLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholder={`Enter ${label}`}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#f2f2f2',
  },
  card: {
    marginBottom: 20,
    borderRadius: 20,
    elevation: 5,
    backgroundColor: '#D9D9D9'
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  noImageText: {
    marginBottom: 20,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  divider: {
    marginBottom: 20,
    backgroundColor: '#ccc',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
  },
  infoLabel: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  infoValue: {
    flex: 2,
    fontSize: 16,
    color: '#666',
  },
  cardActions: {
    justifyContent: 'flex-end',
    padding: 20,
  },
  editButton: {
    borderRadius: 20,
    backgroundColor: '#334257',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editContainer: {
    marginVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  cancelButton: {
    marginLeft: 10,
    backgroundColor: '#f44336',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    borderRadius: 12,
  },
  picker: {
    height: 40,
    marginBottom: 20,
  },
});

export default ProfilePage;

import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const About = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>About Page</Text>
      <Text style={styles.message}>features will be added soon.</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
});

export default About;

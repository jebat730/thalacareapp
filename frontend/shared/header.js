import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function Header() {
  return(
    <View style={styles.header}>
        <FontAwesome5 name="briefcase-medical" size={24} color="black" />
        <View>
            <Text style={styles.headerText}> THALACARE</Text>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
    header: {
        width: '120%',
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#333',
        letterSpacing: 1,
    },
})
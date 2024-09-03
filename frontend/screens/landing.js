import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { globalStyle } from "../../styles/global";
import Card from "../shared/card";

export default function Landing({ navigation }) {
    
    const handleSignup = () => {
        navigation.navigate('Login');
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <View style={styles.container}>
                <Card style={styles.card}>
                    <Image 
                        source={require('../../assets/images/undraw_medicine_b1ol.png')}
                        style={styles.image}
                    />

                    <View style={styles.textContainer}>
                        <Text style={styles.mainText}>
                            {'Your Empowering Companion '}
                        </Text>
                        <Text style={styles.mainText}>
                            {'in the Fight Against Thalassemia'}
                        </Text>
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.additionalText}>
                            Track effortlessly, get timely reminders, explore educational resources, and connect with a supportive community
                        </Text>
                        <Text style={styles.additionalText}>
                            Join ThalaCare
                        </Text>
                        <Text style={styles.additionalText}>
                            Your Path to Wellness
                        </Text>
                    </View>

                    <TouchableOpacity style={globalStyle.button} onPress={handleSignup}>
                        <Text style={globalStyle.buttonText}>Get Started</Text>
                    </TouchableOpacity>
                </Card>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollViewContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        width: '100%',
    },
    card: {
        padding: 30,
        marginVertical: 20,
        width: '90%',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: undefined,
        aspectRatio: 1,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    textContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    mainText: {
        ...globalStyle.customText,
        textAlign: 'center',
        fontSize: 24,
        marginBottom: 10,
    },
    additionalText: {
        ...globalStyle.additionalText,
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 5,
    },
});

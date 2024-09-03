import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, RefreshControl } from "react-native";
import { globalStyle } from "../../styles/global";
import Card from "../shared/card";

export default function Home({ navigation }) {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        // Implement your refresh logic here
        setRefreshing(true);
        // For example, fetch data or perform any other action
        // After completion, set refreshing to false
        setTimeout(() => setRefreshing(false), 2000); // Simulating a delay of 2 seconds
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Image 
                source={require('../../assets/images/undraw_be_the_hero_ssr2.png')}
                style={{width: 300, height: 300, alignSelf: 'center', justifyContent: 'center'}}
            />
            
            <Text style={[globalStyle.titleText, styles.centerText]}>{'Empowering Thalassemia Warriors'}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PersonalHealth')}>
                <CardWithImageAndText
                    imageSource={require('../../assets/images/undraw_super_woman_dv0y.png')}
                    title={'Journal Your Wellness'}
                    description={'Record and analyze your thalassemia journey log transfusions, manage medications, and take control of your health'}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ReminderScreen')}>
            <CardWithImageAndText
                    imageSource={require('../../assets/images/undraw_Time_management_re_tk5w.png')}
                    title={'Stay on Track'}
                    description={'Never miss an appointment! Schedule reminders for your medical check-ups, transfusions, and consultations. Stay proactive and take charge of your health journey with timely notifications and organized schedules.'}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Edu')}>
                <CardWithImageAndText
                    imageSource={require('../../assets/images/undraw_education_f8ru.png')}
                    title={'Empower Yourself'}
                    description={'Dive into a wealth of knowledge! Explore informative videos, articles, and engaging infographics to empower your thalassemia journey'}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ForumPostList')}>
                <CardWithImageAndText
                    imageSource={require('../../assets/images/undraw_People_re_8spw.png')}
                    title={'Forum of Strength'}
                    description={'Discover a supportive space! Connect with fellow warriors, share advice, and find encouragement in the ThalaCare Community Forum'}
                />
            </TouchableOpacity>
        </ScrollView>
    );
}

const CardWithImageAndText = ({ imageSource, title, description }) => (
    <Card style={styles.cardContainer}>
        <View style={styles.rowContainer}>
            <View style={styles.imageContainer}>
                <Image 
                    source={imageSource}
                    style={styles.image}
                />
            </View>
            <View style={styles.textContent}>
                <Text style={[globalStyle.titleText, styles.titleText]}>{title}</Text>
                <Text style={[globalStyle.titleText, styles.descriptionText]}>{description}</Text>
            </View>
        </View>
    </Card>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    centerText: {
        textAlign: 'center',
        fontSize: 30
    },
    titleText: {
        flex: 1, 
        textAlign: 'left', 
        marginBottom: 1,
        fontSize: 20 
    },
    descriptionText: {
        flex: 1, 
        textAlign: 'left', 
        fontSize: 15,
        marginRight: 20 
    },
    cardContainer: {
        paddingHorizontal: 20, 
        paddingVertical: 10, 
    },
    imageContainer: {
        marginRight: 10, 
    },
    image: {
        width: 100,
        height: 100,
    },
    textContent: {
        flex: 1,
    },
});

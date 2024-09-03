import { StyleSheet } from "react-native";

export const globalStyle = StyleSheet.create({
    container: {
        padding: 24
    },
    titleText: {
        fontFamily: 'nunito-bold',
        fontSize: 18,
        color: '#333'
    },
    paragraph: {
        marginVertical:8,
        lineHeight: 20,
    },
    customTextView: {
        alignItems: 'center',
        marginBottom: 20
    },
    customText: {
        width: '100%',
        fontFamily: 'nunito-bold',
        fontStyle: 'normal',
        fontWeight: '700',
        fontSize: 25,
        lineHeight: 27,
        textAlign: 'center',
        color: '#476072'
    },
    additionalText: {
        fontFamily: 'nunito-regular',
        fontStyle: 'normal',
        fontWeight: '400',
        fontSize: 20,
        lineHeight: 22,
        textAlign: 'center',
        color: 'rgba(84, 140, 168, 0.6)',
        marginBottom: 10,
        marginTop: 10
    },
    button: {
        marginTop: 20, // Add margin top to separate the button from other elements
        backgroundColor: '#334257',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold'
    }
});
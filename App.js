import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import AuthNavigator from './backend/routes/AuthNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { notificationService } from './frontend/screens/NotificationService';

const getFonts = async () => {
  await Font.loadAsync({
    'nunito-regular': require('./assets/fonts/Nunito-Regular.ttf'),
    'nunito-bold': require('./assets/fonts/Nunito-Bold.ttf')
  });
};

// Define your custom theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#334257', // Change the primary color here (button color)
    accent: '#334257', // Change the accent color here (radio button color)
  },
};

export default function App() {
  const [fontLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    notificationService.configure(); // Configure notifications when the app starts
  }, []);

  const loadFonts = async () => {
    await getFonts();
    setFontsLoaded(true);
  };

  if (!fontLoaded) {
    return (
      <AppLoading
        startAsync={loadFonts}
        onFinish={() => setFontsLoaded(true)}
        onError={console.warn}
      />
    );
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

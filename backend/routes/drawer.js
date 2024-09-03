import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AppNavigator from './AppNavigator';
import aboutStack from './aboutStack';
import Header from '../../frontend/shared/header';
import LogoutScreen from '../../frontend/screens/Logout';

const Drawer = createDrawerNavigator();
  
export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator 
        screenOptions={{
          drawerStyle: {
            backgroundColor: '#334257',
            width: 240,
          },
        }}
        initialRouteName="Home"
      >
        <Drawer.Screen 
          name="Home2" 
          component={AppNavigator} 
          options={{
            title: 'Home',
            headerTitle: () => <Header />
          }} 
        />
        <Drawer.Screen 
          name="About2" 
          component={aboutStack} 
          options={{
            title: 'About',
            headerTitle: () => <Header />
          }} 
        />
        <Drawer.Screen 
          name="Logout" 
          component={LogoutScreen} 
          options={{
            title: 'Logout',
            headerTitle: () => <Header />
          }} 
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

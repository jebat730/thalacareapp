import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Landing from "../../frontend/screens/landing";
import Login from "../../frontend/screens/Login";
import Signup from "../../frontend/screens/Signup";
import AppNavigator from './AppNavigator';
import Header from '../../frontend/shared/header';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkTokenAndRole = async () => {
      const token = await AsyncStorage.getItem('token');
      const role = await AsyncStorage.getItem('userRole');
      if (token) {
        setUserLoggedIn(true);
        setUserRole(role);
      }
    };
    checkTokenAndRole();
  }, []);

  const handleLoginSuccess = async (navigation, isAdmin = false) => {
    setUserLoggedIn(true);
    const role = isAdmin ? 'admin' : 'user';
    await AsyncStorage.setItem('userRole', role); // Store role on login
    setUserRole(role);
    const routeName = isAdmin ? 'AdminStack' : 'AppNavigator';
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: routeName }],
      })
    );
  };

  return (
    <Stack.Navigator>
      {!userLoggedIn ? (
        <>
          <Stack.Screen name="Landing" component={Landing} options={{ title: ' ' }} />
          <Stack.Screen name="Login">
            {(props) => <Login {...props} onLoginSuccess={(nav) => handleLoginSuccess(nav, false)} onAdminLoginSuccess={(nav) => handleLoginSuccess(nav, true)} />}
          </Stack.Screen>
          <Stack.Screen name="Signup" component={Signup} options={{ title: 'Register Page' }} />
        </>
      ) : userRole === 'admin' ? (
        <Stack.Screen name="AdminStack" component={AdminStack} options={{ title: '', headerTitle: () => <Header /> }} />
      ) : (
        <Stack.Screen name="AppNavigator" component={AppNavigator} options={{ title: '', headerTitle: () => <Header /> }} />
      )}
    </Stack.Navigator>
  );
};

export default AuthNavigator;

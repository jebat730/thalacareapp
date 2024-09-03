import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Home from "../../frontend/screens/home";
import PersonalHealth from "../../frontend/screens/PersonalHealthScreen";
import ReminderScreen from "../../frontend/screens/ReminderScreen";
import Edu from "../../frontend/screens/EducationalScreen";
import Forum from "../../frontend/screens/ForumScreen";
import aboutStack from './aboutStack';
import Header from '../../frontend/shared/header';
import UserProfile from '../../frontend/screens/UserProfile';
import Logout from '../../frontend/screens/Logout';
import IronLevelPage from '../../frontend/screens/IronLevelPage';
import BloodTransfusion from '../../frontend/screens/BloodTransfusion';
import MedicationPage from '../../frontend/screens/MedicationPage';
import Emergo from '../../frontend/screens/Emergo';
import ArticleDetailScreen from '../../frontend/screens/ArticleDetailScreen';
import ForumPostList from '../../frontend/screens/Forum/ForumsPostList';
import CommentSection from '../../frontend/screens/Forum/CommentSection';
import StatusPage from '../../frontend/screens/StatusPage';
import AuthNavigator from './AuthNavigator';
import ReportPage from '../../frontend/screens/ReportPage';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="PersonalHealth" component={PersonalHealth} />
      <Stack.Screen name="IronLevelPage" component={IronLevelPage} />
      <Stack.Screen name="StatusPage" component={StatusPage} />
      <Stack.Screen name="BloodTransfusion" component={BloodTransfusion} />
      <Stack.Screen name="MedicationPage" component={MedicationPage} />
      <Stack.Screen name="ReportPage" component={ReportPage} />
      <Stack.Screen name="ReminderScreen" component={ReminderScreen} />
      <Stack.Screen name="Edu" component={Edu} />
      <Stack.Screen name="Emergo" component={Emergo} />
      <Stack.Screen name="ArticleDetailScreen" component={ArticleDetailScreen} />
      <Stack.Screen name="ForumPostList" component={ForumPostList} />
      <Stack.Screen name="CommentSection" component={CommentSection} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
    };
    checkToken();
  }, []);

  return (
    <>
      {isAuthenticated ? (
        <Drawer.Navigator
          screenOptions={{
            drawerStyle: {
              backgroundColor: '#D9D9D9',
              width: 240,
            },
          }}
          initialRouteName="Main"
        >
          <Drawer.Screen 
            name="Main" 
            component={MainStack} 
            options={{
              title: 'Thalacare',
            }} 
          />
          <Drawer.Screen 
            name="Profile" 
            component={UserProfile} 
            options={{
              title: 'Profile',
            }} 
          />
          <Drawer.Screen 
            name="About" 
            component={aboutStack} 
            options={{
              title: 'About',
            }} 
          />
          <Drawer.Screen 
            name="Logout" 
            component={Logout} 
            options={{
              title: 'Logout',
            }} 
          />
        </Drawer.Navigator>
      ) : (
        <Stack.Screen name="AuthNavigator" component={AuthNavigator} options={{ title: '',headerTitle: () => <Header /> }} />
      )}
    </>
  );
};

export default AppNavigator;

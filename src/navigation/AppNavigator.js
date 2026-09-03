// src/navigation/AppNavigator.js
// Cấu hình Điều hướng chính React Navigation (Bottom Tab + Native Stack + Auth & ChatBot)

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

// Import Screens cho Ứng viên
import HomeScreen from '../screens/HomeScreen';
import MapViewScreen from '../screens/MapViewScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import FilterScreen from '../screens/FilterScreen';
import SavedScreen from '../screens/SavedScreen';
import ApplicationsScreen from '../screens/ApplicationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ChatBotScreen from '../screens/ChatBotScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';

// Import Screens cho Nhà tuyển dụng
import EmployerJobsScreen from '../screens/EmployerJobsScreen';
import EmployerPostJobScreen from '../screens/EmployerPostJobScreen';
import EmployerCandidatesScreen from '../screens/EmployerCandidatesScreen';
import EmployerProfileScreen from '../screens/EmployerProfileScreen';
import CandidateProfileScreen from '../screens/CandidateProfileScreen';

import colors from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * Bottom Tab Navigator cho ỨNG VIÊN
 */
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryMain,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'ellipse';
          if (route.name === 'HomeTab') iconName = focused ? 'briefcase' : 'briefcase-outline';
          else if (route.name === 'MapTab') iconName = focused ? 'map' : 'map-outline';
          else if (route.name === 'SavedTab') iconName = focused ? 'heart' : 'heart-outline';
          else if (route.name === 'ApplicationsTab') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'ChatListTab') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Việc làm' }} />
      <Tab.Screen name="MapTab" component={MapViewScreen} options={{ tabBarLabel: 'Bản đồ' }} />
      <Tab.Screen name="SavedTab" component={SavedScreen} options={{ tabBarLabel: 'Đã lưu' }} />
      <Tab.Screen name="ApplicationsTab" component={ApplicationsScreen} options={{ tabBarLabel: 'Đã ứng tuyển' }} />
      <Tab.Screen name="ChatListTab" component={ChatListScreen} options={{ tabBarLabel: 'Tin nhắn' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Hồ sơ' }} />
    </Tab.Navigator>
  );
}

/**
 * Bottom Tab Navigator cho NHÀ TUYỂN DỤNG
 */
function EmployerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'ellipse';
          if (route.name === 'EmployerJobsTab') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'EmployerPostJobTab') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'EmployerCandidatesTab') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'ChatListTab') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'EmployerProfileTab') iconName = focused ? 'business' : 'business-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="EmployerJobsTab" component={EmployerJobsScreen} options={{ tabBarLabel: 'Tin của tôi' }} />
      <Tab.Screen name="EmployerPostJobTab" component={EmployerPostJobScreen} options={{ tabBarLabel: 'Đăng tin' }} />
      <Tab.Screen name="EmployerCandidatesTab" component={EmployerCandidatesScreen} options={{ tabBarLabel: 'Ứng viên' }} />
      <Tab.Screen name="ChatListTab" component={ChatListScreen} options={{ tabBarLabel: 'Tin nhắn' }} />
      <Tab.Screen name="EmployerProfileTab" component={EmployerProfileScreen} options={{ tabBarLabel: 'Hồ sơ' }} />
    </Tab.Navigator>
  );
}

/**
 * Root Stack Navigator chứa Tabs, Modal và Màn hình lẻ
 */
export default function AppNavigator() {
  const { user } = useApp();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Dynamic Root dựa theo role */}
      {user?.role === 'employer' ? (
        <Stack.Screen name="EmployerTabs" component={EmployerTabNavigator} />
      ) : (
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      )}
      
      {/* Các màn hình dùng chung hoặc đè lên Tab */}
      <Stack.Screen
        name="ChatBot"
        component={ChatBotScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen
        name="Filter"
        component={FilterScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
      <Stack.Screen name="CandidateProfile" component={CandidateProfileScreen} />
    </Stack.Navigator>
  );
}

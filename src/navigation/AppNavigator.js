// src/navigation/AppNavigator.js
// Cấu hình Điều hướng chính React Navigation (Bottom Tab + Native Stack + Auth & ChatBot)

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

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

import colors from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * Bottom Tab Navigator với 5 Tab chính
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

          if (route.name === 'HomeTab') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'MapTab') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'SavedTab') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'ApplicationsTab') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Trang chủ' }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapViewScreen}
        options={{ tabBarLabel: 'Bản đồ' }}
      />
      <Tab.Screen
        name="SavedTab"
        component={SavedScreen}
        options={{ tabBarLabel: 'Đã lưu' }}
      />
      <Tab.Screen
        name="ApplicationsTab"
        component={ApplicationsScreen}
        options={{ tabBarLabel: 'Đã ứng tuyển' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Hồ sơ' }}
      />
    </Tab.Navigator>
  );
}

/**
 * Root Stack Navigator chứa MainTabs, ChatBot, JobDetail, Login, Register và Filter modal
 */
export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen
        name="ChatBot"
        component={ChatBotScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen
        name="Filter"
        component={FilterScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}

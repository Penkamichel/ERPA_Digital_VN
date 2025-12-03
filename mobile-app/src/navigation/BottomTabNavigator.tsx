import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Users, BarChart2, Settings } from 'react-native-svg';
import HomeScreen from '../screens/Home/HomeScreen';
import ParticipateScreen from '../screens/Participate/ParticipateScreen';
import MonitorScreen from '../screens/Monitor/MonitorScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ name, focused, color, size }: any) {
  const icons: any = {
    Home: Home,
    Participate: Users,
    Monitor: BarChart2,
    Settings: Settings,
  };

  const Icon = icons[name];
  return <Icon width={size} height={size} stroke={color} fill={focused ? color : 'none'} />;
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon name={route.name} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Participate" component={ParticipateScreen} />
      <Tab.Screen name="Monitor" component={MonitorScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

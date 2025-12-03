import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppProvider } from './src/contexts/AppContext';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import LoginScreen from './src/screens/LoginScreen';
import { useAuth } from './src/contexts/AuthContext';

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <BottomTabNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppContent />
        </NavigationContainer>
      </AppProvider>
    </AuthProvider>
  );
}

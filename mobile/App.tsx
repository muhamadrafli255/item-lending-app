import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import CustomSplashScreen from './src/components/CustomSplashScreen';

// Keep the native splash screen visible while we start
SplashScreen.preventAutoHideAsync().catch(() => { });

function Main() {
  const { isLoading: authLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    // Show splash for at least 2 seconds for that premium feel
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Hide native splash once the app logic is ready
    if (!authLoading && isReady) {
      SplashScreen.hideAsync().catch(() => { });
      setAppLoading(false);
    }
  }, [authLoading, isReady]);

  if (appLoading) {
    return <CustomSplashScreen />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}

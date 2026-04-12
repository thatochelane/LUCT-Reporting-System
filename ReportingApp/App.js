import React, { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    ScreenOrientation.unlockAsync();
  }, []);

  return <AppNavigator />;
}
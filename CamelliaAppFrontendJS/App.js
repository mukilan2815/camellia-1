// App.js
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import './src/localization/i18n'
import { SafeAreaView } from 'react-native-safe-area-context'; 


export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppNavigator />
    </SafeAreaView>
) 
}

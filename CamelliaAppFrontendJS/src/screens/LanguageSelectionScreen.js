// src/screens/LanguageSelectionScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Button, Text, RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import customTheme from '../utils/theme';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';

const LANGUAGE_PREFERENCE_KEY = 'user-language';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'as', label: 'অসমীয়া' },
  // Add other South Indian languages as needed
];

const LanguageSelectionScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [location, setLocation] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(null);

  useEffect(() => {
    // Function to request permissions
    const requestPermissions = async () => {
      try {
        // Request Camera Permission
        const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(cameraStatus === 'granted');

        if (cameraStatus !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Camera permission is required to use certain features of the app.',
            [{ text: 'OK' }]
          );
        }

        // Request Location Permission
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        setHasLocationPermission(locationStatus === 'granted');

        if (locationStatus !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to access your location.',
            [{ text: 'OK' }]
          );
          return; // Exit if location permission is not granted
        }

        // Fetch the current location
        const userLocation = await Location.getCurrentPositionAsync({});
        setLocation(userLocation.coords);
      } catch (error) {
        console.error('Error requesting permissions:', error);
        Alert.alert('Error', 'An error occurred while requesting permissions.');
      }
    };

    requestPermissions();
  }, []);

  const handleNext = async () => {
    if (!location) {
      Alert.alert('Location Required', 'Unable to fetch your location. Please try again.');
      return;
    }

    try {
      // Save the selected language in AsyncStorage
      await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, selectedLanguage);

      // Save location data in AsyncStorage (optional)
      await AsyncStorage.setItem('user-location', JSON.stringify(location));

      // Change the language in i18next
      await i18n.changeLanguage(selectedLanguage);

      // Log before navigation
      console.log('Navigating to UserDetailsScreen with language and location');

      // Navigate to UserDetailsScreen with the selected language and location
      navigation.navigate('UserDetails', { language: selectedLanguage, location });
    } catch (error) {
      console.error('Error setting language or location:', error);
      Alert.alert('Error', 'Failed to set language or fetch location. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{t('selectLanguage')}</Text>
      <RadioButton.Group
        onValueChange={(newValue) => setSelectedLanguage(newValue)}
        value={selectedLanguage}
      >
        {languages.map((lang) => (
          <RadioButton.Item
            label={lang.label}
            value={lang.code}
            key={lang.code}
            labelStyle={styles.radioLabel}
            color={customTheme.colors.primary} // Uses theme primary color
            uncheckedColor={customTheme.colors.text} // Dark Green
          />
        ))}
      </RadioButton.Group>
      <Button
        mode="contained"
        onPress={handleNext}
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
        disabled={!location} // Disable button if location is not fetched
      >
        {t('next')}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: customTheme.colors.background, // Uses theme background color
    padding: 16,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 26, // Slightly larger font
    fontWeight: 'bold',
    color: customTheme.colors.text, // Dark Green
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 1,
  },
  radioLabel: {
    fontSize: 18,
    color: customTheme.colors.text, // Uses theme text color
  },
  button: {
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: customTheme.colors.primary, // Uses theme primary color
    borderRadius: 25,
 
  },
  buttonContent: {
    paddingVertical: 5,
    paddingHorizontal: 24,
  },
  buttonLabel: {
    fontSize: 18,
    color: customTheme.colors.surface, // Ensures contrast with the button
    //fontWeight: 'bold',
  },
});

export default LanguageSelectionScreen;

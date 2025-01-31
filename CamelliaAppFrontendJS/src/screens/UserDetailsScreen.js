// src/screens/UserDetailsScreen.js

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

import customTheme from '../utils/theme';
import MessageDialog from '../components/MessageDialog'; // Ensure this path is correct

const UserDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { location } = route.params || {}; // If location is passed from a previous screen
  const { t } = useTranslation();

  // State variables for user input
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateField, setStateField] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [coordinates, setCoordinates] = useState({ latitude: 0, longitude: 0 });

  // Form & status states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);

  // Error dialog states
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState('');

  useEffect(() => {
    // This effect runs once on component mount or when `location` changes
    const fetchAddress = async () => {
      // For Web, skip reverse-geocoding (Expo SDK 49+ no longer supports it)
      if (Platform.OS === 'web') {
        console.log('[fetchAddress] Running on web: skipping reverse-geocoding');
        setIsLoadingAddress(false);
        return;
      }

      // On iOS/Android, attempt to fetch address
      console.log('[fetchAddress] Attempting location permission & reverse-geocoding...');
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        console.log('[fetchAddress] Permission denied: skipping reverse-geocoding');
        setIsLoadingAddress(false);
        return;
      }

      try {
        if (!location || !location.latitude || !location.longitude) {
          console.log('[fetchAddress] Invalid location data received:', location);
          showErrorDialog('Invalid location data. Please enter address manually.');
          setIsLoadingAddress(false);
          return;
        }

        // Reverse geocoding
        console.log('[fetchAddress] Reverse geocoding coords:', location);
        const addressArray = await Location.reverseGeocodeAsync({
          latitude: location.latitude,
          longitude: location.longitude,
        });
        console.log('[fetchAddress] reverseGeocodeAsync result:', addressArray);

        if (addressArray.length > 0) {
          const addr = addressArray[0];
          setStreet(addr.street || '');
          setCity(addr.city || addr.town || addr.village || '');
          setStateField(addr.region || addr.state || '');
          setCountry(addr.country || '');
          setPostalCode(addr.postalCode || '');
          setCoordinates({
            // If the reverse geocode result has lat/long, use them; otherwise fallback
            latitude: addr.latitude || location.latitude,
            longitude: addr.longitude || location.longitude,
          });
        } else {
          console.log('[fetchAddress] No address found for coords:', location);
          showErrorDialog('Unable to fetch address from location. Please enter manually.');
        }
      } catch (error) {
        console.log('[fetchAddress] Error:', error);
        showErrorDialog('An error occurred while fetching your address.');
      } finally {
        setIsLoadingAddress(false);
      }
    };

    fetchAddress();
  }, [location]);

  // Helper to request location permission
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location access is needed to auto-fetch your address. Please grant permission or enter address manually.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (err) {
      console.log('[requestLocationPermission] Error:', err);
      return false;
    }
  };

  // Helper to show error dialog
  const showErrorDialog = (message) => {
    setErrorDialogMessage(message);
    setErrorDialogVisible(true);
  };

  const closeErrorDialog = () => setErrorDialogVisible(false);

  // Validate user input
  const validate = () => {
    let isValid = true;
    let tempErrors = {};

    if (!name.trim()) {
      tempErrors.name = 'Name is required.';
      isValid = false;
    }

    if (!phoneNumber || phoneNumber.length !== 10 || !/^\d{10}$/.test(phoneNumber)) {
      tempErrors.phoneNumber = 'Enter a valid 10-digit phone number.';
      isValid = false;
    }

    if (!street.trim()) {
      tempErrors.street = 'Street is required.';
      isValid = false;
    }

    if (!city.trim()) {
      tempErrors.city = 'City is required.';
      isValid = false;
    }

    if (!country.trim()) {
      tempErrors.country = 'Country is required.';
      isValid = false;
    }

    if (!postalCode.trim()) {
      tempErrors.postalCode = 'Postal Code is required.';
      isValid = false;
    }

    // Validate coordinates
    if (coordinates.latitude === 0 || coordinates.longitude === 0) {
      tempErrors.coordinates = 'Invalid coordinates. Please ensure location is correct.';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  // Handle submission
  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please correct the highlighted fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data
      const userData = {
        name,
        phoneNumber,
        location: {
          street,
          city,
          state: stateField,
          country,
          postalCode,
          coordinates,
        },
      };

      console.log('[handleSubmit] Submitting User Data:', userData);

      const API_ENDPOINT = 'http://10.0.2.2:5000/api/auth/register';

      console.log('[handleSubmit] Sending POST to:', API_ENDPOINT);

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      console.log('[handleSubmit] Response status:', response.status);

      const responseData = await response.json();
      console.log('[handleSubmit] Response JSON:', JSON.stringify(userData));

      if (response.ok) {
        // Optionally store data in AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        console.log("OTP pathuko",responseData.otp)
        console.log("ithaanda user",await AsyncStorage.getItem('user'))
        Alert.alert(
          'Registration Successful',
          'You have registered successfully.',
          [{ text: 'OK', onPress: () => navigation.navigate('OTPScreen', {phoneNumber}) }] // Adjust navigation as desired
        );
      } else {
        showErrorDialog(responseData.message || 'Failed to register user.');
      }
    } catch (error) {
      console.log('[handleSubmit] Error during submission:', error);
      showErrorDialog('An error occurred while saving your data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Enter Your Details</Text>

        {/* Name */}
        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          placeholder="Enter your full name"
          error={!!errors.name}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        {/* Phone Number */}
        <TextInput
          label="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          mode="outlined"
          keyboardType="number-pad"
          maxLength={10}
          style={styles.input}
          placeholder="Enter your mobile number"
          error={!!errors.phoneNumber}
        />
        {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}

        {/* Street */}
        <TextInput
          label="Street"
          value={street}
          onChangeText={setStreet}
          mode="outlined"
          style={styles.input}
          placeholder={
            isLoadingAddress ? 'Fetching location...' : 'Street name or House number'
          }
          editable={Platform.OS === 'web' || !isLoadingAddress}
          error={!!errors.street}
        />
        {errors.street && <Text style={styles.errorText}>{errors.street}</Text>}

        {/* City */}
        <TextInput
          label="City"
          value={city}
          onChangeText={setCity}
          mode="outlined"
          style={styles.input}
          placeholder={
            isLoadingAddress ? 'Fetching location...' : 'City / District'
          }
          editable={Platform.OS === 'web' || !isLoadingAddress}
          error={!!errors.city}
        />
        {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

        {/* State */}
        <TextInput
          label="State"
          value={stateField}
          onChangeText={setStateField}
          mode="outlined"
          style={styles.input}
          placeholder="Enter your state"
          editable={Platform.OS === 'web' || !isLoadingAddress}
        />
        {/* Not mandatory by default, so no error message here. If needed, add one. */}

        {/* Country */}
        <TextInput
          label="Country"
          value={country}
          onChangeText={setCountry}
          mode="outlined"
          style={styles.input}
          placeholder={isLoadingAddress ? 'Fetching location...' : 'Country'}
          editable={Platform.OS === 'web' || !isLoadingAddress}
          error={!!errors.country}
        />
        {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}

        {/* Postal Code */}
        <TextInput
          label="Postal Code"
          value={postalCode}
          onChangeText={setPostalCode}
          mode="outlined"
          keyboardType="number-pad"
          style={styles.input}
          placeholder={isLoadingAddress ? 'Fetching location...' : 'PIN / Zip Code'}
          editable={Platform.OS === 'web' || !isLoadingAddress}
          error={!!errors.postalCode}
        />
        {errors.postalCode && <Text style={styles.errorText}>{errors.postalCode}</Text>}

        {/* Submit Button or Loader */}
        {isSubmitting ? (
          <ActivityIndicator
            size="large"
            color={customTheme.colors.primary}
            style={styles.registerLoader}
          />
        ) : (
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            disabled={isSubmitting}
          >
            Submit
          </Button>
        )}

        {/* Error Dialog */}
        <MessageDialog
          visible={errorDialogVisible}
          onDismiss={closeErrorDialog}
          title="Error"
          message={errorDialogMessage}
          buttonLabel="OK"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default UserDetailsScreen;

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: customTheme.colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: customTheme.colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    backgroundColor: customTheme.colors.surface,
  
  },
  button: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: customTheme.colors.primary,
    borderRadius: 25,
    width: '50%',
  },
  buttonContent: {
    paddingVertical: 5,
    paddingHorizontal: 24,
  },
  buttonLabel: {
    fontSize: 16,
    color: customTheme.colors.surface,
    fontWeight: 'bold',
  },
  registerLoader: {
    marginTop: 24,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    marginLeft: 4,
  },
});

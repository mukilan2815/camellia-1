// src/screens/OTPScreen.js

import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import customTheme from '../utils/theme';
import MessageDialog from '../components/MessageDialog'; // Ensure this path is correct

const OTPScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { phoneNumber } = route.params; // Removed 'language' as per your requirement
  const { t } = useTranslation();

  const [otp, setOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // States for Error Dialog
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState('');

  const showErrorDialog = (message) => {
    setErrorDialogMessage(message);
    setErrorDialogVisible(true);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError(t('validationErrors.otpInvalid') || 'Enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);

    try {
      // Replace with your actual backend API endpoint
      const API_ENDPOINT =  'http://10.0.2.2:5000/api/auth/verify-otp' // For Android Emulator
        // For iOS Simulator or Physical Devices

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('OTP verified successfully:', responseData);

        // Optionally, update user data locally to reflect verification
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const updatedUser = JSON.parse(userData);
          updatedUser.isVerified = true;
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        }

        console.log('Navigating to Home screen');
        navigation.replace('Home');
      } else {
        const errorData = await response.json();
        console.error('Error verifying OTP:', errorData);
        showErrorDialog(errorData.message || 'Failed to verify OTP.');
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
      showErrorDialog('An error occurred while verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('enterOTP') || 'Enter OTP'}</Text>

      <TextInput
        label={t('otp') || 'OTP'}
        value={otp}
        onChangeText={(text) => {
          setOTP(text);
          setError('');
        }}
        mode="outlined"
        keyboardType="number-pad"
        maxLength={6}
        style={styles.input}
        error={!!error}
        placeholder={t('placeholders.enterOTP') || 'Enter your 6-digit OTP'}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button
        mode="contained"
        onPress={handleVerifyOTP}
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
        disabled={loading} // Disable button while verifying
      >
        {loading ? (
          <ActivityIndicator animating={true} color={customTheme.colors.surface} />
        ) : (
          t('submit') || 'Submit'
        )}
      </Button>

      {/* Error Dialog */}
      <MessageDialog
        visible={errorDialogVisible}
        onDismiss={() => setErrorDialogVisible(false)}
        title={t('dialogs.errorTitle') || 'Error'}
        message={t('dialogs.errorMessage', { message: errorDialogMessage }) || errorDialogMessage}
        buttonLabel={t('dialogs.ok') || 'OK'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.background, // Uses theme background color
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: customTheme.colors.text, // Uses theme text color
    marginBottom: 20,
  },
  input: {
    width: '80%',
    marginBottom: 10,
    backgroundColor: customTheme.colors.surface, // Ensures background consistency
  },
  button: {
    marginTop: 20,
    width: '50%',
    backgroundColor: customTheme.colors.primary, // Uses theme primary color
    borderRadius: 25,
  },
  buttonContent: {
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  buttonLabel: {
    fontSize: 18,
    color: customTheme.colors.surface, // Ensures contrast with the button
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    marginLeft: 4,
  },
});

export default OTPScreen;

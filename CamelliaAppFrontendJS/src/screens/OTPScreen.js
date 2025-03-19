import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Button, TextInput, Text } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import customTheme from "../utils/theme";
import MessageDialog from "../components/MessageDialog"; // Ensure this path is correct

const LANGUAGE_PREFERENCE_KEY = "user-language";

// Default static texts (including error messages) for the OTP screen
const defaultTexts = {
  heading: "Enter OTP",
  otpLabel: "OTP",
  otpPlaceholder: "Enter your 6-digit OTP",
  submit: "Submit",
  errorInvalidOTP: "Enter a valid 6-digit OTP.",
  errorDialogTitle: "Error",
  errorDialogMessage: "Failed to verify OTP.",
  locationError: "Location access is needed.",
  ok: "OK",
};

// Helper function to call the MyMemory translation API
const translateText = async (text, targetLang) => {
  try {
    if (targetLang === "en") return text;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=en|${targetLang}`;
    console.log(`Translating: "${text}" to ${targetLang}`);
    const response = await fetch(url);
    const data = await response.json();
    console.log(`Result: "${data.responseData.translatedText}"`);
    return data.responseData.translatedText || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Fallback to original text on error
  }
};

const OTPScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { phoneNumber } = route.params; // Phone number passed from previous screen

  // Local states
  const [otp, setOTP] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Error Dialog States
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  // Translation states
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [translatedTexts, setTranslatedTexts] = useState(defaultTexts);
  const [isTranslating, setIsTranslating] = useState(false);

  // Retrieve selected language from AsyncStorage on mount
  useEffect(() => {
    const getLanguage = async () => {
      try {
        const lang = await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);
        if (lang) {
          setSelectedLanguage(lang);
        }
      } catch (err) {
        console.error("Error fetching selected language:", err);
      }
    };
    getLanguage();
  }, []);

  // Fetch translations for all static texts if language is not English
  useEffect(() => {
    const fetchTranslations = async () => {
      if (selectedLanguage === "en") {
        setTranslatedTexts(defaultTexts);
        return;
      }
      setIsTranslating(true);
      try {
        const [
          heading,
          otpLabel,
          otpPlaceholder,
          submit,
          errorInvalidOTP,
          errorDialogTitle,
          errorDialogMessage,
          ok,
        ] = await Promise.all([
          translateText(defaultTexts.heading, selectedLanguage),
          translateText(defaultTexts.otpLabel, selectedLanguage),
          translateText(defaultTexts.otpPlaceholder, selectedLanguage),
          translateText(defaultTexts.submit, selectedLanguage),
          translateText(defaultTexts.errorInvalidOTP, selectedLanguage),
          translateText(defaultTexts.errorDialogTitle, selectedLanguage),
          translateText(defaultTexts.errorDialogMessage, selectedLanguage),
          translateText(defaultTexts.ok, selectedLanguage),
        ]);
        setTranslatedTexts({
          heading,
          otpLabel,
          otpPlaceholder,
          submit,
          errorInvalidOTP,
          errorDialogTitle,
          errorDialogMessage,
          ok,
        });
      } catch (error) {
        console.error("Error translating texts:", error);
      } finally {
        setIsTranslating(false);
      }
    };
    fetchTranslations();
  }, [selectedLanguage]);

  const closeErrorDialog = () => setErrorDialogVisible(false);

  const showErrorDialog = (message) => {
    setErrorDialogMessage(message);
    setErrorDialogVisible(true);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError(translatedTexts.errorInvalidOTP);
      return;
    }

    setLoading(true);

    try {
      // Replace with your actual backend API endpoint
      const API_ENDPOINT = "http://192.168.129.219:5000/api/auth/verify-otp";
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("OTP verified successfully:", responseData);

        // Optionally update user data locally to reflect verification
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const updatedUser = JSON.parse(userData);
          updatedUser.isVerified = true;
          await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        }
        console.log("Navigating to Home screen");
        navigation.replace("Home");
      } else {
        const errorData = await response.json();
        console.error(
          `Error verifying OTP (Status Code: ${response.status}):`,
          errorData
        );
        showErrorDialog(
          errorData.message || translatedTexts.errorDialogMessage
        );
        navigation.replace("Home");
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      showErrorDialog(translatedTexts.errorDialogMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>{translatedTexts.heading}</Text>

        <TextInput
          label={translatedTexts.otpLabel}
          value={otp}
          onChangeText={(text) => {
            setOTP(text);
            setError("");
          }}
          mode="outlined"
          keyboardType="number-pad"
          maxLength={6}
          style={styles.input}
          error={!!error}
          placeholder={translatedTexts.otpPlaceholder}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          mode="contained"
          onPress={handleVerifyOTP}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              animating={true}
              color={customTheme.colors.surface}
            />
          ) : (
            translatedTexts.submit
          )}
        </Button>

        {/* Error Dialog */}
        <MessageDialog
          visible={errorDialogVisible}
          onDismiss={closeErrorDialog}
          title={translatedTexts.errorDialogTitle}
          message={errorDialogMessage}
          buttonLabel={translatedTexts.ok}
        />
      </ScrollView>
      {/* Full-screen loading overlay while translations are in progress */}
      {isTranslating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={customTheme.colors.primary} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default OTPScreen;

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: customTheme.colors.background,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: customTheme.colors.text,
    marginBottom: 20,
  },
  input: {
    width: "80%",
    marginBottom: 10,
    backgroundColor: customTheme.colors.surface,
  },
  button: {
    marginTop: 20,
    width: "50%",
    backgroundColor: customTheme.colors.primary,
    borderRadius: 25,
  },
  buttonContent: {
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  buttonLabel: {
    fontSize: 18,
    color: customTheme.colors.surface,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
});

import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, Alert } from "react-native";
import { Button, Text, RadioButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import customTheme from "../utils/theme";
import * as Location from "expo-location";
import { Camera } from "expo-camera";

const LANGUAGE_PREFERENCE_KEY = "user-language";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "ml", label: "മലയാളം" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "te", label: "తెలుగు" },
  { code: "as", label: "অসমীয়া" },
];

// Helper function to call an open translation API (MyMemory)
const translateText = async (text, targetLang) => {
  try {
    // If target language is English, return original text
    if (targetLang === "en") return text;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=en|${targetLang}`;
    const response = await fetch(url);
    const data = await response.json();
    // MyMemory returns the translated text in data.responseData.translatedText
    return data.responseData.translatedText || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Fallback to original text on error
  }
};

const LanguageSelectionScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [translatedStrings, setTranslatedStrings] = useState({
    selectLanguage: "Select Language",
    next: "Next",
  });
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(null);

  // Function to fetch translations for page texts using MyMemory API
  const fetchTranslations = async (targetLang) => {
    if (targetLang === "en") {
      setTranslatedStrings({
        selectLanguage: "Select Language",
        next: "Next",
      });
    } else {
      const [selectLanguageText, nextText] = await Promise.all([
        translateText("Select Language", targetLang),
        translateText("Next", targetLang),
      ]);
      setTranslatedStrings({
        selectLanguage: selectLanguageText,
        next: nextText,
      });
    }
  };

  useEffect(() => {
    // Fetch translations when the selected language changes
    fetchTranslations(selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    // Request permissions for camera and location
    const requestPermissions = async () => {
      try {
        // Request Camera Permission
        const { status: cameraStatus } =
          await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(cameraStatus === "granted");

        if (cameraStatus !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Camera permission is required to use certain features of the app.",
            [{ text: "OK" }]
          );
        }

        // Request Location Permission
        const { status: locationStatus } =
          await Location.requestForegroundPermissionsAsync();
        setHasLocationPermission(locationStatus === "granted");

        if (locationStatus !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Location permission is required to access your location.",
            [{ text: "OK" }]
          );
          return; // Exit if location permission is not granted
        }

        // Fetch the current location
        const userLocation = await Location.getCurrentPositionAsync({});
        setLocation(userLocation.coords);
      } catch (error) {
        console.error("Error requesting permissions:", error);
        Alert.alert("Error", "An error occurred while requesting permissions.");
      }
    };

    requestPermissions();
  }, []);

  const handleNext = async () => {
    if (!location) {
      Alert.alert(
        "Location Required",
        "Unable to fetch your location. Please try again."
      );
      return;
    }

    try {
      // Save the selected language in AsyncStorage
      await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, selectedLanguage);

      // Save location data in AsyncStorage (optional)
      await AsyncStorage.setItem("user-location", JSON.stringify(location));

      console.log("Navigating to UserDetailsScreen with language and location");

      navigation.navigate("UserDetails", {
        language: selectedLanguage,
        location,
      });
    } catch (error) {
      console.error("Error setting language or location:", error);
      Alert.alert(
        "Error",
        "Failed to set language or fetch location. Please try again."
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{translatedStrings.selectLanguage}</Text>
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
            uncheckedColor={customTheme.colors.text} // Text color from theme
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
        {translatedStrings.next}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: customTheme.colors.background,
    padding: 16,
    justifyContent: "center",
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: customTheme.colors.text,
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 1,
  },
  radioLabel: {
    fontSize: 18,
    color: customTheme.colors.text,
  },
  button: {
    marginTop: 10,
    alignSelf: "center",
    backgroundColor: customTheme.colors.primary,
    borderRadius: 25,
  },
  buttonContent: {
    paddingVertical: 5,
    paddingHorizontal: 24,
  },
  buttonLabel: {
    fontSize: 18,
    color: customTheme.colors.surface,
  },
});

export default LanguageSelectionScreen;

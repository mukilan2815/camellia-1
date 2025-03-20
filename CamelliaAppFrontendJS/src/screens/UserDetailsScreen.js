import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import customTheme from "../utils/theme";
import MessageDialog from "../components/MessageDialog";

const { width } = Dimensions.get("window");

// -------------------- Translation Utils --------------------

// Language preference storage key
const LANGUAGE_PREFERENCE_KEY = "user-language";

// Supported languages (for reference)
const languages = [
  { code: "en", label: "English", translation: "English" },
  { code: "hi", label: "हिन्दी", translation: "Hindi" },
  { code: "ta", label: "தமிழ்", translation: "Tamil" },
  { code: "ml", label: "മലയാളം", translation: "Malayalam" },
  { code: "kn", label: "ಕನ್ನಡ", translation: "Kannada" },
  { code: "te", label: "తెలుగు", translation: "Telugu" },
  { code: "as", label: "অসমীয়া", translation: "Assamese" },
];

// Default texts (UI labels and error messages)
const defaultTexts = {
  heading: "Enter Your Details",
  nameLabel: "Name",
  namePlaceholder: "Enter your full name",
  phoneLabel: "Phone Number",
  phonePlaceholder: "Enter your mobile number",
  streetLabel: "Street",
  streetPlaceholder: "Street name or House number",
  cityLabel: "City",
  cityPlaceholder: "City / District",
  stateLabel: "State",
  statePlaceholder: "Enter your state",
  countryLabel: "Country",
  countryPlaceholder: "Country",
  postalLabel: "Postal Code",
  postalPlaceholder: "PIN / Zip Code",
  submit: "Submit",
  errorName: "Name is required.",
  errorPhone: "Enter a valid 10-digit phone number.",
  errorStreet: "Street is required.",
  errorCity: "City is required.",
  errorCountry: "Country is required.",
  errorPostal: "Postal Code is required.",
  errorCoordinates: "Invalid coordinates. Please ensure location is correct.",
  errorInvalidLocation: "Invalid location data. Please enter address manually.",
  errorUnableFetch:
    "Unable to fetch address from location. Please enter manually.",
  errorFetchingAddress: "An error occurred while fetching your address.",
  errorSubmit: "An error occurred while saving your data.",
  errorRegister: "Failed to register user.",
};

// Helper function to translate text using the MyMemory API
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
    return text;
  }
};

// -------------------- Main Form Component --------------------

const FormScreen = () => {
  const navigation = useNavigation();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    street: "",
    city: "",
    stateField: "",
    country: "",
    postalCode: "",
  });
  const [coordinates, setCoordinates] = useState({ latitude: 0, longitude: 0 });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);

  // Dialog state
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  // Translation state
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [translatedTexts, setTranslatedTexts] = useState(defaultTexts);
  const [isTranslating, setIsTranslating] = useState(false);

  // Header animation ref
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Load language preference
  useEffect(() => {
    const getLanguage = async () => {
      try {
        const lang = await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);
        if (lang) setSelectedLanguage(lang);
      } catch (err) {
        console.error("Error fetching language:", err);
      }
    };
    getLanguage();
  }, []);

  // Fetch translations if language is not English
  useEffect(() => {
    const fetchTranslations = async () => {
      if (selectedLanguage === "en") {
        setTranslatedTexts(defaultTexts);
        return;
      }
      setIsTranslating(true);
      try {
        const translations = {};
        for (const [key, value] of Object.entries(defaultTexts)) {
          translations[key] = await translateText(value, selectedLanguage);
        }
        setTranslatedTexts(translations);
      } catch (error) {
        console.error("Error translating texts:", error);
      } finally {
        setIsTranslating(false);
      }
    };
    fetchTranslations();
  }, [selectedLanguage]);

  // Animate header on mount
  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Fetch address from device location
  useEffect(() => {
    const fetchAddress = async () => {
      if (Platform.OS === "web") {
        setIsLoadingAddress(false);
        return;
      }
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setIsLoadingAddress(false);
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        if (!location || !location.coords) {
          showErrorDialog(translatedTexts.errorInvalidLocation);
          setIsLoadingAddress(false);
          return;
        }
        const { latitude, longitude } = location.coords;
        const addressArray = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (addressArray.length > 0) {
          const addr = addressArray[0];
          setFormData((prev) => ({
            ...prev,
            street: addr.street || "",
            city: addr.city || addr.town || addr.village || "",
            stateField: addr.region || addr.state || "",
            country: addr.country || "",
            postalCode: addr.postalCode || "",
          }));
          setCoordinates({
            latitude: addr.latitude || latitude,
            longitude: addr.longitude || longitude,
          });
        } else {
          showErrorDialog(translatedTexts.errorUnableFetch);
        }
      } catch (error) {
        showErrorDialog(translatedTexts.errorFetchingAddress);
      } finally {
        setIsLoadingAddress(false);
      }
    };
    fetchAddress();
  }, [translatedTexts]);

  // Helper to show error dialog
  const showErrorDialog = (message) => {
    setErrorDialogMessage(message);
    setErrorDialogVisible(true);
  };

  const closeErrorDialog = () => setErrorDialogVisible(false);

  // Input handler
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Validate entire form
  const validateAll = () => {
    let isValid = true;
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = translatedTexts.errorName;
      isValid = false;
    }
    if (
      !formData.phoneNumber ||
      formData.phoneNumber.length !== 10 ||
      !/^\d{10}$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber = translatedTexts.errorPhone;
      isValid = false;
    }
    if (!formData.street.trim()) {
      newErrors.street = translatedTexts.errorStreet;
      isValid = false;
    }
    if (!formData.city.trim()) {
      newErrors.city = translatedTexts.errorCity;
      isValid = false;
    }
    if (!formData.country.trim()) {
      newErrors.country = translatedTexts.errorCountry;
      isValid = false;
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = translatedTexts.errorPostal;
      isValid = false;
    }
    if (coordinates.latitude === 0 || coordinates.longitude === 0) {
      newErrors.coordinates = translatedTexts.errorCoordinates;
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  // Form submission handler
  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!validateAll()) {
      Alert.alert(
        translatedTexts.heading,
        "Please complete all required fields correctly."
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const userData = {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        location: {
          street: formData.street,
          city: formData.city,
          state: formData.stateField,
          country: formData.country,
          postalCode: formData.postalCode,
          coordinates,
        },
      };
      console.log("[handleSubmit] Submitting User Data:", userData);
      const API_ENDPOINT = "http://192.168.29.144:5000/api/auth/register";
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const responseData = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        Alert.alert(
          translatedTexts.heading,
          "You have registered successfully.",
          [
            {
              text: "OK",
              onPress: () =>
                navigation.navigate("OTPScreen", {
                  phoneNumber: formData.phoneNumber,
                }),
            },
          ]
        );
      } else {
        showErrorDialog(responseData.message || translatedTexts.errorRegister);
      }
    } catch (error) {
      console.log("[handleSubmit] Error during submission:", error);
      showErrorDialog(translatedTexts.errorSubmit);
    } finally {
      setIsSubmitting(false);
    }
  };

  // While translations are loading, show a full-screen loader
  if (isTranslating) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color={customTheme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Solid background using theme color */}
      <View style={styles.background} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Animated.Text
          style={[
            styles.heading,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {translatedTexts.heading}
        </Animated.Text>
        <TextInput
          mode="outlined"
          label={translatedTexts.nameLabel}
          value={formData.name}
          onChangeText={(text) => handleInputChange("name", text)}
          placeholder={translatedTexts.namePlaceholder}
          style={styles.input}
          theme={{ colors: { primary: customTheme.colors.primary } }}
          error={!!errors.name}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        <TextInput
          mode="outlined"
          label={translatedTexts.phoneLabel}
          value={formData.phoneNumber}
          onChangeText={(text) => handleInputChange("phoneNumber", text)}
          placeholder={translatedTexts.phonePlaceholder}
          keyboardType="number-pad"
          maxLength={10}
          style={styles.input}
          theme={{ colors: { primary: customTheme.colors.primary } }}
          error={!!errors.phoneNumber}
        />
        {errors.phoneNumber && (
          <Text style={styles.errorText}>{errors.phoneNumber}</Text>
        )}
        <TextInput
          mode="outlined"
          label={translatedTexts.streetLabel}
          value={formData.street}
          onChangeText={(text) => handleInputChange("street", text)}
          placeholder={
            isLoadingAddress
              ? "Fetching location..."
              : translatedTexts.streetPlaceholder
          }
          style={styles.input}
          theme={{ colors: { primary: customTheme.colors.primary } }}
          error={!!errors.street}
          editable={Platform.OS === "web" || !isLoadingAddress}
        />
        {errors.street && <Text style={styles.errorText}>{errors.street}</Text>}
        <TextInput
          mode="outlined"
          label={translatedTexts.cityLabel}
          value={formData.city}
          onChangeText={(text) => handleInputChange("city", text)}
          placeholder={
            isLoadingAddress
              ? "Fetching location..."
              : translatedTexts.cityPlaceholder
          }
          style={styles.input}
          theme={{ colors: { primary: customTheme.colors.primary } }}
          error={!!errors.city}
          editable={Platform.OS === "web" || !isLoadingAddress}
        />
        {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
        <TextInput
          mode="outlined"
          label={translatedTexts.stateLabel}
          value={formData.stateField}
          onChangeText={(text) => handleInputChange("stateField", text)}
          placeholder={translatedTexts.statePlaceholder}
          style={styles.input}
          theme={{ colors: { primary: customTheme.colors.primary } }}
          editable={Platform.OS === "web" || !isLoadingAddress}
        />
        <TextInput
          mode="outlined"
          label={translatedTexts.countryLabel}
          value={formData.country}
          onChangeText={(text) => handleInputChange("country", text)}
          placeholder={
            isLoadingAddress
              ? "Fetching location..."
              : translatedTexts.countryPlaceholder
          }
          style={styles.input}
          theme={{ colors: { primary: customTheme.colors.primary } }}
          error={!!errors.country}
          editable={Platform.OS === "web" || !isLoadingAddress}
        />
        {errors.country && (
          <Text style={styles.errorText}>{errors.country}</Text>
        )}
        <TextInput
          mode="outlined"
          label={translatedTexts.postalLabel}
          value={formData.postalCode}
          onChangeText={(text) => handleInputChange("postalCode", text)}
          placeholder={
            isLoadingAddress
              ? "Fetching location..."
              : translatedTexts.postalPlaceholder
          }
          keyboardType="number-pad"
          style={styles.input}
          theme={{ colors: { primary: customTheme.colors.primary } }}
          error={!!errors.postalCode}
          editable={Platform.OS === "web" || !isLoadingAddress}
        />
        {errors.postalCode && (
          <Text style={styles.errorText}>{errors.postalCode}</Text>
        )}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
        >
          {translatedTexts.submit}
        </Button>
      </ScrollView>
      <MessageDialog
        visible={errorDialogVisible}
        onDismiss={closeErrorDialog}
        title="Error"
        message={errorDialogMessage}
        buttonLabel="OK"
      />
      {isTranslating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={customTheme.colors.primary} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default FormScreen;

// -------------------- Styles --------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: customTheme.colors.background, // Solid background from theme
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 60,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: customTheme.colors.primary,
    marginBottom: 30,
    textAlign: "center",
    opacity: 0, // initial opacity for animation
  },
  input: {
    marginBottom: 15,
    backgroundColor: "white",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: customTheme.colors.primary,
    borderRadius: 30,
    paddingVertical: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
});

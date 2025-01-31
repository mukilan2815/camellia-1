// src/localization/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from './translations/en.json';
import hi from './translations/hi.json';
import ta from './translations/ta.json';
import ml from './translations/ml.json';
import kn from './translations/kn.json';
import te from './translations/te.json';
import as from './translations/as.json';

const LANGUAGE_PREFERENCE_KEY = 'user-language';

// Function to load the user's language preference from AsyncStorage
const loadLanguage = async () => {
  try {
    const language = await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);
    if (language) {
      return language;
    }
    return 'en'; // default language
  } catch (error) {
    console.error('Failed to load language preference:', error);
    return 'en'; // default language
  }
};

// Initialize i18next
const initializeI18n = async () => {
  const userLanguage = await loadLanguage();

  i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
      resources: {
        en: { translation: en },
        hi: { translation: hi },
        ta: { translation: ta },
        ml: { translation: ml },
        kn: { translation: kn },
        te: { translation: te },
        as: { translation: as },
      },
      lng: userLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // react already safes from xss
      },
    });
};

initializeI18n();

export default i18n;

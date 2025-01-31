// src/utils/theme.js
import { DefaultTheme } from "react-native-paper";

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#2E7D32", // Warm Orange (Primary Button)
    accent: "#4C956C", // Green
    background: "#FFFFFF", // White
    surface: "#FFFFFF", // White
    text: "#2C6E49", // Dark Green (Better readability)
    onSurface: '#F3FAF6',
    // Button Text Contrast Fix:
    onPrimary: "#FFFFFF", // Button Text on Primary (Changed to White for better contrast)
    onAccent: "#FFFFFF", // Button Text on Accent

    // Other Colors:
    disabled: "rgba(0, 0, 0, 0.26)",
    placeholder: "rgba(0, 0, 0, 0.54)",
    backdrop: "rgba(0, 0, 0, 0.5)",
  },
  // You can customize fonts, roundness, etc.
};

export default customTheme;

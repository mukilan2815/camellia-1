// src/navigation/AppNavigator.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import customTheme from "../utils/theme";

// Import Screens
import GetStartedScreen from "../screens/GetStartedScreen";
import LanguageSelectionScreen from "../screens/LanguageSelectionScreen";
import UserDetailsScreen from "../screens/UserDetailsScreen";
import OTPScreen from "../screens/OTPScreen";
import HomeScreen from "../screens/HomeScreen";
import Prediction from "../screens/Prediction";
import CameraScreen from "../screens/Camera";
import ScanCamera from "../screens/ScanCamera";
import WeatherForecastScreen from "../screens/WeatherForecasting";
const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <PaperProvider theme={customTheme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="GetStarted">
          <Stack.Screen
            name="GetStarted"
            component={GetStartedScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="LanguageSelection"
            component={LanguageSelectionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="UserDetails"
            component={UserDetailsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OTPScreen"
            component={OTPScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Prediction"
            component={Prediction}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ScanCamera"
            component={ScanCamera}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="WeatherForecast"
            component={WeatherForecastScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default AppNavigator;

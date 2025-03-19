// src/navigation/AppNavigator.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
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
import TeaHub from "../screens/Teahub";
import Profile from "../screens/Profile";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "TeaHub") {
            iconName = "tea";
          } else if (route.name === "Profile") {
            iconName = "account";
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: {
          height: 80,
          paddingBottom: 30,
          paddingTop: 5,
          flexDirection: "row",
          justifyContent: "space-around",
          paddingHorizontal: 24,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: "#FFFFFF",
          elevation: 8,
        },
        tabBarItemStyle: {
          alignItems: "center",
          paddingHorizontal: 16,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          color: "#6B7280",
          marginTop: 4,
        },
        tabBarActiveItemStyle: {
          backgroundColor: "#E8F5E9",
          paddingVertical: 8,
          borderRadius: 24,
        },
        tabBarActiveLabelStyle: {
          color: "#4CAF50",
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="TeaHub"
        component={TeaHub}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator
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
            component={BottomTabNavigator} // Use the BottomTabNavigator here
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

// src/screens/HomeScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { Text, Surface, useTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Location from "expo-location";
import customTheme from "../utils/theme"; // If needed directly
// import Prediction from "./Prediction"; // if you need to reference


const API_KEY = "9dac1789f6909ca2205c94277b32f8bd";

const newsData = [
  {
    id: 1,
    title: "Agriculture Advances in 2025",
    subtitle: "Innovations transforming farming practices.",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854",
  },
  {
    id: 2,
    title: "Sustainable Farming Techniques",
    subtitle: "Eco-friendly methods gaining popularity.",
    image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2",
  },
  {
    id: 3,
    title: "Crop Management Tips",
    subtitle: "Maximize yield with these strategies.",
    image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9",
  },
  {
    id: 4,
    title: "Market Trends for Farmers",
    subtitle: "Stay ahead with the latest insights.",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
  },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme(); // Access the theme's colors
  const [user, setUser] = useState(null);
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserAndLocation();
  }, []);

  const loadUserAndLocation = async () => {
    try {
      const storedUserString = await AsyncStorage.getItem("user");
      if (storedUserString) {
        setUser(JSON.parse(storedUserString));
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Location permission denied");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      await fetchWeather(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      const response = await fetch(url);
      const data = await response.json();
      if (data?.weather) setWeather(data);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      Clear: "weather-sunny",
      Clouds: "weather-cloudy",
      Rain: "weather-rainy",
      Snow: "weather-snowy",
      Thunderstorm: "weather-lightning",
      Drizzle: "weather-rainy",
      Mist: "weather-fog",
      Smoke: "weather-fog",
      Haze: "weather-hazy",
      Dust: "weather-fog",
      Fog: "weather-fog",
      Sand: "weather-fog",
      Ash: "weather-fog",
      Squall: "weather-windy",
      Tornado: "weather-tornado",
      default: "weather-partly-cloudy",
    };
    return icons[condition] || icons.default;
  };

  const WeatherCard = () => {
    if (!weather) return null;
    return (
      <Surface
        style={[styles.weatherCard, { backgroundColor: colors.onSurface }]}
      >
        <View style={styles.weatherInfo}>
          <View style={styles.weatherDetails}>
            <View style={styles.weatherHeader}>
              <Icon name="map-marker" size={15} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.text }]}>
                {weather.name}
              </Text>
            </View>
            <View style={styles.weatherData}>
              <Text style={[styles.temperature, { color: colors.text }]}>
                {Math.round(weather.main.temp)}°C
              </Text>
              <Text style={[styles.weatherDesc, { color: colors.placeholder }]}>
                {weather.weather[0].main}
              </Text>
            </View>
          </View>
          <Icon
            name={getWeatherIcon(weather.weather[0].main)}
            size={60}
            color={colors.primary}
          />
        </View>
      </Surface>
    );
  };

  const NewsBanner = () => (
    <View style={styles.newsBanner}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {newsData.map((news) => (
          <Surface
            key={news.id}
            style={[styles.newsCard, { backgroundColor: colors.surface }]}
          >
            <Image source={{ uri: news.image }} style={styles.newsImage} />
            <View style={styles.newsContent}>
              <Text
                style={[styles.newsTitle, { color: colors.text }]}
                numberOfLines={2}
              >
                {news.title}
              </Text>
              <Text
                style={[styles.newsSubtitle, { color: colors.placeholder }]}
                numberOfLines={2}
              >
                {news.subtitle}
              </Text>
            </View>
          </Surface>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header + Weather */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <Image
                source={{ uri: "https://i.pravatar.cc/150" }}
                style={styles.avatar}
              />
              <View style={styles.welcomeText}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {user?.name || "Alex William"}
                </Text>
                <Text style={{ fontSize: 14, color: colors.placeholder }}>
                  Welcome Back! 👋
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Notifications")}
            >
              <Icon name="bell-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <WeatherCard />
        </View>

        {/* News Banner */}
        <NewsBanner />

        {/* Scan Section */}
        <View
          style={[styles.scanSection, { backgroundColor: colors.onSurface }]}
        >
          <View style={styles.scanHeader}>
            <Icon name="leaf" size={20} color={colors.primary} />
            <Text style={[styles.scanTitle, { color: colors.text }]}>
              Know plant disease with plantia AI
            </Text>
          </View>
          <Text style={[styles.scanSubtitle, { color: colors.placeholder }]}>
            Lorem ipsum dolor sit amet consectetur
          </Text>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => navigation.navigate("ScanCamera")}
          >
            <Text
              style={{ color: colors.primary, fontWeight: "600", fontSize: 16 }}
            >
              Scan Now
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Diagnoses */}
        <View style={styles.diagnosesSection}>
          <View style={styles.diagnosesHeader}>
            <Text style={[styles.diagnosesTitle, { color: colors.text }]}>
              Recent Diagnose
            </Text>
            <TouchableOpacity>
              <Text style={{ fontSize: 14, color: colors.primary }}>
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {[
            { name: "Powder Mildew", plant: "Spinach", time: "2h ago" },
            { name: "Bacterial Spot", plant: "Carrot", time: "Jul 3, 2024" },
            { name: "Blight", plant: "Apple", time: "Jun 24, 2024" },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.diagnoseItem}
              onPress={() =>
                navigation.navigate("Prediction", { diagnosis: item })
              }
            >
              <View style={styles.diagnoseIcon}>
                <Icon name="leaf" size={20} color={colors.primary} />
              </View>
              <View style={styles.diagnoseInfo}>
                <Text style={[styles.diagnoseName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 14, color: colors.placeholder }}>
                  {item.plant}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: colors.placeholder }}>
                {item.time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* FLOATING CAMERA BUTTON (optional, if you still want it on HomeScreen) */}
      <TouchableOpacity
        style={styles.cameraButton}
        onPress={() => navigation.navigate("ScanCamera")}
      >
        <Icon name="camera" size={34} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <Surface style={[styles.bottomNav, { backgroundColor: colors.surface }]}>
        {[
          { icon: "home", label: "Home", active: true },
          { icon: "newspaper", label: "Tea Hub", active: false },
          { icon: "account", label: "Profile", active: false },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.navItem, item.active && styles.navItemActive]}
            onPress={() => {
              if (item.label === "Home") {
                // Already here
              } else if (item.label === "Tea Hub") {
                navigation.navigate("TeaHub");
              } else {
                navigation.navigate("Profile");
              }
            }}
          >
            <Icon
              name={item.icon}
              size={24}
              color={item.active ? colors.primary : "#6B7280"}
            />
            <Text
              style={[
                styles.navLabel,
                item.active && styles.navLabelActive,
                { color: item.active ? colors.primary : "#6B7280" },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </Surface>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  welcomeText: {
    justifyContent: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  weatherCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  weatherInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weatherDetails: {
    flex: 1,
    paddingRight: 8,
  },
  weatherHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 4,
  },
  temperature: {
    fontSize: 24,
    fontWeight: "600",
  },
  weatherDesc: {
    fontSize: 14,
  },
  newsBanner: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  newsCard: {
    width: 250,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
    elevation: 2,
  },
  newsImage: {
    width: "100%",
    height: 120,
  },
  newsContent: {
    padding: 12,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  newsSubtitle: {
    fontSize: 12,
  },
  scanSection: {
    margin: 18,
    padding: 18,
    borderRadius: 16,
  },
  scanHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  scanTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  scanSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  diagnosesSection: {
    margin: 16,
  },
  diagnosesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  diagnosesTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  diagnoseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  diagnoseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  diagnoseInfo: {
    flex: 1,
  },
  diagnoseName: {
    fontSize: 16,
    fontWeight: "500",
  },
  cameraButton: {
    position: "absolute",
    bottom: 70,
    alignSelf: "center",
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 6,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 4,
  },
  navItem: {
    alignItems: "center",
    paddingHorizontal: 18,
  },
  navItemActive: {
    backgroundColor: "#E8F5E9",
    paddingVertical: 5,
    borderRadius: 24,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  navLabelActive: {
    color: "#4CAF50",
  },
});

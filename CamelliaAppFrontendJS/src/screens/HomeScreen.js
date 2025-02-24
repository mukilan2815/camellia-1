import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { Text, Surface } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Location from "expo-location";

const API_KEY = "8cf62faa46f163cabb513fb54b5bcc50";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserAndLocation();
  }, []);

  const loadUserAndLocation = async () => {
    try {
      // Load user data
      const storedUserString = await AsyncStorage.getItem("user");
      if (storedUserString) {
        setUser(JSON.parse(storedUserString));
      }

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Location permission denied");
        setLoading(false);
        return;
      }

      // Get current location
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

  const fetchWeather = async (latitude, longitude) => {
    try {
      // Basic weather endpoint to get city name, temperature, etc.
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
      const response = await fetch(url);
      const data = await response.json();
      if (data?.weather) {
        setWeather(data);
      }
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
      Drizzle: "weather-pouring",
      default: "weather-partly-cloudy",
    };
    return icons[condition] || icons.default;
  };

  const WeatherCard = () =>
    weather && (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate("WeatherForecast", {
            lat: location?.coords.latitude,
            lon: location?.coords.longitude,
          })
        }
      >
        <Surface style={styles.weatherCard}>
          <View style={styles.weatherContent}>
            {/* Location, Temperature & Description on the left */}
            <View style={{ flex: 1 }}>
              <Text style={styles.locationText}>{weather.name}</Text>
              <Text style={styles.temperature}>
                {Math.round(weather.main.temp)}°C
              </Text>
              <Text style={styles.weatherDesc}>{weather.weather[0].main}</Text>
            </View>
            {/* Icon on the right (larger size) */}
            <Icon
              name={getWeatherIcon(weather.weather[0].main)}
              size={48}
              color="#4CAF50"
            />
          </View>
        </Surface>
      </TouchableOpacity>
    );

  return (
    <SafeAreaView style={styles.container}>
      {/* Make the container position 'relative' so our floating button can be absolutely positioned */}
      <View style={{ flex: 1, position: "relative" }}>
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          // ↑ Padding at bottom so content isn't hidden behind floating button/nav
        >
          {/* Header with Weather */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.userInfo}>
                <Image
                  source={{ uri: "https://i.pravatar.cc/150" }}
                  style={styles.avatar}
                />
                <View style={styles.welcomeText}>
                  <Text style={styles.userName}>
                    {user?.name || "Alex William"}
                  </Text>
                  <Text style={styles.greeting}>Welcome Back! 👋</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("Notifications")}
              >
                <Icon name="bell-outline" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>
            <WeatherCard />
          </View>

          {/* Main Banner */}
          <Surface style={styles.banner}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854",
              }}
              style={styles.bannerImage}
            />
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerTitle}>
                Learn how plantia helps 10,000+ farmers
              </Text>
              <Text style={styles.bannerSubtitle}>
                Lorem ipsum dolor sit amet consectetur
              </Text>
            </View>
          </Surface>

          {/* Scan Section */}
          <View style={styles.scanSection}>
            <View style={styles.scanHeader}>
              <Icon name="leaf" size={20} color="#4CAF50" />
              <Text style={styles.scanTitle}>
                Know plant disease with plantia AI
              </Text>
            </View>
            <Text style={styles.scanSubtitle}>
              Lorem ipsum dolor sit amet consectetur
            </Text>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => navigation.navigate("ScanCamera")}
            >
              <Text style={styles.scanButtonText}>Scan Now</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Diagnoses */}
          <View style={styles.diagnosesSection}>
            <View style={styles.diagnosesHeader}>
              <Text style={styles.diagnosesTitle}>Recent Diagnose</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {[
              { name: "Powder Mildew", plant: "Spinach", time: "2h ago" },
              { name: "Bacterial Spot", plant: "Carrot", time: "Jul 3, 2024" },
              { name: "Blight", plant: "Apple", time: "Jun 24, 2024" },
            ].map((item, index) => (
              <View key={index} style={styles.diagnoseItem}>
                <View style={styles.diagnoseIcon}>
                  <Icon name="leaf" size={20} color="#4CAF50" />
                </View>
                <View style={styles.diagnoseInfo}>
                  <Text style={styles.diagnoseName}>{item.name}</Text>
                  <Text style={styles.diagnosePlant}>{item.plant}</Text>
                </View>
                <Text style={styles.diagnoseTime}>{item.time}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Floating Analysis Button */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate("ScanCamera")}
        >
          <Icon name="magnify" size={24} color="#FFFFFF" />
          <Text style={styles.floatingButtonText}>Analysis</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <Surface style={styles.bottomNav}>
        {[
          { icon: "home", label: "Home", active: true },
          { icon: "newspaper", label: "Tea Hub", active: false },
          { icon: "account", label: "Profile", active: false },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.navItem, item.active && styles.navItemActive]}
          >
            <Icon
              name={item.icon}
              size={24}
              color={item.active ? "#4CAF50" : "#6B7280"}
            />
            <Text
              style={[styles.navLabel, item.active && styles.navLabelActive]}
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
    backgroundColor: "#FFFFFF",
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
    color: "#1A1A1A",
  },
  greeting: {
    fontSize: 14,
    color: "#6B7280",
  },
  weatherCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginTop: 8,
    height: 100,
  },
  weatherContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#333333",
    marginBottom: 6,
  },
  temperature: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  weatherDesc: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  banner: {
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
  },
  bannerImage: {
    width: "100%",
    height: 200,
  },
  bannerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  scanSection: {
    margin: 16,
    padding: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
  },
  scanHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  scanTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  scanSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  scanButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
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
    color: "#1A1A1A",
  },
  seeAll: {
    fontSize: 14,
    color: "#4CAF50",
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
    color: "#1A1A1A",
  },
  diagnosePlant: {
    fontSize: 14,
    color: "#6B7280",
  },
  diagnoseTime: {
    fontSize: 12,
    color: "#6B7280",
  },
  // Removed the old "analysisContainer"; now using absolute positioning:
  floatingButton: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    bottom: 20, // adjust as needed so it's above the bottom nav
    alignSelf: "center", // center horizontally
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 4, // for Android shadow
    shadowColor: "#000", // for iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingButtonText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
    elevation: 8,
  },
  navItem: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  navItemActive: {
    backgroundColor: "#E8F5E9",
    paddingVertical: 8,
    borderRadius: 24,
  },
  navLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  navLabelActive: {
    color: "#4CAF50",
  },
});

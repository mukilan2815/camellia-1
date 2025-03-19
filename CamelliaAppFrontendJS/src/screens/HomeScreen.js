"use client";

import { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  FlatList,
} from "react-native";
import { Text, Surface } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";

const API_KEY = "8cf62faa46f163cabb513fb54b5bcc50";
const { width } = Dimensions.get("window");

// Banner data with fake content
const bannerData = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854",
    title: "Learn how plantia helps 10,000+ farmers",
    subtitle: "Discover sustainable farming techniques",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8",
    title: "Increase crop yield by 40% with AI",
    subtitle: "Smart technology for modern agriculture",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399",
    title: "Organic farming certification guide",
    subtitle: "Step-by-step process for certification",
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8",
    title: "Seasonal planting calendar 2024",
    subtitle: "Optimize your growing schedule",
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae",
    title: "Drought-resistant varieties",
    subtitle: "Climate-smart agriculture solutions",
  },
  {
    id: "6",
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b",
    title: "Community farming initiatives",
    subtitle: "Join local agricultural networks",
  },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scanButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadUserAndLocation();

    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
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

  const handleScanButtonPress = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(scanButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scanButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => navigation.navigate("ScanCamera"));
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
        <Animated.View
          style={[
            styles.weatherCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <LinearGradient
            colors={["#3a7bd5", "#00d2ff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.weatherGradient}
          >
            <View style={styles.weatherContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationText}>{weather.name}</Text>
                <Text style={styles.temperature}>
                  {Math.round(weather.main.temp)}°C
                </Text>
                <Text style={styles.weatherDesc}>
                  {weather.weather[0].main}
                </Text>
              </View>
              <Icon
                name={getWeatherIcon(weather.weather[0].main)}
                size={48}
                color="#FFFFFF"
              />
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );

  // Render banner item
  const renderBannerItem = ({ item, index }) => {
    return (
      <Animated.View
        style={[
          styles.bannerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Surface style={styles.banner}>
          <Image source={{ uri: item.image }} style={styles.bannerImage} />
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]}
            style={styles.bannerOverlay}
          >
            <Text style={styles.bannerTitle}>{item.title}</Text>
            <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          </LinearGradient>
        </Surface>
      </Animated.View>
    );
  };

  // Render pagination dots
  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {bannerData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === activeIndex ? "#4CAF50" : "#D1D5DB",
              },
            ]}
          />
        ))}
      </View>
    );
  };

  // Handle scroll event for pagination
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / (width - 32));
    if (currentIndex !== activeIndex) {
      setActiveIndex(currentIndex);
    }
  };

  // Header opacity animation based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Animated Header Background */}
      <Animated.View
        style={[styles.headerBackground, { opacity: headerOpacity }]}
      />

      <View style={{ flex: 1, position: "relative" }}>
        <Animated.ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          {/* Header with Weather */}
          <View style={styles.header}>
            <Animated.View
              style={[
                styles.headerContent,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
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
                style={styles.notificationButton}
              >
                <Icon name="bell-outline" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </Animated.View>
            <WeatherCard />
          </View>

          {/* Horizontal Banner Carousel */}
          <View style={styles.carouselSection}>
            <View style={styles.carouselHeader}>
              <Text style={styles.carouselTitle}>Featured Content</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={bannerData}
              renderItem={renderBannerItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              snapToInterval={width - 32}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            />

            {renderPaginationDots()}
          </View>

          {/* Scan Section */}
          <Animated.View
            style={[
              styles.scanSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <LinearGradient
              colors={["#F9F9F9", "#F3F4F6"]}
              style={styles.scanGradient}
            >
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
                onPress={handleScanButtonPress}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={["#4CAF50", "#2E7D32"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.scanButtonGradient}
                >
                  <Text style={styles.scanButtonText}>Scan Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Recent Diagnoses */}
          <Animated.View
            style={[
              styles.diagnosesSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
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
              <Animated.View
                key={index}
                style={[
                  styles.diagnoseItem,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                    animationDelay: `${index * 100}ms`,
                  },
                ]}
              >
                <View style={styles.diagnoseIcon}>
                  <LinearGradient
                    colors={["#F0F9F0", "#E8F5E9"]}
                    style={styles.diagnoseIconGradient}
                  >
                    <Icon name="leaf" size={20} color="#4CAF50" />
                  </LinearGradient>
                </View>
                <View style={styles.diagnoseInfo}>
                  <Text style={styles.diagnoseName}>{item.name}</Text>
                  <Text style={styles.diagnosePlant}>{item.plant}</Text>
                </View>
                <Text style={styles.diagnoseTime}>{item.time}</Text>
              </Animated.View>
            ))}
          </Animated.View>
        </Animated.ScrollView>

        {/* Floating Analysis Button */}
        <Animated.View
          style={[
            styles.floatingButtonContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scanButtonScale },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={handleScanButtonPress}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#4CAF50", "#2E7D32"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.floatingButtonGradient}
            >
              <Icon name="magnify" size={24} color="#FFFFFF" />
              <Text style={styles.floatingButtonText}>Analysis</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#FFFFFF",
    zIndex: 1,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 24,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#E8F5E9",
  },
  welcomeText: {
    justifyContent: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 0.2,
  },
  greeting: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  weatherCard: {
    borderRadius: 16,
    marginTop: 8,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  weatherGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    height: 110,
  },
  weatherContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 6,
    opacity: 0.9,
  },
  temperature: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  weatherDesc: {
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 4,
    opacity: 0.9,
  },
  // Carousel section styles
  carouselSection: {
    marginTop: 16,
  },
  carouselHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  carouselTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 0.2,
  },
  carouselContent: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  bannerContainer: {
    width: width - 32,
    paddingRight: 12,
  },
  banner: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bannerImage: {
    width: "100%",
    height: 180,
  },
  bannerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  scanSection: {
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scanGradient: {
    padding: 20,
    borderRadius: 16,
  },
  scanHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    letterSpacing: 0.2,
  },
  scanSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
    lineHeight: 20,
  },
  scanButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scanButtonGradient: {
    padding: 14,
    alignItems: "center",
    borderRadius: 12,
  },
  scanButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
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
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 0.2,
  },
  seeAll: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  diagnoseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  diagnoseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    overflow: "hidden",
  },
  diagnoseIconGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  diagnoseInfo: {
    flex: 1,
  },
  diagnoseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  diagnosePlant: {
    fontSize: 14,
    color: "#6B7280",
  },
  diagnoseTime: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  floatingButton: {
    borderRadius: 30,
    overflow: "hidden",
  },
  floatingButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
  },
  floatingButtonText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

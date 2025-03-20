import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
  StatusBar,
  FlatList,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

// Onboarding data with illustrations and descriptions
const onboardingData = [
  {
    id: "1",
    title: "Welcome to Camellia",
    description:
      "Your smart assistant for tea leaf disease detection and management",
    image: require("../assets/images/tea.png"),
    illustration:
      "https://png.pngtree.com/png-vector/20220901/ourmid/pngtree-tea-leaf-vector-illustration-png-image_6131508.png", // Tea leaf illustration
  },
  {
    id: "2",
    title: "Instant Disease Detection",
    description:
      "Take a photo of your tea leaves and get instant AI-powered disease diagnosis",
    image: require("../assets/images/tea5.jpg"),
    illustration:
      "https://png.pngtree.com/png-vector/20220929/ourmid/pngtree-golden-leaf-camera-photography-logo-png-image_6221021.png", // Camera scanning leaves illustration
  },
  {
    id: "3",
    title: "Treatment Recommendations",
    description:
      "Receive personalized treatment plans and prevention strategies",
    image: require("../assets/images/tea11.jpg"),
    illustration: "https://cdn-icons-png.flaticon.com/512/2688/2688386.png", // Treatment illustration
  },
  {
    id: "4",
    title: "Track Your Progress",
    description:
      "Monitor the health of your tea plants over time with detailed analytics",
    image: require("../assets/images/tea.png"),
    illustration: "https://cdn-icons-png.flaticon.com/512/4149/4149663.png", // Analytics illustration
  },
];

const WelcomeScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const illustrationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check AsyncStorage for user data
    const checkUserData = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        navigation.navigate("Home");
        return;
      }
    };
    checkUserData();

    // Start illustration animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(illustrationAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(illustrationAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [navigation]);

  // Handle button press animations
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Handle skip to last slide
  const handleSkip = () => {
    slidesRef.current.scrollToIndex({
      index: onboardingData.length - 1,
      animated: true,
    });
  };

  // Handle next slide
  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  // Handle get started (navigate to main app)
  const handleGetStarted = () => {
    // Animate before navigating
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 50,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      navigation.navigate("LanguageSelection");
    });
  };

  // Render individual onboarding item
  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    // Animations based on scroll position
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: "clamp",
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [50, 0, 50],
      extrapolate: "clamp",
    });

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: "clamp",
    });

    // Floating animation for illustrations
    const illustrationTranslateY = illustrationAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -15],
    });

    return (
      <View style={styles.slide}>
        {/* Background Image with Gradient Overlay */}
        <Image
          source={item.image}
          style={styles.backgroundImage}
          blurRadius={3}
        />
        <View style={styles.gradientOverlay} />

        {/* Illustration */}
        <Animated.View
          style={[
            styles.illustrationContainer,
            {
              opacity,
              transform: [{ translateY: illustrationTranslateY }, { scale }],
            },
          ]}
        >
          <Image
            source={{ uri: item.illustration }}
            style={styles.illustration}
          />
        </Animated.View>

        {/* Text Content */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  // Render pagination dots
  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={`dot-${index}`}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      {/* Top Section - Logos & Version */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo2.png")}
            style={styles.logo}
          />
          <Text style={styles.logoText}>Camellia</Text>
        </View>

        {/* Skip button */}
        {currentIndex < onboardingData.length - 1 && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Onboarding Slides */}
      <Animated.View
        style={[
          styles.slidesContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}
      >
        <FlatList
          ref={slidesRef}
          data={onboardingData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
          scrollEventThrottle={16}
        />
      </Animated.View>

      {/* Pagination Dots */}
      {renderPagination()}

      {/* Bottom Buttons */}
      <Animated.View
        style={[
          styles.bottomContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleNext}
        >
          <Animated.View
            style={[styles.button, { transform: [{ scale: scaleAnim }] }]}
          >
            <Text style={styles.buttonText}>
              {currentIndex === onboardingData.length - 1
                ? "Get Started"
                : "Next"}
            </Text>
            <Ionicons
              name={
                currentIndex === onboardingData.length - 1
                  ? "arrow-forward"
                  : "arrow-forward"
              }
              size={20}
              color="#000"
              style={styles.buttonIcon}
            />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* Version Text */}
      <Text style={styles.versionText}>v1.0</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  slidesContainer: {
    flex: 1,
  },
  slide: {
    width,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    position: "absolute",
    width,
    height,
    opacity: 0.6,
  },
  gradientOverlay: {
    position: "absolute",
    width,
    height,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  illustrationContainer: {
    width: width * 0.8,
    height: height * 0.4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  illustration: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  textContainer: {
    width: width * 0.8,
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#9FE870",
    marginHorizontal: 5,
  },
  bottomContainer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    alignItems: "center",
  },
  button: {
    width: width - 64,
    backgroundColor: "#9FE870",
    borderRadius: 30,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonIcon: {
    marginLeft: 10,
  },
  versionText: {
    position: "absolute",
    bottom: 10,
    right: 10,
    fontSize: 10,
    color: "#FFFFFF",
    opacity: 0.5,
  },
});

export default WelcomeScreen;

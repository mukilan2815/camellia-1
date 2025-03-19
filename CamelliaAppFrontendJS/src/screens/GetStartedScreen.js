import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const WelcomeScreen = ({ navigation }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const backgroundImages = [
    require("../assets/images/tea.png"),
    require("../assets/images/tea5.jpg"),
    require("../assets/images/tea11.jpg"),
  ];
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

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 3000);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    return () => clearInterval(interval);
  }, [navigation]);

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

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Animated.Image
        source={backgroundImages[currentImage]}
        style={[
          styles.backgroundImage,
          {
            opacity: fadeAnim,
            transform: [
              {
                scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1.1, 1],
                }),
              },
            ],
          },
        ]}
        blurRadius={0.7}
      />

      {/* Top Section - Logos & Version */}
      <View style={styles.topContainer}>
        <Image
          source={require("../assets/images/kahe.png")}
          style={styles.kahe}
        />
        <Image
          source={require("../assets/images/logo2.png")}
          style={styles.logo}
        />
      </View>

      <Text style={styles.versionText}>v1</Text>

      {/* Logo Circles
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logomain1.png")}
          style={styles.logo1}
        />
        <Text style={styles.logoText}>Camellia</Text>
      </View> */}

      {/* Bottom Content */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => navigation.navigate("LanguageSelection")}
        >
          <Animated.View
            style={[styles.button, { transform: [{ scale: scaleAnim }] }]}
          >
            <Text style={styles.buttonText}>Start Now</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    position: "absolute",
    width: width,
    height: height,
    opacity: 0.6,
  },
  topContainer: {
    // position: "absolute",
    // top: 20,
    left: 20,
    width: width - 40,
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  kahe: {
    width: 140,
    height: 140,
    resizeMode: "contain",
  },
  logo1: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  versionText: {
    position: "absolute",
    bottom: 10,
    right: 10,
    fontSize: 10,
    color: "#FFFFFF",
    opacity: 0.5,
  },
  logoContainer: {
    position: "absolute",
    top: "30%",
    alignSelf: "center",
    alignItems: "center",
  },
  circleContainer: {
    position: "relative",
    width: 64,
    height: 64,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  circleBack: {
    position: "absolute",
    top: -16,
    left: -16,
  },
  logoText: {
    marginTop: 24,
    color: "#FFFFFF",
    fontSize: 30,
    fontFamily: "sans-serif",
    // fontWeight: "bold",
    letterSpacing: 3,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  button: {
    width: width - 64,
    backgroundColor: "#9FE870",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    bottom: 30,
  },
  buttonText: {
    color: "#000000",
    fontSize: 18,

    fontWeight: "bold",
  },
  loginContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  loginText: {
    color: "#9BA3AF",
    fontSize: 14,
    marginBottom: 8,
  },
  loginLink: {
    color: "#9FE870",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default WelcomeScreen;

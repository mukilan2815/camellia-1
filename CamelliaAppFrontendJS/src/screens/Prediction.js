import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  Share,
  Platform,
  ActivityIndicator,
  Dimensions,
  Alert,
  TextInput,
  Animated,
  PanResponder,
  Easing,
  Vibration,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Location from "expo-location";
import axios from "axios";
import { LineChart } from "react-native-chart-kit";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";

const GEMINI_API_KEY = "AIzaSyAt149CIT6Nhw9FSXTSZGKNLbqXKfLkSCQ";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
const API_KEY = "9dac1789f6909ca2205c94277b32f8bd";

const parseMessageText = (text) => {
  if (!text) return [];

  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return {
        id: index,
        text: part.slice(2, -2),
        isBold: true,
      };
    }
    return {
      id: index,
      text: part,
      isBold: false,
    };
  });
};

// Animated Chat Message Component with enhanced animations and formatting
const ChatMessageItem = ({ item, index, onLongPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(
    new Animated.Value(item.sender === "user" ? 50 : -50)
  ).current;
  const [isPressed, setIsPressed] = useState(false);
  const [parsedText, setParsedText] = useState([]);

  // Parse text for formatting when message changes
  useEffect(() => {
    setParsedText(parseMessageText(item.text));
  }, [item.text]);

  // Run entrance animation when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
        delay: index * 100,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
        delay: index * 100,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
        delay: index * 100,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim, index]);

  // Handle press animations
  const handlePressIn = () => {
    setIsPressed(true);
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();

    // Light haptic feedback
    Vibration.vibrate(10);
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Get time from message timestamp
  const getMessageTime = () => {
    const date = new Date(item.timestamp || Date.now());
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Animated.View
      style={[
        styles.chatBubbleContainer,
        item.sender === "user"
          ? styles.chatBubbleContainerUser
          : styles.chatBubbleContainerBot,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateX: slideAnim }],
        },
      ]}
    >
      {item.sender === "bot" && (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Icon name="robot" size={16} color="#fff" />
          </View>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={() => onLongPress(item)}
        delayLongPress={500}
        style={[
          styles.chatBubble,
          item.sender === "user" ? styles.chatBubbleUser : styles.chatBubbleBot,
          isPressed && styles.chatBubblePressed,
        ]}
      >
        <View style={styles.chatBubbleContent}>
          {parsedText.map((part) => (
            <Text
              key={part.id}
              style={[
                styles.chatBubbleText,
                item.sender === "user"
                  ? styles.chatBubbleTextUser
                  : styles.chatBubbleTextBot,
                part.isBold && styles.boldText,
              ]}
            >
              {part.text}
            </Text>
          ))}
        </View>

        <Text style={styles.messageTime}>{getMessageTime()}</Text>

        {item.sender === "user" && (
          <View style={styles.messageTick}>
            <Icon name="check-all" size={14} color="#4CAF50" />
          </View>
        )}
      </TouchableOpacity>

      {item.sender === "user" && (
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, styles.userAvatar]}>
            <Icon name="account" size={16} color="#fff" />
          </View>
        </View>
      )}
    </Animated.View>
  );
};

// Typing indicator with animated dots
const TypingIndicator = () => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    };

    animateDot(dot1Anim, 0);
    animateDot(dot2Anim, 200);
    animateDot(dot3Anim, 400);

    return () => {
      dot1Anim.stopAnimation();
      dot2Anim.stopAnimation();
      dot3Anim.stopAnimation();
    };
  }, [dot1Anim, dot2Anim, dot3Anim]);

  return (
    <View style={[styles.chatBubbleContainer, styles.chatBubbleContainerBot]}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Icon name="robot" size={16} color="#fff" />
        </View>
      </View>

      <View
        style={[styles.chatBubble, styles.chatBubbleBot, styles.typingBubble]}
      >
        <View style={styles.typingIndicator}>
          {[dot1Anim, dot2Anim, dot3Anim].map((dotAnim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.typingDot,
                {
                  transform: [
                    {
                      translateY: dotAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -8],
                      }),
                    },
                  ],
                  opacity: dotAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.4, 1, 0.4],
                  }),
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

// Message actions menu component
const MessageActionsMenu = ({
  visible,
  message,
  onClose,
  onCopy,
  onDelete,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 70,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, scaleAnim]);

  if (!visible) return null;

  return (
    <View style={styles.messageActionsOverlay}>
      <TouchableOpacity
        style={styles.messageActionsBackdrop}
        onPress={onClose}
      />
      <Animated.View
        style={[
          styles.messageActionsContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.messageActionsHeader}>
          <Text style={styles.messageActionsTitle}>Message Options</Text>
        </View>

        <TouchableOpacity style={styles.messageAction} onPress={onCopy}>
          <Icon name="content-copy" size={22} color="#333" />
          <Text style={styles.messageActionText}>Copy Text</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.messageAction} onPress={onDelete}>
          <Icon name="delete-outline" size={22} color="#F44336" />
          <Text style={[styles.messageActionText, { color: "#F44336" }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const ResultScreen = ({ route, navigation }) => {
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [chatbotModalVisible, setChatbotModalVisible] = useState(false);
  const { prediction } = route.params; // Passed prediction data from previous screen
  const [loading, setLoading] = useState(false);

  // Location & Weather States
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [weather, setWeather] = useState(null);
  const [locLoading, setLocLoading] = useState(true);

  // Chatbot states
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello, I am **Gemini Chatbot**. I can help you with tea leaf disease detection and remedies. How can I assist you today?",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatListRef = useRef(null);
  const chatIconAnim = useRef(new Animated.Value(1)).current;
  const chatPanelAnim = useRef(new Animated.Value(0)).current;
  const inputAnim = useRef(new Animated.Value(1)).current;
  const sendButtonAnim = useRef(new Animated.Value(0)).current;
  const floatingButtonAnim = useRef(new Animated.Value(1)).current;

  // Message actions menu states
  const [messageActionsVisible, setMessageActionsVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // New chatbot size states
  const [chatModalHeight, setChatModalHeight] = useState(500);
  const [initialChatModalHeight, setInitialChatModalHeight] = useState(500);
  const [isResizing, setIsResizing] = useState(false);
  const [chatSize, setChatSize] = useState("medium"); // 'small', 'medium', 'large'

  // Theme state
  const [darkMode, setDarkMode] = useState(false);

  // Pan responder for resizing
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsResizing(true);
      },
      onPanResponderMove: (_, gestureState) => {
        const newHeight = initialChatModalHeight - gestureState.dy;
        if (
          newHeight >= 250 &&
          newHeight <= Dimensions.get("window").height * 0.9
        ) {
          setChatModalHeight(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsResizing(false);
        setInitialChatModalHeight(chatModalHeight);

        // Determine chat size based on height
        const windowHeight = Dimensions.get("window").height;
        if (chatModalHeight < windowHeight * 0.4) {
          setChatSize("small");
        } else if (chatModalHeight < windowHeight * 0.7) {
          setChatSize("medium");
        } else {
          setChatSize("large");
        }
      },
    })
  ).current;
  const handleGenerateReport = async () => {
    try {
      setLoading(true);

      // Format the current date
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = currentDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Format confidence percentage
      const confidencePercentage = diseaseInfo.confidence
        ? `${(diseaseInfo.confidence * 100).toFixed(1)}%`
        : "N/A";

      // Format location data
      let locationHtml = "";
      if (location) {
        const lat = location.coords.latitude.toFixed(4);
        const lon = location.coords.longitude.toFixed(4);

        let addressText = "Unknown location";
        if (address) {
          const addressParts = [];
          if (address.name) addressParts.push(address.name);
          if (address.street) addressParts.push(address.street);
          if (address.city) addressParts.push(address.city);
          if (address.region) addressParts.push(address.region);
          if (address.country) addressParts.push(address.country);
          addressText = addressParts.join(", ");
        }

        locationHtml = `
          <div class="info-section">
            <h2>Location Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Coordinates:</span>
                <span class="info-value">${lat}, ${lon}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Address:</span>
                <span class="info-value">${addressText}</span>
              </div>
            </div>
          </div>
        `;
      }

      // Format weather data
      let weatherHtml = "";
      if (weather) {
        const temp = weather.main.temp;
        const humidity = weather.main.humidity;
        const condition =
          weather.weather && weather.weather[0]
            ? weather.weather[0].description
            : "Unknown";

        weatherHtml = `
          <div class="info-section">
            <h2>Weather Conditions</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Temperature:</span>
                <span class="info-value">${temp}°C</span>
              </div>
              <div class="info-item">
                <span class="info-label">Humidity:</span>
                <span class="info-value">${humidity}%</span>
              </div>
              <div class="info-item">
                <span class="info-label">Condition:</span>
                <span class="info-value">${condition}</span>
              </div>
            </div>
          </div>
        `;
      }

      // Format treatments
      let treatmentsHtml = "";
      if (diseaseInfo.treatments) {
        const { chemical, biological, mechanical } = diseaseInfo.treatments;

        const formatTreatmentList = (items) => {
          if (!items || items.length === 0) return "<p>None recommended</p>";
          return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
        };

        treatmentsHtml = `
          <div class="info-section">
            <h2>Recommended Treatments</h2>
            
            <div class="treatment-section">
              <h3>Chemical Control</h3>
              ${formatTreatmentList(chemical)}
            </div>
            
            <div class="treatment-section">
              <h3>Biological Control</h3>
              ${formatTreatmentList(biological)}
            </div>
            
            <div class="treatment-section">
              <h3>Mechanical Control</h3>
              ${formatTreatmentList(mechanical)}
            </div>
          </div>
        `;
      }

      // Add notes if available
      let notesHtml = "";
      if (diseaseInfo.note) {
        notesHtml = `
          <div class="info-section note-section">
            <h2>Additional Notes</h2>
            <p>${diseaseInfo.note}</p>
          </div>
        `;
      }

      // Create the HTML template for the PDF
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Camellia Disease Detection Report</title>
          <style>
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 20px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #4CAF50;
              margin-bottom: 30px;
            }
            
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #4CAF50;
              margin-bottom: 5px;
            }
            
            .subtitle {
              font-size: 16px;
              color: #666;
            }
            
            .timestamp {
              font-size: 14px;
              color: #888;
              margin-top: 10px;
            }
            
            .main-content {
              display: flex;
              margin-bottom: 30px;
            }
            
            .image-container {
              flex: 0 0 200px;
              margin-right: 20px;
            }
            
            .image-container img {
              width: 100%;
              border-radius: 8px;
              border: 1px solid #ddd;
            }
            
            .disease-info {
              flex: 1;
            }
            
            h1 {
              color: #333;
              margin-top: 0;
              font-size: 24px;
            }
            
            h2 {
              color: #4CAF50;
              font-size: 18px;
              margin-top: 25px;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 1px solid #eee;
            }
            
            h3 {
              color: #555;
              font-size: 16px;
              margin-top: 15px;
              margin-bottom: 10px;
            }
            
            .info-section {
              margin-bottom: 25px;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }
            
            .info-item {
              margin-bottom: 10px;
            }
            
            .info-label {
              font-weight: bold;
              color: #555;
            }
            
            .info-value {
              color: #333;
            }
            
            .confidence-bar-container {
              width: 100%;
              height: 20px;
              background-color: #eee;
              border-radius: 10px;
              margin-top: 10px;
              overflow: hidden;
            }
            
            .confidence-bar {
              height: 100%;
              background-color: #4CAF50;
              border-radius: 10px;
            }
            
            .treatment-section {
              margin-bottom: 20px;
            }
            
            ul {
              margin-top: 5px;
              padding-left: 20px;
            }
            
            li {
              margin-bottom: 5px;
            }
            
            .note-section {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #4CAF50;
            }
            
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #888;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Camellia</div>
              <div class="subtitle">Tea Leaf Disease Detection Report</div>
              <div class="timestamp">Generated on ${formattedDate} at ${formattedTime}</div>
            </div>
            
            <div class="main-content">
              <div class="image-container">
                <img src="${diseaseInfo.image}" alt="Disease Image">
              </div>
              
              <div class="disease-info">
                <h1>${diseaseInfo.name || "Unknown Disease"}</h1>
                
                <div class="info-item">
                  <span class="info-label">Confidence:</span>
                  <span class="info-value">${confidencePercentage}</span>
                  <div class="confidence-bar-container">
                    <div class="confidence-bar" style="width: ${confidencePercentage};"></div>
                  </div>
                </div>
                
                <div class="info-section">
                  <h2>Description</h2>
                  <p>${
                    diseaseInfo.description || "No description available."
                  }</p>
                </div>
              </div>
            </div>
            
            ${treatmentsHtml}
            
            ${locationHtml}
            
            ${weatherHtml}
            
            ${notesHtml}
            
            <div class="footer">
              <p>© ${currentDate.getFullYear()} Camellia - Tea Leaf Disease Detection System</p>
              <p>This report is generated automatically and should be reviewed by a professional.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Generate the PDF file
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
        width: 612, // Standard US Letter width in points (8.5 inches)
        height: 792, // Standard US Letter height in points (11 inches)
      });

      console.log("PDF generated at:", uri);

      // Share the PDF file
      await shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
        dialogTitle: "Share Disease Detection Report",
      });

      setLoading(false);
      Alert.alert(
        "Report Generated",
        "Your detailed disease detection report has been generated successfully."
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to generate the report. Please try again.");
    }
  };

  // Request location permission and get current location details
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access location was denied"
        );
        setLocLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      // Reverse geocode the location for address details
      const addr = await Location.reverseGeocodeAsync(loc.coords);
      if (addr && addr.length > 0) {
        setAddress(addr[0]);
      }
      setLocLoading(false);
    })();
  }, []);

  // Fetch current weather data using the obtained location
  useEffect(() => {
    if (location) {
      const { latitude, longitude } = location.coords;
      axios
        .get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        )
        .then((response) => {
          setWeather(response.data);
        })
        .catch((error) => {
          console.error("Error fetching weather:", error);
        });
    }
  }, [location]);

  // Animate send button based on input text
  useEffect(() => {
    if (inputText.trim().length > 0) {
      Animated.spring(sendButtonAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(sendButtonAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [inputText, sendButtonAnim]);

  // Build diseaseInfo object including additional API data
  const diseaseInfo = prediction
    ? {
        name: prediction.prediction || "",
        confidence: prediction.confidence || null,
        image: prediction.image || "",
        description: prediction.description || "",
        treatments: {
          chemical: prediction.chemical_control || [],
          biological: prediction.biological_control || [],
          mechanical: prediction.mechanical_control || [],
        },
        note: prediction.note || "",
        metadata: prediction.metadata || {},
      }
    : null;

  // Dummy monthly pest risk data
  const chartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        data: [20, 35, 50, 65, 80, 95, 90, 70, 55, 40, 30, 25],
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#4CAF50" },
  };

  // Build context string from on-screen details to feed into Gemini
  const buildContext = () => {
    let context = "";
    if (diseaseInfo) {
      context += `Disease Info:\n`;
      context += `Name: ${diseaseInfo.name}\n`;
      if (diseaseInfo.confidence)
        context += `Confidence: ${(diseaseInfo.confidence * 100).toFixed(
          1
        )}%\n`;
      if (diseaseInfo.description)
        context += `Description: ${diseaseInfo.description}\n`;
      if (diseaseInfo.treatments) {
        if (diseaseInfo.treatments.chemical.length > 0)
          context += `Chemical Treatments: ${diseaseInfo.treatments.chemical.join(
            ", "
          )}\n`;
        if (diseaseInfo.treatments.biological.length > 0)
          context += `Biological Treatments: ${diseaseInfo.treatments.biological.join(
            ", "
          )}\n`;
        if (diseaseInfo.treatments.mechanical.length > 0)
          context += `Mechanical Treatments: ${diseaseInfo.treatments.mechanical.join(
            ", "
          )}\n`;
      }
      if (diseaseInfo.note) context += `Note: ${diseaseInfo.note}\n`;
    }
    if (location) {
      context += `Location: Latitude ${location.coords.latitude.toFixed(
        4
      )}, Longitude ${location.coords.longitude.toFixed(4)}.\n`;
    }
    if (weather) {
      context += `Weather: Temperature ${weather.main.temp}°C, Humidity ${weather.main.humidity}%, Condition: ${weather.weather[0].description}.\n`;
    }
    return context;
  };

  // Function to call the Gemini API with the user message and context
  const sendMessageToGemini = async (message) => {
    // Build context string from on-screen details
    const context = buildContext();
    const fullPrompt = `You are a tea leaf disease detection and remedy chatbot. Use the following context to answer the query accurately. Use ** for important terms or emphasis (e.g. **Brown Spot Disease**). Keep responses concise and helpful:\n\n${context}\nUser Query: ${message}\nAnswer:`;
    const payload = {
      contents: [
        {
          parts: [{ text: fullPrompt }],
        },
      ],
    };

    try {
      const response = await axios.post(GEMINI_ENDPOINT, payload, {
        headers: { "Content-Type": "application/json" },
      });
      if (
        response.data &&
        response.data.candidates &&
        response.data.candidates.length > 0 &&
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts.length > 0
      ) {
        return response.data.candidates[0].content.parts[0].text;
      } else {
        return "I'm sorry, I didn't understand that.";
      }
    } catch (error) {
      console.error(
        "Error calling Gemini API:",
        error.response ? error.response.data : error.message
      );
      return "There was an error processing your request.";
    }
  };

  // Handle sending user message and getting bot reply
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Animate input field on send
    Animated.sequence([
      Animated.timing(inputAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(inputAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Haptic feedback
    Vibration.vibrate(20);

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: inputText.trim(),
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsBotTyping(true);

    if (chatListRef.current) {
      setTimeout(() => {
        chatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }

    const botReply = await sendMessageToGemini(userMessage.text);

    const botMessage = {
      id: Date.now() + 1,
      sender: "bot",
      text: botReply,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, botMessage]);
    setIsBotTyping(false);

    // Scroll to bottom after bot reply
    if (chatListRef.current) {
      setTimeout(() => {
        chatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Animate chat panel and icon when toggling chatbot modal
  useEffect(() => {
    if (chatbotModalVisible) {
      Animated.timing(chatIconAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.spring(chatPanelAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Bounce animation for floating button
      Animated.sequence([
        Animated.timing(floatingButtonAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(300),
      ]).start();
    } else {
      Animated.timing(chatIconAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(chatPanelAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Bounce animation for floating button
      Animated.sequence([
        Animated.delay(200),
        Animated.spring(floatingButtonAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [chatbotModalVisible, chatIconAnim, chatPanelAnim, floatingButtonAnim]);

  // Set chat size presets
  const setChatSizePreset = (size) => {
    const windowHeight = Dimensions.get("window").height;
    setChatSize(size);

    switch (size) {
      case "small":
        setChatModalHeight(windowHeight * 0.3);
        setInitialChatModalHeight(windowHeight * 0.3);
        break;
      case "medium":
        setChatModalHeight(windowHeight * 0.5);
        setInitialChatModalHeight(windowHeight * 0.5);
        break;
      case "large":
        setChatModalHeight(windowHeight * 0.8);
        setInitialChatModalHeight(windowHeight * 0.8);
        break;
    }
  };

  // Handle message long press
  const handleMessageLongPress = (message) => {
    Vibration.vibrate(50);
    setSelectedMessage(message);
    setMessageActionsVisible(true);
  };

  // Copy message text to clipboard
  const handleCopyMessage = () => {
    if (selectedMessage) {
      // In a real app, you would use Clipboard.setString(selectedMessage.text)
      Alert.alert("Copied", "Message copied to clipboard");
      setMessageActionsVisible(false);
    }
  };

  // Delete message
  const handleDeleteMessage = () => {
    if (selectedMessage) {
      setChatMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== selectedMessage.id)
      );
      setMessageActionsVisible(false);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Share the captured image and full details including live location and weather info
  const handleShare = async () => {
    if (!diseaseInfo) return;
    try {
      let shareMessage = `Plant Disease Detection Result\n\n`;
      shareMessage += diseaseInfo.name ? `Disease: ${diseaseInfo.name}\n` : "";
      shareMessage += diseaseInfo.confidence
        ? `Confidence: ${(diseaseInfo.confidence * 100).toFixed(1)}%\n`
        : "";
      shareMessage += diseaseInfo.description
        ? `Description: ${diseaseInfo.description}\n`
        : "";
      if (diseaseInfo.treatments) {
        const { chemical, biological, mechanical } = diseaseInfo.treatments;
        if (chemical.length > 0) {
          shareMessage += `\nChemical Control:\n`;
          chemical.forEach((item) => {
            shareMessage += `- ${item}\n`;
          });
        }
        if (biological.length > 0) {
          shareMessage += `\nBiological Control:\n`;
          biological.forEach((item) => {
            shareMessage += `- ${item}\n`;
          });
        }
        if (mechanical.length > 0) {
          shareMessage += `\nMechanical Control:\n`;
          mechanical.forEach((item) => {
            shareMessage += `- ${item}\n`;
          });
        }
      }
      shareMessage += diseaseInfo.note ? `\nNote: ${diseaseInfo.note}\n` : "";
      if (location) {
        shareMessage += `\nLocation:\n  Latitude: ${location.coords.latitude.toFixed(
          4
        )}\n  Longitude: ${location.coords.longitude.toFixed(4)}\n`;
        if (address) {
          const addrStr = `${address.name || ""} ${address.street || ""} ${
            address.city || ""
          } ${address.region || ""} ${address.country || ""}`.trim();
          shareMessage += `  Address: ${addrStr}\n`;
        }
      }
      if (weather) {
        shareMessage += `\nWeather:\n  Temperature: ${weather.main.temp}°C\n  Humidity: ${weather.main.humidity}%\n`;
        if (weather.weather && weather.weather[0]) {
          shareMessage += `  Condition: ${weather.weather[0].description}\n`;
        }
      }
      const shareContent = {
        title: "Plant Disease Detection Result",
        message: shareMessage,
      };
      if (Platform.OS === "ios" && diseaseInfo.image) {
        shareContent.url = diseaseInfo.image;
      }
      const result = await Share.share(shareContent);
      if (result.action === Share.sharedAction) {
        console.log("Shared successfully");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleRegenerate = () => {
    navigation.replace("ScanCamera");
  };

  if (loading || locLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!diseaseInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Result</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No prediction data found</Text>
          <TouchableOpacity
            style={styles.regenerateButton}
            onPress={handleRegenerate}
          >
            <Text style={styles.regenerateText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Result</Text>
        <TouchableOpacity>
          <Icon name="dots-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      {/* Main Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Prediction Card */}
        <View style={styles.diseaseCard}>
          <TouchableOpacity onPress={() => setImageModalVisible(true)}>
            <Image
              source={{ uri: diseaseInfo.image }}
              style={styles.diseaseImage}
            />
          </TouchableOpacity>
          <View style={styles.diseaseInfo}>
            <Text style={styles.diseaseName}>{diseaseInfo.name}</Text>
            {diseaseInfo.confidence && (
              <Text style={styles.confidence}>
                Confidence: {(diseaseInfo.confidence * 100).toFixed(1)}%
              </Text>
            )}
          </View>
        </View>

        {/* Horizontal Cards Container */}
        <View style={styles.horizontalCardsContainer}>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Location & Weather</Text>
            {location ? (
              <>
                <Text style={styles.cardContent}>
                  Lat: {location.coords.latitude.toFixed(4)}
                </Text>
                <Text style={styles.cardContent}>
                  Lon: {location.coords.longitude.toFixed(4)}
                </Text>
                {address && (
                  <Text style={styles.cardContent}>
                    {address.city ? `${address.city}, ` : ""}
                    {address.country ? address.country : ""}
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.cardContent}>Location not available</Text>
            )}
            {weather ? (
              <>
                <Text style={styles.cardContent}>
                  Temp: {weather.main.temp}°C
                </Text>
                <Text style={styles.cardContent}>
                  Humidity: {weather.main.humidity}%
                </Text>
                {weather.weather && weather.weather[0] && (
                  <Text style={styles.cardContent}>
                    {weather.weather[0].description}
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.cardContent}>Weather not available</Text>
            )}
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Affected Area</Text>
            <Text style={styles.cardContent}>
              This disease affects an area within a 5 km radius of your
              location.
            </Text>
            <Icon
              name="map-marker-radius"
              size={24}
              color="#4CAF50"
              style={{ marginTop: 8 }}
            />
          </View>
        </View>

        {/* Monthly Pest Risk Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Monthly Pest Risk</Text>
          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chartStyle}
          />
        </View>

        {/* Details Section */}
        {diseaseInfo.description && (
          <>
            <Text style={styles.subheader}>Description</Text>
            <Text style={styles.description}>{diseaseInfo.description}</Text>
          </>
        )}
        {Array.isArray(diseaseInfo.treatments?.chemical) &&
          diseaseInfo.treatments.chemical.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Chemical Control</Text>
              {diseaseInfo.treatments.chemical.map((item, index) => (
                <Text key={index} style={styles.treatmentDesc}>
                  - {item}
                </Text>
              ))}
            </>
          )}
        {Array.isArray(diseaseInfo.treatments?.biological) &&
          diseaseInfo.treatments.biological.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Biological Control</Text>
              {diseaseInfo.treatments.biological.map((item, index) => (
                <Text key={index} style={styles.treatmentDesc}>
                  - {item}
                </Text>
              ))}
            </>
          )}
        {Array.isArray(diseaseInfo.treatments?.mechanical) &&
          diseaseInfo.treatments.mechanical.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Mechanical Control</Text>
              {diseaseInfo.treatments.mechanical.map((item, index) => (
                <Text key={index} style={styles.treatmentDesc}>
                  - {item}
                </Text>
              ))}
            </>
          )}
        {diseaseInfo.note && (
          <View style={styles.noteSection}>
            <Icon
              name="star-outline"
              size={24}
              color="#4CAF50"
              style={styles.noteIcon}
            />
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>Note:</Text>
              <Text style={styles.noteText}>{diseaseInfo.note}</Text>
            </View>
          </View>
        )}
      </ScrollView>
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity
          style={styles.regenerateButton}
          onPress={handleRegenerate}
        >
          <Text style={styles.regenerateText}>Re-generate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.shareButton, { backgroundColor: "#FF5252" }]}
          onPress={handleGenerateReport}
        >
          <Text style={styles.shareText}>Report</Text>
        </TouchableOpacity>
      </View>
      {/* Image Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setImageModalVisible(false)}
            >
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Image
              source={{ uri: diseaseInfo.image }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </Modal>
      {/* Enhanced Chatbot Modal with Resizing */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={chatbotModalVisible}
        onRequestClose={() => setChatbotModalVisible(false)}
      >
        <View style={styles.chatModalContainer}>
          <Animated.View
            style={[
              styles.chatModalContent,
              {
                opacity: chatPanelAnim,
                transform: [{ scale: chatPanelAnim }],
                height: chatModalHeight,
                maxHeight: Dimensions.get("window").height * 0.9,
                backgroundColor: darkMode ? "#1E1E1E" : "#fff",
              },
            ]}
          >
            {/* Resize handle */}
            <View style={styles.resizeHandle} {...panResponder.panHandlers}>
              <View
                style={[styles.resizeBar, darkMode && styles.resizeBarDark]}
              ></View>
            </View>

            {/* Chat header with size controls */}
            <View
              style={[
                styles.chatModalHeader,
                darkMode && styles.chatModalHeaderDark,
              ]}
            >
              <View style={styles.chatHeaderLeft}>
                <Text
                  style={[
                    styles.chatModalTitle,
                    darkMode && styles.chatModalTitleDark,
                  ]}
                >
                  Gemini Assistant
                </Text>
                <View style={styles.chatSizeControls}>
                  <TouchableOpacity
                    style={[
                      styles.sizeButton,
                      darkMode && styles.sizeButtonDark,
                      chatSize === "small" && styles.activeSizeButton,
                    ]}
                    onPress={() => setChatSizePreset("small")}
                  >
                    <Icon
                      name="arrow-collapse"
                      size={16}
                      color={
                        chatSize === "small"
                          ? "#fff"
                          : darkMode
                          ? "#ccc"
                          : "#666"
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sizeButton,
                      darkMode && styles.sizeButtonDark,
                      chatSize === "medium" && styles.activeSizeButton,
                    ]}
                    onPress={() => setChatSizePreset("medium")}
                  >
                    <Icon
                      name="arrow-collapse-horizontal"
                      size={16}
                      color={
                        chatSize === "medium"
                          ? "#fff"
                          : darkMode
                          ? "#ccc"
                          : "#666"
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sizeButton,
                      darkMode && styles.sizeButtonDark,
                      chatSize === "large" && styles.activeSizeButton,
                    ]}
                    onPress={() => setChatSizePreset("large")}
                  >
                    <Icon
                      name="arrow-expand-all"
                      size={16}
                      color={
                        chatSize === "large"
                          ? "#fff"
                          : darkMode
                          ? "#ccc"
                          : "#666"
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.chatHeaderRight}>
                <TouchableOpacity
                  style={[
                    styles.themeToggleButton,
                    darkMode && styles.themeToggleButtonDark,
                  ]}
                  onPress={toggleDarkMode}
                >
                  <Icon
                    name={darkMode ? "weather-sunny" : "weather-night"}
                    size={20}
                    color={darkMode ? "#fff" : "#333"}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.closeModalButton,
                    darkMode && styles.closeModalButtonDark,
                  ]}
                  onPress={() => setChatbotModalVisible(false)}
                >
                  <Icon
                    name="close"
                    size={24}
                    color={darkMode ? "#fff" : "#000"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Chat messages */}
            <ScrollView
              ref={chatListRef}
              style={styles.chatMessagesContainer}
              contentContainerStyle={[
                styles.chatMessagesContent,
                darkMode && styles.chatMessagesContentDark,
              ]}
              onContentSizeChange={() =>
                chatListRef.current.scrollToEnd({ animated: true })
              }
            >
              {chatMessages.map((msg, index) => (
                <ChatMessageItem
                  key={msg.id}
                  item={msg}
                  index={index}
                  onLongPress={handleMessageLongPress}
                />
              ))}
              {isBotTyping && <TypingIndicator />}
            </ScrollView>

            {/* Chat input */}
            <Animated.View
              style={[
                styles.chatInputContainer,
                darkMode && styles.chatInputContainerDark,
                { transform: [{ scale: inputAnim }] },
              ]}
            >
              <TextInput
                style={[styles.chatInput, darkMode && styles.chatInputDark]}
                placeholder="Type your message..."
                placeholderTextColor={darkMode ? "#999" : "#999"}
                value={inputText}
                onChangeText={setInputText}
                multiline={true}
                maxHeight={100}
                color={darkMode ? "#fff" : "#000"}
              />

              <Animated.View
                style={{
                  opacity: sendButtonAnim,
                  transform: [
                    {
                      scale: sendButtonAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    },
                    {
                      rotate: sendButtonAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["-45deg", "0deg"],
                      }),
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    !inputText.trim() && styles.sendButtonDisabled,
                  ]}
                  onPress={handleSendMessage}
                  disabled={!inputText.trim()}
                >
                  <Icon
                    name="send"
                    size={24}
                    color={inputText.trim() ? "#fff" : "#A0A0A0"}
                  />
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </View>
      </Modal>
      {/* Message Actions Menu */}
      <MessageActionsMenu
        visible={messageActionsVisible}
        message={selectedMessage}
        onClose={() => setMessageActionsVisible(false)}
        onCopy={handleCopyMessage}
        onDelete={handleDeleteMessage}
      />
      {/* Floating Chatbot Icon with Pulse Animation */}
      <Animated.View
        style={[
          styles.floatingChatButton,
          {
            opacity: chatIconAnim,
            transform: [
              { scale: floatingButtonAnim },
              {
                translateY: floatingButtonAnim.interpolate({
                  inputRange: [0.9, 1, 1.1],
                  outputRange: [0, 0, -10],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.floatingButtonInner}
          onPress={() => {
            setChatbotModalVisible(true);
            // Reset to medium size when opening
            setChatSizePreset("medium");
            // Haptic feedback
            Vibration.vibrate(20);
          }}
        >
          <Icon name="robot" size={30} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 16, fontWeight: "600" },
  scrollContainer: { flex: 1, padding: 16 },
  scrollContent: { paddingBottom: 100 },
  diseaseCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    marginBottom: 20,
  },
  diseaseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#333333",
  },
  diseaseInfo: { flex: 1, marginLeft: 16 },
  diseaseName: { fontSize: 18, fontWeight: "600", color: "#FFFFFF" },
  confidence: { fontSize: 14, color: "#4CAF50", marginTop: 4 },
  horizontalCardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  cardContent: { fontSize: 14, color: "#666666", marginBottom: 4 },
  chartCard: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  chartStyle: { marginVertical: 8, borderRadius: 16 },
  subheader: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  description: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 24,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  treatmentDesc: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 8,
  },
  noteSection: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 136,
  },
  noteIcon: { marginRight: 12 },
  noteContent: { flex: 1 },
  noteTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  noteText: { fontSize: 14, color: "#666666", lineHeight: 20 },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  regenerateButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  regenerateText: { color: "#4CAF50", fontSize: 16, fontWeight: "600" },
  shareButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    alignItems: "center",
  },
  shareText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: { fontSize: 16, color: "#666666", marginBottom: 16 },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
    padding: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 20,
  },
  modalImage: { flex: 1, width: "100%", borderRadius: 12 },

  // Enhanced Chatbot Modal Styles
  chatModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  chatModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    minHeight: 300,
    overflow: "hidden",
  },
  resizeHandle: {
    width: "100%",
    height: 20,
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  resizeBar: {
    width: 40,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
  },
  resizeBarDark: {
    backgroundColor: "#555",
  },
  chatModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 12,
    marginTop: 10,
  },
  chatModalHeaderDark: {
    borderBottomColor: "#333",
  },
  chatHeaderLeft: {
    flexDirection: "column",
  },
  chatHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  chatModalTitleDark: {
    color: "#fff",
  },
  chatSizeControls: {
    flexDirection: "row",
    marginTop: 4,
  },
  sizeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    marginRight: 8,
  },
  sizeButtonDark: {
    backgroundColor: "#333",
  },
  activeSizeButton: {
    backgroundColor: "#4CAF50",
  },
  themeToggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  themeToggleButtonDark: {
    backgroundColor: "#333",
  },
  closeModalButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeModalButtonDark: {
    backgroundColor: "#333",
  },
  chatMessagesContainer: {
    flex: 1,
    marginTop: 12,
    marginBottom: 8,
  },
  chatMessagesContent: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  chatMessagesContentDark: {
    backgroundColor: "#1E1E1E",
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
    paddingBottom: 4,
  },
  chatInputContainerDark: {
    borderTopColor: "#333",
  },
  chatInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 24,
    marginRight: 10,
    backgroundColor: "#F5F5F5",
    fontSize: 15,
  },
  chatInputDark: {
    backgroundColor: "#333",
    borderColor: "#444",
    color: "#fff",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  sendButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  floatingChatButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    zIndex: 10,
  },
  floatingButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  // Enhanced Chat Bubble Styles
  chatBubbleContainer: {
    flexDirection: "row",
    marginVertical: 6,
    alignItems: "flex-end",
  },
  chatBubbleContainerUser: {
    justifyContent: "flex-end",
  },
  chatBubbleContainerBot: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    width: 30,
    height: 30,
    marginHorizontal: 5,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatar: {
    backgroundColor: "#2196F3",
  },
  chatBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: "75%",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minWidth: 60,
  },
  chatBubbleUser: {
    backgroundColor: "#E3F2FD",
    borderBottomRightRadius: 4,
  },
  chatBubbleBot: {
    backgroundColor: "#F5F5F5",
    borderBottomLeftRadius: 4,
  },
  chatBubblePressed: {
    opacity: 0.8,
  },
  chatBubbleContent: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chatBubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  chatBubbleTextUser: {
    color: "#000",
  },
  chatBubbleTextBot: {
    color: "#000",
  },
  boldText: {
    fontWeight: "bold",
  },
  messageTime: {
    fontSize: 10,
    color: "#999",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  messageTick: {
    position: "absolute",
    bottom: 2,
    right: -18,
  },
  typingBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 40,
  },
  typingIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 24,
    width: 60,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginHorizontal: 3,
  },

  // Message Actions Menu
  messageActionsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  messageActionsBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  messageActionsContainer: {
    width: 250,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  messageActionsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  messageActionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  messageAction: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  messageActionText: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default ResultScreen;

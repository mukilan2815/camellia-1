import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { SharedElement } from "react-navigation-shared-element";

// Gemini API configuration
const GEMINI_API_KEY = "AIzaSyAt149CIT6Nhw9FSXTSZGKNLbqXKfLkSCQ";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// Product images
const PRODUCT_IMAGES = [
  "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=1000",
  "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1000",
  "https://images.unsplash.com/photo-1523920290228-4f321a939b4c?q=80&w=1000",
  "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?q=80&w=1000",
  "https://images.unsplash.com/photo-1563911892437-1feda0179e1b?q=80&w=1000",
  "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a5?q=80&w=1000",
];

// --- New Component: ChatMessageItem ---
const ChatMessageItem = ({ item, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  return (
    <Animated.View
      style={[
        styles.messageBubble,
        item.isBot ? styles.botMessage : styles.userMessage,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {item.isBot && (
        <LinearGradient
          colors={["#4caf50", "#2e7d32"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.botAvatar}
        >
          <Ionicons name="leaf" size={16} color="#fff" />
        </LinearGradient>
      )}
      <View
        style={[
          styles.messageContent,
          item.isBot ? styles.botMessageContent : styles.userMessageContent,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.isBot ? styles.botMessageText : styles.userMessageText,
          ]}
        >
          {item.text}
        </Text>
        {item.image && (
          <Image
            source={
              typeof item.image === "object"
                ? { uri: item.image.uri }
                : item.image.startsWith("data:")
                ? { uri: item.image }
                : { uri: `data:image/jpeg;base64,${item.image}` }
            }
            style={styles.chatImage}
          />
        )}
        <Text
          style={[
            styles.messageTime,
            item.isBot ? styles.botMessageTime : styles.userMessageTime,
          ]}
        >
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </Animated.View>
  );
};

// --- New Component: ProductCard ---
const ProductCard = ({ item, index, onAddToCart, animationDelay = 0 }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const addButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        delay: animationDelay + index * 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        delay: animationDelay + index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 600,
        delay: animationDelay + index * 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, [scaleAnim, opacityAnim, translateYAnim, index, animationDelay]);

  const handleAddToCart = () => {
    Animated.sequence([
      Animated.timing(addButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(addButtonScale, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(2)),
      }),
      Animated.timing(addButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => onAddToCart(item));
  };

  return (
    <Animated.View
      style={[
        styles.productCard,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
        },
      ]}
    >
      <SharedElement id={`product.${item.id}.image`}>
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
      </SharedElement>

      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]}
        style={styles.productGradient}
      >
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>{item.price}</Text>
        </View>
      </LinearGradient>

      <View style={styles.productDetails}>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <Animated.View style={{ transform: [{ scale: addButtonScale }] }}>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#4caf50", "#2e7d32"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addToCartGradient}
            >
              <Ionicons
                name="cart"
                size={16}
                color="#fff"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.addToCartButtonText}>Add to Cart</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

// --- New Component: CartItem ---
const CartItem = ({ item, index, onRemove }) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim, index]);

  return (
    <Animated.View
      style={[
        styles.cartItem,
        {
          opacity: opacityAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <Image source={{ uri: item.image }} style={styles.cartItemImage} />
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cartItemPrice}>{item.price}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(item.id)}
      >
        <Ionicons name="close-circle" size={22} color="#ff5252" />
      </TouchableOpacity>
    </Animated.View>
  );
};

// --- Main App Component ---
const App = () => {
  // Refs for animations
  const chatListRef = useRef(null);
  const chatPanelAnim = useRef(new Animated.Value(0)).current;
  const chatIconAnim = useRef(new Animated.Value(1)).current;
  const cartPanelAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchBarAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // App state
  const [chatVisible, setChatVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Camellia, your tea leaf disease assistant. Ask me anything about tea leaf issues.",
      isBot: true,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBarVisible, setSearchBarVisible] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Screen dimensions
  const { width } = Dimensions.get("window");

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatListRef.current && chatMessages.length > 0) {
      setTimeout(() => {
        chatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  // Animate chat panel when toggling
  useEffect(() => {
    if (chatVisible) {
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
    } else {
      Animated.timing(chatIconAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      Animated.timing(chatPanelAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    }
  }, [chatVisible, chatIconAnim, chatPanelAnim]);

  // Animate cart panel when toggling
  useEffect(() => {
    if (cartVisible) {
      Animated.spring(cartPanelAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(cartPanelAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    }
  }, [cartVisible, cartPanelAnim]);

  // Animate search bar when toggling
  useEffect(() => {
    if (searchBarVisible) {
      Animated.timing(searchBarAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    } else {
      Animated.timing(searchBarAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    }
  }, [searchBarVisible, searchBarAnim]);

  // Toggle functions
  const toggleChat = () => {
    setChatVisible(!chatVisible);
    if (cartVisible) setCartVisible(false);
  };

  const toggleCart = () => {
    setCartVisible(!cartVisible);
    if (chatVisible) setChatVisible(false);
  };

  const toggleSearchBar = () => {
    setSearchBarVisible(!searchBarVisible);
    if (!searchBarVisible) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  };

  // Function to pick an image
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access gallery is required!"
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });
    if (!result.cancelled && !result.canceled) {
      setSelectedImage({ uri: result.uri, base64: result.base64 });

      // Animate selection feedback
      const pulseAnim = new Animated.Value(1);
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      Alert.alert(
        "Image Selected",
        "Your image has been attached to the message."
      );
    }
  };

  // Function to add product to cart with animation
  const handleAddToCart = (product) => {
    // Check if product is already in cart
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      Alert.alert(
        "Already in Cart",
        `${product.name} is already in your cart.`
      );
      return;
    }

    setCartItems([...cartItems, product]);

    // Animate cart icon
    const cartBounce = new Animated.Value(1);
    Animated.sequence([
      Animated.timing(cartBounce, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(2)),
      }),
      Animated.timing(cartBounce, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    Alert.alert(
      "Added to Cart",
      `${product.name} has been added to your cart.`
    );
  };

  // Function to remove item from cart
  const handleRemoveFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => item.id !== productId));
  };

  // Function to send message to Gemini API
  const sendMessage = async () => {
    if (message.trim() === "" && !selectedImage) return;

    const userText = message;
    const userMessage = {
      id: Date.now(),
      text: userText + (selectedImage ? " [Image attached]" : ""),
      isBot: false,
      image: selectedImage,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setMessage("");
    Keyboard.dismiss();
    setIsTyping(true);

    // Allow only tea-related queries
    const lowerCaseMsg = userText.toLowerCase();
    const isTeaRelated =
      lowerCaseMsg.includes("tea") || lowerCaseMsg.includes("leaf");

    if (!isTeaRelated) {
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: "I'm sorry, I only answer questions related to tea leaf diseases.",
            isBot: true,
          },
        ]);
        setIsTyping(false);
      }, 1500);
      setSelectedImage(null);
      return;
    }

    // Prepare payload for Gemini API
    const payload = {
      contents: [
        {
          parts: [{ text: userText }],
          ...(selectedImage ? { image: selectedImage.base64 } : {}),
        },
      ],
    };

    try {
      const response = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();

      let replyText = "";
      let replyImage = null;
      if (data?.candidates?.[0]?.content) {
        const candidate = data.candidates[0].content;
        if (candidate.parts?.[0]?.text) {
          replyText = candidate.parts[0].text;
        }
        if (candidate.image) {
          replyImage = candidate.image;
        }
      }

      const botMessage = {
        id: Date.now() + 3,
        text: replyText || "Sorry, I could not process your request.",
        isBot: true,
      };
      if (replyImage) {
        botMessage.image = replyImage;
      }

      setTimeout(() => {
        setChatMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 4,
            text: "Error connecting to Gemini Bot. Please try again later.",
            isBot: true,
          },
        ]);
        setIsTyping(false);
      }, 1000);
      console.error("Gemini API error:", error);
    }

    setSelectedImage(null);
  };

  // Sample products list with real images
  const products = [
    {
      id: 1,
      name: "Premium Darjeeling Tea",
      price: "$12.99",
      image: PRODUCT_IMAGES[0],
      description: "Finest Darjeeling tea from the foothills of Himalayas",
    },
    {
      id: 2,
      name: "Organic Green Tea",
      price: "$9.99",
      image: PRODUCT_IMAGES[1],
      description: "Pure organic green tea with antioxidant properties",
    },
    {
      id: 3,
      name: "Earl Grey Black Tea",
      price: "$8.99",
      image: PRODUCT_IMAGES[2],
      description: "Classic Earl Grey with bergamot flavor",
    },
    {
      id: 4,
      name: "Chamomile Herbal Tea",
      price: "$7.99",
      image: PRODUCT_IMAGES[3],
      description: "Soothing chamomile for relaxation",
    },
    {
      id: 5,
      name: "Tea Leaf Disease Detection Kit",
      price: "$29.99",
      image: PRODUCT_IMAGES[4],
      description: "Professional kit to detect common tea leaf diseases",
    },
    {
      id: 6,
      name: "Organic Tea Fertilizer",
      price: "$15.99",
      image: PRODUCT_IMAGES[5],
      description: "Specialized fertilizer for healthy tea plants",
    },
  ];

  const filteredProducts = products.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Animation values
  const chatPanelTransform = {
    transform: [
      {
        translateY: chatPanelAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [800, 0],
        }),
      },
      {
        scale: chatPanelAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.8, 0.9, 1],
        }),
      },
    ],
    opacity: chatPanelAnim,
  };

  const cartPanelTransform = {
    transform: [
      {
        translateX: cartPanelAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [400, 0],
        }),
      },
    ],
    opacity: cartPanelAnim,
  };

  const chatIconTransform = {
    transform: [
      {
        scale: chatIconAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
      {
        rotate: chatIconAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["45deg", "0deg"],
        }),
      },
    ],
    opacity: chatIconAnim,
  };

  // Header animations based on scroll
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [
      Platform.OS === "android" ? StatusBar.currentHeight + 70 : 90,
      Platform.OS === "android" ? StatusBar.currentHeight + 60 : 70,
    ],
    extrapolate: "clamp",
  });

  const headerElevation = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 10],
    extrapolate: "clamp",
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [1, 0.5, 1],
    extrapolate: "clamp",
  });

  const headerTitleScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1.2, 1],
    extrapolate: "clamp",
  });

  // Search input ref
  const searchInputRef = useRef(null);

  // Render product item
  const renderProduct = ({ item, index }) => (
    <ProductCard
      item={item}
      index={index}
      onAddToCart={handleAddToCart}
      animationDelay={200}
    />
  );

  // Pull to refresh function
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Typing animation for chat
  const typingDot1 = useRef(new Animated.Value(0.3)).current;
  const typingDot2 = useRef(new Animated.Value(0.3)).current;
  const typingDot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingDot1, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(typingDot2, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(typingDot3, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(typingDot1, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(typingDot2, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(typingDot3, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingDot1.setValue(0.3);
      typingDot2.setValue(0.3);
      typingDot3.setValue(0.3);
    }
  }, [isTyping, typingDot1, typingDot2, typingDot3]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#2e7d32" />
      <View style={styles.container}>
        {/* Animated Header */}
        <Animated.View
          style={[
            styles.header,
            {
              height: headerHeight,
              shadowOpacity: headerElevation.interpolate({
                inputRange: [0, 10],
                outputRange: [0, 0.3],
              }),
            },
          ]}
        >
          <MaskedView
            style={{ flex: 1 }}
            maskElement={
              <LinearGradient
                colors={["rgba(46,125,50,1)", "rgba(46,125,50,0.8)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ flex: 1 }}
              />
            }
          >
            <LinearGradient
              colors={["#4caf50", "#2e7d32"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            >
              <View style={styles.headerContent}>
                <Animated.View
                  style={[
                    styles.titleContainer,
                    {
                      opacity: searchBarAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0],
                      }),
                      transform: [
                        { scale: headerTitleScale },
                        {
                          translateX: searchBarAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -100],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Animated.Text
                    style={[
                      styles.title,
                      {
                        opacity: headerTitleOpacity,
                      },
                    ]}
                  >
                    Tea Hub
                  </Animated.Text>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.searchInputContainer,
                    {
                      width: searchBarAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, width - 100],
                      }),
                      opacity: searchBarAnim,
                    },
                  ]}
                >
                  <TextInput
                    ref={searchInputRef}
                    style={styles.searchInputHeader}
                    placeholder="Search products..."
                    placeholderTextColor="#7c7c7c"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                  />
                  {searchTerm.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearSearchButton}
                      onPress={() => setSearchTerm("")}
                    >
                      <Ionicons name="close-circle" size={16} color="#7c7c7c" />
                    </TouchableOpacity>
                  )}
                </Animated.View>

                <View style={styles.headerIcons}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={toggleSearchBar}
                  >
                    <Ionicons
                      name={searchBarVisible ? "close" : "search"}
                      size={24}
                      color="#fff"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={toggleCart}
                  >
                    <Animated.View>
                      <Ionicons name="cart" size={24} color="#fff" />
                      {cartItems.length > 0 && (
                        <View style={styles.cartBadge}>
                          <Text style={styles.cartBadgeText}>
                            {cartItems.length}
                          </Text>
                        </View>
                      )}
                    </Animated.View>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </MaskedView>
        </Animated.View>

        {/* Products Section */}
        <Animated.FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsContainer}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListHeaderComponent={
            <View style={styles.productsHeader}>
              <Text style={styles.sectionTitle}>Our Premium Collection</Text>
              <Text style={styles.sectionSubtitle}>
                Discover the finest tea products
              </Text>
            </View>
          }
          ListEmptyComponent={
            searchTerm.length > 0 ? (
              <View style={styles.emptyResultsContainer}>
                <Ionicons name="search-outline" size={60} color="#ccc" />
                <Text style={styles.emptyResultsText}>
                  No products found for "{searchTerm}"
                </Text>
              </View>
            ) : null
          }
        />

        {/* Chat Icon with Animation */}
        <Animated.View style={[styles.chatIconContainer, chatIconTransform]}>
          <TouchableOpacity
            style={styles.chatIcon}
            onPress={toggleChat}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#4caf50", "#2e7d32"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.chatIconGradient}
            >
              <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Cart Panel with Animation */}
        {cartVisible && (
          <Animated.View style={[styles.cartPanel, cartPanelTransform]}>
            <BlurView intensity={20} style={styles.blurOverlay} />
            <View style={styles.cartContent}>
              <View style={styles.cartHeader}>
                <LinearGradient
                  colors={["#4caf50", "#2e7d32"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.cartHeaderGradient}
                >
                  <Text style={styles.cartTitle}>Your Cart</Text>
                  <TouchableOpacity onPress={toggleCart}>
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </LinearGradient>
              </View>

              {cartItems.length === 0 ? (
                <View style={styles.emptyCartContainer}>
                  <Animated.View
                    style={{
                      transform: [
                        {
                          translateY: new Animated.Value(0).interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 10],
                          }),
                        },
                      ],
                    }}
                  >
                    <Ionicons name="cart-outline" size={80} color="#ccc" />
                  </Animated.View>
                  <Text style={styles.emptyCartText}>Your cart is empty</Text>
                  <Text style={styles.emptyCartSubtext}>
                    Add some products to your cart
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={cartItems}
                  renderItem={({ item, index }) => (
                    <CartItem
                      item={item}
                      index={index}
                      onRemove={handleRemoveFromCart}
                    />
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  style={styles.cartItemsList}
                  showsVerticalScrollIndicator={false}
                />
              )}

              {cartItems.length > 0 && (
                <View style={styles.cartFooter}>
                  <View style={styles.cartTotal}>
                    <Text style={styles.cartTotalLabel}>Total:</Text>
                    <Text style={styles.cartTotalAmount}>
                      $
                      {cartItems
                        .reduce(
                          (total, item) =>
                            total + parseFloat(item.price.replace("$", "")),
                          0
                        )
                        .toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.checkoutButton}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={["#4caf50", "#2e7d32"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.checkoutButtonGradient}
                    >
                      <Text style={styles.checkoutButtonText}>Checkout</Text>
                      <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Chat Panel with Animation */}
        {chatVisible && (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoid}
          >
            <Animated.View style={[styles.chatPanel, chatPanelTransform]}>
              <BlurView intensity={20} style={styles.blurOverlay} />
              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <LinearGradient
                    colors={["#4caf50", "#2e7d32"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.chatHeaderGradient}
                  >
                    <View style={styles.chatHeaderContent}>
                      <View style={styles.chatAvatarContainer}>
                        <Ionicons name="leaf" size={20} color="#fff" />
                      </View>
                      <View>
                        <Text style={styles.chatTitle}>Camellia Assistant</Text>
                        <Text style={styles.chatSubtitle}>Tea Leaf Expert</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={toggleChat}>
                      <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                  </LinearGradient>
                </View>

                <FlatList
                  ref={chatListRef}
                  data={chatMessages}
                  renderItem={({ item, index }) => (
                    <ChatMessageItem item={item} index={index} />
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  style={styles.chatMessages}
                  contentContainerStyle={styles.chatMessagesContent}
                  showsVerticalScrollIndicator={false}
                  onContentSizeChange={() =>
                    chatListRef.current.scrollToEnd({ animated: true })
                  }
                  onLayout={() =>
                    chatListRef.current.scrollToEnd({ animated: true })
                  }
                />

                {isTyping && (
                  <View style={styles.typingIndicator}>
                    <Text style={styles.typingText}>Camellia is typing</Text>
                    <View style={styles.typingDots}>
                      <Animated.View
                        style={[
                          styles.typingDot,
                          {
                            opacity: typingDot1,
                            transform: [{ scale: typingDot1 }],
                          },
                        ]}
                      />
                      <Animated.View
                        style={[
                          styles.typingDot,
                          {
                            opacity: typingDot2,
                            transform: [{ scale: typingDot2 }],
                          },
                        ]}
                      />
                      <Animated.View
                        style={[
                          styles.typingDot,
                          {
                            opacity: typingDot3,
                            transform: [{ scale: typingDot3 }],
                          },
                        ]}
                      />
                    </View>
                  </View>
                )}

                <View style={styles.chatInputContainer}>
                  {selectedImage && (
                    <View style={styles.selectedImageContainer}>
                      <Image
                        source={{ uri: selectedImage.uri }}
                        style={styles.selectedImagePreview}
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => setSelectedImage(null)}
                      >
                        <Ionicons name="close-circle" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}

                  <TextInput
                    style={styles.chatInput}
                    placeholder="Ask about tea leaf diseases..."
                    placeholderTextColor="#7c7c7c"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                  />

                  <TouchableOpacity
                    style={styles.imageButton}
                    onPress={pickImage}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={["#4caf50", "#2e7d32"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.actionButtonGradient}
                    >
                      <Ionicons name="image" size={22} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      !message.trim() &&
                        !selectedImage &&
                        styles.sendButtonDisabled,
                    ]}
                    onPress={sendMessage}
                    disabled={!message.trim() && !selectedImage}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        !message.trim() && !selectedImage
                          ? ["#a5d6a7", "#81c784"]
                          : ["#4caf50", "#2e7d32"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.actionButtonGradient}
                    >
                      <Ionicons name="send" size={22} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2e7d32",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#2e7d32",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: "100%",
  },
  titleContainer: {
    position: "absolute",
    left: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  searchInputContainer: {
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginLeft: 16,
  },
  searchInputHeader: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#333",
  },
  clearSearchButton: {
    padding: 4,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 15,
    position: "relative",
    padding: 5,
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff5252",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  productsHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  productsContainer: {
    padding: 8,
    paddingBottom: 100,
  },
  productRow: {
    justifyContent: "space-between",
  },
  productCard: {
    width: (Dimensions.get("window").width - 36) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    height: 320, // Fixed height to ensure consistent layout
  },
  productImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  productGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  productInfo: {
    justifyContent: "flex-end",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  productDetails: {
    padding: 12,
  },
  productDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
    height: 36,
  },
  addToCartButton: {
    borderRadius: 25,
    overflow: "hidden",
    alignSelf: "stretch", // Make button fill the width
  },
  addToCartGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 25,
  },
  addToCartButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  chatIconContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 100,
  },
  chatIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  chatIconGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  chatPanel: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    bottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  chatContent: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
  },
  chatHeader: {
    overflow: "hidden",
  },
  chatHeaderGradient: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  chatTitle: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  chatSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  chatMessagesContent: {
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: "85%",
    marginBottom: 16,
    flexDirection: "row",
  },
  botMessage: {
    alignSelf: "flex-start",
  },
  userMessage: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    alignSelf: "flex-start",
  },
  messageContent: {
    borderRadius: 18,
    padding: 12,
    paddingBottom: 8,
  },
  botMessageContent: {
    backgroundColor: "#f0f0f0",
  },
  userMessageContent: {
    backgroundColor: "#e7f5e7",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  botMessageText: {
    color: "#333",
  },
  userMessageText: {
    color: "#333",
  },
  botMessageTime: {
    color: "#999",
  },
  userMessageTime: {
    color: "#999",
  },
  messageTime: {
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  chatImage: {
    width: 200,
    height: 150,
    marginTop: 10,
    borderRadius: 10,
    resizeMode: "cover",
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginLeft: 10,
  },
  typingText: {
    fontSize: 12,
    color: "#666",
    marginRight: 10,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4caf50",
    marginHorizontal: 2,
  },
  chatInputContainer: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  selectedImageContainer: {
    position: "absolute",
    top: -70,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 8,
    padding: 2,
  },
  selectedImagePreview: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ff5252",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  imageButton: {
    borderRadius: 25,
    overflow: "hidden",
    marginRight: 8,
  },
  sendButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  cartPanel: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "80%",
    height: "100%",
    zIndex: 1000,
  },
  cartContent: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: "hidden",
  },
  cartHeader: {
    overflow: "hidden",
  },
  cartHeaderGradient: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartTitle: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  cartItemsList: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cartItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4caf50",
  },
  removeButton: {
    padding: 5,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyCartText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
  },
  emptyCartSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  cartFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cartTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cartTotalLabel: {
    fontSize: 16,
    color: "#666",
  },
  cartTotalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  checkoutButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  checkoutButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 25,
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },
  emptyResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyResultsText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

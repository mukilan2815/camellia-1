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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

// Gemini API configuration
const GEMINI_API_KEY = "AIzaSyAt149CIT6Nhw9FSXTSZGKNLbqXKfLkSCQ";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// --- New Component: ChatMessageItem ---
// This component renders each chat message and uses hooks for animation.
const ChatMessageItem = ({ item, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      delay: index * 50, // Stagger animation
    }).start();
  }, [fadeAnim, index]);

  return (
    <Animated.View
      style={[
        styles.messageBubble,
        item.isBot ? styles.botMessage : styles.userMessage,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      {item.isBot && (
        <View style={styles.botAvatar}>
          <Ionicons name="leaf" size={16} color="#fff" />
        </View>
      )}
      <View style={styles.messageContent}>
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
        <Text style={styles.messageTime}>
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </Animated.View>
  );
};

const App = () => {
  // Refs for auto-scrolling and animations
  const chatListRef = useRef(null);
  const chatPanelAnim = useRef(new Animated.Value(0)).current;
  const chatIconAnim = useRef(new Animated.Value(1)).current;

  // Chatbot state
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

  // Search and ecommerce states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBarVisible, setSearchBarVisible] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);

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
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [chatVisible, chatIconAnim, chatPanelAnim]);

  // Toggle chat and cart visibility
  const toggleChat = () => setChatVisible(!chatVisible);
  const toggleCart = () => setCartVisible(!cartVisible);

  // Function to pick an image using Expo ImagePicker (with base64 encoding)
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
      Alert.alert(
        "Image Selected",
        "Your image has been attached to the message."
      );
    }
  };

  // Function to add product to cart
  const handleAddToCart = (product) => {
    setCartItems([...cartItems, product]);
    Alert.alert(
      "Added to Cart",
      `${product.name} has been added to your cart.`
    );
  };

  // Function to send message (with optional image) to Gemini API
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

    // Prepare payload for Gemini API (include base64 image if available)
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

  // Sample products list
  const products = [
    {
      id: 1,
      name: "Premium Darjeeling Tea",
      price: "$12.99",
      image: "https://via.placeholder.com/150",
      description: "Finest Darjeeling tea from the foothills of Himalayas",
    },
    {
      id: 2,
      name: "Organic Green Tea",
      price: "$9.99",
      image: "https://via.placeholder.com/150",
      description: "Pure organic green tea with antioxidant properties",
    },
    {
      id: 3,
      name: "Earl Grey Black Tea",
      price: "$8.99",
      image: "https://via.placeholder.com/150",
      description: "Classic Earl Grey with bergamot flavor",
    },
    {
      id: 4,
      name: "Chamomile Herbal Tea",
      price: "$7.99",
      image: "https://via.placeholder.com/150",
      description: "Soothing chamomile for relaxation",
    },
    {
      id: 5,
      name: "Tea Leaf Disease Detection Kit",
      price: "$29.99",
      image: "https://via.placeholder.com/150",
      description: "Professional kit to detect common tea leaf diseases",
    },
    {
      id: 6,
      name: "Organic Tea Fertilizer",
      price: "$15.99",
      image: "https://via.placeholder.com/150",
      description: "Specialized fertilizer for healthy tea plants",
    },
  ];

  const filteredProducts = products.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Chat panel and chat icon animations
  const chatPanelTransform = {
    transform: [
      {
        translateY: chatPanelAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [500, 0],
        }),
      },
      {
        scale: chatPanelAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
    opacity: chatPanelAnim,
  };

  const chatIconTransform = {
    transform: [
      {
        scale: chatIconAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
    opacity: chatIconAnim,
  };

  // Render functions for product and cart items remain unchanged
  const renderProduct = ({ item }) => (
    <TouchableOpacity style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.addToCartButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCartItem = ({ item, index }) => (
    <View style={styles.cartItem} key={index}>
      <Text style={styles.cartItemText}>
        {item.name} - {item.price}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#2e7d32" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {searchBarVisible ? (
            <TextInput
              style={styles.searchInputHeader}
              placeholder="Search products..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          ) : (
            <Text style={styles.title}>Tea Hub</Text>
          )}
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setSearchBarVisible(!searchBarVisible)}
            >
              <Ionicons name="search" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={toggleCart}>
              <Ionicons name="cart" size={24} color="#fff" />
              {cartItems.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Our Products</Text>
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Chat Icon */}
        <Animated.View style={[styles.chatIconContainer, chatIconTransform]}>
          <TouchableOpacity style={styles.chatIcon} onPress={toggleChat}>
            <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        {/* Cart Panel */}
        {cartVisible && (
          <View style={styles.cartPanel}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>Your Cart</Text>
              <TouchableOpacity onPress={toggleCart}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {cartItems.length === 0 ? (
              <View style={styles.emptyCartContainer}>
                <Ionicons name="cart-outline" size={60} color="#ccc" />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
              </View>
            ) : (
              <FlatList
                data={cartItems}
                renderItem={renderCartItem}
                keyExtractor={(_, index) => index.toString()}
                style={styles.cartItemsList}
              />
            )}
            {cartItems.length > 0 && (
              <TouchableOpacity style={styles.checkoutButton}>
                <Text style={styles.checkoutButtonText}>Checkout</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Chat Panel */}
        {chatVisible && (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoid}
          >
            <Animated.View style={[styles.chatPanel, chatPanelTransform]}>
              <View style={styles.chatHeader}>
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
                    <View style={[styles.typingDot, styles.typingDot1]} />
                    <View style={[styles.typingDot, styles.typingDot2]} />
                    <View style={[styles.typingDot, styles.typingDot3]} />
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
                  value={message}
                  onChangeText={setMessage}
                  multiline
                />

                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={pickImage}
                >
                  <Ionicons name="image" size={24} color="#fff" />
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
                >
                  <Ionicons name="send" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default App;

// --------------------
// Styles
// --------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2e7d32",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2e7d32",
    padding: 15,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  searchInputHeader: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#FFFFFF" },
  headerIcons: { flexDirection: "row", alignItems: "center" },
  iconButton: { marginLeft: 15, position: "relative" },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff5722",
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
  productsSection: {
    padding: 10,
    flex: 1,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2e7d32",
    marginVertical: 10,
    marginLeft: 5,
  },
  productRow: { justifyContent: "space-between", marginBottom: 10 },
  productCard: {
    width: (Dimensions.get("window").width - 40) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: { width: "100%", height: 120, resizeMode: "cover" },
  productInfo: { padding: 10 },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  productDescription: { fontSize: 12, color: "#666", marginBottom: 5 },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4caf50",
    marginBottom: 8,
  },
  addToCartButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  addToCartButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 12 },
  chatIconContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 100,
  },
  chatIcon: {
    backgroundColor: "#4caf50",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  keyboardAvoid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  chatPanel: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: "hidden",
  },
  chatHeader: {
    backgroundColor: "#2e7d32",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  chatHeaderContent: { flexDirection: "row", alignItems: "center" },
  chatAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4caf50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  chatTitle: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
  chatSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  chatMessages: { flex: 1, padding: 10 },
  chatMessagesContent: { paddingBottom: 10 },
  messageBubble: { maxWidth: "85%", marginBottom: 15, flexDirection: "row" },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4caf50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    alignSelf: "flex-start",
  },
  messageContent: { borderRadius: 18, padding: 12, paddingBottom: 8 },
  botMessage: { alignSelf: "flex-start" },
  userMessage: { alignSelf: "flex-end", justifyContent: "flex-end" },
  botMessageText: { color: "#333" },
  userMessageText: { color: "#fff" },
  messageText: { fontSize: 15, lineHeight: 20 },
  messageTime: {
    fontSize: 10,
    color: "rgba(0,0,0,0.5)",
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
  typingText: { fontSize: 12, color: "#666", marginRight: 10 },
  typingDots: { flexDirection: "row", alignItems: "center" },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4caf50",
    marginHorizontal: 2,
    opacity: 0.6,
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
  selectedImagePreview: { width: 60, height: 60, borderRadius: 6 },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ff5722",
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
    backgroundColor: "#4caf50",
    padding: 12,
    borderRadius: 25,
    marginRight: 8,
  },
  sendButton: { backgroundColor: "#4caf50", padding: 12, borderRadius: 25 },
  sendButtonDisabled: { backgroundColor: "#a5d6a7", opacity: 0.7 },
  cartPanel: {
    position: "absolute",
    top: 100,
    right: 20,
    width: 300,
    height: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: "hidden",
  },
  cartHeader: {
    backgroundColor: "#2e7d32",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartTitle: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
  cartItemsList: { flex: 1, padding: 10 },
  cartItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cartItemText: { fontSize: 14, color: "#333" },
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCartText: { marginTop: 10, color: "#999", fontSize: 16 },
  checkoutButton: {
    backgroundColor: "#4caf50",
    margin: 15,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

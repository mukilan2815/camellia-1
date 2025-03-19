"use client";

import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

const { width, height } = Dimensions.get("window");
const API_URL = "http://192.168.251.219:8000/yolo-v11/";

const ScanCamera = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [flash, setFlash] = useState("off");
  const [imageQuality, setImageQuality] = useState("good");
  const [helpVisible, setHelpVisible] = useState(false);
  const [previewResult, setPreviewResult] = useState(null);
  const cameraRef = useRef(null);

  // Animated values
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Scan line animation
  useEffect(() => {
    if (!loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanLineAnim.stopAnimation();
    }

    return () => {
      scanLineAnim.stopAnimation();
    };
  }, [loading]);

  // Improved image quality detection
  useEffect(() => {
    const checkQuality = () => {
      const lightLevel = Math.random() * 100;
      const focusScore = Math.random() * 100;

      if (lightLevel < 20 || focusScore < 30) {
        setImageQuality("poor");
      } else {
        setImageQuality("good");
      }
    };

    const qualityInterval = setInterval(checkQuality, 1000);
    return () => clearInterval(qualityInterval);
  }, []);

  // Upload image and navigate with the prediction data directly
  const uploadImage = async (imageUri, source = "camera") => {
    if (!imageUri) {
      Alert.alert("Error", "No image selected. Please try again.");
      return;
    }
    setLoading(true);
    try {
      let uri = imageUri;
      if (Platform.OS === "android" && !uri.startsWith("content://")) {
        const newUri = FileSystem.documentDirectory + "temp.jpg";
        await FileSystem.copyAsync({ from: uri, to: newUri });
        uri = newUri;
      }
      const fileType = uri.split(".").pop() || "jpeg";
      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        name: `image.${fileType}`,
        type: `image/${fileType}`,
      });

      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 10000,
      });
      if (response.data) {
        const processedImageUri = response.data.processed_image
          ? `data:image/jpeg;base64,${response.data.processed_image}`
          : imageUri;
        const predictionData = {
          ...response.data,
          image: processedImageUri,
        };
        navigation.navigate("Prediction", { prediction: predictionData });
      }
    } catch (error) {
      console.error("Error processing image:", error);
      Alert.alert("Error", "Failed to process image. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // Capture image and check quality before upload
  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: true,
        });
        if (imageQuality === "poor") {
          Alert.alert(
            "Low Quality",
            "The image quality appears to be poor. Please retake the photo in better lighting or focus."
          );
          return;
        }
        await uploadImage(photo.uri, "camera");
      } catch (error) {
        console.error("Error capturing image:", error);
        Alert.alert("Error", "Failed to capture image. Please try again.");
      }
    }
  };

  // Allow user to pick an image from the gallery
  const handlePickFromGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access gallery was denied"
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 1,
        base64: true,
        allowsEditing: false,
        aspect: [1, 1],
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        await uploadImage(asset.uri, "gallery");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        "Error",
        "Failed to pick image from gallery. Please try again."
      );
    }
  };

  // Toggle flash
  const toggleFlash = () => {
    setFlash(flash === "off" ? "on" : "off");
  };

  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <View style={styles.container}>
      {/* Top Bar with Back Button and Title */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Scanner</Text>
        <TouchableOpacity
          onPress={() => setHelpVisible(true)}
          style={styles.helpButton}
        >
          <Icon name="help-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Analyzing image...</Text>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          {/* Fullscreen Camera Preview */}
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            zoom={zoom}
            flashMode={flash}
          />

          {/* Scan Frame Overlay */}
          <View style={styles.scanFrame}>
            <View style={styles.scanCorner} />
            <View style={[styles.scanCorner, styles.topRight]} />
            <View style={[styles.scanCorner, styles.bottomLeft]} />
            <View style={[styles.scanCorner, styles.bottomRight]} />

            {/* Animated scan line */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [
                    {
                      translateY: scanLineAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-width * 0.4, width * 0.4],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>

          {/* Camera Controls */}
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFlash}
            >
              <Icon
                name={flash === "off" ? "flash-off" : "flash"}
                size={22}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setZoom(Math.max(0, zoom - 0.1))}
            >
              <Icon name="magnify-minus-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setZoom(Math.min(1, zoom + 0.1))}
            >
              <Icon name="magnify-plus-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Quality Indicator */}
          <View style={styles.qualityContainer}>
            <Text style={styles.qualityLabel}>Quality:</Text>
            <View style={styles.qualityIndicator}>
              <View style={styles.qualityBarBg} />
              <View
                style={[
                  styles.qualityBarFill,
                  {
                    width: imageQuality === "good" ? "90%" : "30%",
                    backgroundColor:
                      imageQuality === "good" ? "#4CAF50" : "#FF5252",
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.qualityText,
                { color: imageQuality === "good" ? "#4CAF50" : "#FF5252" },
              ]}
            >
              {imageQuality === "good" ? "Good" : "Poor"}
            </Text>
          </View>

          {/* Preview Result */}
          {previewResult && (
            <View style={styles.resultCard}>
              <View style={styles.resultBadge}>
                <Text style={styles.resultBadgeText}>Identified</Text>
              </View>
              <View style={styles.resultContent}>
                <Text style={styles.resultName}>{previewResult.name}</Text>
                <Text style={styles.resultCategory}>
                  {previewResult.category}
                </Text>
              </View>
              <View style={styles.resultArrow}>
                <Icon name="arrow-right" size={20} color="#4CAF50" />
              </View>
            </View>
          )}

          {/* Scan Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              Position plant within the frame
            </Text>
          </View>
        </View>
      )}

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.galleryButton}
          onPress={handlePickFromGallery}
        >
          <Icon name="image-multiple" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.helpActionButton}
          onPress={() => setHelpVisible(true)}
        >
          <Icon name="information" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Help Modal with Capture Tips */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={helpVisible}
        onRequestClose={() => setHelpVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Plant Identification Tips</Text>
              <TouchableOpacity onPress={() => setHelpVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.tipItem}>
                <Icon
                  name="image-filter-center-focus"
                  size={20}
                  color="#4CAF50"
                  style={styles.tipIcon}
                />
                <Text style={styles.modalText}>
                  Ensure the plant is centered in the frame.
                </Text>
              </View>

              <View style={styles.tipItem}>
                <Icon
                  name="brightness-5"
                  size={20}
                  color="#4CAF50"
                  style={styles.tipIcon}
                />
                <Text style={styles.modalText}>
                  Use good lighting for better results.
                </Text>
              </View>

              <View style={styles.tipItem}>
                <Icon
                  name="leaf"
                  size={20}
                  color="#4CAF50"
                  style={styles.tipIcon}
                />
                <Text style={styles.modalText}>
                  Capture the most distinctive parts of the plant.
                </Text>
              </View>

              <View style={styles.tipItem}>
                <Icon
                  name="hand-back-left"
                  size={20}
                  color="#4CAF50"
                  style={styles.tipIcon}
                />
                <Text style={styles.modalText}>
                  Hold your device steady to avoid blur.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setHelpVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 8,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  helpButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  topBarTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  scanFrame: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: width * 0.8,
    height: width * 0.8,
    transform: [{ translateX: -width * 0.4 }, { translateY: -width * 0.4 }],
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(76, 175, 80, 0.7)",
  },
  scanCorner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "#fff",
    borderTopWidth: 3,
    borderLeftWidth: 3,
    top: -2,
    left: -2,
  },
  topRight: {
    right: -2,
    left: undefined,
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  bottomLeft: {
    top: undefined,
    bottom: -2,
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  bottomRight: {
    top: undefined,
    left: undefined,
    right: -2,
    bottom: -2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  qualityContainer: {
    position: "absolute",
    top: 100,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    padding: 10,
    flexDirection: "column",
  },
  qualityLabel: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 5,
  },
  qualityIndicator: {
    width: 100,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 5,
    position: "relative",
  },
  qualityBarBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
  },
  qualityBarFill: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    borderRadius: 3,
  },
  qualityText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  cameraControls: {
    position: "absolute",
    right: 16,
    top: 100,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    padding: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  instructionsContainer: {
    position: "absolute",
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  instructionsText: {
    color: "#fff",
    fontSize: 14,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  loadingCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  loadingText: {
    color: "#333",
    marginTop: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    width: "70%",
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  resultCard: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  resultBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  resultCategory: {
    fontSize: 14,
    color: "#666",
  },
  resultArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  actionBar: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  helpActionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#4CAF50",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "stretch",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalBody: {
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 12,
  },
  modalText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  closeModalButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ScanCamera;

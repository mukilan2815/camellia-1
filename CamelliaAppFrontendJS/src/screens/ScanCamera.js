import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

const { width, height } = Dimensions.get("window");
const API_URL = "http://192.168.55.219:8000/yolo-v11/";

const ScanCamera = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [imageQuality, setImageQuality] = useState("checking");
  const [helpVisible, setHelpVisible] = useState(false);
  const cameraRef = useRef(null);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Simulated real-time image quality check (replace with real analysis as needed)
  useEffect(() => {
    const qualityInterval = setInterval(() => {
      // Simulate a quality check: in production, analyze frame data here.
      const simulatedScore = Math.random();
      setImageQuality(simulatedScore > 0.6 ? "good" : "poor");
    }, 2000);
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
        allowsEditing: true,
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

  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <View style={styles.container}>
      {/* Top Bar with Help Button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Tea Leaf Capture</Text>
        <TouchableOpacity onPress={() => setHelpVisible(true)}>
          <Icon name="help-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ flex: 1 }} />
      ) : (
        <View style={styles.cameraContainer}>
          {/* Fullscreen Camera Preview */}
          <CameraView ref={cameraRef} style={styles.camera} zoom={zoom} />

          {/* Real-time Quality Indicator */}
          <View style={styles.qualityIndicator}>
            <Text
              style={[
                styles.qualityText,
                { color: imageQuality === "good" ? "#4CAF50" : "#FF5252" },
              ]}
            >
              {imageQuality === "checking"
                ? "Checking quality..."
                : imageQuality === "good"
                ? "Good quality"
                : "Poor quality"}
            </Text>
          </View>

          {/* Zoom Controls */}
          <View style={styles.zoomControls}>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => setZoom(Math.max(0, zoom - 0.1))}
            >
              <Icon name="minus" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.zoomText}>{`${(zoom * 100).toFixed(0)}%`}</Text>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => setZoom(Math.min(1, zoom + 0.1))}
            >
              <Icon name="plus" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom Controls */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButtonCapture}
          onPress={handleCapture}
        >
          <Icon name="camera" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handlePickFromGallery}
        >
          <Icon name="image-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Help Modal with Capture Tips */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={helpVisible}
        onRequestClose={() => setHelpVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Capture Tips for Tea Leaves</Text>
            <Text style={styles.modalText}>
              1. Ensure the tea leaf is well-lit and clearly visible.
            </Text>
            <Text style={styles.modalText}>
              2. Hold your device steady to avoid blur.
            </Text>
            <Text style={styles.modalText}>
              3. Avoid shadows or glare on the leaf.
            </Text>
            <Text style={styles.modalText}>
              4. Use a plain background if possible.
            </Text>
            <Text style={styles.modalText}>
              5. Adjust the zoom as needed for a tight crop.
            </Text>
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
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "space-between",
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    width: width,
    height: height - 150, // Adjust height if needed (e.g., accounting for header and controls)
  },
  qualityIndicator: {
    position: "absolute",
    top: 20,
    left: 16,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
  },
  qualityText: {
    fontSize: 14,
    fontWeight: "500",
  },
  zoomControls: {
    position: "absolute",
    right: 20,
    bottom: 80,
    flexDirection: "column",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 8,
    padding: 8,
  },
  zoomButton: {
    padding: 8,
  },
  zoomText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 12,
  },
  bottomContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "space-around",
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonCapture: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 6,
    textAlign: "center",
  },
  closeModalButton: {
    marginTop: 10,
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeModalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ScanCamera;

// src/screens/ScanCamera.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const boxSize = width * 0.8;

const ScanCamera = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      processImageAndNavigate(photo.uri);
    }
  };

  const handlePickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access gallery was denied");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 1,
    });
    if (!result.cancelled) {
      processImageAndNavigate(result.uri);
    }
  };

  const processImageAndNavigate = (imageUri) => {
    // Send imageUri/base64 to AI model, then navigate:
    navigation.navigate("Prediction", { imageUri });
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Recognition</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} />
        {/* Scanning Box Overlay */}
        <View style={[styles.scanBox, { width: boxSize, height: boxSize }]} />
      </View>

      {/* Bottom Controls: 3 Circular Icon Buttons */}
      <View style={styles.bottomContainer}>
        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Capture Button */}
        <TouchableOpacity
          style={styles.iconButtonCapture}
          onPress={handleCapture}
        >
          <Icon name="camera" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Gallery Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handlePickFromGallery}
        >
          <Icon name="image-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ScanCamera;

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
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  scanBox: {
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 8,
  },
  bottomContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "space-around",
  },

  // Shared Icon Button style
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Capture (center) button with a different color
  iconButtonCapture: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
});

import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Camera as ExpoCamera } from "expo-camera";
import { Surface } from "react-native-paper";

const CameraScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [progress, setProgress] = useState(0.6);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await ExpoCamera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const cameraType =
    ExpoCamera?.Constants?.Type?.back || ExpoCamera?.Type?.back || 0;

  return (
    <View style={styles.container}>
      {ExpoCamera && (
        <ExpoCamera ref={cameraRef} style={styles.camera} type={cameraType}>
          <View style={styles.overlay}>
            <View style={styles.scanBox} />
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                ⭐ {Math.round(progress * 100)}% Analyse
              </Text>
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ExpoCamera>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanBox: {
    width: "70%",
    height: "35%",
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 10,
    position: "absolute",
    top: "30%",
    left: "15%",
  },
  progressContainer: {
    position: "absolute",
    bottom: 120,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressText: { fontSize: 16, fontWeight: "bold" },
  cancelButton: {
    position: "absolute",
    bottom: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  cancelText: { fontSize: 16, color: "white" },
});

export default CameraScreen;

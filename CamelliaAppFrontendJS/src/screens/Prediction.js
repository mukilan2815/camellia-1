import React, { useState, useEffect } from "react";
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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Location from "expo-location";
import axios from "axios";
import { LineChart } from "react-native-chart-kit";

const API_KEY = "9dac1789f6909ca2205c94277b32f8bd";

const ResultScreen = ({ route, navigation }) => {
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const { prediction } = route.params; // Passed prediction data from the previous screen
  const [loading, setLoading] = useState(false);

  // Location & Weather States
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [weather, setWeather] = useState(null);
  const [locLoading, setLocLoading] = useState(true);

  // Request location permission and get current location details
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access location was denied"
        );
        setLocLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      // Reverse geocode the location for address details
      let addr = await Location.reverseGeocodeAsync(loc.coords);
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

  // Dummy monthly pest risk data (replace with real data if available)
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
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#4CAF50",
    },
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

      // Include treatments if available
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

      {/* Content */}
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
          {/* Location & Weather Card */}
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

          {/* Affected Area Card */}
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
        {diseaseInfo.description ? (
          <>
            <Text style={styles.subheader}>Description</Text>
            <Text style={styles.description}>{diseaseInfo.description}</Text>
          </>
        ) : null}

        {/* Treatments: Chemical */}
        {diseaseInfo.treatments.chemical &&
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

        {/* Treatments: Biological */}
        {diseaseInfo.treatments.biological &&
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

        {/* Treatments: Mechanical */}
        {diseaseInfo.treatments.mechanical &&
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

        {diseaseInfo.note ? (
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
        ) : null}
      </ScrollView>

      {/* Bottom Buttons */}
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
      </View>

      {/* Improved Fullscreen Image Modal */}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
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
  diseaseInfo: {
    flex: 1,
    marginLeft: 16,
  },
  diseaseName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  confidence: {
    fontSize: 14,
    color: "#4CAF50",
    marginTop: 4,
  },
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  cardContent: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  chartCard: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
  subheader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
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
  noteIcon: {
    marginRight: 12,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
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
  regenerateText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
  shareButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    alignItems: "center",
  },
  shareText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
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
  errorText: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 16,
  },
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
  modalImage: {
    flex: 1,
    width: "100%",
    borderRadius: 12,
  },
});

export default ResultScreen;

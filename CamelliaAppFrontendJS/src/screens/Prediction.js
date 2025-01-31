import React, { useState } from "react";
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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const ResultScreen = ({ navigation }) => {
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const diseaseInfo = {
    name: "Downy Mildew",
    plant: "Spinach Plant",
    time: "2h ago",
    description:
      "Downy mildew is a common and destructive fungal disease affecting spinach (Spinacea). Yellowish spots appear on the upper leaf surface. A purplish-gray mold develops on the underside of leaves.",
    treatments: [
      {
        title: "Fungicides:",
        description:
          "While fungicides can help control the spread, they cannot cure the disease. Preventive applications are essential. Consult local agricultural experts for recommended fungicides and application.",
      },
      {
        title: "Resistant Varieties:",
        description:
          "Plant varieties with genetic resistance to downy mildew can greatly reduce the risk of infection.",
      },
      {
        title: "Crop Rotation:",
        description:
          "Avoid planting spinach in the same location year after year.",
      },
    ],
    note: "Early detection and prompt action are crucial for managing downy mildew. If you suspect downy mildew in your spinach, consult a local agricultural extension agent for specific recommendations.",
  };

  const handleShare = async () => {
    try {
      const shareContent = {
        title: "Plant Disease Detection Result",
        message:
          `Disease: ${diseaseInfo.name}\n` +
          `Plant: ${diseaseInfo.plant}\n\n` +
          `Description: ${diseaseInfo.description}\n\n` +
          `Treatments:\n` +
          diseaseInfo.treatments
            .map((t) => `${t.title} ${t.description}`)
            .join("\n\n") +
          `\n\nNote: ${diseaseInfo.note}`,
      };

      if (Platform.OS === "ios") {
        shareContent.url = "path-to-your-image"; // Add image URL for iOS
      }

      const result = await Share.share(shareContent);
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log("Shared with activity type:", result.activityType);
        } else {
          // shared
          console.log("Shared successfully");
        }
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

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

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Disease Card */}
        <View style={styles.diseaseCard}>
          <TouchableOpacity onPress={() => setImageModalVisible(true)}>
            <Image
              source={require("../assets/images/predicted.png")}
              style={styles.diseaseImage}
            />
          </TouchableOpacity>
          <View style={styles.diseaseInfo}>
            <Text style={styles.diseaseName}>{diseaseInfo.name}</Text>
            <Text style={styles.plantName}>{diseaseInfo.plant}</Text>
          </View>
          <Text style={styles.timeAgo}>{diseaseInfo.time}</Text>
        </View>

        {/* Rest of the content */}
        <Text style={styles.subheader}>Downy Mildew on Spinach</Text>
        <Text style={styles.description}>{diseaseInfo.description}</Text>

        <Text style={styles.sectionTitle}>Treatment and Prevention</Text>
        {diseaseInfo.treatments.map((treatment, index) => (
          <View key={index} style={styles.treatmentItem}>
            <Text style={styles.treatmentTitle}>{treatment.title}</Text>
            <Text style={styles.treatmentDesc}>{treatment.description}</Text>
          </View>
        ))}

        <View style={styles.riskSection}>
          <Text style={styles.riskTitle}>Risk life prediction</Text>
          <View style={styles.riskBar}>
            <View style={styles.riskFill} />
          </View>
          <View style={styles.riskLabels}>
            <Text style={styles.riskLabel}>Low</Text>
            <Text style={styles.riskLabel}>High</Text>
          </View>
        </View>

        {/* Note Section (scrollable) */}
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

        {/* Extra padding for scroll content */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Fixed Buttons at Bottom */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.regenerateButton}>
          <Text style={styles.regenerateText}>Re-generate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Image Preview Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setImageModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Image
              source={require("../assets/images/predicted.png")}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  // New and modified styles
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "70%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
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
  diseaseCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    marginBottom: 20,
  },
  diseaseImage: {
    width: 60, // Increased from 40
    height: 60, // Increased from 40
    borderRadius: 8,
    backgroundColor: "#333333",
  },
  diseaseInfo: {
    flex: 1,
    marginLeft: 16,
  },
  diseaseName: {
    fontSize: 18, // Increased from 16
    fontWeight: "600",
    color: "#FFFFFF",
  },
  plantName: {
    fontSize: 16, // Increased from 14
    color: "#A0A0A0",
    marginTop: 4,
  },
  timeAgo: {
    fontSize: 12,
    color: "#A0A0A0",
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
  treatmentItem: {
    marginBottom: 16,
  },
  treatmentTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  treatmentDesc: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  riskSection: {
    marginVertical: 24,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  riskBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
  },
  riskFill: {
    width: "75%",
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  riskLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  riskLabel: {
    fontSize: 12,
    color: "#666666",
  },
  fixedBottomSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
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
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 24,
    paddingTop: 8,
  },
  regenerateButton: {
    flex: 1,
    paddingVertical: 14, // Increased padding
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
    alignItems: "center",
  },
  regenerateText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
  shareButton: {
    flex: 1,
    paddingVertical: 14, // Increased padding
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
});

export default ResultScreen;

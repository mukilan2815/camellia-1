import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ProfileScreen = ({ navigation }) => {
  // Sample recent diagnosis data with pest details
  const diagnoses = [
    {
      id: 1,
      name: "Tania Ahmed",
      avatar: "https://i.pravatar.cc/150?img=1",
      date: "2h ago",
      pest: "Aphids",
      details:
        "Detected a mild aphid infestation on the tea leaves. Recommended natural insecticides.",
    },
    {
      id: 2,
      name: "Saida Khan",
      avatar: "https://i.pravatar.cc/150?img=2",
      date: "4h ago",
      pest: "Whiteflies",
      details:
        "Significant whitefly presence observed. Immediate pest control measures are advised.",
    },
    {
      id: 3,
      name: "Michael Chen",
      avatar: "https://i.pravatar.cc/150?img=3",
      date: "1d ago",
      pest: "Mealybugs",
      details:
        "Mealybug infestation detected. Organic treatment recommended to control the spread.",
    },
  ];

  // Statistics data
  const stats = [
    {
      title: "Leaves Diagnosed",
      value: "1.2k",
      icon: "leaf",
    },
    {
      title: "Success Rate",
      value: "94%",
      icon: "checkmark-circle",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: "https://i.pravatar.cc/300?img=8" }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>Jimmy Sullivan</Text>
          <Text style={styles.title}>Tea Enthusiast</Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Ionicons name={stat.icon} size={24} color="#fff" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>

        {/* Recent Diagnosis Section */}
        <View style={styles.diagnosisSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Diagnosis</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See all</Text>
            </TouchableOpacity>
          </View>

          {/* Diagnosis Cards */}
          {diagnoses.map((diag) => (
            <View key={diag.id} style={styles.diagnosisCard}>
              <View style={styles.diagnosisHeader}>
                <View style={styles.diagnosisInfo}>
                  <Text style={styles.reviewerName}>{diag.name}</Text>
                  <Text style={styles.pestName}>
                    Pest Detected: {diag.pest}
                  </Text>
                </View>
                <Text style={styles.diagnosisDate}>{diag.date}</Text>
              </View>
              <Text style={styles.diagnosisDetails}>{diag.details}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  backButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "#4caf50",
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 8,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 8,
  },
  statTitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  diagnosisSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  seeAllButton: {
    color: "#4caf50",
    fontSize: 14,
  },
  diagnosisCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  diagnosisHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  diagnosisInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  pestName: {
    fontSize: 14,
    color: "#4caf50",
    fontWeight: "500",
  },
  diagnosisDate: {
    fontSize: 12,
    color: "#999",
  },
  diagnosisDetails: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});

export default ProfileScreen;

import React, { useState } from "react";
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
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ProfileScreen = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "Charlotte King",
    email: "charlotteking@gmail.com",
    username: "charlotteking",
    password: "••••••••••••",
    phone: "+1 • 202555",
  });

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

  // Menu items
  const menuItems = [
    // { icon: "heart-outline", title: "Favourites", hasArrow: true },
    { icon: "download-outline", title: "Downloads", hasArrow: true },
    { icon: "language-outline", title: "Language", hasArrow: true },
    { icon: "location-outline", title: "Location", hasArrow: true },
    { icon: "card-outline", title: "Subscription", hasArrow: true },
    {
      icon: "headset-outline",
      title: "User Feedback & Support",
      hasArrow: true,
    },
    { icon: "scan-outline", title: "Drone Service", hasArrow: true },
    { icon: "log-out-outline", title: "Log out", hasArrow: false },
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save the user data to your backend
  };

  const renderProfileView = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(true)}
        >
          <Ionicons name="settings-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Image
          source={{ uri: "https://i.pravatar.cc/300?img=8" }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.email}>{userData.email}</Text>

        <TouchableOpacity style={styles.editProfileButton}>
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name={item.icon} size={22} color="#333" />
            </View>
            <Text style={styles.menuItemText}>{item.title}</Text>
            {item.hasArrow && (
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#ccc"
                style={styles.menuArrow}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderEditView = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleSave}>
          <Ionicons name="checkmark" size={24} color="#4caf50" />
        </TouchableOpacity>
      </View>

      <View style={styles.editProfileSection}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: "https://i.pravatar.cc/300?img=8" }}
            style={styles.profileImageEdit}
          />
          <TouchableOpacity style={styles.editImageButton}>
            <Ionicons name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Name</Text>
            <TextInput
              style={styles.formInput}
              value={userData.name}
              onChangeText={(text) => setUserData({ ...userData, name: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>E-mail address</Text>
            <TextInput
              style={styles.formInput}
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>User name</Text>
            <TextInput
              style={styles.formInput}
              value={userData.username}
              onChangeText={(text) =>
                setUserData({ ...userData, username: text })
              }
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.formInput}
                value={userData.password}
                onChangeText={(text) =>
                  setUserData({ ...userData, password: text })
                }
                secureTextEntry={true}
              />
              <TouchableOpacity style={styles.passwordVisibilityButton}>
                <Ionicons name="eye-off" size={20} color="#ccc" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Phone number</Text>
            <TextInput
              style={styles.formInput}
              value={userData.phone}
              onChangeText={(text) => setUserData({ ...userData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </View>
    </>
  );

  // Hidden content (still available but not shown in the UI)
  const hiddenContent = () => (
    <View style={{ display: "none" }}>
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
                <Text style={styles.pestName}>Pest Detected: {diag.pest}</Text>
              </View>
              <Text style={styles.diagnosisDate}>{diag.date}</Text>
            </View>
            <Text style={styles.diagnosisDetails}>{diag.details}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {isEditing ? renderEditView() : renderProfileView()}
        {hiddenContent()}
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
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  editButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  editProfileButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editProfileButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  menuContainer: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuIconContainer: {
    width: 24,
    alignItems: "center",
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  menuArrow: {
    marginLeft: 8,
  },
  navFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 20,
  },
  navButton: {
    padding: 8,
  },
  // Edit Profile Styles
  editProfileSection: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  profileImageEdit: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4caf50",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: "100%",
    paddingHorizontal: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  formInput: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  passwordVisibilityButton: {
    padding: 8,
  },
  // Original styles (kept for hidden content)
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

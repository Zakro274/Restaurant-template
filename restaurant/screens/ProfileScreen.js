import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { firestore, auth } from "../config/firebase";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../context/AuthContext";

const ProfileScreen = ({ navigation }) => {
  const { isLoggedIn, userData, logout, isManager } = useAuth();

  // State for logged-in user settings
  const [notifications, setNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [tempUserData, setTempUserData] = useState(userData || {});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userData && userData.settings) {
      setNotifications(userData.settings.notifications || false);
      setDarkMode(userData.settings.darkMode || false);
      setLocationServices(userData.settings.locationServices || false);
    }

    if (userData) {
      setTempUserData({ ...userData });
    }
  }, [userData]);

  const saveChangesToFirestore = async () => {
    if (!isLoggedIn || !auth.currentUser) {
      Alert.alert("Error", "You must be logged in to update your profile");
      return;
    }

    setIsSaving(true);

    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(firestore, "users", userId);

      // Prepare data to update in Firestore
      const updateData = {
        displayName: tempUserData.name,
        phoneNumber: tempUserData.phone || "",
        address: tempUserData.address || "",
        settings: {
          notifications,
          darkMode,
          locationServices,
        },
      };

      // Update Firestore document
      await updateDoc(userRef, updateData);

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEditMode = async () => {
    if (editMode) {
      // Save changes to Firestore
      await saveChangesToFirestore();
    }
    setEditMode(!editMode);
  };

  const updateSettingInFirestore = async (setting, value) => {
    if (!isLoggedIn || !auth.currentUser) {
      Alert.alert("Error", "You must be logged in to update settings");
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(firestore, "users", userId);

      // Create object with nested path for the specific setting
      const updateData = {
        [`settings.${setting}`]: value,
      };

      // Update just this one setting
      await updateDoc(userRef, updateData);
    } catch (error) {
      console.error(`Error updating ${setting}:`, error);

      // Revert the UI state if the server update failed
      switch (setting) {
        case "notifications":
          setNotifications(!value);
          break;
        case "darkMode":
          setDarkMode(!value);
          break;
        case "locationServices":
          setLocationServices(!value);
          break;
      }

      Alert.alert("Error", `Failed to update ${setting}. Please try again.`);
    }
  };

  const handleInputChange = (field, value) => {
    setTempUserData({
      ...tempUserData,
      [field]: value,
    });
  };

  const handleToggleNotifications = async (value) => {
    setNotifications(value);
    if (!editMode) {
      await updateSettingInFirestore("notifications", value);
    }
  };

  const handleToggleDarkMode = async (value) => {
    setDarkMode(value);
    if (!editMode) {
      await updateSettingInFirestore("darkMode", value);
    }
  };

  const handleToggleLocationServices = async (value) => {
    setLocationServices(value);
    if (!editMode) {
      await updateSettingInFirestore("locationServices", value);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        onPress: () => {
          logout();
          Alert.alert("Signed Out", "You have been signed out successfully");
        },
        style: "destructive",
      },
    ]);
  };

  // Render the not logged in state
  const renderNotLoggedIn = () => (
    <View style={styles.notLoggedInContainer}>
      <Icon name="person-circle-outline" size={120} color="#E0E0E0" />
      <Text style={styles.notLoggedInTitle}>You're not signed in</Text>
      <Text style={styles.notLoggedInSubtitle}>
        Sign in to view your profile, track orders, and manage your account
        settings.
      </Text>
      <TouchableOpacity
        style={styles.signInButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.signInButtonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.signUpButton}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.signUpButtonText}>Create New Account</Text>
      </TouchableOpacity>
    </View>
  );

  // Profile sections for logged-in users
  const renderAccountInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account Information</Text>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Name</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={tempUserData?.name || ''}
            onChangeText={(text) => handleInputChange('name', text)}
          />
        ) : (
          <Text style={styles.infoValue}>{userData?.name || 'Not set'}</Text>
        )}
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Email</Text>
        {editMode ? (
          <TextInput
            style={[styles.input, { color: '#999' }]}
            value={tempUserData?.email || ''}
            editable={false}  // Email can't be changed directly
          />
        ) : (
          <Text style={styles.infoValue}>{userData?.email || 'Not set'}</Text>
        )}
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Phone</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={tempUserData?.phone || ''}
            onChangeText={(text) => handleInputChange('phone', text)}
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.infoValue}>{userData?.phone || 'Not set'}</Text>
        )}
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Address</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={tempUserData?.address || ''}
            onChangeText={(text) => handleInputChange('address', text)}
            multiline
          />
        ) : (
          <Text style={styles.infoValue}>{userData?.address || 'Not set'}</Text>
        )}
      </View>
    </View>
  );

  const renderAccountStats = () => {
    // Ensure userData exists before trying to access its properties
    const favoriteItems = userData?.favoriteItems || 0;
    const pastOrders = userData?.pastOrders || 0;
    const paymentMethods = userData?.paymentMethods || 0;
    
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="heart" size={24} color="#E63946" />
          <Text style={styles.statCount}>{favoriteItems}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="time" size={24} color="#E63946" />
          <Text style={styles.statCount}>{pastOrders}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="wallet" size={24} color="#E63946" />
          <Text style={styles.statCount}>{paymentMethods}</Text>
          <Text style={styles.statLabel}>Payments</Text>
        </View>
      </View>
    );
  };

  const renderSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Settings</Text>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Icon name="notifications-outline" size={22} color="#333" />
          <Text style={styles.settingLabel}>Push Notifications</Text>
        </View>
        <Switch
          value={notifications}
          onValueChange={handleToggleNotifications}
          trackColor={{ false: "#D0D0D0", true: "#FFD0D0" }}
          thumbColor={notifications ? "#E63946" : "#F4F3F4"}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Icon name="moon-outline" size={22} color="#333" />
          <Text style={styles.settingLabel}>Dark Mode</Text>
        </View>
        <Switch
          value={darkMode}
          onValueChange={handleToggleDarkMode}
          trackColor={{ false: "#D0D0D0", true: "#FFD0D0" }}
          thumbColor={darkMode ? "#E63946" : "#F4F3F4"}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Icon name="location-outline" size={22} color="#333" />
          <Text style={styles.settingLabel}>Location Services</Text>
        </View>
        <Switch
          value={locationServices}
          onValueChange={handleToggleLocationServices}
          trackColor={{ false: "#D0D0D0", true: "#FFD0D0" }}
          thumbColor={locationServices ? "#E63946" : "#F4F3F4"}
        />
      </View>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate("PaymentMethods")}
      >
        <View style={styles.menuItemContent}>
          <Icon name="card-outline" size={22} color="#333" />
          <Text style={styles.menuItemLabel}>Payment Methods</Text>
        </View>
        <Icon name="chevron-forward" size={22} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate("OrderHistory")}
      >
        <View style={styles.menuItemContent}>
          <Icon name="receipt-outline" size={22} color="#333" />
          <Text style={styles.menuItemLabel}>Order History</Text>
        </View>
        <Icon name="chevron-forward" size={22} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate("Addresses")}
      >
        <View style={styles.menuItemContent}>
          <Icon name="location-outline" size={22} color="#333" />
          <Text style={styles.menuItemLabel}>Saved Addresses</Text>
        </View>
        <Icon name="chevron-forward" size={22} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuItemContent}>
          <Icon name="help-circle-outline" size={22} color="#333" />
          <Text style={styles.menuItemLabel}>Help & Support</Text>
        </View>
        <Icon name="chevron-forward" size={22} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuItemContent}>
          <Icon name="information-circle-outline" size={22} color="#333" />
          <Text style={styles.menuItemLabel}>About</Text>
        </View>
        <Icon name="chevron-forward" size={22} color="#999" />
      </TouchableOpacity>
    </View>
  );

  const renderManagerOptions = () => {
    if (!isManager) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manager Options</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("FoodManagement")}
        >
          <View style={styles.menuItemContent}>
            <Icon name="restaurant-outline" size={22} color="#333" />
            <Text style={styles.menuItemLabel}>Food Management</Text>
          </View>
          <Icon name="chevron-forward" size={22} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <Icon name="bar-chart-outline" size={22} color="#333" />
            <Text style={styles.menuItemLabel}>Sales Reports</Text>
          </View>
          <Icon name="chevron-forward" size={22} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <Icon name="people-outline" size={22} color="#333" />
            <Text style={styles.menuItemLabel}>Staff Management</Text>
          </View>
          <Icon name="chevron-forward" size={22} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <Icon name="pricetag-outline" size={22} color="#333" />
            <Text style={styles.menuItemLabel}>Promotions</Text>
          </View>
          <Icon name="chevron-forward" size={22} color="#999" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        {isLoggedIn && (
          <TouchableOpacity onPress={toggleEditMode} style={styles.editButton}>
            <Icon
              name={editMode ? "checkmark" : "create-outline"}
              size={24}
              color="#E63946"
            />
          </TouchableOpacity>
        )}
        {!isLoggedIn && <View style={{ width: 40 }} />}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {!isLoggedIn ? (
          renderNotLoggedIn()
        ) : (
          <>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <Image 
                source={userData && userData.profileImage ? userData.profileImage : require('../assets/placeholder-profile.jpg')} 
                style={styles.profileImage} 
              />
              <Text style={styles.profileName}>{userData?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{userData?.email || ''}</Text>
              {isManager && (
                <View style={styles.managerBadge}>
                  <Icon name="shield-checkmark" size={14} color="#FFF" />
                  <Text style={styles.managerBadgeText}>Manager</Text>
                </View>
              )}
            </View>

            {/* Account Stats */}
            {renderAccountStats()}

            {/* Manager Options (if manager) */}
            {renderManagerOptions()}

            {/* Account Information */}
            {renderAccountInfo()}

            {/* Settings */}
            {renderSettings()}

            {/* Sign Out Button */}
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Icon name="log-out-outline" size={20} color="#E63946" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Bottom Space */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
  },
  // Not logged in styles
  notLoggedInContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    marginTop: 50,
  },
  notLoggedInTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  notLoggedInSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },
  signInButton: {
    backgroundColor: "#E63946",
    width: "100%",
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  signInButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  signUpButton: {
    backgroundColor: "#FFF",
    width: "100%",
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E63946",
  },
  signUpButtonText: {
    color: "#E63946",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Logged in styles
  profileHeader: {
    alignItems: "center",
    paddingVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  managerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  managerBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  section: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoItem: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
  },
  input: {
    fontSize: 16,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 5,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemLabel: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E63946",
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#E63946",
    marginLeft: 10,
  },
});

export default ProfileScreen;
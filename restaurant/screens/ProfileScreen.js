import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileScreen = ({ navigation }) => {
  // Sample user data - in a real app, this would come from authentication
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Anytown, USA',
    profileImage: require('../assets/placeholder-profile.jpg'), // You'll need to add this asset
    favoriteItems: 3,
    pastOrders: 12,
    paymentMethods: 2
  });

  // Settings states
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [tempUserData, setTempUserData] = useState({ ...userData });

  const toggleEditMode = () => {
    if (editMode) {
      // Save changes
      setUserData({...tempUserData});
      Alert.alert('Success', 'Profile updated successfully!');
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (field, value) => {
    setTempUserData({
      ...tempUserData,
      [field]: value
    });
  };

  const signOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Sign Out',
          onPress: () => {
            // Handle sign out logic here
            Alert.alert('Signed Out', 'You have been signed out successfully');
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Profile sections
  const renderAccountInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account Information</Text>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Name</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={tempUserData.name}
            onChangeText={(text) => handleInputChange('name', text)}
          />
        ) : (
          <Text style={styles.infoValue}>{userData.name}</Text>
        )}
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Email</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={tempUserData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            keyboardType="email-address"
          />
        ) : (
          <Text style={styles.infoValue}>{userData.email}</Text>
        )}
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Phone</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={tempUserData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.infoValue}>{userData.phone}</Text>
        )}
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Address</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={tempUserData.address}
            onChangeText={(text) => handleInputChange('address', text)}
            multiline
          />
        ) : (
          <Text style={styles.infoValue}>{userData.address}</Text>
        )}
      </View>
    </View>
  );

  const renderAccountStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Icon name="heart" size={24} color="#E63946" />
        <Text style={styles.statCount}>{userData.favoriteItems}</Text>
        <Text style={styles.statLabel}>Favorites</Text>
      </View>
      <View style={styles.statItem}>
        <Icon name="time" size={24} color="#E63946" />
        <Text style={styles.statCount}>{userData.pastOrders}</Text>
        <Text style={styles.statLabel}>Orders</Text>
      </View>
      <View style={styles.statItem}>
        <Icon name="wallet" size={24} color="#E63946" />
        <Text style={styles.statCount}>{userData.paymentMethods}</Text>
        <Text style={styles.statLabel}>Payments</Text>
      </View>
    </View>
  );

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
          onValueChange={setNotifications}
          trackColor={{ false: '#D0D0D0', true: '#FFD0D0' }}
          thumbColor={notifications ? '#E63946' : '#F4F3F4'}
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Icon name="moon-outline" size={22} color="#333" />
          <Text style={styles.settingLabel}>Dark Mode</Text>
        </View>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          trackColor={{ false: '#D0D0D0', true: '#FFD0D0' }}
          thumbColor={darkMode ? '#E63946' : '#F4F3F4'}
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Icon name="location-outline" size={22} color="#333" />
          <Text style={styles.settingLabel}>Location Services</Text>
        </View>
        <Switch
          value={locationServices}
          onValueChange={setLocationServices}
          trackColor={{ false: '#D0D0D0', true: '#FFD0D0' }}
          thumbColor={locationServices ? '#E63946' : '#F4F3F4'}
        />
      </View>
      
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PaymentMethods')}>
        <View style={styles.menuItemContent}>
          <Icon name="card-outline" size={22} color="#333" />
          <Text style={styles.menuItemLabel}>Payment Methods</Text>
        </View>
        <Icon name="chevron-forward" size={22} color="#999" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('OrderHistory')}>
        <View style={styles.menuItemContent}>
          <Icon name="receipt-outline" size={22} color="#333" />
          <Text style={styles.menuItemLabel}>Order History</Text>
        </View>
        <Icon name="chevron-forward" size={22} color="#999" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Addresses')}>
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
        <TouchableOpacity onPress={toggleEditMode} style={styles.editButton}>
          <Icon name={editMode ? "checkmark" : "create-outline"} size={24} color="#E63946" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={userData.profileImage} style={styles.profileImage} />
          <Text style={styles.profileName}>{userData.name}</Text>
          <Text style={styles.profileEmail}>{userData.email}</Text>
        </View>

        {/* Account Stats */}
        {renderAccountStats()}

        {/* Account Information */}
        {renderAccountInfo()}

        {/* Settings */}
        {renderSettings()}

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Icon name="log-out-outline" size={20} color="#E63946" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Bottom Space */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E63946',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E63946',
    marginLeft: 10,
  },
});

export default ProfileScreen;
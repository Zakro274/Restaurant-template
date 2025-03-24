import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const SpecialOfferScreen = ({ navigation }) => {
  // Sample offer details - in a real app, this would come from an API
  const offerDetails = {
    title: "Special Offer",
    subtitle: "Get 20% off your first order!",
    description: "Welcome to our restaurant app! As a new user, you can enjoy 20% off on your first order. This offer is valid for all menu items and can be used with any payment method.",
    validUntil: "March 31, 2025",
    code: "WELCOME20",
    terms: [
      "Valid for new users only",
      "Minimum order value: $15",
      "Cannot be combined with other offers",
      "Valid for delivery and pickup orders",
      "One-time use only"
    ],
    image: require('../assets/placeholder-banner.jpg'),
  };

  const handleCopyCode = () => {
    // In a real app, you would use Clipboard API
    // Clipboard.setString(offerDetails.code);
    // For now, just show a console log
    console.log('Code copied: ' + offerDetails.code);
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
        <Text style={styles.headerTitle}>Special Offer</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Offer Banner */}
        <ImageBackground
          source={offerDetails.image}
          style={styles.banner}
          imageStyle={{ borderRadius: 0 }}
        >
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>{offerDetails.title}</Text>
            <Text style={styles.bannerSubtitle}>{offerDetails.subtitle}</Text>
          </View>
        </ImageBackground>

        {/* Offer Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Offer Details</Text>
          <Text style={styles.descriptionText}>{offerDetails.description}</Text>
          
          <View style={styles.validityContainer}>
            <Icon name="calendar-outline" size={20} color="#E63946" />
            <Text style={styles.validityText}>Valid until {offerDetails.validUntil}</Text>
          </View>

          {/* Promo Code */}
          <View style={styles.promoCodeContainer}>
            <View style={styles.promoCodeContent}>
              <Text style={styles.promoCodeLabel}>Use code:</Text>
              <Text style={styles.promoCode}>{offerDetails.code}</Text>
            </View>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
              <Icon name="copy-outline" size={20} color="#FFF" />
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>

          {/* Terms & Conditions */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            {offerDetails.terms.map((term, index) => (
              <View key={index} style={styles.termItem}>
                <Icon name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.termText}>{term}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Apply Offer Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.applyOfferButton}
            onPress={() => navigation.navigate('DiscoverMain')}
          >
            <Text style={styles.applyOfferButtonText}>Browse Menu & Apply Offer</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    height: 200,
    width: '100%',
    justifyContent: 'flex-end',
  },
  bannerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 18,
    color: '#FFF',
  },
  detailsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    margin: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 20,
  },
  validityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  validityText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  promoCodeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#DDD',
  },
  promoCodeContent: {
    flex: 1,
  },
  promoCodeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  promoCode: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E63946',
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: 'row',
    backgroundColor: '#E63946',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  termsContainer: {
    marginTop: 10,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  termText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  buttonContainer: {
    padding: 20,
    marginBottom: 20,
  },
  applyOfferButton: {
    backgroundColor: '#E63946',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  applyOfferButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SpecialOfferScreen;
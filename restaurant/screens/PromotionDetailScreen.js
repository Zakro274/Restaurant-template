import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";

const PromotionDetailScreen = ({ route, navigation }) => {
  // Default promo data
  const defaultPromo = {
    id: 1,
    title: "Happy Hour",
    description: "30% off appetizers, 4-6PM daily",
    image: require("../assets/placeholder-promo1.jpg"),
    fullDescription:
      "Enjoy 30% off on all appetizers every day between 4PM and 6PM. A perfect way to start your evening!",
    validDays: "Monday to Friday",
    validHours: "4:00 PM - 6:00 PM",
    featured: [
      {
        name: "Mozzarella Sticks",
        price: "$5.99",
        discountedPrice: "$4.19",
        image: require("../assets/placeholder-pizza.jpg"),
      },
      {
        name: "Chicken Wings",
        price: "$8.99",
        discountedPrice: "$6.29",
        image: require("../assets/placeholder-burger.jpg"),
      },
      {
        name: "Loaded Nachos",
        price: "$7.99",
        discountedPrice: "$5.59",
        image: require("../assets/placeholder-salad.jpg"),
      },
    ],
    additionalInfo: [
      "Dine-in only",
      "Cannot be combined with other offers",
      "Excluding holidays",
      "No limit on items per table",
    ],
  };

  // Get the promo data from navigation params, or use default
  const promo = route.params?.promo || defaultPromo;

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
        <Text style={styles.headerTitle}>Promotion Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Promotion Banner */}
        <ImageBackground
          source={promo.image}
          style={styles.banner}
          imageStyle={{ borderRadius: 0 }}
        >
          <View style={styles.bannerOverlay}>
            <View style={styles.promoTag}>
              <Text style={styles.promoTagText}>PROMOTION</Text>
            </View>
            <Text style={styles.bannerTitle}>{promo.title}</Text>
            <Text style={styles.bannerSubtitle}>{promo.description}</Text>
          </View>
        </ImageBackground>

        {/* Details Container */}
        <View style={styles.detailsContainer}>
          {/* Validity */}
          <View style={styles.validitySection}>
            <View style={styles.validityItem}>
              <Icon name="calendar-outline" size={20} color="#E63946" />
              <Text style={styles.validityText}>{promo.validDays}</Text>
            </View>
            <View style={styles.validityItem}>
              <Icon name="time-outline" size={20} color="#E63946" />
              <Text style={styles.validityText}>{promo.validHours}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.descriptionText}>{promo.fullDescription}</Text>

          {/* Featured Items */}
          <Text style={styles.sectionTitle}>Featured Items</Text>

          {promo.featured && promo.featured.length > 0 ? (
            promo.featured.map((item, index) => (
              <View key={index} style={styles.featuredItem}>
                <Image source={item.image} style={styles.featuredItemImage} />
                <View style={styles.featuredItemDetails}>
                  <Text style={styles.featuredItemName}>{item.name}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.originalPrice}>{item.price}</Text>
                    <Text style={styles.discountedPrice}>
                      {item.discountedPrice}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.addButton}>
                    <Icon name="add" size={16} color="#FFF" />
                    <Text style={styles.addButtonText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noItemsText}>
              No featured items available for this promotion.
            </Text>
          )}

          {/* Additional Information */}
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <View style={styles.additionalInfoContainer}>
            {promo.additionalInfo && promo.additionalInfo.length > 0 ? (
              promo.additionalInfo.map((info, index) => (
                <View key={index} style={styles.infoItem}>
                  <Icon
                    name="information-circle-outline"
                    size={16}
                    color="#666"
                  />
                  <Text style={styles.infoText}>{info}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noItemsText}>
                No additional information available.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  noItemsText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    padding: 10,
  },
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  banner: {
    height: 220,
    width: "100%",
    justifyContent: "flex-end",
  },
  bannerOverlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
  },
  promoTag: {
    backgroundColor: "#E63946",
    alignSelf: "flex-start",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  promoTagText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: "#FFF",
  },
  detailsContainer: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    margin: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  validitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  validityItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  validityText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    marginBottom: 20,
  },
  featuredItem: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
  },
  featuredItemImage: {
    width: 100,
    height: 100,
  },
  featuredItemDetails: {
    flex: 1,
    padding: 15,
    justifyContent: "center",
  },
  featuredItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  originalPrice: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: 10,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E63946",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E63946",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  additionalInfoContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 15,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
  },
  buttonContainer: {
    padding: 20,
    marginBottom: 20,
  },
  
});

export default PromotionDetailScreen;

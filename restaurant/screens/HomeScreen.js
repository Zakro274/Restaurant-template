import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { firestore } from "../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [featuredItems, setFeaturedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn, userData } = useAuth();

  const promotions = [
    {
      id: 1,
      title: "Happy Hour",
      description: "30% off appetizers, 4-6PM daily",
      image: require("../assets/placeholder-promo1.jpg"),
      fullDescription:
        "Enjoy 30% off on all appetizers every day between 4PM and 6PM. A perfect way to start your evening!",
      validDays: "Monday to Friday",
      validHours: "4:00 PM - 6:00 PM",
    },
    {
      id: 2,
      title: "Family Deal",
      description: "Pizza, sides & drinks for 4, $39.99",
      image: require("../assets/placeholder-promo2.jpg"),
      fullDescription:
        "Feed the whole family with our special Family Deal! Get a large pizza, 2 sides, and 4 drinks for just $39.99.",
      validDays: "Every day",
      validHours: "All day",
    },
  ];

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create a query to get only featured items
        const featuredQuery = query(
          collection(firestore, "foodItems"),
          where("featured", "==", true)
        );

        const querySnapshot = await getDocs(featuredQuery);

        if (querySnapshot.empty) {
          console.log("No featured items found");
          setFeaturedItems([]);
        } else {
          // Map the Firestore documents to our app's data format
          const items = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
              description: data.description,
              price: `$${data.price.toFixed(2)}`,
              // Handle image URLs from Firestore or use a placeholder
              image: data.imageUrl
                ? { uri: data.imageUrl }
                : require("../assets/placeholder-pizza.jpg"),
              rating: data.rating || 4.5,
              reviews: data.reviews || 0,
              calories: data.calories || 0,
              prepTime: data.prepTime || "15-20 min",
              ingredients: data.ingredients || [],
              allergens: data.allergens || [],
              spicyLevel: data.spicyLevel || "Mild",
            };
          });

          setFeaturedItems(items);
        }
      } catch (error) {
        console.error("Error fetching featured items:", error);
        setError("Failed to load featured items");

        // Set fallback featured items in case of error
        setFeaturedItems([
          // Your fallback items here
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {isLoggedIn && userData
              ? `Hello, ${userData.name.split(" ")[0]}!`
              : "Hello, Guest!"}
          </Text>
          <Text style={styles.subGreeting}>
            What would you like to eat today?
          </Text>
        </View>
        <View style={styles.headerRight}>
          {/* Cart Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Cart")}
          >
            <Icon name="cart-outline" size={24} color="#333" />
          </TouchableOpacity>
          {/* Profile Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Icon name="person-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Banner */}
        <TouchableOpacity onPress={() => navigation.navigate("SpecialOffer")}>
          <ImageBackground
            source={require("../assets/placeholder-banner.jpg")}
            style={styles.banner}
            imageStyle={{ borderRadius: 15 }}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Special Offer</Text>
              <Text style={styles.bannerSubtitle}>
                Get 20% off your first order!
              </Text>
              <TouchableOpacity
                style={styles.orderNowButton}
                onPress={() => navigation.navigate("SpecialOffer")}
              >
                <Text style={styles.orderNowText}>Order Now</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* Featured Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Featured Items</Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E63946" />
              <Text style={styles.loadingText}>Loading featured items...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle-outline" size={40} color="#E63946" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : featuredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="restaurant-outline" size={40} color="#999" />
              <Text style={styles.emptyText}>No featured items available</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.menuScrollView}
            >
              {featuredItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() =>
                    navigation.navigate("ItemDescription", { item })
                  }
                >
                  <Image
                    source={item.image}
                    style={styles.menuItemImage}
                    defaultSource={require("../assets/placeholder-pizza.jpg")}
                  />
                  <View style={styles.menuItemContent}>
                    <View style={styles.menuItemRating}>
                      <Icon name="star" size={16} color="#FFD700" />
                      <Text style={styles.menuItemRatingText}>
                        {item.rating}
                      </Text>
                    </View>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    <Text style={styles.menuItemDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <View style={styles.menuItemFooter}>
                      <Text style={styles.menuItemPrice}>{item.price}</Text>
                      {/* <TouchableOpacity style={styles.addButton}>
                        <Icon name="add" size={20} color="#FFF" />
                      </TouchableOpacity> */}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Promotions */}
        <View style={styles.promotionsContainer}>
          <Text style={styles.sectionTitle}>Special Promotions</Text>
          {promotions.map((promo) => (
            <TouchableOpacity
              key={promo.id}
              style={styles.promotionItem}
              onPress={() => navigation.navigate("PromotionDetail", { promo })}
            >
              <Image source={promo.image} style={styles.promotionImage} />
              <View style={styles.promotionContent}>
                <Text style={styles.promotionTitle}>{promo.title}</Text>
                <Text style={styles.promotionDescription}>
                  {promo.description}
                </Text>
                <TouchableOpacity
                  style={styles.viewPromoButton}
                  onPress={() =>
                    navigation.navigate("PromotionDetail", { promo })
                  }
                >
                  <Text style={styles.viewPromoText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    paddingVertical: 20,
  },
  headerRight: {
    flexDirection: "row",
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  subGreeting: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  banner: {
    height: 180,
    marginHorizontal: 20,
    marginTop: 15,
    justifyContent: "center",
    overflow: "hidden",
  },
  bannerContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 15,
    height: "100%",
    justifyContent: "center",
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: "#FFF",
    marginBottom: 15,
  },
  orderNowButton: {
    backgroundColor: "#E63946",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  orderNowText: {
    color: "#FFF",
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },

  categoryItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  menuContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  menuScrollView: {
    paddingRight: 20,
  },
  menuItem: {
    width: width * 0.65,
    backgroundColor: "#FFF",
    borderRadius: 15,
    marginRight: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  menuItemContent: {
    padding: 15,
  },
  menuItemRating: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: -20,
    right: 15,
    backgroundColor: "#FFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemRatingText: {
    marginLeft: 4,
    fontWeight: "bold",
    color: "#333",
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  menuItemDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 15,
  },
  menuItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E63946",
  },
  addButton: {
    backgroundColor: "#E63946",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  promotionsContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  promotionItem: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promotionImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  promotionContent: {
    flex: 1,
    padding: 15,
    justifyContent: "center",
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  promotionDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },
  viewPromoButton: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  viewPromoText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
  // Add these new styles
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    height: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    height: 200,
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: "#E63946",
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    height: 200,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default HomeScreen;

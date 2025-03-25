import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");

const ItemDescriptionScreen = ({ route, navigation }) => {
  const { item } = route.params || {
    id: 1,
    name: "Supreme Pizza",
    description:
      "Fresh dough, homemade sauce, premium toppings including pepperoni, sausage, bell peppers, olives, and onions. Our signature item prepared in a brick oven.",
    price: "$14.99",
    image: require("../assets/placeholder-pizza.jpg"),
    rating: 4.8,
    reviews: 127,
    calories: 285,
    prepTime: "15-20 min",
    ingredients: [
      "Fresh dough",
      "Tomato sauce",
      "Mozzarella cheese",
      "Pepperoni",
      "Italian sausage",
      "Bell peppers",
      "Olives",
      "Red onions",
      "Oregano",
    ],
    allergens: ["Wheat", "Dairy"],
    spicyLevel: "Mild",
  };

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Medium");
  const [selectedExtras, setSelectedExtras] = useState([]);

  const sizes = [
    { name: "Small", price: "-$2.00" },
    { name: "Medium", price: "" },
    { name: "Large", price: "+$3.00" },
    { name: "X-Large", price: "+$5.00" },
  ];

  const extras = [
    { name: "Extra Cheese", price: "+$1.50" },
    { name: "Double Pepperoni", price: "+$2.00" },
    { name: "Garlic Crust", price: "+$1.00" },
    { name: "Truffle Oil", price: "+$3.00" },
  ];

  const incrementQuantity = () => setQuantity(quantity + 1);
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const toggleExtra = (extraName) => {
    if (selectedExtras.includes(extraName)) {
      setSelectedExtras(selectedExtras.filter((name) => name !== extraName));
    } else {
      setSelectedExtras([...selectedExtras, extraName]);
    }
  };

  const calculateTotalPrice = () => {
    let basePrice = parseFloat(item.price.replace("$", ""));

    // Add size adjustments
    if (selectedSize === "Small") basePrice -= 2;
    if (selectedSize === "Large") basePrice += 3;
    if (selectedSize === "X-Large") basePrice += 5;

    // Add extras
    if (selectedExtras.includes("Extra Cheese")) basePrice += 1.5;
    if (selectedExtras.includes("Double Pepperoni")) basePrice += 2;
    if (selectedExtras.includes("Garlic Crust")) basePrice += 1;
    if (selectedExtras.includes("Truffle Oil")) basePrice += 3;

    // Multiply by quantity
    return (basePrice * quantity).toFixed(2);
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
        <Text style={styles.headerTitle}>Item Details</Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <Icon name="heart-outline" size={24} color="#E63946" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Item Image */}
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.itemImage} />

          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviews})</Text>
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>{item.price}</Text>
        </View>

        <Text style={styles.itemDescription}>{item.description}</Text>

        {/* Item Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Icon name="flame-outline" size={20} color="#E63946" />
            <Text style={styles.detailText}>{item.calories} cal</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="time-outline" size={20} color="#E63946" />
            <Text style={styles.detailText}>{item.prepTime}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="alert-circle-outline" size={20} color="#E63946" />
            <Text style={styles.detailText}>{item.spicyLevel}</Text>
          </View>
        </View>

        {/* Allergens */}
        {item.allergens && item.allergens.length > 0 && (
          <View style={styles.allergenContainer}>
            <Text style={styles.sectionTitle}>Allergens</Text>
            <View style={styles.allergenList}>
              {item.allergens.map((allergen, index) => (
                <View key={index} style={styles.allergenItem}>
                  <Text style={styles.allergenText}>{allergen}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Ingredients */}
        {item.ingredients && item.ingredients.length > 0 && (
          <View style={styles.ingredientsContainer}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.ingredientList}>
              {item.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <Icon name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Size Selection */}
        <View style={styles.sizeContainer}>
          <Text style={styles.sectionTitle}>Size</Text>
          <View style={styles.sizeOptions}>
            {sizes.map((size, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.sizeOption,
                  selectedSize === size.name && styles.selectedSizeOption,
                ]}
                onPress={() => setSelectedSize(size.name)}
              >
                <Text
                  style={[
                    styles.sizeText,
                    selectedSize === size.name && styles.selectedSizeText,
                  ]}
                >
                  {size.name}
                </Text>
                {size.price && (
                  <Text
                    style={[
                      styles.sizePrice,
                      selectedSize === size.name && styles.selectedSizeText,
                    ]}
                  >
                    {size.price}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Extras */}
        <View style={styles.extrasContainer}>
          <Text style={styles.sectionTitle}>Extras</Text>
          <View style={styles.extrasList}>
            {extras.map((extra, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.extraItem,
                  selectedExtras.includes(extra.name) &&
                    styles.selectedExtraItem,
                ]}
                onPress={() => toggleExtra(extra.name)}
              >
                <View style={styles.extraCheckbox}>
                  {selectedExtras.includes(extra.name) ? (
                    <Icon name="checkbox" size={22} color="#E63946" />
                  ) : (
                    <Icon name="square-outline" size={22} color="#999" />
                  )}
                </View>
                <View style={styles.extraInfo}>
                  <Text
                    style={[
                      styles.extraName,
                      selectedExtras.includes(extra.name) &&
                        styles.selectedExtraText,
                    ]}
                  >
                    {extra.name}
                  </Text>
                  <Text
                    style={[
                      styles.extraPrice,
                      selectedExtras.includes(extra.name) &&
                        styles.selectedExtraText,
                    ]}
                  >
                    {extra.price}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quantity */}
        <View style={styles.quantityContainer}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={decrementQuantity}
            >
              <Icon name="remove" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={incrementQuantity}
            >
              <Icon name="add" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Spacer for bottom action bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add to Cart Bar */}
      <View style={styles.addToCartContainer}>
        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>${calculateTotalPrice()}</Text>
        </View>
        <TouchableOpacity style={styles.addToCartButton}>
          <Icon name="cart" size={24} color="#FFF" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    top: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#FFF",
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
  favoriteButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: "100%",
    height: 250,
    position: "relative",
  },
  itemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  ratingBadge: {
    position: "absolute",
    bottom: 15,
    right: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  ratingText: {
    fontWeight: "bold",
    color: "#333",
    marginLeft: 4,
  },
  reviewCount: {
    color: "#666",
    fontSize: 12,
    marginLeft: 3,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  itemName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  itemPrice: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#E63946",
  },
  itemDescription: {
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 22,
    color: "#555",
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  allergenContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  allergenList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  allergenItem: {
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FFD0D0",
  },
  allergenText: {
    color: "#E63946",
    fontSize: 12,
    fontWeight: "500",
  },
  ingredientsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  ingredientList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 10,
  },
  ingredientText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#555",
  },
  sizeContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sizeOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sizeOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  selectedSizeOption: {
    borderColor: "#E63946",
    backgroundColor: "#FFEFEF",
  },
  sizeText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  sizePrice: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  selectedSizeText: {
    color: "#E63946",
    fontWeight: "bold",
  },
  extrasContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  extrasList: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  extraItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  selectedExtraItem: {
    backgroundColor: "#FFEFEF",
  },
  extraCheckbox: {
    marginRight: 10,
  },
  extraInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  extraName: {
    fontSize: 14,
    color: "#333",
  },
  extraPrice: {
    fontSize: 14,
    color: "#666",
  },
  selectedExtraText: {
    color: "#E63946",
    fontWeight: "500",
  },
  quantityContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 20,
    width: 40,
    textAlign: "center",
  },
  addToCartContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10,
  },
  totalPriceContainer: {
    flexDirection: "column",
  },
  totalLabel: {
    fontSize: 12,
    color: "#666",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E63946",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  addToCartText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default ItemDescriptionScreen;

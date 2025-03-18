import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Popular', 'Pizza', 'Burgers', 'Pasta', 'Desserts'];
  
  const featuredItems = [
    {
      id: 1,
      name: 'Supreme Pizza',
      description: 'Fresh dough, homemade sauce, premium toppings',
      price: '$14.99',
      image: require('../assets/placeholder-pizza.jpg'),
      rating: 4.8,
      reviews: 127,
      calories: 285,
      prepTime: '15-20 min',
      ingredients: [
        'Fresh dough', 'Tomato sauce', 'Mozzarella cheese', 'Pepperoni',
        'Italian sausage', 'Bell peppers', 'Olives', 'Red onions', 'Oregano'
      ],
      allergens: ['Wheat', 'Dairy'],
      spicyLevel: 'Mild'
    },
    {
      id: 2,
      name: 'Signature Burger',
      description: 'Angus beef, special sauce, brioche bun',
      price: '$12.99',
      image: require('../assets/placeholder-burger.jpg'),
      rating: 4.7,
      reviews: 98,
      calories: 450,
      prepTime: '10-15 min',
      ingredients: [
        'Angus beef patty', 'Brioche bun', 'Lettuce', 'Tomato',
        'Cheddar cheese', 'Special sauce', 'Pickles', 'Red onion'
      ],
      allergens: ['Wheat', 'Dairy', 'Egg'],
      spicyLevel: 'Medium'
    },
    {
      id: 3,
      name: 'Pasta Carbonara',
      description: 'Creamy sauce, pancetta, fresh pasta',
      price: '$13.99',
      image: require('../assets/placeholder-pasta.jpg'),
      rating: 4.6,
      reviews: 86,
      calories: 380,
      prepTime: '12-18 min',
      ingredients: [
        'Fresh pasta', 'Pancetta', 'Parmesan cheese', 'Eggs',
        'Black pepper', 'Garlic', 'Parsley'
      ],
      allergens: ['Wheat', 'Dairy', 'Egg'],
      spicyLevel: 'Mild'
    },
  ];

  const promotions = [
    { 
      id: 1, 
      title: 'Happy Hour', 
      description: '30% off appetizers, 4-6PM daily', 
      image: require('../assets/placeholder-promo1.jpg') 
    },
    { 
      id: 2, 
      title: 'Family Deal', 
      description: 'Pizza, sides & drinks for 4, $39.99', 
      image: require('../assets/placeholder-promo2.jpg') 
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Guest!</Text>
          <Text style={styles.subGreeting}>What would you like to eat today?</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="cart-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Banner */}
        <TouchableOpacity>
          <ImageBackground
            source={require('../assets/placeholder-banner.jpg')}
            style={styles.banner}
            imageStyle={{ borderRadius: 15 }}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Special Offer</Text>
              <Text style={styles.bannerSubtitle}>Get 20% off your first order!</Text>
              <TouchableOpacity style={styles.orderNowButton}>
                <Text style={styles.orderNowText}>Order Now</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollView}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryItem,
                  activeCategory === category && styles.activeCategoryItem,
                ]}
                onPress={() => setActiveCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === category && styles.activeCategoryText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Featured Items</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.menuScrollView}
          >
            {featuredItems.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.menuItem}
                onPress={() => navigation.navigate('ItemDescription', { item })}
              >
                <Image source={item.image} style={styles.menuItemImage} />
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemRating}>
                    <Icon name="star" size={16} color="#FFD700" />
                    <Text style={styles.menuItemRatingText}>{item.rating}</Text>
                  </View>
                  <Text style={styles.menuItemName}>{item.name}</Text>
                  <Text style={styles.menuItemDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.menuItemFooter}>
                    <Text style={styles.menuItemPrice}>{item.price}</Text>
                    <TouchableOpacity style={styles.addButton}>
                      <Icon name="add" size={20} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Promotions */}
        <View style={styles.promotionsContainer}>
          <Text style={styles.sectionTitle}>Special Promotions</Text>
          {promotions.map((promo) => (
            <TouchableOpacity key={promo.id} style={styles.promotionItem}>
              <Image source={promo.image} style={styles.promotionImage} />
              <View style={styles.promotionContent}>
                <Text style={styles.promotionTitle}>{promo.title}</Text>
                <Text style={styles.promotionDescription}>{promo.description}</Text>
                <TouchableOpacity style={styles.viewPromoButton}>
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerRight: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  banner: {
    height: 180,
    marginHorizontal: 20,
    marginTop: 15,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bannerContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    height: '100%',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 15,
  },
  orderNowButton: {
    backgroundColor: '#E63946',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  orderNowText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  categoriesContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  categoriesScrollView: {
    paddingRight: 20,
  },
  categoryItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeCategoryItem: {
    backgroundColor: '#E63946',
  },
  categoryText: {
    color: '#333',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#FFF',
    fontWeight: 'bold',
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
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  menuItemContent: {
    padding: 15,
  },
  menuItemRating: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: -20,
    right: 15,
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemRatingText: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: '#333',
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  menuItemDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 15,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E63946',
  },
  addButton: {
    backgroundColor: '#E63946',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promotionsContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  promotionItem: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promotionImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  promotionContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  promotionDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  viewPromoButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  viewPromoText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
});

export default HomeScreen;
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const DiscoverScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 1, name: 'Pizza', icon: 'pizza-outline', color: '#FF7E67' },
    { id: 2, name: 'Burgers', icon: 'fast-food-outline', color: '#FF9F45' },
    { id: 3, name: 'Salads', icon: 'leaf-outline', color: '#7AC74F' },
    { id: 4, name: 'Pasta', icon: 'restaurant-outline', color: '#FFD166' },
    { id: 5, name: 'Desserts', icon: 'ice-cream-outline', color: '#E8C1C5' },
    { id: 6, name: 'Drinks', icon: 'wine-outline', color: '#748DA6' },
  ];

  const popularDishes = [
    {
      id: 1,
      name: 'Pepperoni Pizza',
      description: 'Classic pepperoni with mozzarella',
      price: '$12.99',
      image: require('../assets/placeholder-pizza.jpg'),
      rating: 4.8,
      reviews: 127,
      calories: 275,
      prepTime: '15-20 min',
      ingredients: [
        'Fresh dough', 'Tomato sauce', 'Mozzarella cheese', 'Pepperoni',
        'Oregano', 'Olive oil'
      ],
      allergens: ['Wheat', 'Dairy'],
      spicyLevel: 'Medium'
    },
    {
      id: 2,
      name: 'Classic Cheeseburger',
      description: 'Beef patty with cheese and special sauce',
      price: '$10.99',
      image: require('../assets/placeholder-burger.jpg'),
      rating: 4.6,
      reviews: 96,
      calories: 420,
      prepTime: '10-12 min',
      ingredients: [
        'Beef patty', 'Sesame bun', 'Cheddar cheese', 'Lettuce',
        'Tomato', 'Pickles', 'Special sauce'
      ],
      allergens: ['Wheat', 'Dairy', 'Egg'],
      spicyLevel: 'Mild'
    },
    {
      id: 3,
      name: 'Caesar Salad',
      description: 'Romaine lettuce with croutons and dressing',
      price: '$8.99',
      image: require('../assets/placeholder-salad.jpg'),
      rating: 4.5,
      reviews: 72,
      calories: 180,
      prepTime: '5-8 min',
      ingredients: [
        'Romaine lettuce', 'Croutons', 'Parmesan cheese', 'Caesar dressing',
        'Black pepper', 'Lemon juice'
      ],
      allergens: ['Wheat', 'Dairy', 'Egg'],
      spicyLevel: 'Mild'
    },
    {
      id: 4,
      name: 'Fettuccine Alfredo',
      description: 'Creamy pasta with parmesan cheese',
      price: '$13.99',
      image: require('../assets/placeholder-pasta.jpg'),
      rating: 4.7,
      reviews: 84,
      calories: 410,
      prepTime: '12-15 min',
      ingredients: [
        'Fettuccine pasta', 'Heavy cream', 'Butter', 'Parmesan cheese',
        'Garlic', 'Black pepper', 'Parsley'
      ],
      allergens: ['Wheat', 'Dairy'],
      spicyLevel: 'Mild'
    },
  ];

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <Icon name={item.icon} size={24} color="#FFF" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderDishItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.dishItem}
      onPress={() => navigation.navigate('ItemDescription', { item })}
    >
      <Image source={item.image} style={styles.dishImage} />
      <View style={styles.dishContent}>
        <Text style={styles.dishName}>{item.name}</Text>
        <Text style={styles.dishDescription} numberOfLines={1}>
          {item.description}
        </Text>
        <View style={styles.dishRatingContainer}>
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.dishRating}>{item.rating}</Text>
          <Text style={styles.dishReviews}>({item.reviews} reviews)</Text>
        </View>
        <View style={styles.dishFooter}>
          <Text style={styles.dishPrice}>{item.price}</Text>
          <TouchableOpacity style={styles.addButton}>
            <Icon name="add" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="options-outline" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Popular Dishes */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Dishes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={popularDishes}
            renderItem={renderDishItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={styles.dishesList}
          />
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: '#E63946',
    fontWeight: '500',
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 5,
    width: 80,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  categoryName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  dishesList: {
    paddingHorizontal: 20,
  },
  dishItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dishImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  dishContent: {
    flex: 1,
    padding: 12,
  },
  dishName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dishDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  dishRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dishRating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  dishReviews: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
  },
  dishFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dishPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E63946',
  },
  addButton: {
    backgroundColor: '#E63946',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DiscoverScreen;
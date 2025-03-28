import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { firestore } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const DiscoverScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foodItems, setFoodItems] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories and food items from Firebase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesSnapshot = await getDocs(collection(firestore, 'categories'));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Add 'All' as the first category
        setCategories([
          { id: 'all', name: 'All', icon: 'grid-outline', color: '#748DA6' },
          ...categoriesData
        ]);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      }
    };

    const fetchFoodItems = async () => {
      try {
        setIsLoading(true);
        const foodItemsSnapshot = await getDocs(collection(firestore, 'foodItems'));
        const foodItemsData = foodItemsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Create a compatible format with the existing code
          price: `$${doc.data().price}`,
          image: { uri: doc.data().imageUrl } // Adjust this based on how you store images
        }));
        
        setFoodItems(foodItemsData);
        setFilteredDishes(foodItemsData);
      } catch (error) {
        console.error('Error fetching food items:', error);
        setError('Failed to load menu items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
    fetchFoodItems();
  }, []);

  // Filter dishes based on search query and active category
  useEffect(() => {
    setIsSearching(true);
    
    // Simulate a slight delay for search to feel more natural
    const searchTimer = setTimeout(() => {
      const filtered = foodItems.filter(dish => {
        const matchesSearch = searchQuery.trim() === '' || 
          dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (dish.ingredients && Array.isArray(dish.ingredients) && dish.ingredients.some(ingredient => 
            ingredient.toLowerCase().includes(searchQuery.toLowerCase())
          ));
        
        const matchesCategory = !activeCategory || activeCategory === 'All' || 
          dish.category === activeCategory;
        
        return matchesSearch && matchesCategory;
      });
      
      setFilteredDishes(filtered);
      setIsSearching(false);
    }, 500);
    
    return () => clearTimeout(searchTimer);
  }, [searchQuery, activeCategory, foodItems]);

  const handleCategoryPress = (categoryName) => {
    if (activeCategory === categoryName) {
      // If tapping the already active category, deselect it
      setActiveCategory(null);
    } else {
      setActiveCategory(categoryName);
    }
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.categoryItem,
        activeCategory === item.name && styles.activeCategoryItem
      ]}
      onPress={() => handleCategoryPress(item.name)}
    >
      <View style={[styles.categoryIcon, { backgroundColor: item.color || '#E63946' }]}>
        <Icon name={item.icon || 'restaurant-outline'} size={24} color="#FFF" />
      </View>
      <Text style={[
        styles.categoryName,
        activeCategory === item.name && styles.activeCategoryName
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderDishItem = ({ item }) => {
    // Handle different possible image sources
    let imageSource;
    if (item.imageUrl) {
      // If we have a Firebase Storage URL
      imageSource = { uri: item.imageUrl };
    } else if (typeof item.image === 'object' && item.image.uri) {
      // If we have an object with uri property
      imageSource = item.image;
    } else {
      // Fallback to placeholder
      imageSource = require('../assets/placeholder-pizza.jpg');
    }
    
    return (
      <TouchableOpacity 
        style={styles.dishItem}
        onPress={() => navigation.navigate('ItemDescription', { item })}
      >
        <Image 
          source={imageSource}
          style={styles.dishImage}
          // Add error handling for image loading failures
          onError={() => console.log(`Failed to load image for ${item.name}`)}
        />
        <View style={styles.dishContent}>
          <Text style={styles.dishName}>{item.name}</Text>
          <Text style={styles.dishDescription} numberOfLines={1}>
            {item.description}
          </Text>
          <View style={styles.dishRatingContainer}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.dishRating}>{item.rating || '4.5'}</Text>
            <Text style={styles.dishReviews}>({item.reviews || '0'} reviews)</Text>
          </View>
          <View style={styles.dishFooter}>
            <Text style={styles.dishPrice}>{typeof item.price === 'number' ? `${item.price.toFixed(2)}` : item.price}</Text>
            <TouchableOpacity style={styles.addButton}>
              <Icon name="add" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyResult = () => (
    <View style={styles.emptyResultContainer}>
      <Icon name="search-outline" size={60} color="#CCC" />
      <Text style={styles.emptyResultTitle}>No results found</Text>
      <Text style={styles.emptyResultText}>
        We couldn't find any dishes matching your search.
        Try a different keyword or category.
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyResultContainer}>
      <Icon name="alert-circle-outline" size={60} color="#E63946" />
      <Text style={styles.emptyResultTitle}>Something went wrong</Text>
      <Text style={styles.emptyResultText}>
        {error || 'Failed to load menu items. Please try again later.'}
      </Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={() => {
          setIsLoading(true);
          // Reload the component (re-trigger the useEffect)
          setFoodItems([]);
          setFilteredDishes([]);
          // Force a re-render
          setTimeout(() => {
            setIsLoading(false);
          }, 100);
        }}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
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
            returnKeyType="search"
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E63946" />
          <Text style={styles.loadingText}>Loading menu items...</Text>
        </View>
      ) : error ? (
        renderError()
      ) : (
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

          {/* Results Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {searchQuery.trim() !== '' ? 'Search Results' : 'All Dishes'}
                {activeCategory && activeCategory !== 'All' ? ` • ${activeCategory}` : ''}
              </Text>
              
              {!searchQuery && !activeCategory && (
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E63946" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : filteredDishes.length > 0 ? (
              <FlatList
                data={filteredDishes}
                renderItem={renderDishItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={styles.dishesList}
              />
            ) : (
              renderEmptyResult()
            )}
          </View>
        </ScrollView>
      )}
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
    right:15,
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
  activeCategoryItem: {
    transform: [{ scale: 1.05 }],
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
  activeCategoryName: {
    fontWeight: 'bold',
    color: '#E63946',
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
  loadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyResultContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyResultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  emptyResultText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DiscoverScreen;
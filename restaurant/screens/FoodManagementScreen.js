import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Alert,
  Modal,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

const FoodManagementScreen = ({ navigation }) => {
  const { isManager } = useAuth();
  const [foodItems, setFoodItems] = useState([
    {
      id: 1,
      name: 'Pepperoni Pizza',
      description: 'Classic pepperoni with mozzarella',
      price: '12.99',
      image: require('../assets/placeholder-pizza.jpg'),
      category: 'Pizza',
      available: true
    },
    {
      id: 2,
      name: 'Classic Cheeseburger',
      description: 'Beef patty with cheese and special sauce',
      price: '10.99',
      image: require('../assets/placeholder-burger.jpg'),
      category: 'Burgers',
      available: true
    },
    {
      id: 3,
      name: 'Caesar Salad',
      description: 'Romaine lettuce with croutons and dressing',
      price: '8.99',
      image: require('../assets/placeholder-salad.jpg'),
      category: 'Salads',
      available: true
    }
  ]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Pizza',
    available: true
  });
  
  const categories = [
    'All', 'Pizza', 'Burgers', 'Salads', 'Pasta', 'Desserts', 'Drinks'
  ];

  // Check if user is manager when screen mounts
  useEffect(() => {
    if (!isManager) {
      Alert.alert('Access Denied', 'You do not have permission to access this area.');
      navigation.goBack();
    }
  }, [isManager, navigation]);

  // Filter food items based on search query and category
  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const resetNewItem = () => {
    setNewItem({
      name: '',
      description: '',
      price: '',
      category: 'Pizza',
      available: true
    });
  };

  const handleAddItem = () => {
    // Validate form fields
    if (!newItem.name.trim()) {
      Alert.alert('Error', 'Please enter a food item name');
      return;
    }
    
    if (!newItem.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    
    if (!newItem.price.trim() || isNaN(parseFloat(newItem.price))) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    // Create new item with unique ID
    const newId = foodItems.length > 0 
      ? Math.max(...foodItems.map(item => item.id)) + 1 
      : 1;
      
    const itemToAdd = {
      ...newItem,
      id: newId,
      price: parseFloat(newItem.price).toFixed(2),
      image: require('../assets/placeholder-pizza.jpg'), // Default image
    };

    // Add new item to list
    setFoodItems([...foodItems, itemToAdd]);
    resetNewItem();
    setModalVisible(false);
    
    Alert.alert('Success', 'Food item added successfully');
  };

  const handleUpdateItem = () => {
    if (!currentItem) return;
    
    // Validate form fields
    if (!newItem.name.trim()) {
      Alert.alert('Error', 'Please enter a food item name');
      return;
    }
    
    if (!newItem.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    
    if (!newItem.price.trim() || isNaN(parseFloat(newItem.price))) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    // Update the item in the list
    const updatedItems = foodItems.map(item => 
      item.id === currentItem.id 
        ? { 
            ...item, 
            name: newItem.name,
            description: newItem.description,
            price: parseFloat(newItem.price).toFixed(2),
            category: newItem.category,
            available: newItem.available
          } 
        : item
    );

    setFoodItems(updatedItems);
    resetNewItem();
    setCurrentItem(null);
    setEditMode(false);
    setModalVisible(false);
    
    Alert.alert('Success', 'Food item updated successfully');
  };

  const handleDeleteItem = (id) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => {
            const updatedItems = foodItems.filter(item => item.id !== id);
            setFoodItems(updatedItems);
            Alert.alert('Success', 'Item deleted successfully');
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleEditItem = (item) => {
    setCurrentItem(item);
    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      available: item.available
    });
    setEditMode(true);
    setModalVisible(true);
  };

  // Render each food item in the list
  const renderFoodItem = ({ item }) => (
    <View style={styles.foodItem}>
      <Image source={item.image} style={styles.foodImage} />
      <View style={styles.foodInfo}>
        <View style={styles.foodHeader}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodPrice}>${item.price}</Text>
        </View>
        <Text style={styles.foodDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.foodFooter}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
          <Text style={[
            styles.statusText, 
            { color: item.available ? '#4CAF50' : '#F44336' }
          ]}>
            {item.available ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]} 
          onPress={() => handleEditItem(item)}
        >
          <Icon name="create-outline" size={20} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => handleDeleteItem(item.id)}
        >
          <Icon name="trash-outline" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
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
        <Text style={styles.headerTitle}>Food Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            resetNewItem();
            setEditMode(false);
            setModalVisible(true);
          }}
        >
          <Icon name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search food items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Filters */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                filterCategory === category && styles.activeCategoryChip
              ]}
              onPress={() => setFilterCategory(category)}
            >
              <Text style={[
                styles.categoryChipText,
                filterCategory === category && styles.activeCategoryChipText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Food Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderFoodItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="restaurant-outline" size={80} color="#DDD" />
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptyMessage}>
              {searchQuery || filterCategory !== 'All' 
                ? 'Try changing your search or filter' 
                : 'Add your first food item with the + button'}
            </Text>
          </View>
        }
      />

      {/* Add/Edit Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Edit Food Item' : 'Add New Food Item'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContainer}
            >
              {/* Name Field */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter food item name"
                  value={newItem.name}
                  onChangeText={(text) => setNewItem({...newItem, name: text})}
                />
              </View>

              {/* Description Field */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description *</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Enter description"
                  value={newItem.description}
                  onChangeText={(text) => setNewItem({...newItem, description: text})}
                  multiline={true}
                  numberOfLines={3}
                />
              </View>

              {/* Price Field */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Price ($) *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="0.00"
                  value={newItem.price}
                  onChangeText={(text) => setNewItem({...newItem, price: text})}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Category Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryOptions}
                >
                  {categories.filter(cat => cat !== 'All').map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        newItem.category === category && styles.selectedCategoryOption
                      ]}
                      onPress={() => setNewItem({...newItem, category})}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        newItem.category === category && styles.selectedCategoryOptionText
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Availability Toggle */}
              <View style={styles.formGroup}>
                <View style={styles.availabilityContainer}>
                  <Text style={styles.formLabel}>Available</Text>
                  <Switch
                    value={newItem.available}
                    onValueChange={(value) => setNewItem({...newItem, available: value})}
                    trackColor={{ false: '#D0D0D0', true: '#FFD0D0' }}
                    thumbColor={newItem.available ? '#E63946' : '#F4F3F4'}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={editMode ? handleUpdateItem : handleAddItem}
              >
                <Text style={styles.submitButtonText}>
                  {editMode ? 'Update Item' : 'Add Item'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#E63946',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
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
  categoriesContainer: {
    marginBottom: 10,
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  activeCategoryChip: {
    backgroundColor: '#E63946',
    borderColor: '#E63946',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#333',
  },
  activeCategoryChipText: {
    color: '#FFF',
    fontWeight: '500',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 50,
  },
  foodItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  foodImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  foodInfo: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  foodPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E63946',
  },
  foodDescription: {
    fontSize: 14,
    color: '#666',
    marginVertical: 8,
  },
  foodFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#666',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    justifyContent: 'space-between',
    padding: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  formInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryOptions: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  categoryOption: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#F5F5F5',
  },
  selectedCategoryOption: {
    backgroundColor: '#FFEFEF',
    borderColor: '#E63946',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryOptionText: {
    color: '#E63946',
    fontWeight: '500',
  },
  availabilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  submitButton: {
    backgroundColor: '#E63946',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default FoodManagementScreen;
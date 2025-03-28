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
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { firestore, storage } from '../config/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  deleteObject, 
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

const FoodManagementScreen = ({ navigation }) => {
  // Auth context
  const { isManager } = useAuth();

  // State variables
  const [foodItems, setFoodItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Pizza',
    available: true
  });
  
  // Categories list
  const categories = [
    'All', 'Pizza', 'Burgers', 'Salads', 'Pasta', 'Desserts', 'Drinks'
  ];

  // Check if user is manager and fetch food items when screen mounts
  useEffect(() => {
    if (!isManager) {
      Alert.alert('Access Denied', 'You do not have permission to access this area.');
      navigation.goBack();
    } else {
      fetchFoodItems();
    }
  }, [isManager, navigation]);

  // Apply filters when search query or category changes
  useEffect(() => {
    filterItems();
  }, [searchQuery, filterCategory, foodItems]);

  // Fetch food items from Firestore
  const fetchFoodItems = async () => {
    try {
      setIsLoading(true);
      const foodItemsCollection = collection(firestore, 'foodItems');
      const snapshot = await getDocs(foodItemsCollection);
      
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Use the image URL from Firestore or fallback to local image
        image: doc.data().imageUrl 
          ? { uri: doc.data().imageUrl } 
          : require('../assets/placeholder-pizza.jpg'),
        price: doc.data().price?.toString() || '0'
      }));
      
      setFoodItems(items);
    } catch (error) {
      console.error('Error fetching food items:', error);
      Alert.alert('Error', 'Failed to load food items from the database.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter food items based on search query and category
  const filterItems = () => {
    const filtered = foodItems.filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredItems(filtered);
  };

  // Reset form state
  const resetForm = () => {
    setNewItem({
      name: '',
      description: '',
      price: '',
      category: 'Pizza',
      available: true
    });
    setSelectedImage(null);
    setCurrentItem(null);
    setEditMode(false);
  };

  // Image picker function
  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required', 
          'Please grant camera roll permissions to upload images.'
        );
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async (imageUri, itemId) => {
    if (!imageUri) return null;
    
    try {
      setUploadingImage(true);
      
      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Create a unique filename
      const filename = `foodItems/images/${itemId || Date.now()}.${imageUri.split('.').pop()}`;
      const imageRef = storageRef(storage, filename);
      
      // Upload to Firebase Storage
      await uploadBytes(imageRef, blob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(imageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // Delete image from Firebase Storage
  const deleteImage = async (imageUrl) => {
    if (!imageUrl) return;
    
    try {
      console.log('Attempting to delete image:', imageUrl);
      
      // Check for different URL formats
      let filePath = null;
      const standardFormatMatch = imageUrl.match(/o\/(.+?)\?/);
      
      if (standardFormatMatch && standardFormatMatch[1]) {
        // Standard Firebase storage URL
        filePath = decodeURIComponent(standardFormatMatch[1]);
      } else if (imageUrl.includes('firebasestorage.app')) {
        // URL format: https://storage.googleapis.com/rest-5c1f4.firebasestorage.app/foodItems/images/filename.jpeg
        const urlParts = imageUrl.split('firebasestorage.app/');
        if (urlParts.length > 1) {
          filePath = urlParts[1];
        }
      }
      
      if (filePath) {
        console.log('Extracted file path:', filePath);
        const imageRef = storageRef(storage, filePath);
        await deleteObject(imageRef);
        console.log('Image deleted from storage:', filePath);
        return true;
      } else {
        console.log('Could not extract file path from URL:', imageUrl);
        return false;
      }
    } catch (error) {
      console.error('Error deleting image from storage:', error);
      return false;
    }
  };

  // Handle adding a new food item
  const handleAddItem = async () => {
    // Validate form fields
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Prepare data for Firestore
      const itemData = {
        name: newItem.name.trim(),
        description: newItem.description.trim(),
        price: parseFloat(newItem.price),
        category: newItem.category,
        available: newItem.available,
        imageUrl: '',
        featured: false,
        rating: 4.5,
        reviews: 0,
        calories: 0,
        prepTime: '15-20 min',
        ingredients: [],
        allergens: [],
        spicyLevel: 'Mild',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add to Firestore first to get the document ID
      const docRef = await addDoc(collection(firestore, 'foodItems'), itemData);
      const newItemId = docRef.id;
      
      // Upload image if selected
      let imageUrl = '';
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage.uri, newItemId);
        
        // Update the document with the image URL
        if (imageUrl) {
          await updateDoc(doc(firestore, 'foodItems', newItemId), {
            imageUrl: imageUrl
          });
          itemData.imageUrl = imageUrl;
        }
      }
      
      // Update local state with new item
      const newItemWithId = {
        id: newItemId,
        ...itemData,
        image: selectedImage ? { uri: selectedImage.uri } : require('../assets/placeholder-pizza.jpg'),
        price: itemData.price.toString()
      };
      
      setFoodItems([...foodItems, newItemWithId]);
      resetForm();
      setModalVisible(false);
      
      Alert.alert('Success', 'Food item added successfully to the database');
    } catch (error) {
      console.error('Error adding food item:', error);
      Alert.alert('Error', 'Failed to add food item to the database');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating an existing food item
  const handleUpdateItem = async () => {
    if (!currentItem || !validateForm()) return;

    try {
      setIsSubmitting(true);

      // Prepare data for update
      const itemData = {
        name: newItem.name.trim(),
        description: newItem.description.trim(),
        price: parseFloat(newItem.price),
        category: newItem.category,
        available: newItem.available,
        updatedAt: serverTimestamp()
      };

      // Handle image update if necessary
      let imageUrl = currentItem.imageUrl || '';
      
      // If there's a new image or the current image was removed
      if (selectedImage) {
        if (!currentItem.imageUrl || selectedImage.uri !== currentItem.imageUrl) {
          // Delete old image if it exists
          if (currentItem.imageUrl) {
            await deleteImage(currentItem.imageUrl);
          }
          
          // Upload new image
          imageUrl = await uploadImage(selectedImage.uri, currentItem.id);
          if (imageUrl) {
            itemData.imageUrl = imageUrl;
          }
        }
      } else if (currentItem.imageUrl && !selectedImage) {
        // Image was removed, delete it from storage
        await deleteImage(currentItem.imageUrl);
        itemData.imageUrl = '';
      }

      // Update in Firestore
      const itemRef = doc(firestore, 'foodItems', currentItem.id);
      await updateDoc(itemRef, itemData);
      
      // Update local state
      const updatedItems = foodItems.map(item => 
        item.id === currentItem.id 
          ? { 
              ...item, 
              ...itemData,
              image: selectedImage ? { uri: selectedImage.uri } : require('../assets/placeholder-pizza.jpg'),
              price: itemData.price.toString(),
              imageUrl: itemData.imageUrl
            } 
          : item
      );

      setFoodItems(updatedItems);
      resetForm();
      setModalVisible(false);
      
      Alert.alert('Success', 'Food item updated successfully in the database');
    } catch (error) {
      console.error('Error updating food item:', error);
      Alert.alert('Error', 'Failed to update food item in the database');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting a food item
  const handleDeleteItem = (id) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: async () => {
            try {
              setIsLoading(true);
              
              // Find the item to get its imageUrl
              const itemToDelete = foodItems.find(item => item.id === id);
              
              // Delete from Firestore
              const itemRef = doc(firestore, 'foodItems', id);
              await deleteDoc(itemRef);
              
              // Delete image from Storage if it exists
              if (itemToDelete && itemToDelete.imageUrl) {
                await deleteImage(itemToDelete.imageUrl);
              }
              
              // Update local state
              const updatedItems = foodItems.filter(item => item.id !== id);
              setFoodItems(updatedItems);
              
              Alert.alert('Success', 'Item deleted successfully from the database');
            } catch (error) {
              console.error('Error deleting food item:', error);
              Alert.alert('Error', 'Failed to delete food item from the database');
            } finally {
              setIsLoading(false);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Handle editing a food item
  const handleEditItem = (item) => {
    setCurrentItem(item);
    setNewItem({
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      category: item.category || 'Pizza',
      available: item.available !== undefined ? item.available : true
    });
    
    // Set the image if it exists
    if (item.imageUrl) {
      setSelectedImage({ uri: item.imageUrl });
    } else {
      setSelectedImage(null);
    }
    
    setEditMode(true);
    setModalVisible(true);
  };

  // Validate form input
  const validateForm = () => {
    if (!newItem.name.trim()) {
      Alert.alert('Error', 'Please enter a food item name');
      return false;
    }
    
    if (!newItem.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    
    if (!newItem.price.trim() || isNaN(parseFloat(newItem.price))) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }

    return true;
  };

  // Render each food item in the list
  const renderFoodItem = ({ item }) => (
    <View style={styles.foodItem}>
      <Image 
        source={item.image} 
        style={styles.foodImage}
        defaultSource={require('../assets/placeholder-pizza.jpg')}
      />
      <View style={styles.foodInfo}>
        <View style={styles.foodHeader}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodPrice}>${parseFloat(item.price).toFixed(2)}</Text>
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

  // Loading screen
  if (isLoading && foodItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Food Management</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E63946" />
          <Text style={styles.loadingText}>Loading food items...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            resetForm();
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
        refreshing={isLoading}
        onRefresh={fetchFoodItems}
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
        onRequestClose={() => {
          if (!isSubmitting && !uploadingImage) {
            setModalVisible(false);
          }
        }}
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
                onPress={() => {
                  if (!isSubmitting && !uploadingImage) {
                    setModalVisible(false);
                    resetForm();
                  }
                }}
                disabled={isSubmitting || uploadingImage}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContainer}
            >
              {/* Image Upload Section */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Product Image</Text>
                <View style={styles.imageUploadContainer}>
                  {selectedImage ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image
                        source={{ uri: selectedImage.uri }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => setSelectedImage(null)}
                        disabled={isSubmitting || uploadingImage}
                      >
                        <Icon name="close-circle" size={24} color="#E63946" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={pickImage}
                      disabled={isSubmitting || uploadingImage}
                    >
                      <Icon name="image-outline" size={30} color="#999" />
                      <Text style={styles.uploadText}>Select Image</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Name Field */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter food item name"
                  value={newItem.name}
                  onChangeText={(text) => setNewItem({...newItem, name: text})}
                  editable={!isSubmitting && !uploadingImage}
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
                  editable={!isSubmitting && !uploadingImage}
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
                  editable={!isSubmitting && !uploadingImage}
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
                      disabled={isSubmitting || uploadingImage}
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
                    disabled={isSubmitting || uploadingImage}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity 
                style={[
                  styles.submitButton, 
                  (isSubmitting || uploadingImage) && styles.disabledButton
                ]}
                onPress={editMode ? handleUpdateItem : handleAddItem}
                disabled={isSubmitting || uploadingImage}
              >
                {isSubmitting || uploadingImage ? (
                  <View style={styles.loadingButtonContent}>
                    <ActivityIndicator color="#FFF" size="small" />
                    <Text style={styles.loadingButtonText}>
                      {uploadingImage ? 'Uploading Image...' : 'Saving...'}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>
                    {editMode ? 'Update Item' : 'Add Item'}
                  </Text>
                )}
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
  disabledButton: {
    backgroundColor: '#F5A5A5',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  imageUploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#DDD',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  uploadButton: {
    width: '100%',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 5,
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingButtonText: {
    color: '#FFF',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default FoodManagementScreen;
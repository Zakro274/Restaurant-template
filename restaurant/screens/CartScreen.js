import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { firestore } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';

const CartScreen = ({ navigation }) => {
  const { isLoggedIn, userData } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const deliveryFee = 2.99;
  const total = subtotal + tax + deliveryFee;

  // Fetch cart items when the screen loads
  useEffect(() => {
    fetchCartItems();
  }, [isLoggedIn, userData]);

  // Function to fetch cart items from Firestore
  const fetchCartItems = async () => {
    if (!isLoggedIn || !userData) {
      setCartItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Query the cart collection for items belonging to the current user
      const userId = userData.uid || (userData.email ? userData.email.replace(/[.@]/g, '_') : 'guest');
      const cartRef = collection(firestore, 'carts');
      const cartQuery = query(cartRef, where('userId', '==', userId));
      
      const querySnapshot = await getDocs(cartQuery);
      
      // Check if user has a cart
      if (querySnapshot.empty) {
        console.log('No items in cart');
        setCartItems([]);
        setIsLoading(false);
        return;
      }
      
      // Map the cart items to our app's format
      const items = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          name: data.name,
          price: data.price,
          quantity: data.quantity,
          options: data.options || '',
          image: data.imageUrl 
            ? { uri: data.imageUrl } 
            : require('../assets/placeholder-pizza.jpg'),
          foodItemId: data.foodItemId
        });
      });
      
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      Alert.alert('Error', 'Failed to load your cart items');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update item quantity in Firestore
  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setIsUpdating(true);
      
      // Update in Firestore
      const cartItemRef = doc(firestore, 'carts', id);
      await updateDoc(cartItemRef, {
        quantity: newQuantity,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setCartItems(cartItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update item quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to remove item from cart
  const removeItem = (id) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Remove", 
          onPress: async () => {
            try {
              setIsUpdating(true);
              
              // Delete from Firestore
              const cartItemRef = doc(firestore, 'carts', id);
              await deleteDoc(cartItemRef);
              
              // Update local state
              setCartItems(cartItems.filter(item => item.id !== id));
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Failed to remove item from cart');
            } finally {
              setIsUpdating(false);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  // Function to handle checkout
  const handleCheckout = () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      Alert.alert(
        'Login Required',
        'You need to be logged in to checkout',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Login', 
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
      return;
    }

    // Check if cart is empty
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return;
    }

    // Here you would typically navigate to a checkout screen
    // For now, we'll just show an alert
    Alert.alert(
      'Checkout',
      'Processing your order...',
      [
        { 
          text: 'OK', 
          onPress: () => createOrder()
        }
      ]
    );
  };

  // Function to create an order in Firestore
  const createOrder = async () => {
    if (!isLoggedIn || cartItems.length === 0) return;
    
    try {
      setIsUpdating(true);
      
      // Create order object
      const orderData = {
        userId: userData.uid || userData.email.replace(/[.@]/g, '_'),
        items: cartItems.map(item => ({
          foodItemId: item.foodItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          options: item.options ? item.options.split(', ') : []
        })),
        status: 'pending',
        totalAmount: total,
        subtotal: subtotal,
        tax: tax,
        deliveryFee: deliveryFee,
        discount: 0,
        deliveryAddress: userData.address || '',
        paymentMethod: 'Credit Card', // Default for now
        promoCode: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add to Firestore
      await addDoc(collection(firestore, 'orders'), orderData);
      
      // Clear the cart
      for (const item of cartItems) {
        await deleteDoc(doc(firestore, 'carts', item.id));
      }
      
      setCartItems([]);
      
      Alert.alert(
        'Order Placed',
        'Your order has been placed successfully!',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Error', 'Failed to place your order. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to apply promo code
  const applyPromoCode = () => {
    // For now, just show a message
    Alert.alert('Promo Code', 'This feature will be implemented soon!');
  };

  // Render cart item component
  const renderCartItem = (item) => (
    <View key={item.id} style={styles.cartItem}>
      <Image source={item.image} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemOptions}>{item.options}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
          disabled={isUpdating}
        >
          <Icon name="remove" size={18} color="#333" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
          disabled={isUpdating}
        >
          <Icon name="add" size={18} color="#333" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeItem(item.id)}
        disabled={isUpdating}
      >
        <Icon name="trash-outline" size={18} color="#E63946" />
      </TouchableOpacity>
    </View>
  );

  // Loading indicator while fetching cart items
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E63946" />
          <Text style={styles.loadingText}>Loading your cart...</Text>
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
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={{ width: 40 }} />
      </View>

      {cartItems.length > 0 ? (
        <>
          <ScrollView style={styles.cartContainer}>
            {/* Overlay for updates */}
            {isUpdating && (
              <View style={styles.updatingOverlay}>
                <ActivityIndicator size="large" color="#E63946" />
              </View>
            )}

            {/* Cart Items */}
            <View style={styles.itemsContainer}>
              {cartItems.map(renderCartItem)}
            </View>

            {/* Promo Code */}
            <View style={styles.promoContainer}>
              <View style={styles.promoInputContainer}>
                <Icon name="pricetag-outline" size={20} color="#999" style={styles.promoIcon} />
                <Text style={styles.promoPlaceholder}>Add promo code</Text>
              </View>
              <TouchableOpacity 
                style={styles.applyButton} 
                onPress={applyPromoCode}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>

            {/* Order Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Subtotal</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Tax (8%)</Text>
                <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
              </View>
              
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalText}>Total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
            </View>

            {/* Extra space at the bottom */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Checkout Button */}
          <View style={styles.checkoutContainer}>
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={handleCheckout}
              disabled={isUpdating}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <View style={styles.checkoutPriceContainer}>
                <Text style={styles.checkoutPrice}>${total.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        // Empty Cart State
        <View style={styles.emptyCartContainer}>
          <Icon name="cart-outline" size={80} color="#E0E0E0" />
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartMessage}>Looks like you haven't added any items to your cart yet.</Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseButtonText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
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
  updatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  cartContainer: {
    flex: 1,
  },
  itemsContainer: {
    padding: 15,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemOptions: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E63946',
    marginTop: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  quantityButton: {
    width: 28,
    height: 28,
    backgroundColor: '#F0F0F0',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 8,
    width: 20,
    textAlign: 'center',
  },
  removeButton: {
    width: 34,
    height: 34,
    backgroundColor: '#FFF0F0',
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  promoInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  promoIcon: {
    marginRight: 10,
  },
  promoPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  applyButton: {
    backgroundColor: '#E63946',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  applyButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  summaryContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 15,
    marginTop: 5,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E63946',
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10,
  },
  checkoutButton: {
    backgroundColor: '#E63946',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkoutPriceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  checkoutPrice: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyCartTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyCartMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: '#E63946',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;
import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, firestore } from '../config/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          
          if (userDoc.exists()) {
            const userDataFromDB = userDoc.data();
            setUserData({
              name: userDataFromDB.name || user.displayName || 'User',
              email: user.email,
              phone: userDataFromDB.phone || '+1 (555) 123-4567',
              address: userDataFromDB.address || '123 Main St, Anytown, USA',
              profileImage: require('../assets/placeholder-profile.jpg'),
              favoriteItems: userDataFromDB.favoriteItems || 0,
              pastOrders: userDataFromDB.pastOrders || 0,
              paymentMethods: userDataFromDB.paymentMethods || 0,
              isManager: userDataFromDB.isManager || false
            });
            setIsManager(userDataFromDB.isManager || false);
          } else {
            // If user document doesn't exist, use default values
            setUserData({
              name: user.displayName || 'User',
              email: user.email,
              phone: '+1 (555) 123-4567',
              address: '123 Main St, Anytown, USA',
              profileImage: require('../assets/placeholder-profile.jpg'),
              favoriteItems: 0,
              pastOrders: 0,
              paymentMethods: 0,
              isManager: false
            });
          }
          
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setIsLoggedIn(false);
          setUserData(null);
        }
      } else {
        // User is signed out
        setIsLoggedIn(false);
        setUserData(null);
        setIsManager(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      // Use Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // The auth state change listener will handle updating the state
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      return { 
        success: false, 
        error: error.message || "Failed to login. Please check your credentials." 
      };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // The auth state change listener will handle updating the state
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // // For development purposes, you can keep these mock users 
  // // as fallbacks or for testing without Firebase
  // const mockManagerData = {
  //   name: 'Manager Smith',
  //   email: 'manager@restaurant.com',
  //   phone: '+1 (555) 987-6543',
  //   address: '456 Admin St, Anytown, USA',
  //   profileImage: require('../assets/placeholder-profile.jpg'),
  //   favoriteItems: 5,
  //   pastOrders: 20,
  //   paymentMethods: 3,
  //   isManager: true
  // };

  // const mockUserData = {
  //   name: 'John Doe',
  //   email: 'john.doe@example.com',
  //   phone: '+1 (555) 123-4567',
  //   address: '123 Main St, Anytown, USA',
  //   profileImage: require('../assets/placeholder-profile.jpg'),
  //   favoriteItems: 3,
  //   pastOrders: 12,
  //   paymentMethods: 2,
  //   isManager: false
  // };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      userData, 
      isManager, 
      login, 
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
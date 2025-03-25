import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, firestore } from '../config/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

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
        setIsLoggedIn(true);
        
        try {
          // Get user data from Firestore
          const userRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            // User document exists in Firestore
            const firestoreUserData = userDoc.data();
            
            // Update last login timestamp
            await updateDoc(userRef, {
              lastLogin: serverTimestamp()
            });
            
            // Create user data object combining Auth and Firestore data
            const userDataObj = {
              name: firestoreUserData.displayName || user.displayName || '',
              email: user.email,
              phone: firestoreUserData.phoneNumber || '',
              address: firestoreUserData.address || '',
              profileImage: require('../assets/placeholder-profile.jpg'),
              favoriteItems: Array.isArray(firestoreUserData.favoriteItems) ? firestoreUserData.favoriteItems.length : 0,
              pastOrders: 0, // This would come from orders collection in a full implementation
              paymentMethods: 0 // This would come from a paymentMethods collection
            };
            
            setUserData(userDataObj);
            
            // Check if user is a manager based on role or email
            if (firestoreUserData.role === 'manager' || user.email === 'manager@restaurant.com') {
              setIsManager(true);
            } else {
              setIsManager(false);
            }
          } else {
            // Fallback to basic Auth user if no Firestore document exists
            const userDataObj = {
              name: user.displayName || '',
              email: user.email,
              phone: user.phoneNumber || '',
              address: '',
              profileImage: require('../assets/placeholder-profile.jpg'),
              favoriteItems: 0,
              pastOrders: 0,
              paymentMethods: 0
            };
            
            setUserData(userDataObj);
            
            // Check if user is a manager based on email
            if (user.email === 'manager@restaurant.com') {
              setIsManager(true);
            } else {
              setIsManager(false);
            }
          }
          
          console.log('User is logged in:', user.email);
          console.log('Is manager?', isManager);
        } catch (error) {
          console.error('Error fetching user data from Firestore:', error);
          
          // Fallback to basic user data if Firestore fetch fails
          const userDataObj = {
            name: user.displayName || '',
            email: user.email,
            phone: user.phoneNumber || '',
            address: '',
            profileImage: require('../assets/placeholder-profile.jpg'),
            favoriteItems: 0,
            pastOrders: 0,
            paymentMethods: 0
          };
          
          setUserData(userDataObj);
          
          // Check if user is a manager based on email
          if (user.email === 'manager@restaurant.com') {
            setIsManager(true);
          } else {
            setIsManager(false);
          }
        }
      } else {
        // User is signed out
        setIsLoggedIn(false);
        setUserData(null);
        setIsManager(false);
        console.log('User is logged out');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Use Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Auth state listener will handle updating the state
      
      console.log('Login successful for:', email);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      setLoading(false);
      
      // Return appropriate error message
      let errorMessage = 'Authentication failed';
      switch(error.code) {
        case 'auth/invalid-email':
          errorMessage = 'The email address is not valid.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This user account has been disabled.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many unsuccessful login attempts. Please try again later.';
          break;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Auth state listener will handle updating the state
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
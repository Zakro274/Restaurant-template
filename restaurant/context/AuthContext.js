import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setIsLoggedIn(true);
        
        // Create user data object from Firebase user
        const userDataObj = {
          name: user.displayName || 'User',
          email: user.email,
          phone: user.phoneNumber || '+1 (555) 123-4567',
          address: '123 Main St, Anytown, USA', // Default value, would come from Firestore in a real app
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
        
        console.log('User is logged in:', user.email);
        console.log('Is manager?', user.email === 'manager@restaurant.com');
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
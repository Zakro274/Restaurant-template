import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isManager, setIsManager] = useState(false);

  // Mock user data for demonstration
  const mockUserData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Anytown, USA',
    profileImage: require('../assets/placeholder-profile.jpg'), // You'll need to add this asset
    favoriteItems: 3,
    pastOrders: 12,
    paymentMethods: 2,
    isManager: false
  };

  // Mock manager data
  const mockManagerData = {
    name: 'Manager Smith',
    email: 'manager@restaurant.com',
    phone: '+1 (555) 987-6543',
    address: '456 Admin St, Anytown, USA',
    profileImage: require('../assets/placeholder-profile.jpg'),
    favoriteItems: 5,
    pastOrders: 20,
    paymentMethods: 3,
    isManager: true
  };

  const login = (email, password) => {
    // In a real app, you would validate credentials here
    // For demo purposes, we'll use hard-coded values
    if (email === 'manager@restaurant.com' && password === 'manager123') {
      setIsLoggedIn(true);
      setUserData(mockManagerData);
      setIsManager(true);
    } else {
      // Default to regular user login
      setIsLoggedIn(true);
      setUserData(mockUserData);
      setIsManager(false);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    setIsManager(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userData, isManager, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
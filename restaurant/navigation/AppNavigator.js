import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Ionicons";

// Import screens
import HomeScreen from "../screens/HomeScreen";
import DiscoverScreen from "../screens/DiscoverScreen";
import ScanScreen from "../screens/ScanScreen";
import ItemDescriptionScreen from "../screens/ItemDescriptionScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PlaceholderScreen from "../screens/PlaceholderScreen";
import CartScreen from "../screens/CartScreen";
import SpecialOfferScreen from "../screens/SpecialOfferScreen";
import PromotionDetailScreen from "../screens/PromotionDetailScreen";
import LoginScreen from "../screens/LoginScreen";
import FoodManagementScreen from "../screens/FoodManagementScreen"; // Import the new screen
import RegisterScreen from "../screens/RegisterScreen"

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home stack navigator
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ItemDescription" component={ItemDescriptionScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="OrderHistory" component={PlaceholderScreen} />
      <Stack.Screen name="PaymentMethods" component={PlaceholderScreen} />
      <Stack.Screen name="Addresses" component={PlaceholderScreen} />
      <Stack.Screen name="SpecialOffer" component={SpecialOfferScreen} />
      <Stack.Screen name="PromotionDetail" component={PromotionDetailScreen} />
      <Stack.Screen name="FoodManagement" component={FoodManagementScreen} />
    </Stack.Navigator>
  );
};

// Discover stack navigator
const DiscoverStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiscoverMain" component={DiscoverScreen} />
      <Stack.Screen name="ItemDescription" component={ItemDescriptionScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="PromotionDetail" component={PromotionDetailScreen} />
    </Stack.Navigator>
  );
};

// Main app navigator with bottom tabs
const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Discover") {
            iconName = focused ? "compass" : "compass-outline";
          } else if (route.name === "Scan") {
            iconName = focused ? "scan" : "scan-outline";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#E63946",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Discover" component={DiscoverStack} />
      <Tab.Screen name="Scan" component={ScanScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
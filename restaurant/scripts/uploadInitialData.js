// Used for developing mode.
// In case the database is empty, upload all this initial values.

// restaurant/scripts/uploadInitialData.js
import { firestore, storage } from "../config/firebase";
import {
  collection,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// Import expo-file-system for file handling (if you're using Expo)
// import * as FileSystem from 'expo-file-system';

// Sample data from your app
import { auth } from "../config/firebase";

// Function to clear a collection (CAUTION: use only in development)
const clearCollection = async (collectionName) => {
  try {
    console.log(`Clearing ${collectionName} collection...`);

    const querySnapshot = await getDocs(collection(firestore, collectionName));
    const deletePromises = [];

    querySnapshot.forEach((document) => {
      deletePromises.push(
        deleteDoc(doc(firestore, collectionName, document.id))
      );
    });

    await Promise.all(deletePromises);
    console.log(`Collection ${collectionName} cleared successfully.`);
  } catch (error) {
    console.error(`Error clearing ${collectionName} collection:`, error);
  }
};

// This function will upload a local image to Firebase Storage and return the URL
const uploadImageFromAsset = async (assetPath, storagePath) => {
  try {
    // In a real implementation with physical files, you would:
    // 1. Get the local file URI of the asset
    // 2. Convert it to a blob
    // 3. Upload to Firebase Storage

    // Since we can't actually upload the images in this script (we'd need the physical files),
    // we'll return placeholder URLs that match your Firebase project
    console.log(
      `Would upload ${assetPath} to Firebase Storage at path: ${storagePath}`
    );

    // For now, we'll use a placeholder URL pattern that matches your Firebase config
    // In a real implementation, replace this with actual file uploads
    return `https://firebasestorage.googleapis.com/v0/b/rest-5c1f4.appspot.com/o/${encodeURIComponent(
      storagePath
    )}?alt=media`;
  } catch (error) {
    console.error(`Error uploading image ${assetPath}:`, error);
    throw error;
  }
};

// Function to upload categories
const uploadCategories = async () => {
  try {
    const categories = [
      { id: 1, name: "All", icon: "grid-outline", color: "#333333" },
      { id: 2, name: "Popular", icon: "star-outline", color: "#FFD700" },
      { id: 3, name: "Pizza", icon: "pizza-outline", color: "#FF7E67" },
      { id: 4, name: "Burgers", icon: "fast-food-outline", color: "#FF9F45" },
      { id: 5, name: "Salads", icon: "leaf-outline", color: "#7AC74F" },
      { id: 6, name: "Pasta", icon: "restaurant-outline", color: "#FFD166" },
      { id: 7, name: "Desserts", icon: "ice-cream-outline", color: "#E8C1C5" },
      { id: 8, name: "Drinks", icon: "wine-outline", color: "#748DA6" },
    ];

    console.log("Uploading categories...");

    for (const category of categories) {
      // Skip the "All" category since it's just for UI filtering
      if (category.name !== "All") {
        await addDoc(collection(firestore, "categories"), {
          name: category.name,
          icon: category.icon,
          color: category.color,
          displayOrder: category.id,
          createdAt: serverTimestamp(),
        });
        console.log(`Category added: ${category.name}`);
      }
    }

    console.log("Categories upload completed!");
  } catch (error) {
    console.error("Error uploading categories:", error);
  }
};

// Function to upload food items
const uploadFoodItems = async () => {
  try {
    // Combine all food items from different screens
    const allFoodItems = [
      // From HomeScreen.js
      {
        id: 1,
        name: "Supreme Pizza",
        description: "Fresh dough, homemade sauce, premium toppings",
        price: 14.99,
        image: "../assets/placeholder-pizza.jpg",
        rating: 4.8,
        reviews: 127,
        calories: 285,
        prepTime: "15-20 min",
        category: "Pizza",
        ingredients: [
          "Fresh dough",
          "Tomato sauce",
          "Mozzarella cheese",
          "Pepperoni",
          "Italian sausage",
          "Bell peppers",
          "Olives",
          "Red onions",
          "Oregano",
        ],
        allergens: ["Wheat", "Dairy"],
        spicyLevel: "Mild",
        available: true,
        featured: true,
      },
      {
        id: 2,
        name: "Signature Burger",
        description: "Angus beef, special sauce, brioche bun",
        price: 12.99,
        image: "../assets/placeholder-burger.jpg",
        rating: 4.7,
        reviews: 98,
        calories: 450,
        prepTime: "10-15 min",
        category: "Burgers",
        ingredients: [
          "Angus beef patty",
          "Brioche bun",
          "Lettuce",
          "Tomato",
          "Cheddar cheese",
          "Special sauce",
          "Pickles",
          "Red onion",
        ],
        allergens: ["Wheat", "Dairy", "Egg"],
        spicyLevel: "Medium",
        available: true,
        featured: true,
      },
      {
        id: 3,
        name: "Pasta Carbonara",
        description: "Creamy sauce, pancetta, fresh pasta",
        price: 13.99,
        image: "../assets/placeholder-pasta.jpg",
        rating: 4.6,
        reviews: 86,
        calories: 380,
        prepTime: "12-18 min",
        category: "Pasta",
        ingredients: [
          "Fresh pasta",
          "Pancetta",
          "Parmesan cheese",
          "Eggs",
          "Black pepper",
          "Garlic",
          "Parsley",
        ],
        allergens: ["Wheat", "Dairy", "Egg"],
        spicyLevel: "Mild",
        available: true,
        featured: true,
      },
      // From DiscoverScreen.js
      {
        id: 4,
        name: "Pepperoni Pizza",
        description: "Classic pepperoni with mozzarella",
        price: 12.99,
        image: "../assets/placeholder-pizza.jpg",
        rating: 4.8,
        reviews: 127,
        calories: 275,
        prepTime: "15-20 min",
        category: "Pizza",
        ingredients: [
          "Fresh dough",
          "Tomato sauce",
          "Mozzarella cheese",
          "Pepperoni",
          "Oregano",
          "Olive oil",
        ],
        allergens: ["Wheat", "Dairy"],
        spicyLevel: "Medium",
        available: true,
        featured: false,
      },
      {
        id: 5,
        name: "Classic Cheeseburger",
        description: "Beef patty with cheese and special sauce",
        price: 10.99,
        image: "../assets/placeholder-burger.jpg",
        rating: 4.6,
        reviews: 96,
        calories: 420,
        prepTime: "10-12 min",
        category: "Burgers",
        ingredients: [
          "Beef patty",
          "Sesame bun",
          "Cheddar cheese",
          "Lettuce",
          "Tomato",
          "Pickles",
          "Special sauce",
        ],
        allergens: ["Wheat", "Dairy", "Egg"],
        spicyLevel: "Mild",
        available: true,
        featured: false,
      },
      {
        id: 6,
        name: "Caesar Salad",
        description: "Romaine lettuce with croutons and dressing",
        price: 8.99,
        image: "../assets/placeholder-salad.jpg",
        rating: 4.5,
        reviews: 72,
        calories: 180,
        prepTime: "5-8 min",
        category: "Salads",
        ingredients: [
          "Romaine lettuce",
          "Croutons",
          "Parmesan cheese",
          "Caesar dressing",
          "Black pepper",
          "Lemon juice",
        ],
        allergens: ["Wheat", "Dairy", "Egg"],
        spicyLevel: "Mild",
        available: true,
        featured: false,
      },
      {
        id: 7,
        name: "Fettuccine Alfredo",
        description: "Creamy pasta with parmesan cheese",
        price: 13.99,
        image: "../assets/placeholder-pasta.jpg",
        rating: 4.7,
        reviews: 84,
        calories: 410,
        prepTime: "12-15 min",
        category: "Pasta",
        ingredients: [
          "Fettuccine pasta",
          "Heavy cream",
          "Butter",
          "Parmesan cheese",
          "Garlic",
          "Black pepper",
          "Parsley",
        ],
        allergens: ["Wheat", "Dairy"],
        spicyLevel: "Mild",
        available: true,
        featured: false,
      },
      {
        id: 8,
        name: "Chocolate Cake",
        description: "Rich chocolate cake with ganache",
        price: 7.99,
        image: "../assets/placeholder-pizza.jpg", // Would need proper dessert image
        rating: 4.9,
        reviews: 103,
        calories: 380,
        prepTime: "5 min",
        category: "Desserts",
        ingredients: [
          "Chocolate",
          "Flour",
          "Sugar",
          "Eggs",
          "Butter",
          "Vanilla",
        ],
        allergens: ["Wheat", "Dairy", "Egg"],
        spicyLevel: "None",
        available: true,
        featured: false,
      },
      {
        id: 9,
        name: "Strawberry Milkshake",
        description: "Creamy milkshake with fresh strawberries",
        price: 5.99,
        image: "../assets/placeholder-pasta.jpg", // Would need proper drink image
        rating: 4.7,
        reviews: 68,
        calories: 320,
        prepTime: "5 min",
        category: "Drinks",
        ingredients: [
          "Milk",
          "Ice cream",
          "Fresh strawberries",
          "Whipped cream",
        ],
        allergens: ["Dairy"],
        spicyLevel: "None",
        available: true,
        featured: false,
      },
      {
        id: 10,
        name: "Margherita Pizza",
        description: "Classic Italian pizza with tomato, mozzarella, and basil",
        price: 11.99,
        image: "../assets/placeholder-pizza.jpg",
        rating: 4.6,
        reviews: 112,
        calories: 260,
        prepTime: "15-20 min",
        category: "Pizza",
        ingredients: [
          "Fresh dough",
          "Tomato sauce",
          "Fresh mozzarella",
          "Basil leaves",
          "Olive oil",
          "Salt",
        ],
        allergens: ["Wheat", "Dairy"],
        spicyLevel: "Mild",
        available: true,
        featured: false,
      },
    ];

    console.log("Uploading food items...");

    for (const item of allFoodItems) {
      // First, upload the image to Firebase Storage
      const imagePath = `foodItems/${item.id}_${item.name
        .replace(/\s+/g, "_")
        .toLowerCase()}.jpg`;
      const imageUrl = await uploadImageFromAsset(item.image, imagePath);

      // Then create the food item document in Firestore
      await addDoc(collection(firestore, "foodItems"), {
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: imageUrl,
        category: item.category,
        rating: item.rating,
        reviews: item.reviews,
        calories: item.calories,
        prepTime: item.prepTime,
        ingredients: item.ingredients,
        allergens: item.allergens,
        spicyLevel: item.spicyLevel,
        available: item.available,
        featured: item.featured,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(`Food item added: ${item.name}`);
    }

    console.log("Food items upload completed!");
  } catch (error) {
    console.error("Error uploading food items:", error);
  }
};

// Function to upload promotions
// Function to upload promotions
const uploadPromotions = async () => {
  try {
    const promotions = [
      {
        id: 1,
        title: "Happy Hour",
        description: "30% off appetizers, 4-6PM daily",
        image: "../assets/placeholder-promo1.jpg",
        fullDescription:
          "Enjoy 30% off on all appetizers every day between 4PM and 6PM. A perfect way to start your evening!",
        validDays: "Monday to Friday",
        validHours: "4:00 PM - 6:00 PM",
        code: "HAPPY30",
        discount: 30,
        discountType: "percentage",
        minimumOrderValue: 0,
        validFrom: new Date("2025-01-01"),
        validUntil: new Date("2025-12-31"),
        featured: [
          {
            name: "Mozzarella Sticks",
            price: 5.99,
            discountedPrice: 4.19,
          },
          {
            name: "Chicken Wings",
            price: 8.99,
            discountedPrice: 6.29,
          },
          {
            name: "Loaded Nachos",
            price: 7.99,
            discountedPrice: 5.59,
          },
        ],
        terms: [
          "Dine-in only",
          "Cannot be combined with other offers",
          "Excluding holidays",
          "No limit on items per table",
        ],
      },
      {
        id: 2,
        title: "Family Deal",
        description: "Pizza, sides & drinks for 4, $39.99",
        image: "../assets/placeholder-promo2.jpg",
        fullDescription:
          "Feed the whole family with our special Family Deal! Get a large pizza, 2 sides, and 4 drinks for just $39.99.",
        validDays: "Every day",
        validHours: "All day",
        code: "FAMILY40",
        discount: 0, // Fixed price deal
        discountType: "fixed",
        minimumOrderValue: 0,
        validFrom: new Date("2025-01-01"),
        validUntil: new Date("2025-12-31"),
        featured: [],
        terms: [
          "Valid for delivery and pickup",
          "Cannot be combined with other offers",
          "Subject to availability",
        ],
      },
      {
        id: 3,
        title: "Special Offer",
        description: "Get 20% off your first order!",
        image: "../assets/placeholder-banner.jpg",
        fullDescription:
          "Welcome to our restaurant app! As a new user, you can enjoy 20% off on your first order. This offer is valid for all menu items and can be used with any payment method.",
        validDays: "Every day",
        validHours: "All day",
        code: "WELCOME20",
        discount: 20,
        discountType: "percentage",
        minimumOrderValue: 15,
        validFrom: new Date("2025-01-01"),
        validUntil: new Date("2025-03-31"),
        featured: [],
        terms: [
          "Valid for new users only",
          "Minimum order value: $15",
          "Cannot be combined with other offers",
          "Valid for delivery and pickup orders",
          "One-time use only",
        ],
      },
    ];

    console.log("Uploading promotions...");

    for (const promo of promotions) {
      // Upload the promotion image to Firebase Storage
      const imagePath = `promotions/${promo.id}_${promo.title
        .replace(/\s+/g, "_")
        .toLowerCase()}.jpg`;
      const imageUrl = await uploadImageFromAsset(promo.image, imagePath);

      // Then create the promotion document in Firestore
      await addDoc(collection(firestore, "promotions"), {
        title: promo.title,
        description: promo.description,
        fullDescription: promo.fullDescription,
        code: promo.code,
        discount: promo.discount,
        discountType: promo.discountType,
        minimumOrderValue: promo.minimumOrderValue,
        validFrom: promo.validFrom,
        validUntil: promo.validUntil,
        imageUrl: imageUrl,
        validDays: promo.validDays,
        validHours: promo.validHours,
        terms: promo.terms,
        featured: promo.featured, // This would normally be an array of foodItemIds
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(`Promotion added: ${promo.title}`);
    }

    console.log("Promotions upload completed!");
  } catch (error) {
    console.error("Error uploading promotions:", error);
  }
};

// Function to create sample users (for testing)
const createSampleUsers = async () => {
  try {
    console.log("Creating sample users...");

    // Sample users - in a real app, users would register themselves
    const users = [
      {
        uid: "manager123", // This would normally be generated by Firebase Auth
        displayName: "Restaurant Manager",
        email: "manager@restaurant.com",
        phoneNumber: "+1 (555) 123-4567",
        address: "123 Main St, Restaurant City, RC 12345",
        role: "manager",
        favoriteItems: [],
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        settings: {
          notifications: true,
          darkMode: false,
          locationServices: true,
        },
      },
      {
        uid: "customer456", // This would normally be generated by Firebase Auth
        displayName: "John Customer",
        email: "john@example.com",
        phoneNumber: "+1 (555) 987-6543",
        address: "456 Oak St, Customer City, CC 67890",
        role: "customer",
        favoriteItems: [],
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        settings: {
          notifications: true,
          darkMode: true,
          locationServices: false,
        },
      },
    ];

    for (const user of users) {
      // Create user document in Firestore with the UID as document ID
      await setDoc(doc(firestore, "users", user.uid), user);
      console.log(`User created: ${user.displayName}`);
    }

    console.log("Sample users created!");
  } catch (error) {
    console.error("Error creating sample users:", error);
  }
};

// Function to create the orders collection structure
const createOrdersCollection = async () => {
  try {
    console.log("Creating sample order...");

    // Create a sample order to establish the collection structure
    const sampleOrder = {
      userId: "customer456",
      items: [
        {
          foodItemId: "1", // This would be the actual Firestore document ID in production
          name: "Supreme Pizza",
          price: 14.99,
          quantity: 1,
          options: ["Medium", "Extra Cheese"],
        },
        {
          foodItemId: "2", // This would be the actual Firestore document ID in production
          name: "Classic Cheeseburger",
          price: 10.99,
          quantity: 2,
          options: ["Medium rare", "No onions"],
        },
      ],
      status: "delivered",
      totalAmount: 36.97,
      subtotal: 36.97,
      tax: 2.96,
      deliveryFee: 2.99,
      discount: 0,
      deliveryAddress: "456 Oak St, Customer City, CC 67890",
      paymentMethod: "Credit Card",
      promoCode: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      deliveredAt: serverTimestamp(),
    };

    await addDoc(collection(firestore, "orders"), sampleOrder);
    console.log("Sample order created!");
  } catch (error) {
    console.error("Error creating orders collection:", error);
  }
};

// Main execution function
const uploadAllData = async () => {
  try {
    console.log("Starting data upload process...");

    // Uncomment these lines if you want to clear existing data first
    // CAUTION: This will delete all existing data in these collections!
    // await clearCollection("categories");
    // await clearCollection("foodItems");
    // await clearCollection("promotions");
    // await clearCollection("users");
    // await clearCollection("orders");

    // Upload data in sequence
    await uploadCategories();
    await uploadFoodItems();
    await uploadPromotions();
    await createSampleUsers();
    await createOrdersCollection();

    console.log("All data uploaded successfully!");
  } catch (error) {
    console.error("Error in data upload process:", error);
  }
};

// Execute the upload process
uploadAllData();

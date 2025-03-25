// firebase-image-uploader.js
// This script uploads images from a local directory to Firebase Storage
// and updates Firestore documents with the image URLs

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK with your service account key
const serviceAccount = require('./firebase-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'rest-5c1f4.firebasestorage.app' // Updated bucket name
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Directory containing your food images
// Update this path to where your images are actually located
const IMAGES_DIR = './assets-initialize';

// Function to upload an image to Firebase Storage
async function uploadImage(filePath, destination) {
  try {
    // Upload the file to Firebase Storage
    const [file] = await bucket.upload(filePath, {
      destination,
      metadata: {
        contentType: 'image/jpeg', // Adjust based on your file types
      },
    });
    
    // Make the file publicly accessible
    await file.makePublic();
    
    // Get the public URL
    const url = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    console.log(`Uploaded ${filePath} to ${url}`);
    
    return url;
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error);
    throw error;
  }
}

// Function to update a food item document with image URL
async function updateFoodItemWithImageUrl(foodItemId, imageUrl) {
  try {
    // First check if the food item exists
    const foodItemRef = db.collection('foodItems').doc(foodItemId);
    const foodItemDoc = await foodItemRef.get();
    
    if (!foodItemDoc.exists) {
      console.warn(`Food item with ID ${foodItemId} does not exist in Firestore.`);
      
      // Optional: List all food item IDs to help debug
      const snapshot = await db.collection('foodItems').get();
      console.log('Available food items:');
      snapshot.forEach(doc => {
        console.log(`ID: ${doc.id}, Name: ${doc.data().name || 'Unknown'}`);
      });
      
      return; // Skip this item
    }
    
    // Update the document with the image URL
    await foodItemRef.update({
      imageUrl: imageUrl
    });
    
    console.log(`Updated food item ${foodItemId} with image URL: ${imageUrl}`);
  } catch (error) {
    console.error(`Error updating food item ${foodItemId}:`, error);
    throw error;
  }
}

// Main function to process all images
async function processImages() {
  try {
    // Read all files in the images directory
    const files = fs.readdirSync(IMAGES_DIR);
    
    for (const file of files) {
      const filePath = path.join(IMAGES_DIR, file);
      
      // Skip if not a file
      if (!fs.statSync(filePath).isFile()) continue;
      
      // Extract food item ID from filename
      // Assuming format like: "foodItemId-name.jpg" or just "foodItemId.jpg"
      const fileNameWithoutExt = path.basename(file, path.extname(file));
      const foodItemId = fileNameWithoutExt.split('-')[0];
      
      if (!foodItemId) {
        console.warn(`Could not extract food item ID from ${file}, skipping`);
        continue;
      }
      
      // Destination path in Firebase Storage
      const destination = `foodItems/images/${file}`;
      
      // Upload image and get URL
      const imageUrl = await uploadImage(filePath, destination);
      
      // Update Firestore document with image URL
      await updateFoodItemWithImageUrl(foodItemId, imageUrl);
    }
    
    console.log('All images processed successfully!');
  } catch (error) {
    console.error('Error processing images:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

// Run the script
processImages();
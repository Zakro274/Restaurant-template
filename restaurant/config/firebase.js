// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Import analytics only if you're using it
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIyqa-v435NGjl9x33ycmv2tGjjvQ5AK0",
  authDomain: "rest-5c1f4.firebaseapp.com",
  projectId: "rest-5c1f4",
  storageBucket: "rest-5c1f4.firebasestorage.app",
  messagingSenderId: "531412062012",
  appId: "1:531412062012:web:23f7972cf6d88b1d129839",
  measurementId: "G-DNLRZG1HNB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Export the services
export { app, auth, firestore, storage, analytics };
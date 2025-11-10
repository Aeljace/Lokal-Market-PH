// Import the functions you need from the SDKs you need
// FIX: Use named import for firebase/app to align with the modular SDK.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// IMPORTANT: This application is now configured to use the Firebase Realtime Database.
const firebaseConfig = {
  apiKey: "AIzaSyDziRXUE4Nv_VXllmk6MrJFEKdDFtS9fRc",
  authDomain: "local-market-ph.firebaseapp.com",
  // This is the URL for the Realtime Database, which the app is now configured to use.
  databaseURL: "https://local-market-ph-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "local-market-ph",
  storageBucket: "local-market-ph.firebasestorage.app",
  messagingSenderId: "466030224083",
  appId: "1:466030224083:web:eb2c77ae6c23392436ea26"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
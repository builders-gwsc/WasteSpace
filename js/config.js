// /js/config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";

// 🔴 Replace values with your Firebase config (from Project Settings > SDK setup)
const firebaseConfig = {
  apiKey: "AIzaSyBTFuNqxrFLPE6TIRPXhwryKq3eRSt7PEY",
  authDomain: "daily-objectives-8922e.firebaseapp.com",
  databaseURL: "https://daily-objectives-8922e-default-rtdb.firebaseio.com",
  projectId: "daily-objectives-8922e",
  storageBucket: "daily-objectives-8922e.firebasestorage.app",
  messagingSenderId: "450105668325",
  appId: "1:450105668325:web:e64427c9316403195fda0c",
  measurementId: "G-9EKLEJJN73"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

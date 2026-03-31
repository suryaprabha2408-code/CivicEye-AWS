// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // 👈 Indha line irukkanum

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "civic-eye-app1.firebaseapp.com",
  projectId: "civic-eye-app1",
  storageBucket: "civic-eye-app1.firebasestorage.app",
  messagingSenderId: "1097393055074",
  appId: "1:1097393055074:web:78276d585f1f32d545383b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 👇 Indha line romba mukkiyam! Ithu illana error varum.
export const db = getFirestore(app);
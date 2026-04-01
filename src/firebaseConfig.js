import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "civic-eye-app1.firebaseapp.com",
  projectId: "civic-eye-app1",
  storageBucket: "civic-eye-app1.firebasestorage.app",
  messagingSenderId: "1097393055074",
  appId: "1:1097393055074:web:78276d585f1f32d545383b"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBoXxm2lmczjotcpXz0eGZqa9hYl-PP6xo",
  authDomain: "react-e-commerce-app-3c483.firebaseapp.com",
  projectId: "react-e-commerce-app-3c483",
  storageBucket: "react-e-commerce-app-3c483.firebasestorage.app",
  messagingSenderId: "81722759184",
  appId: "1:81722759184:web:4a7aaeaaecce9690591295",
  measurementId: "G-BJWJY0F2W2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

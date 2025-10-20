import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC5M5Ro1mLVF9-kj8iJlyztztR7w6D-YeI",
  authDomain: "luxora-7044b.firebaseapp.com",
  projectId: "luxora-7044b",
  storageBucket: "luxora-7044b.firebasestorage.app",
  messagingSenderId: "853190660119",
  appId: "1:853190660119:web:5459ef30aea9d6a18ecc52",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
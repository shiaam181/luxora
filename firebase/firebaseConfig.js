// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC5M5Ro1mLVF9-kj8iJlyztztR7w6D-YeI",
  authDomain: "luxora-7044b.firebaseapp.com",
  projectId: "luxora-7044b",
  storageBucket: "luxora-7044b.firebasestorage.app",
  messagingSenderId: "853190660119",
  appId: "1:853190660119:web:5459ef30aea9d6a18ecc52",
  measurementId: "G-NWTHPQX2KH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
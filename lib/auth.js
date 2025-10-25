// Import Firebase authentication functions
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from './firebase';

// Admin login
// lib/auth.js

const ADMIN_CREDENTIALS = {
  email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@luxora.com',
  password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'luxora123'
};

export const loginAdmin = async (email, password) => {
  console.log('🔐 Attempting login with:', email);
  
  // Simple credential check
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    console.log('✅ Login successful!');
    
    // Store session
    if (typeof window !== 'undefined') {
      localStorage.setItem('isAdminLoggedIn', 'true');
      localStorage.setItem('adminEmail', email);
    }
    
    return true;
  } else {
    console.log('❌ Invalid credentials');
    throw new Error('Invalid email or password');
  }
};

export const logoutAdmin = async () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminEmail');
  }
};

export const onAuthChange = (callback) => {
  // Check if admin is logged in
  if (typeof window !== 'undefined') {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    callback(isLoggedIn);
  }
};
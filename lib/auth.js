// Import Firebase authentication functions
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from './firebase';

// Admin login
const ADMIN_EMAIL = 'admin@luxora.com';

export const loginAdmin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if user is admin
    if (!userCredential.user.email || userCredential.user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      await signOut(auth);
      throw new Error('You are not authorized as admin');
    }
    
    console.log('Login successful:', userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error.message);
    throw new Error(error.message || 'Invalid email or password');
  }
};

// Admin logout
export const logoutAdmin = async () => {
  try {
    await signOut(auth);
    console.log('Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Listen for login/logout changes
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};
// Import Firebase database functions
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc,
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// Get all items from a collection (like "products" or "orders")
export const getAll = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error getting ${collectionName}:`, error);
    return [];
  }
};

// Get one specific item by ID
export const getOne = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { _id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error(`Error getting document:`, error);
    return null;
  }
};

// Create a new item
export const create = async (collectionName, data, customId = null) => {
  try {
    if (customId) {
      // Use specific ID
      const docRef = doc(db, collectionName, customId);
      await setDoc(docRef, data);
      return { _id: customId, ...data };
    } else {
      // Auto-generate ID
      const docRef = await addDoc(collection(db, collectionName), data);
      return { _id: docRef.id, ...data };
    }
  } catch (error) {
    console.error(`Error creating document:`, error);
    return null;
  }
};

// Update an existing item
export const update = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
    return { _id: docId, ...data };
  } catch (error) {
    console.error(`Error updating document:`, error);
    return null;
  }
};

// Delete an item
export const remove = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return true;
  } catch (error) {
    console.error(`Error deleting document:`, error);
    return false;
  }
};

// Listen for real-time changes
export const subscribe = (collectionName, callback) => {
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
    callback(data);
  });
};
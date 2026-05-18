import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Note: If you fix the Firebase quota, this file will be automatically 
// updated or you can paste your own config here.
const firebaseConfig = {
  apiKey: "AIzaSyBi3MglSjDN0So4w2MPCnhADCgNBDnMG8w",
  authDomain: "lahanbersama-d4b12.firebaseapp.com",
  projectId: "lahanbersama-d4b12",
  storageBucket: "lahanbersama-d4b12.firebasestorage.app",
  messagingSenderId: "21054832062",
  appId: "1:21054832062:web:6e016d2b81517528c5cdef"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

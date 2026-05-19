import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const __env = (import.meta as any).env as Record<string, string | undefined>;
const envOrThrow = (key: string) => {
  const value = __env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value as string;
};

const firebaseConfig = {
  apiKey: envOrThrow("VITE_FIREBASE_API_KEY"),
  authDomain: envOrThrow("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: envOrThrow("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: envOrThrow("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: envOrThrow("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: envOrThrow("VITE_FIREBASE_APP_ID"),
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

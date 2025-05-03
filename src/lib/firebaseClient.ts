// lib/firebaseClient.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, Firestore } from "firebase/firestore"; // Import getFirestore
import { getFunctions } from "firebase/functions"; // Import getFunctions

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

let firebaseApp: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null; // Add db instance
let functionsInstance = null; // Add functions instance

// Initialize Firebase Client App only on the client side
if (typeof window !== 'undefined') {
    if (!getApps().length) {
        firebaseApp = initializeApp(firebaseConfig);
    } else {
        firebaseApp = getApp();
    }
    authInstance = getAuth(firebaseApp);
    dbInstance = getFirestore(firebaseApp); // Initialize Firestore client-side
    functionsInstance = getFunctions(firebaseApp); // Initialize Functions client-side
}

// Export instances which might be null initially on the server
export const auth: Auth | null = authInstance;
export const db: Firestore | null = dbInstance; // Export Firestore instance
export const functions = functionsInstance; // Export Functions instance

// Re-export Google specific helpers if needed directly by components
export { GoogleAuthProvider, signInWithPopup };

// Optional: Export the app instance if needed elsewhere
export { firebaseApp };

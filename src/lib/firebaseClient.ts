// lib/firebaseClient.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

let firebaseApp: FirebaseApp;

// Initialize Firebase Client App only on the client side
if (typeof window !== 'undefined') {
    if (!getApps().length) {
        firebaseApp = initializeApp(firebaseConfig);
    } else {
        firebaseApp = getApp();
    }
}

// Export auth instance for client-side usage
// Ensure firebaseApp is initialized before calling getAuth
// Handle the case where firebaseApp might not be initialized (e.g., during server-side rendering)
// We explicitly check for window again to be absolutely sure this runs client-side.
const authInstance = typeof window !== 'undefined' && firebaseApp! ? getAuth(firebaseApp) : null;

// Ensure auth is properly exported and non-null for client components expecting it.
// Throw an error if it's somehow null on the client, indicating an initialization issue.
if (typeof window !== 'undefined' && !authInstance) {
  console.error("Firebase Auth could not be initialized on the client.");
  // Depending on your error handling strategy, you might throw an error
  // or handle this case gracefully in components using auth.
}

export const auth = authInstance!; // Using non-null assertion assuming it must be available client-side

// Re-export Google specific helpers if needed directly by components
export { GoogleAuthProvider, signInWithPopup };

// Optional: Export the app instance if needed elsewhere
// export { firebaseApp };

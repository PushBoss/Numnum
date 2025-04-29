"use server";

import { FirebaseOptions, initializeApp as initializeClientApp, getApps as getClientApps, getApp as getClientApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getApps as getAdminApps, initializeApp as initializeAdminApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db: FirebaseFirestore.Firestore;
let auth: ReturnType<typeof getAuth> | null = null;

// Firebase Admin Setup (Server Side Only)
if (typeof window === 'undefined') {
  if (!getAdminApps().length) {
    const admin = require('firebase-admin');
    const serviceAccount = require('../../serviceKey.json');

    initializeAdminApp({
      credential: admin.credential.cert(serviceAccount),
    });

    db = getFirestore();
  }
}

// Firebase Client Setup (Client Side Only)
if (typeof window !== 'undefined') {
  const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  const app = !getClientApps().length ? initializeClientApp(firebaseConfig) : getClientApp();
  const auth = getAuth(app);
}

export async function seedRestaurants() {
  if (typeof window !== 'undefined') {
    console.log('Seeding only runs on the server.');
    return;
  }

  const restaurants = [
    {
      name: "Tastee",
      type: "restaurant",
      location: "Jamaica",
      price_level: 2,
      spice_range: [10, 20],
      dine_type: "eat_out",
      menu: ["Beef Patty", "Chicken Patty", "Cheese Patty"]
    },
    {
      name: "Chilitos JaMexican",
      type: "restaurant",
      location: "Jamaica",
      price_level: 3,
      spice_range: [20, 60],
      dine_type: "eat_out",
      menu: ["Burrito Bowl", "Sweet Chili Chicken Wings"]
    },
    {
      name: "Orient Express",
      type: "restaurant",
      location: "Jamaica",
      price_level: 4,
      spice_range: [5, 30],
      dine_type: "eat_out",
      menu: ["Chinese Fried Chicken", "Sweet & Sour Chicken", "Shrimp Lo Mein"]
    },
    {
      name: "Mother's",
      type: "restaurant",
      location: "Jamaica",
      price_level: 2,
      spice_range: [10, 20],
      dine_type: "eat_out",
      menu: ["Callaloo Patty", "Fried Chicken Sandwich"]
    },
    {
      name: "Chicken & Tings",
      type: "restaurant",
      location: "Jamaica",
      price_level: 3,
      spice_range: [40, 70],
      dine_type: "eat_out",
      menu: ["Jerk Chicken", "Oxtail", "Rice & Peas"]
    },
    {
      name: "KFC Jamaica",
      type: "restaurant",
      location: "Jamaica",
      price_level: 2,
      spice_range: [5, 15],
      dine_type: "eat_out",
      menu: ["Zinger Burger", "Fried Chicken", "Mac & Cheese"]
    },
    {
      name: "Island Grill",
      type: "restaurant",
      location: "Jamaica",
      price_level: 3,
      spice_range: [25, 45],
      dine_type: "eat_out",
      menu: ["Jerk Pork", "BBQ Chicken", "Callaloo Wrap"]
    },
    {
      name: "Roti Hut",
      type: "restaurant",
      location: "Trinidad",
      price_level: 2,
      spice_range: [30, 50],
      dine_type: "eat_out",
      menu: ["Curry Chicken Roti", "Doubles", "Pepper Roti"]
    },
    {
      name: "Jerk Center POS",
      type: "restaurant",
      location: "Trinidad",
      price_level: 3,
      spice_range: [50, 80],
      dine_type: "eat_out",
      menu: ["Jerk Chicken", "Festival", "Callaloo Crab"]
    },
    {
      name: "Rituals",
      type: "restaurant",
      location: "Trinidad",
      price_level: 4,
      spice_range: [10, 20],
      dine_type: "eat_out",
      menu: ["Macaroni Pie", "Chicken Caesar Wrap", "Pineapple Smoothie"]
    }
  ];

  if (!db) {
    console.error('Firestore not initialized.');
    return;
  } else {
    console.log('Firestore is running...');
  }

  const batch = db.batch();

  restaurants.forEach(restaurant => {
    const docRef = db.collection('restaurants').doc();
    batch.set(docRef, restaurant);
  });

  try {
    await batch.commit();
    console.log('Successfully seeded restaurants collection!');
  } catch (error) {
    console.error('Failed to seed restaurants collection:', error);
  }
}


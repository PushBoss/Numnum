'use server';

import { initializeApp as initializeAdminApp, cert, getApps as getAdminApps, getApp as getAdminApp, App as AdminFirebaseApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db: FirebaseFirestore.Firestore | null = null;
let adminApp: AdminFirebaseApp;

// Firebase Admin Setup (Server Side Only)
try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountJson) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
    }
    const serviceAccount = JSON.parse(serviceAccountJson);

    if (!getAdminApps().length) {
        adminApp = initializeAdminApp({
            credential: cert(serviceAccount),
        });
        console.log("Firebase Admin SDK Initialized.");
    } else {
        adminApp = getAdminApp();
        console.log("Using existing Firebase Admin App.");
    }
    db = getFirestore(adminApp);
} catch (error: any) {
    console.error('Firebase Admin initialization error:', error.message);
    // Keep db as null if initialization fails
}

export async function seedRestaurants() {
    if (!db) {
        console.error('Firestore DB not initialized. Cannot seed.');
        return;
    }

    console.log('Firestore seeding initiated...');

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

    const batch = db.batch();

    restaurants.forEach(restaurant => {
        const docRef = db!.collection('restaurants').doc();
        batch.set(docRef, restaurant);
    });

    try {
        await batch.commit();
        console.log('Successfully seeded restaurants collection!');
    } catch (error) {
        console.error('Failed to seed restaurants collection:', error);
    }
}

// Export only server-side relevant instances/functions
export { db };


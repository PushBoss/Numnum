/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import {onCall, HttpsError, type CallableRequest, type HttpsOptions} from "firebase-functions/v2/https";
import {
  Client,
  PlaceInputType,
  PlaceType2,
  PlacesNearbyRanking,
} from "@googlemaps/google-maps-services-js";

// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();
const placesClient = new Client({});

// Environment variables
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  functions.logger.error(
    "GOOGLE_MAPS_API_KEY environment variable not set. Functionality will be limited."
  );
}

// --- Interfaces ---
interface UserPreferences {
  latitude: number;
  longitude: number;
  mood_level: number; // 0-100
  hunger_level: number; // 0-100
  dine_preference: number; // 0-100 (maps to radius)
  budget_level: number; // 0-100 (maps to price level)
  spicy_level: number; // 0-100
}

interface RestaurantCache {
  place_id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;

  photo_reference?: string;
  cuisine_tags?: string[];
  last_fetched: FirebaseFirestore.Timestamp;
}

interface Suggestion {
  place_id: string;
  name: string;
  address?: string;
  rating?: number;

  photo_reference?: string;
  distance?: number; // in meters
  score: number; // Composite score
}

// --- Helper Functions ---

/**
 * Maps the dine_preference slider (0-100) to a radius in meters.
 */
function mapDinePreferenceToRadius(dinePreference: number): number | null {
  if (dinePreference <= 10) return 500; // ~0.3 miles
  if (dinePreference <= 30) return 1000; // ~0.6 miles
  if (dinePreference <= 50) return 1609; // 1 mile
  if (dinePreference <= 70) return 3218; // 2 miles
  if (dinePreference <= 90) return 8046; // 5 miles
  return null; // rankby: distance if slider is high
}

/**
 * Maps the budget_level slider (0-100) to Google Places Price Levels (0-4).
 */
// function mapBudgetToPriceLevels(budgetLevel: number): PriceLevel[] {
//   if (budgetLevel <= 25) return [PriceLevel.price_level_free, PriceLevel.price_level_inexpensive]; // 0, 1
//   if (budgetLevel <= 50) return [PriceLevel.price_level_moderate]; // 2
//   if (budgetLevel <= 75) return [PriceLevel.price_level_expensive]; // 3
//   return [PriceLevel.price_level_very_expensive]; // 4
// }

/**
 * Calculates distance between two points using Haversine formula.
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// --- Cloud Function ---

const httpsOptions: HttpsOptions = {
  cors: [
    'https://6000-idx-studio-1744576296297.cluster-f4iwdviaqvc2ct6pgytzw4xqy4.cloudworkstations.dev',
    'http://localhost:3000', // Common Next.js dev port
    'http://localhost:9002',  // Port from package.json dev script for the main app
    // Add other development origins if necessary, e.g., your Firebase Hosting domain for production
  ],
  // region: 'us-central1', // Optionally specify the region
};

export const restaurantFinder = onCall<
  {preferences: UserPreferences}, // Type of request.data
  {suggestions: Suggestion[]}     // Type of the value returned by the async handler
>(
  httpsOptions, // Pass HttpsOptions as the first argument
  async (request: CallableRequest<{preferences: UserPreferences}>): Promise<{suggestions: Suggestion[]}> => {
    functions.logger.info("restaurantFinder called with data:", request.data);

    const {preferences} = request.data; // request.data is { preferences: UserPreferences }

    if (!GOOGLE_MAPS_API_KEY) {
      throw new HttpsError(
        "failed-precondition",
        "Server configuration error: Missing Google Maps API Key."
      );
    }

    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }
    const userId = request.auth.uid;

    // Validate preferences
    if (
      typeof preferences.latitude !== "number" ||
      typeof preferences.longitude !== "number" ||
      typeof preferences.mood_level !== "number" ||
      typeof preferences.hunger_level !== "number" ||
      typeof preferences.dine_preference !== "number" ||
      typeof preferences.budget_level !== "number" ||
      typeof preferences.spicy_level !== "number"
    ) {
      throw new HttpsError(
        "invalid-argument",
        "Invalid user preferences provided."
      );
    }

    const radius = mapDinePreferenceToRadius(preferences.dine_preference);
    //const allowedPriceLevels = mapBudgetToPriceLevels(preferences.budget_level);

    try {
      // --- Step 1: Fetch Nearby Restaurants ---
      functions.logger.info(`Fetching nearby restaurants for user ${userId}...`);
      const nearbyParams: any = {
        location: {lat: preferences.latitude, lng: preferences.longitude},
        type: PlaceType2.food,
        key: GOOGLE_MAPS_API_KEY,
      };

      if (radius) {
        nearbyParams.radius = radius;
      } else {
        nearbyParams.rankby = PlacesNearbyRanking.distance;
      }

      const nearbyResponse = await placesClient.placesNearby(nearbyParams);
      const places = nearbyResponse.data.results;

      functions.logger.info(`Found ${places.length} potential restaurants nearby.`);

      if (!places || places.length === 0) {
        functions.logger.info("No restaurants found nearby based on initial criteria.");
        return {suggestions: []};
      }

      // --- Step 2: Filter & Score ---
      let suggestions: Suggestion[] = [];
      const cachePromises: Promise<void>[] = [];

      for (const place of places) {
        if (!place.place_id || !place.name) continue; // Skip incomplete results

        const placeLat = place.geometry?.location?.lat;
        const placeLng = place.geometry?.location?.lng;

        let distance = 0;
        if (placeLat !== undefined && placeLng !== undefined) {
          distance = calculateDistance(
            preferences.latitude,
            preferences.longitude,
            placeLat,
            placeLng
          );
          if (radius && distance > radius) {
            continue;
          }
        }
        
        // Caching Logic (Example - currently commented out)
        // const cacheRef = db.collection("restaurant_cache").doc(place.place_id);
        // cachePromises.push(
        //   cacheRef.set( /* ... data ... */, {merge: true})
        // );


        let score = place.rating || 3.0; // Base score on rating
        score -= distance / 10000; // Penalize distance

        // Mood/Spice/Hunger Filtering (Example - needs refinement)
        if (preferences.spicy_level > 70) {
          // score += 0.5; // Example: Boost score for spicy places if user wants spicy
        }
        if (preferences.mood_level < 30) {
          // score += 0.5; // Example: Boost score for comfort food if mood is low
        }

        suggestions.push({
          place_id: place.place_id,
          name: place.name,
          address: place.vicinity,
          rating: place.rating,
          photo_reference: place.photos?.[0]?.photo_reference,
          distance: Math.round(distance),
          score: score,
        });
      }

      await Promise.allSettled(cachePromises);
      functions.logger.info("Finished attempting cache updates.");

      // --- Step 3: Return Top Suggestions ---
      suggestions.sort((a, b) => b.score - a.score); // Sort by score descending
      const topSuggestions = suggestions.slice(0, 5);

      functions.logger.info(`Returning ${topSuggestions.length} suggestions.`);

      // Store suggestions for the user (optional, fire and forget)
      if (topSuggestions.length > 0) {
        const suggestionsRef = db
        .collection("users")
        .doc(userId)
        .collection("suggestions");
        const batch = db.batch();
        topSuggestions.forEach((s) => {
          const docRef = suggestionsRef.doc(); // Auto-generate ID
          batch.set(docRef, {
            ...s,
            timestamp: new Date(),
            preferencesSnapshot: preferences, // Store preferences at time of suggestion
          });
        });
        batch.commit()
        .then(() =>
        functions.logger.info("Stored suggestions for user:", userId))
        .catch((err) =>
            functions.logger.error("Failed to store suggestions:", err)
          );
      }

      // --- Step 4: Continuous Learning (Placeholder) ---
      // This part would be triggered *after* user interaction (selection/dismissal)
      // in a separate function or frontend logic.
      // await callGeminiToUpdateProfile(userId, userChoice, suggestionData, preferences);+

      return {suggestions: topSuggestions};
    } catch (error: any) {
      functions.logger.error("Error in restaurantFinder:", error);
      if (error.response?.data?.error_message) {
        functions.logger.error("Google API Error:", error.response.data.error_message);
      }
      throw new HttpsError(
        "internal",
        "Failed to fetch or process restaurant data.",
        error.message // Include original error message for debugging
      );
    }
  }
);

// Placeholder for Gemini integration function
// async function callGeminiToUpdateProfile(...) { ... }

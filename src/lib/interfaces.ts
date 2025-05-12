// src/lib/interfaces.ts

// import type { PriceLevel } from "@googlemaps/google-maps-services-js";
import type { Timestamp } from "firebase/firestore";

// Represents a single meal item, potentially with details
export interface MealItem {
  name: string;
  description?: string;
  spicy_level?: number; // Example: 0-100
  price?: string; // Example: "JMD 1500"
}

// Represents the menu structure for a restaurant, categorized by meal time
export interface Menu {
  Breakfast?: MealItem[];
  Lunch?: MealItem[];
  Dinner?: MealItem[];
  Desserts?: MealItem[];
}

// Represents detailed location information for a single restaurant outlet
export interface LocationDetail {
    name?: string; // Optional: e.g., "Sovereign Centre Branch"
    address: string;
    latitude: number;
    longitude: number;
    services?: string[]; // e.g., ["dine-in", "takeout", "delivery"]
}

// Represents a restaurant from the local data list (`currentRestaurantList`)
export interface LocalRestaurant {
  name: string;
  locations: LocationDetail[]; // Changed from LocationInfo to LocationDetail[]
  cuisine_type: string;
  tags?: string[];
  menu: Menu;
  price_level: number; // Assuming 1-5, or map '$$' to a number
  rating?: number;
  image_url?: string; // URL for the logo/image from Firebase Storage
}

// Represents the structure for homemade meals categorized by meal time
export interface HomemadeMeals {
  Breakfast: string[];
  Lunch: string[];
  Dinner: string[];
}

// Represents the data structure for a specific location (country)
export interface LocationData {
  restaurants: LocalRestaurant[];
  homemade: HomemadeMeals;
}

// Represents user preferences stored in Firestore
export interface UserPreferences {
  latitude?: number;
  longitude?: number;
  country?: 'Jamaica' | 'Trinidad'; // For local data fallback/initial state
  favoriteMeals?: string[];
  favoriteRestaurants?: string[];
  mood_level: number; // 0-100
  hunger_level: number; // 0-100
  dine_preference: number; // 0-100 (maps to radius)
  budget_level: number; // 0-100 (maps to price level)
  spicy_level: number; // 0-100
}

// Represents the data structure for restaurant cache in Firestore
export interface RestaurantCache {
  place_id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  price_level?: number; // Google's PriceLevel type
  photo_reference?: string;
  cuisine_tags?: string[]; // Tags extracted from API or inferred
  last_fetched: Timestamp;
}

// Represents a suggestion returned by the Cloud Function
export interface Suggestion {
  place_id: string;
  name: string;
  address?: string;
  rating?: number;
  price_level?: number;
  photo_reference?: string;
  distance?: number; // in meters
  score: number; // Composite score based on filters
}

// Represents the final selected result shown to the user
export interface SelectedMealResult {
  restaurant: LocalRestaurant | Suggestion; // Can be local or API suggestion
  meal: MealItem | { name: string }; // Meal details or just name
  isHomemade: boolean;
  isApiSuggestion: boolean; // Flag to know the source
}
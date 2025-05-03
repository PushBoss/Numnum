// src/lib/interfaces.ts

// --- Firebase Related ---

export interface UserPreferences {
  latitude?: number;
  longitude?: number;
  mood_level: number; // 0-100 (0 = Faves, 100 = Adventurous)
  hunger_level: number; // 0-100
  dine_preference: number; // 0-100 -> 0-50 = Eat In, 51-100 = Eat Out (maps to radius internally)
  budget_level: number; // 0-100 (maps to price level)
  spicy_level: number; // 0-100
  locationPermissionGranted?: boolean; // Track permission status
  locationTimestamp?: number; // Timestamp of last location update
  country?: 'Jamaica' | 'Trinidad'; // User's selected country
  favoriteMeals: string[]; // List of favorite meal names (ensure it's always an array)
  favoriteRestaurants: string[]; // List of favorite restaurant names (ensure it's always an array)
}

// Google Places Price Levels
export enum PriceLevel {
    price_level_free = 0,
    price_level_inexpensive = 1,
    price_level_moderate = 2,
    price_level_expensive = 3,
    price_level_very_expensive = 4,
}

export interface RestaurantCache {
  place_id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  price_level?: PriceLevel; // Use enum
  photo_reference?: string;
  cuisine_tags?: string[];
  last_fetched: Date; // Use Date object in Firestore (or Timestamp)
}

export interface Suggestion {
  place_id: string;
  name: string;
  address?: string;
  rating?: number;
  price_level?: PriceLevel; // Use enum
  photo_reference?: string;
  distance?: number; // in meters
  score: number; // Composite score
  timestamp?: Date; // Added when storing user suggestions
  preferencesSnapshot?: UserPreferences; // Added when storing
}

// --- App Specific (Local Data) ---

export interface LocationInfo {
  address: string;
  latitude: number;
  longitude: number;
}

export interface MealItem {
  name: string;
  description?: string;
  spicy_level?: number; // 0-100
  price?: string; // e.g., "JMD 1500", "TTD 80"
}

export type MealTime = "Breakfast" | "Lunch" | "Dinner";

export type Menu = {
  [key in MealTime]?: MealItem[];
};

// Represents a restaurant from the local data list (`currentRestaurantList`)
export interface Restaurant {
  name: string;
  location: LocationInfo;
  cuisine_type: string;
  tags?: string[];
  menu: Menu;
  price_level: number; // 1-4 (Mapping needed: 1->Inexpensive, 2->Moderate, 3->Expensive, 4->Very Expensive)
  rating?: number; // Optional rating
  distance_meters?: number; // Optional, calculated later
  image_url?: string; // Optional local image URL (if not using API photos)
}

// Represents homemade meals from local data
export interface HomemadeMeal {
   name: string;
   // Add other relevant properties if needed
}

// Structure for local data in `data.ts`
export interface LocationData {
  restaurants: Restaurant[];
  homemade: {
    [key in MealTime]?: string[]; // Simple names for homemade
  };
}

// Interface for the state holding the selected meal/restaurant result
export interface SelectedMealResult {
    meal?: MealItem; // Details of the selected meal
    restaurant?: Suggestion | Restaurant; // Restaurant details (API or Local)
    isHomemade: boolean; // Flag indicating if it's homemade
    isApiSuggestion?: boolean; // Flag indicating source (true for API, false for local)
}

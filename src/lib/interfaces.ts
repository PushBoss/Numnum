// src/lib/interfaces.ts

// --- Firebase Related ---

export interface UserPreferences {
  latitude?: number;
  longitude?: number;
  mood_level: number; // 0-100
  hunger_level: number; // 0-100
  dine_preference: number; // 0-100 (maps to radius)
  budget_level: number; // 0-100 (maps to price level)
  spicy_level: number; // 0-100
  locationPermissionGranted?: boolean; // Track permission status
  locationTimestamp?: number; // Timestamp of last location update
}

export interface RestaurantCache {
  place_id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  price_level?: number; // Google uses 0-4
  photo_reference?: string;
  cuisine_tags?: string[];
  last_fetched: Date; // Use Date object
}

export interface Suggestion {
  place_id: string;
  name: string;
  address?: string;
  rating?: number;
  price_level?: number;
  photo_reference?: string;
  distance?: number; // in meters
  score: number; // Composite score
  timestamp?: Date; // Added when storing user suggestions
  preferencesSnapshot?: UserPreferences; // Added when storing
}

// --- App Specific (Existing) ---

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

export interface Menu {
  breakfast?: MealItem[];
  lunch?: MealItem[];
  dinner?: MealItem[];
}

export interface Restaurant {
  name: string;
  location: LocationInfo;
  cuisine_type: string;
  tags?: string[];
  menu: Menu;
  price_level: number; // 1-5 (Note: Google uses 0-4, needs mapping)
  rating?: number; // Optional rating
  distance_meters?: number; // Optional, calculated later
  image_url?: string; // Optional image URL (e.g., from Yelp or if Google photo_ref unavailable)
}

export interface HomemadeMeal {
   name: string;
   // Add other relevant properties if needed
}

export interface LocationData {
  restaurants: Restaurant[];
  homemade: {
    Breakfast: string[];
    Lunch: string[];
    Dinner: string[];
  };
}

// Interface for the selected meal/restaurant result passed to the state
export interface SelectedMealResult {
    meal?: MealItem; // Can be just a restaurant suggestion
    restaurant?: Suggestion | Restaurant; // Could be from Places API or local data
    isHomemade: boolean; // Flag to indicate if it's homemade
    isApiSuggestion?: boolean; // Flag to indicate source
}

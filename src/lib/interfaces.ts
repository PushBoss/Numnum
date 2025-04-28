// src/lib/interfaces.ts

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
  price_level: number; // 1-5
  rating?: number; // Optional rating
  distance_meters?: number; // Optional, calculated later
  image_url?: string; // Optional image URL
  // Keep original simple meal lists for compatibility if needed, or migrate fully
  // meals?: { // Keep simple structure temporarily or remove if fully migrated
  //   Breakfast?: string[];
  //   Lunch?: string[];
  //   Dinner?: string[];
  // }
}

export interface HomemadeMeal {
   name: string;
   // Add other relevant properties if needed, like description, ingredients etc.
}


export interface LocationData {
  restaurants: Restaurant[];
  // Update homemade structure if needed, currently using simple strings
  homemade: {
    Breakfast: string[];
    Lunch: string[];
    Dinner: string[];
  };
}

// Interface for the selected meal result passed to the state
export interface SelectedMealResult {
    meal: MealItem; // The selected meal object
    restaurant?: Restaurant; // The restaurant object if applicable
    isHomemade: boolean; // Flag to indicate if it's homemade
}

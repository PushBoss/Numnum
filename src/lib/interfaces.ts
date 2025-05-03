// src/lib/interfaces.ts
// ... other interfaces

// Represents a restaurant from the local data list (`currentRestaurantList`)
export interface Restaurant {
  name: string;
  location: LocationInfo;
  cuisine_type: string;
  tags?: string[];
  menu: Menu;
  price_level: number;
  rating?: number;
  distance_meters?: number; // Optional, calculated later
  image_url?: string; // <--- Make sure this exists and is optional
}

// ... rest of the file

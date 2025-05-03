// src/lib/data.ts
// ... imageList definition ...

export const currentRestaurantList: { Jamaica: LocationData; Trinidad: LocationData } = {
  Jamaica: {
    restaurants: [
       {
        name: "Juici Patties",
        location: { address: "Various Locations, Kingston, Jamaica", latitude: 18.01, longitude: -76.80 },
        cuisine_type: "Jamaican Fast Food",
        tags: ["Jamaican", "Patties", "Fast Food", "Affordable"],
        menu: { /* ... */ },
        price_level: 1,
        rating: 4.2,
        image_url: "YOUR_JUICI_PATTIES_LOGO_URL_HERE" // <-- ADD LOGO URL
      },
      {
        name: "Island Grill",
        location: { address: "Various Locations, Kingston, Jamaica", latitude: 18.02, longitude: -76.79 },
        cuisine_type: "Jamaican Grill",
        tags: ["Jamaican", "Jerk", "Grilled", "Healthy Options"],
        menu: { /* ... */ },
        price_level: 2,
        rating: 4.5,
        image_url: "YOUR_ISLAND_GRILL_LOGO_URL_HERE" // <-- ADD LOGO URL
      },
      {
        name: "Scotchies",
        location: { address: "Drax Hall, St. Ann, Jamaica", latitude: 18.40, longitude: -77.15 },
        cuisine_type: "Jamaican Jerk",
        tags: ["Jamaican", "Jerk", "Outdoor", "Rustic"],
        menu: { /* ... */ },
        price_level: 3,
        rating: 4.7,
        image_url: "YOUR_SCOTCHIES_LOGO_URL_HERE" // <-- ADD LOGO URL
      },
      {
        name: "Tastee Patties",
         location: { address: "Various Locations, Kingston, Jamaica", latitude: 18.00, longitude: -76.78 },
        cuisine_type: "Jamaican Fast Food",
        tags: ["Jamaican", "Patties", "Fast Food", "Breakfast", "Lunch"],
        menu: { /* ... */ },
        price_level: 1,
        rating: 4.1,
        image_url: "YOUR_TASTEE_PATTIES_LOGO_URL_HERE" // <-- ADD LOGO URL
      },
       {
        name: "Tracks & Records",
        location: { address: "Marketplace, Kingston, Jamaica", latitude: 18.015, longitude: -76.785 },
        cuisine_type: "Jamaican Fusion",
        tags: ["Jamaican", "Fusion", "Sports Bar", "Upscale Casual"],
        menu: { /* ... */ },
        price_level: 4,
        rating: 4.4,
        image_url: "YOUR_TRACKS_RECORDS_LOGO_URL_HERE" // <-- ADD LOGO URL
      },
      {
        name: "Nirvanna Indian Fusion Cuisine",
        location: { address: "Unit 1, 80 Lady Musgrave Rd, Kingston, Jamaica", latitude: 18.012413, longitude: -76.777725 },
        cuisine_type: "Indian Fusion",
        tags: ["Indian", "Fusion", "Fine Dining", "Vegetarian Options", "Spicy"],
        menu: { /* ... */ },
        price_level: 3, // Expensive
        rating: 4.6,
        image_url: "YOUR_NIRVANNA_LOGO_URL_HERE" // <-- ADD LOGO URL
      }
      // ... Add image_url for other Jamaican restaurants
    ],
    homemade: { /* ... */ },
  },
  Trinidad: {
     restaurants: [
       {
        name: "Royal Castle",
        location: { address: "Various Locations, Port of Spain, Trinidad", latitude: 10.65, longitude: -61.51 },
        cuisine_type: "Trinidadian Fast Food",
        tags: ["Trinidadian", "Fast Food", "Chicken", "Affordable"],
        menu: { /* ... */ },
        price_level: 1,
        rating: 4.0,
        image_url: "YOUR_ROYAL_CASTLE_LOGO_URL_HERE" // <-- ADD LOGO URL
      },
      // ... Add image_url for other Trinidadian restaurants
     ],
    homemade: { /* ... */ },
  },
};

// ... rest of the file

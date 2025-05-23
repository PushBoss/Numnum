
// src/lib/data.ts

import type { LocationData, MealItem, LocalRestaurant } from './interfaces'; // Assuming interfaces are defined here

export const imageList = [
  "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2Fmeat_%202.png?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2Ffries%202.png?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2Fegg%20and%20bacon%202.png?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2Fburger%201.png?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2Fcookies%202.png?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2Fdonut%202.png?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2Fsteak%202.png?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2Fpizza%202.png?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2Ftaco%202.png?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2Fburitto%202.png?alt=media",
];

// Map specific meal names to image URLs
export const mealImageMap: { [key: string]: string } = {
  "Jerk Chicken": "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2FJerk%20Chicken.png?alt=media"
  // Add more meal-specific images here in the future
};


// Define and export timeRanges separately
export const timeRanges = {
  BREAKFAST_START: 5,
  BREAKFAST_END: 10,
  LUNCH_START: 11,
  LUNCH_END: 15,
  DINNER_START: 16,
  DINNER_END: 21,
};


export const currentRestaurantList: { Jamaica: LocationData; Trinidad: LocationData } = {
  Jamaica: {
    restaurants: [
       {
        name: "Juici Patties",
        locations: [{ address: "Various Locations, Kingston, Jamaica", latitude: 18.01, longitude: -76.80, services: ["dine-in", "takeout"] }],
        cuisine_type: "Jamaican Fast Food",
        tags: ["Jamaican", "Patties", "Fast Food", "Affordable"],
        menu: {
            Breakfast: [
                { name: "Cornmeal Porridge" },
                { name: "Callaloo & Bread" }
            ],
            Lunch: [
                { name: "Beef Patty" },
                { name: "Cheese Patty" },
                { name: "Coco Bread" }
            ],
            Dinner: [
                { name: "Curry Chicken" },
                { name: "Stew Peas" },
                { name: "White Rice" }
            ]
        },
        price_level: 1,
        rating: 4.2,
        image_url: "/images/Juici-patties.png"
      },
      {
        name: "Island Grill",
        locations: [{ address: "Various Locations, Kingston, Jamaica", latitude: 18.02, longitude: -76.79, services: ["dine-in", "takeout"] }],
        cuisine_type: "Jamaican Grill",
        tags: ["Jamaican", "Jerk", "Grilled", "Healthy Options"],
        menu: {
            Breakfast: [
                { name: "Saltfish Fritters" },
                { name: "Ackee Wrap" }
            ],
            Lunch: [
                { name: "BBQ Chicken" },
                { name: "Festival" },
                { name: "Plantain" }
            ],
            Dinner: [
                { name: "Jerk Chicken" },
                { name: "Rice & Peas" },
                { name: "Callaloo" }
            ]
        },
        price_level: 2,
        rating: 4.5,
        image_url: "/images/islandgrill.png"
      },
      {
        name: "Broken Plate",
        locations: [
          {
            name: "Fairview",
            address: "Fairview Shopping Centre, Montego Bay, Jamaica",
            city: "Montego Bay",
            latitude: 18.4630, 
            longitude: -77.9133, 
            services: ["dine-in", "takeout"]
          },
          {
            name: "Kingston",
            latitude: 18.0061, 
            longitude: -76.7816, 
            address: "24 - 28 Barbican Rd, Kingston",
            city: "Kingston",
            services: ["dine-in", "takeout", "delivery"]
          }
        ],
        cuisine_type: "Asian Fusion",
        tags: ["dine-in", "fusion", "sushi", "casual", "modern", "asian"],
        menu: {
        Lunch: [
        { name: "Spicy Tuna Roll" },
        { name: "Bang Bang Shrimp" },
        { name: "Korean BBQ Chicken Bowl" }
        ],
        Dinner: [
        { name: "Teriyaki Salmon" },
        { name: "Jamaican Curry Ramen" },
        { name: "Steak Bibimbap" }
        ],
        Desserts: [
        { name: "Matcha Cheesecake" },
        { name: "Tempura Ice Cream" },
        ]
        },
        price_level: 2, 
        rating: 4.0, 
        image_url: "/images/Broken-plate.jpeg"
      },
      {
        name: "Scotchies",
        locations: [{ address: "Drax Hall, St. Ann, Jamaica", latitude: 18.40, longitude: -77.15, services: ["dine-in", "takeout"] }],
        cuisine_type: "Jamaican Jerk",
        tags: ["Jamaican", "Jerk", "Outdoor", "Rustic"],
         menu: {
            Breakfast: [
                { name: "Roast Breadfruit & Ackee", description: "(weekends)" }
            ],
            Lunch: [
                { name: "Jerk Pork" },
                { name: "Festival" }
            ],
            Dinner: [
                { name: "Jerk Chicken" },
                { name: "Roasted Yam" },
                { name: "Sweet Potato" }
            ]
        },
        price_level: 3,
        rating: 4.7,
        image_url: "/images/Scotchies.png"
      },
      {
        name: "Tastee Patties",
        locations: [{ address: "Various Locations, Kingston, Jamaica", latitude: 18.00, longitude: -76.78, services: ["dine-in", "takeout"] }],
        cuisine_type: "Jamaican Fast Food",
        tags: ["Jamaican", "Patties", "Fast Food", "Breakfast", "Lunch"],
        menu: {
            Breakfast: [
                { name: "Peanut Porridge"},
                { name: "Bun & Cheese"},
                { name: "Ackee & Saltfish"},
                { name: "Callaloo Breakfast"},
                { name: "Chicken Breakfast"},
                { name: "Curry Chicken Breakfast"},
                { name: "Liver Breakfast"},
                { name: "Salt Mackerel"},
                { name: "Cornmeal Porridge"},
                { name: "Hominy Corn Porridge"},
            ],
            Lunch: [
                 { name: "Veggie Patty"},
                 { name: "Fried Chicken"},
                 { name: "Beef Patty"},
                 { name: "Beef with Cheese"},
                 { name: "Chicken Patty"},
                 { name: "Jerk Chicken"},
                 { name: "Super Patty"},
                 { name: "Chicken Loaf"},
                 { name: "Meatloaf"},
                 { name: "Dinner Roll"},
                 { name: "Patty and Coco Bread", description: "(plain/wheat)"}
            ],
            Dinner: [
                { name: "Curried Goat"},
                { name: "White Rice"},
                { name: "Coleslaw"},
                { name: "Chicken Combo", description: "(includes Dinner Roll, Regular Fries, and 16oz Soda)"},
                { name: "Baked Chicken Combo Meal"},
                { name: "Chicken Nugget Combo", description: "(with Regular Fries and 16oz Soda)"},
                { name: "Curried Chicken", description: "(with 16oz Soda)"},
                { name: "Curried Mutton Combo Meal", description: "(with 16oz Soda)"},
                { name: "Stew Peas Combo Meal", description: "(with 16oz Soda)"},
                { name: "Chicken Soup"},
                { name: "Red Peas Soup"}
            ]
        },
        price_level: 1,
        rating: 4.1,
        image_url: "/images/tastee.png"
      },
       {
        name: "Tracks & Records",
        locations: [{ address: "Marketplace, Kingston, Jamaica", latitude: 18.015, longitude: -76.785, services: ["dine-in", "takeout"] }],
        cuisine_type: "Jamaican Fusion",
        tags: ["Jamaican", "Fusion", "Sports Bar", "Upscale Casual"],
         menu: {
            Breakfast: [
                { name: "Plantain Pancakes" },
                { name: "Ackee Bruschetta" }
            ],
            Lunch: [
                { name: "Fish Tacos" },
                { name: "Chicken Sliders" }
            ],
            Dinner: [
                { name: "Oxtail Pasta" },
                { name: "Jerk Chicken Alfredo" }
            ]
        },
        price_level: 4,
        rating: 4.4,
        image_url: "/images/Tracks_and_records.png"
      },
      {
        name: "Nirvanna Indian Fusion Cuisine",
        locations: [{ name: "Nirvanna Kingston", address: "Unit 1, 80 Lady Musgrave Rd, Kingston, Jamaica", latitude: 18.012413, longitude: -76.777725, services: ["dine-in", "takeout"] }],
        cuisine_type: "Indian Fusion",
        tags: ["Indian", "Fusion", "Fine Dining", "Vegetarian Options", "Spicy"],
        menu: {
            Lunch: [
                { name: "Butter Chicken", description: "Creamy tomato-based curry with tandoori chicken.", spicy_level: 50, price: "JMD 2000" },
                { name: "Paneer Tikka Masala", description: "Grilled paneer in a rich, spicy tomato curry.", spicy_level: 60, price: "JMD 1900" }
            ],
            Dinner: [
                { name: "Lamb Rogan Josh", description: "Tender lamb in a red Kashmiri chili sauce.", spicy_level: 70, price: "JMD 2800" },
                { name: "Tandoori Mixed Grill", description: "Platter with chicken, shrimp, and lamb kebabs.", spicy_level: 65, price: "JMD 3200" },
                { name: "Vegetable Biryani", description: "Fragrant spiced rice with mixed vegetables.", spicy_level: 40, price: "JMD 1800" }
            ]
        },
        price_level: 3,
        rating: 4.6,
        image_url: "/images/nirvanna.png"
      },
      {
        name: "East Japanese Restaurant",
        locations: [
          {
            name: "East Japanese - Sovereign Centre",
            address: "Sovereign Centre, Kingston, Jamaica",
            latitude: 18.0158,
            longitude: -76.7827,
            services: ["dine-in", "takeout"]
          },
          {
            name: "East Japanese - Marketplace",
            address: "Marketplace, Constant Spring Rd, Kingston, Jamaica",
            latitude: 18.0177,
            longitude: -76.7895,
            services: ["dine-in", "takeout", "delivery"]
          }
        ],
        cuisine_type: "Japanese, Sushi, Asian", 
        tags: ["sushi", "japanese", "dine-in", "takeout", "traditional", "delivery"],
        menu: {
          Lunch: [
            { name: "Salmon Bento Box" },
            { name: "Chicken Teriyaki" },
            { name: "California Roll Combo" }
          ],
          Dinner: [
            { name: "Sashimi Platter" },
            { name: "Beef Yakiniku" },
            { name: "Eel Donburi" }
          ],
          Desserts: [ 
            { name: "Green Tea Ice Cream" },
            { name: "Mochi Trio" }
          ]
        },
        price_level: 2,
        rating: 4.5, 
        image_url: "/images/east-japanese.jpg"
      },
      {
        name: "Chilito's Jamexican",
        locations: [
          {
            address: "88 Hope Road, Kingston 6, Jamaica",
            latitude: 18.011713,
            longitude: -76.749859,
            services: ["delivery", "dine-in", "takeout"]
          }
        ],
        cuisine_type: "Jamaican, Mexican, Fusion",
        tags: ["tacos", "burritos", "fusion", "margaritas", "casual", "local favorite"],
        menu: {
          Lunch: [
            { name: "Jerk Chicken Tacos", price: "JMD 950", spicy_level: 70, description: "Chilito's Jamexican: A vibrant Jamexican fusion restaurant offering tacos, burritos, quesadillas, and margaritas in a lively and colorful atmosphere. Popular among locals for both dine-in and takeout." },
            { name: "Burrito Bowl", price: "JMD 1,200", spicy_level: 40 },
            { name: "Fish Tacos", price: "JMD 1,050", spicy_level: 30 }
          ],
          Dinner: [
            { name: "Jerk Chicken Tacos", price: "JMD 950", spicy_level: 70 },
            { name: "Burrito Bowl", price: "JMD 1,200", spicy_level: 40 },
            { name: "Fish Tacos", price: "JMD 1,050", spicy_level: 30 }
          ]
        },
        price_level: 2, 
        rating: undefined, 
        image_url: "/images/Chilitos.jpeg" 
      }
      ,
      {
        name: "Jade Garden Restaurant",
        locations: [
          {
            address: "Shop 3, 91 Constant Spring Rd, Kingston 10, Jamaica",
            latitude: 18.0324,
            longitude: -76.8021
          }
        ],
        cuisine_type: "Chinese, Asian, Seafood, Dim Sum",
        tags: ["dim sum", "seafood", "traditional", "family-friendly", "popular"],
        menu: {
          DimSum: [
            { name: "Shrimp Dumplings (Har Gow)", spicy_level: 10 },
            { name: "Sweet & Sour Chicken", spicy_level: 20 },
            { name: "Peking Duck (Half)", spicy_level: 30 }
          ]
          // Add other meal types (Lunch, Dinner) here if their structure is available
        },
        price_level: 2, // Mapping $$ to 2
        rating: undefined, // Assuming rating is not available in the provided data
        image_url: "/images/Jade-garden.jpg"
        // Omitting slug, description, and contact as they don't seem to fit the existing structure
      }
    ],
    homemade: {
      Breakfast: [
        "Ackee & Saltfish",
        "Cornmeal Porridge",
        "Fry Dumpling & Callaloo",
        "Banana Fritters",
        "Peanut Porridge",
        "Fried Breadfruit & Sardines",
      ],
      Lunch: [
        "Curry Chicken & Rice",
        "Stew Peas",
        "Fried Fish & Festival",
        "Chicken Foot Soup",
        "Cow Foot & Broad Beans",
      ],
      Dinner: [
        "Brown Stew Chicken",
        "BBQ Pork",
        "Escovitch Fish & Bammy",
        "Oxtail & Rice and Peas",
        "Curry Goat & White Rice",
      ],
    },
  },
  Trinidad: {
     restaurants: [
       {
        name: "Royal Castle",
        locations: [{ address: "Various Locations, Port of Spain, Trinidad", latitude: 10.65, longitude: -61.51, services: ["dine-in", "takeout"] }],
        cuisine_type: "Trinidadian Fast Food",
        tags: ["Trinidadian", "Fast Food", "Chicken", "Affordable"],
        menu: {
            Breakfast: [
                { name: "Bake & Saltfish" }
            ],
            Lunch: [
                { name: "Spicy Wings" },
                { name: "Fried Chicken" },
                { name: "Fries" }
            ],
            Dinner: [
                { name: "Chicken Sandwich" },
                { name: "Cole Slaw" },
                { name: "Macaroni Pie" }
            ]
        },
        price_level: 1,
        rating: 4.0,
        image_url: "https://firebasestorage.googleapis.com/v0/b/island-bites-tx26s.appspot.com/o/logos%2FRoyal_Castle_logo.png?alt=media"
      },
        {
        name: "Doubles King",
        locations: [{ address: "Various Locations, Port of Spain, Trinidad", latitude: 10.66, longitude: -61.50, services: ["street-food", "takeout"] }],
        cuisine_type: "Trinidadian Street Food",
        tags: ["Trinidadian", "Doubles", "Street Food", "Vegetarian"],
        menu: {
            Breakfast: [
                { name: "Doubles"},
                { name: "Aloo Pie"},
                { name: "Chutney"}
            ],
            Lunch: [
                { name: "Doubles Combo"},
                { name: "Fried Channa"}
            ],
            Dinner: [ 
                { name: "Doubles"},
                { name: "Channa Roti"},
                { name: "Pepper Sauce & Cucumber Chutney"}
            ]
        },
        price_level: 1,
        rating: 4.3,
        image_url: "https://firebasestorage.googleapis.com/v0/b/island-bites-tx26s.appspot.com/o/logos%2FDoubles_King_Placeholder.png?alt=media"
      },
      {
        name: "Roti Cafe",
        locations: [{ address: "Maraval Road, Port of Spain, Trinidad", latitude: 10.67, longitude: -61.52, services: ["dine-in", "takeout"] }],
        cuisine_type: "Trinidadian Roti Shop",
        tags: ["Trinidadian", "Roti", "Curry", "Affordable"],
         menu: {
            Breakfast: [ 
                { name: "Coconut Bake & Cheese" }
            ],
            Lunch: [
                { name: "Chicken Roti" },
                { name: "Dhalpourie" }
            ],
            Dinner: [
                { name: "Goat Roti" },
                { name: "Buss-up-Shut" }
            ]
        },
        price_level: 2,
        rating: 4.4,
        image_url: "https://firebasestorage.googleapis.com/v0/b/island-bites-tx26s.appspot.com/o/logos%2FRoti_Cafe_Placeholder.png?alt=media"
      },
      {
        name: "Linda’s Bakery",
        locations: [{ address: "Various Locations, Trinidad", latitude: 10.65, longitude: -61.49, services: ["takeout", "dine-in-cafe"] }],
        cuisine_type: "Bakery & Cafe",
        tags: ["Trinidadian", "Bakery", "Pastries", "Sandwiches", "Breakfast", "Lunch"],
        menu: {
            Breakfast: [
                { name: "Coconut Roll"},
                { name: "Currant Roll"},
                { name: "Sausage Roll"}
            ],
            Lunch: [
                { name: "Bake & Shark"},
                { name: "Buljol Sandwich"}
            ],
            Dinner: [ 
                { name: "Curry Chicken Puffs"},
                { name: "Cheese Pie"}
            ]
        },
        price_level: 2,
        rating: 4.5,
        image_url: "https://firebasestorage.googleapis.com/v0/b/island-bites-tx26s.appspot.com/o/logos%2FLinda's_Bakery_logo.png?alt=media"
      },
       {
        name: "TGI Fridays (Local Branch)",
        locations: [{ address: "Price Plaza, Chaguanas, Trinidad", latitude: 10.52, longitude: -61.41, services: ["dine-in", "takeout", "delivery"] }],
        cuisine_type: "American Casual Dining",
        tags: ["American", "Burgers", "Wings", "Cocktails", "Casual Dining"],
        menu: {
            Breakfast: [ 
                // { name: "Pancakes & Eggs" }
            ],
            Lunch: [
                { name: "Boneless Wings" },
                { name: "Trini BBQ Burger" }
            ],
            Dinner: [
                { name: "Ribeye with Local Sides" },
                { name: "Curry Pasta" }
            ]
        },
        price_level: 4,
        rating: 4.0,
        image_url: "/images/Fridays.png"
      },
        {
        name: "Jerk Center POS",
        locations: [{ address: "Ariapita Avenue, Port of Spain, Trinidad", latitude: 10.66, longitude: -61.52, services: ["dine-in", "takeout", "outdoor-seating"] }],
        cuisine_type: "Jamaican Jerk",
        tags: ["Jamaican", "Jerk", "Trinidadian Twist", "Outdoor"],
        menu: {
             Lunch: [
                 { name: "Jerk Chicken" },
                 { name: "Festival" },
             ],
            Dinner: [
                { name: "Jerk Pork" },
                { name: "Callaloo Crab" }
            ]
        },
        price_level: 3,
        rating: 4.2,
        image_url: "https://firebasestorage.googleapis.com/v0/b/island-bites-tx26s.appspot.com/o/logos%2FJerk_Center_POS_Placeholder.png?alt=media"
      },
      {
        name: "Rituals Coffee House",
        locations: [{ address: "Various Locations, Trinidad", latitude: 10.655, longitude: -61.515, services: ["dine-in", "takeout", "cafe"] }],
        cuisine_type: "Cafe & Casual",
        tags: ["Coffee", "Sandwiches", "Pastries", "Smoothies", "Breakfast", "Lunch"],
        menu: {
            Breakfast: [
                 { name: "Croissant" },
                 { name: "Coffee" },
                 { name: "Breakfast Wrap" }
            ],
            Lunch: [
                 { name: "Chicken Caesar Wrap" },
                 { name: "Tuna Sandwich" },
                 { name: "Pineapple Smoothie" }
            ],
            Dinner: [
                { name: "Macaroni Pie" },
                { name: "Salad" }
            ]
        },
        price_level: 2,
        rating: 4.1,
        image_url: "/images/Rituals.png"
      }

     ],
    homemade: {
      Breakfast: [
        "Sada Roti & Tomato Choka",
        "Corn Soup",
        "Fry Aloo & Bread",
        "Buljol & Avocado",
        "Saltfish & Ground Provisions",
      ],
      Lunch: [
        "Pelau",
        "Stewed Beef & Callaloo",
        "Macaroni Pie & Fry Plantain",
        "Bake & Shark (homemade)",
        "Curried Mango & Dhal",
      ],
      Dinner: [
        "Curried Chicken & Dhal",
        "Oil Down",
        "Fish Broth with Provisions",
        "Cow Heel Soup",
        "Chicken Gizzards & Rice",
      ],
    },
  },
};

    
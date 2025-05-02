// src/lib/data.ts
import type { LocationData, MealItem, Menu, MealTime } from './interfaces';

// Image list for placeholders or local data display
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

// Define meal times for filtering
const BREAKFAST_START = 5;
const BREAKFAST_END = 10; // Up to 10:59 AM
const LUNCH_START = 11;
const LUNCH_END = 15; // Up to 3:59 PM
const DINNER_START = 16;
const DINNER_END = 21; // Up to 9:59 PM

// Helper function to create MealItem objects easily
const createMeal = (name: string, description?: string, spicy_level?: number, price?: string): MealItem => ({
  name, description, spicy_level, price
});

// Define the local restaurant data using the updated interfaces
export const currentRestaurantList: { Jamaica: LocationData; Trinidad: LocationData } = {
  Jamaica: {
    restaurants: [
       {
        name: "Juici Patties",
        location: { address: "Various Locations, Kingston, Jamaica", latitude: 18.01, longitude: -76.80 },
        cuisine_type: "Jamaican Fast Food",
        tags: ["Jamaican", "Patties", "Fast Food", "Affordable"],
        menu: {
          Breakfast: [createMeal("Cornmeal Porridge", "Traditional Jamaican cornmeal porridge.", 10, "JMD 400"), createMeal("Callaloo & Bread", "Steamed callaloo served with slices of bread.", 5, "JMD 500")],
          Lunch: [createMeal("Beef Patty", "Flaky pastry filled with seasoned ground beef.", 20, "JMD 300"), createMeal("Cheese Patty", "Beef patty with melted cheese.", 15, "JMD 350"), createMeal("Coco Bread", "Slightly sweet, soft bread.", 0, "JMD 150")],
          Dinner: [createMeal("Curry Chicken", "Chicken simmered in Jamaican curry sauce.", 40, "JMD 900"), createMeal("Stew Peas", "Red kidney beans stewed with salted meat and spinners.", 30, "JMD 850"), createMeal("White Rice", "Plain steamed white rice.", 0, "JMD 200")],
        },
        price_level: 1, // Inexpensive
        rating: 4.2,
        image_url: "https://picsum.photos/200/100?random=1"
      },
      {
        name: "Island Grill",
        location: { address: "Various Locations, Kingston, Jamaica", latitude: 18.02, longitude: -76.79 },
        cuisine_type: "Jamaican Grill",
        tags: ["Jamaican", "Jerk", "Grilled", "Healthy Options"],
        menu: {
          Breakfast: [createMeal("Saltfish Fritters", "Fried dumplings with salted codfish.", 15, "JMD 600"), createMeal("Ackee Wrap", "Scrambled ackee in a wrap.", 10, "JMD 700")],
          Lunch: [createMeal("BBQ Chicken", "Chicken grilled with BBQ sauce.", 10, "JMD 1200"), createMeal("Festival", "Sweet fried cornmeal dumplings.", 0, "JMD 200"), createMeal("Plantain", "Fried ripe plantain.", 0, "JMD 250")],
          Dinner: [createMeal("Jerk Chicken", "Spicy grilled jerk chicken.", 70, "JMD 1300"), createMeal("Rice & Peas", "Rice cooked with red kidney beans and coconut milk.", 5, "JMD 300"), createMeal("Callaloo", "Steamed leafy greens.", 5, "JMD 350")],
        },
        price_level: 2, // Moderate
        rating: 4.5,
        image_url: "https://picsum.photos/200/100?random=2"
      },
      {
        name: "Scotchies",
        location: { address: "Drax Hall, St. Ann, Jamaica", latitude: 18.40, longitude: -77.15 },
        cuisine_type: "Jamaican Jerk",
        tags: ["Jamaican", "Jerk", "Outdoor", "Rustic"],
        menu: {
          Breakfast: [createMeal("Roast Breadfruit & Ackee (weekends)", "Seasonal weekend special.", 10, "JMD 900")],
          Lunch: [createMeal("Jerk Pork", "Authentic smoked jerk pork.", 75, "JMD 1500"), createMeal("Festival", "Sweet fried cornmeal dumplings.", 0, "JMD 200")],
          Dinner: [createMeal("Jerk Chicken", "Signature smoked jerk chicken.", 70, "JMD 1400"), createMeal("Roasted Yam", "Yam roasted over coals.", 5, "JMD 400"), createMeal("Sweet Potato", "Roasted sweet potato.", 0, "JMD 400")],
        },
        price_level: 3, // Expensive
        rating: 4.7,
        image_url: "https://picsum.photos/200/100?random=3"
      },
      {
        name: "Tastee Patties",
         location: { address: "Various Locations, Kingston, Jamaica", latitude: 18.00, longitude: -76.78 },
        cuisine_type: "Jamaican Fast Food",
        tags: ["Jamaican", "Patties", "Fast Food", "Breakfast", "Lunch"],
        menu: {
            Breakfast: [
                createMeal("Ackee & Saltfish Breakfast", "National dish of Jamaica.", 10, "JMD 800"),
                createMeal("Callaloo Breakfast", "Steamed callaloo served as breakfast.", 5, "JMD 700"),
                createMeal("Chicken Breakfast", "Served with provisions.", 10, "JMD 850"),
                createMeal("Curry Chicken Breakfast", "Curried chicken for breakfast.", 40, "JMD 850"),
                createMeal("Liver Breakfast", "Traditional liver breakfast.", 15, "JMD 750"),
                createMeal("Salt Mackerel", "Served with provisions.", 20, "JMD 800"),
                createMeal("Cornmeal Porridge", "Creamy cornmeal porridge.", 5, "JMD 400"),
                createMeal("Hominy Corn Porridge", "Porridge made with hominy corn.", 5, "JMD 450"),
                createMeal("Peanut Porridge", "Rich and nutty peanut porridge.", 5, "JMD 450"),
            ],
            Lunch: [
                createMeal("Beef Patty", "Classic Jamaican beef patty.", 20, "JMD 300"),
                createMeal("Beef with Cheese Patty", "Beef patty with cheese.", 15, "JMD 350"),
                createMeal("Chicken Patty", "Seasoned chicken filling.", 15, "JMD 300"),
                createMeal("Jerk Chicken Patty", "Spicy jerk chicken filling.", 60, "JMD 350"),
                createMeal("Vegetable Patty", "Mixed vegetable filling.", 10, "JMD 300"),
                createMeal("Super Patty", "Larger beef patty.", 20, "JMD 400"),
                createMeal("Chicken Loaf", "Baked chicken loaf.", 10, "JMD 380"),
                createMeal("Meatloaf", "Traditional meatloaf slice.", 10, "JMD 380"),
                createMeal("Dinner Roll", "Soft dinner roll.", 0, "JMD 100"),
                createMeal("Patty and Coco Bread", "Patty served in soft coco bread.", 15, "JMD 450"),
                // Combos - simplified for the structure, price reflects combo
                createMeal("Chicken Combo", "Chicken, Roll, Fries, Soda.", 10, "JMD 1200"),
                createMeal("Baked Chicken Combo", "Baked Chicken, Roll, Fries, Soda.", 5, "JMD 1250"),
                createMeal("Chicken Nugget Combo", "Nuggets, Fries, Soda.", 5, "JMD 1100"),
                createMeal("Curried Chicken Meal", "Curried Chicken with Soda.", 40, "JMD 1000"),
                createMeal("Curried Mutton Combo", "Mutton Curry with Soda.", 50, "JMD 1300"),
                createMeal("Stew Peas Combo", "Stew Peas with Soda.", 30, "JMD 1100"),
                // Sandwiches
                createMeal("Ackee & Saltfish Sandwich", "National dish in a sandwich.", 10, "JMD 600"),
                createMeal("Callaloo Sandwich", "Steamed callaloo sandwich.", 5, "JMD 500"),
                createMeal("Cheese Sandwich", "Simple cheese sandwich.", 0, "JMD 300"),
                createMeal("Chicken Sandwich", "Chicken breast sandwich.", 10, "JMD 550"),
                createMeal("Deli Ham Sandwich", "Sliced ham sandwich.", 5, "JMD 500"),
                createMeal("Fish Sandwich", "Fried fish fillet sandwich.", 15, "JMD 600"),
                // Soups
                createMeal("Chicken Soup", "Hearty chicken soup.", 10, "JMD 500"),
                createMeal("Red Peas Soup", "Rich red peas soup.", 20, "JMD 550"),
            ],
            // Dinner menu can often be the same as Lunch for fast food places
            Dinner: [
                 createMeal("Beef Patty", "Classic Jamaican beef patty.", 20, "JMD 300"),
                createMeal("Beef with Cheese Patty", "Beef patty with cheese.", 15, "JMD 350"),
                createMeal("Chicken Patty", "Seasoned chicken filling.", 15, "JMD 300"),
                createMeal("Jerk Chicken Patty", "Spicy jerk chicken filling.", 60, "JMD 350"),
                createMeal("Vegetable Patty", "Mixed vegetable filling.", 10, "JMD 300"),
                createMeal("Super Patty", "Larger beef patty.", 20, "JMD 400"),
                createMeal("Chicken Loaf", "Baked chicken loaf.", 10, "JMD 380"),
                createMeal("Meatloaf", "Traditional meatloaf slice.", 10, "JMD 380"),
                createMeal("Dinner Roll", "Soft dinner roll.", 0, "JMD 100"),
                createMeal("Patty and Coco Bread", "Patty served in soft coco bread.", 15, "JMD 450"),
                createMeal("Chicken Combo", "Chicken, Roll, Fries, Soda.", 10, "JMD 1200"),
                createMeal("Baked Chicken Combo", "Baked Chicken, Roll, Fries, Soda.", 5, "JMD 1250"),
                createMeal("Chicken Nugget Combo", "Nuggets, Fries, Soda.", 5, "JMD 1100"),
                createMeal("Curried Chicken Meal", "Curried Chicken with Soda.", 40, "JMD 1000"),
                createMeal("Curried Mutton Combo", "Mutton Curry with Soda.", 50, "JMD 1300"),
                createMeal("Stew Peas Combo", "Stew Peas with Soda.", 30, "JMD 1100"),
                 createMeal("Chicken Soup", "Hearty chicken soup.", 10, "JMD 500"),
                createMeal("Red Peas Soup", "Rich red peas soup.", 20, "JMD 550"),
            ],
        },
        price_level: 1, // Inexpensive
        rating: 4.1,
        image_url: "https://picsum.photos/200/100?random=4"
      },
       {
        name: "Tracks & Records",
        location: { address: "Marketplace, Kingston, Jamaica", latitude: 18.015, longitude: -76.785 },
        cuisine_type: "Jamaican Fusion",
        tags: ["Jamaican", "Fusion", "Sports Bar", "Upscale Casual"],
        menu: {
          Breakfast: [createMeal("Plantain Pancakes", "Pancakes made with ripe plantains.", 5, "JMD 1200"), createMeal("Ackee Bruschetta", "Ackee and saltfish on toasted bread.", 15, "JMD 1100")],
          Lunch: [createMeal("Fish Tacos", "Grilled fish in soft tacos.", 25, "JMD 1600"), createMeal("Chicken Sliders", "Mini jerk chicken sandwiches.", 30, "JMD 1500")],
          Dinner: [createMeal("Oxtail Pasta", "Braised oxtail in pasta.", 20, "JMD 2500"), createMeal("Jerk Chicken Alfredo", "Creamy Alfredo pasta with jerk chicken.", 40, "JMD 2400")],
        },
        price_level: 4, // Very Expensive
        rating: 4.4,
        image_url: "https://picsum.photos/200/100?random=5"
      },
      {
        name: "Nirvanna Indian Fusion Cuisine",
        location: { address: "Unit 1, 80 Lady Musgrave Rd, Kingston, Jamaica", latitude: 18.012413, longitude: -76.777725 },
        cuisine_type: "Indian Fusion",
        tags: ["Indian", "Fusion", "Fine Dining", "Vegetarian Options", "Spicy"],
        menu: {
          Lunch: [
            createMeal("Butter Chicken", "Creamy tomato-based curry with tandoori chicken.", 50, "JMD 2000"),
            createMeal("Paneer Tikka Masala", "Grilled paneer in a rich, spicy tomato curry.", 60, "JMD 1900")
          ],
          Dinner: [
            createMeal("Lamb Rogan Josh", "Tender lamb in a red Kashmiri chili sauce.", 70, "JMD 2800"),
            createMeal("Tandoori Mixed Grill", "Platter with chicken, shrimp, and lamb kebabs.", 65, "JMD 3200"),
            createMeal("Vegetable Biryani", "Fragrant spiced rice with mixed vegetables.", 40, "JMD 1800")
          ]
        },
        price_level: 3, // Expensive
        rating: 4.6,
        image_url: "https://picsum.photos/200/100?random=11"
      }
    ],
    // Homemade meals remain as simple strings for now
    homemade: {
      Breakfast: [
        "Ackee & Saltfish", "Cornmeal Porridge", "Fry Dumpling & Callaloo", "Banana Fritters", "Peanut Porridge", "Fried Breadfruit & Sardines",
      ],
      Lunch: [
        "Curry Chicken & Rice", "Stew Peas", "Fried Fish & Festival", "Chicken Foot Soup", "Cow Foot & Broad Beans",
      ],
      Dinner: [
        "Brown Stew Chicken", "Jerk Pork with Yam", "Escovitch Fish & Bammy", "Oxtail & Rice and Peas", "Curry Goat & White Rice",
      ],
    },
  },
  Trinidad: {
     restaurants: [
       {
        name: "Royal Castle",
        location: { address: "Various Locations, Port of Spain, Trinidad", latitude: 10.65, longitude: -61.51 },
        cuisine_type: "Trinidadian Fast Food",
        tags: ["Trinidadian", "Fast Food", "Chicken", "Affordable"],
        menu: {
          Breakfast: [createMeal("Bake & Saltfish", "Fried bake with salted codfish.", 15, "TTD 30")],
          Lunch: [createMeal("Spicy Wings", "Crispy spicy chicken wings.", 50, "TTD 45"), createMeal("Fried Chicken", "Classic fried chicken.", 10, "TTD 40"), createMeal("Fries", "Regular french fries.", 0, "TTD 15")],
          Dinner: [createMeal("Chicken Sandwich", "Fried chicken breast sandwich.", 20, "TTD 35"), createMeal("Cole Slaw", "Creamy coleslaw.", 0, "TTD 10"), createMeal("Macaroni Pie", "Baked macaroni and cheese.", 5, "TTD 25")],
        },
        price_level: 1, // Inexpensive
        rating: 4.0,
        image_url: "https://picsum.photos/200/100?random=6"
      },
      {
        name: "Doubles King",
        location: { address: "Various Locations, Trinidad", latitude: 10.66, longitude: -61.50 },
        cuisine_type: "Trinidadian Street Food",
        tags: ["Trinidadian", "Street Food", "Doubles", "Vegetarian"],
        menu: {
          Breakfast: [createMeal("Doubles", "Fried flatbread (bara) with curried chickpeas (channa).", 30, "TTD 7"), createMeal("Aloo Pie", "Fried dough filled with spiced potatoes.", 25, "TTD 8"), createMeal("Chutney", "Various sweet and spicy chutneys.", 5, "TTD 2")],
          Lunch: [createMeal("Doubles Combo", "Multiple doubles with various chutneys.", 30, "TTD 20"), createMeal("Fried Channa", "Spiced fried chickpeas.", 10, "TTD 10")],
          Dinner: [createMeal("Channa Roti", "Roti filled with curried chickpeas.", 25, "TTD 25"), createMeal("Pepper Sauce & Cucumber Chutney", "Condiments.", 60, "TTD 3")],
        },
        price_level: 1, // Inexpensive
        rating: 4.3,
        image_url: "https://picsum.photos/200/100?random=7"
      },
       {
        name: "Roti Cafe",
        location: { address: "Ariapita Ave, Port of Spain, Trinidad", latitude: 10.662, longitude: -61.525 },
        cuisine_type: "Trinidadian Roti",
        tags: ["Trinidadian", "Roti", "Curry", "Casual"],
        menu: {
          Breakfast: [createMeal("Coconut Bake & Cheese", "Sweet coconut bread with cheese.", 5, "TTD 25")],
          Lunch: [createMeal("Chicken Roti", "Roti filled with curried chicken.", 40, "TTD 35"), createMeal("Dhalpourie", "Split pea stuffed roti skin.", 10, "TTD 15")],
          Dinner: [createMeal("Goat Roti", "Roti filled with curried goat.", 50, "TTD 45"), createMeal("Buss-up-Shut", "Shredded roti skin.", 5, "TTD 20")],
        },
        price_level: 2, // Moderate
        rating: 4.4,
        image_url: "https://picsum.photos/200/100?random=8"
      },
       {
        name: "Linda’s Bakery",
        location: { address: "Various Locations, Trinidad", latitude: 10.64, longitude: -61.49 },
        cuisine_type: "Trinidadian Bakery & Cafe",
        tags: ["Trinidadian", "Bakery", "Pastries", "Sandwiches", "Casual"],
        menu: {
          Breakfast: [createMeal("Coconut Roll", "Sweet roll with coconut filling.", 0, "TTD 10"), createMeal("Currant Roll", "Roll with currants.", 0, "TTD 10"), createMeal("Sausage Roll", "Pastry with sausage filling.", 5, "TTD 12")],
          Lunch: [createMeal("Bake & Shark", "Fried bake filled with seasoned fried shark (or fish).", 25, "TTD 50"), createMeal("Buljol Sandwich", "Salted codfish salad sandwich.", 10, "TTD 30")],
          Dinner: [createMeal("Curry Chicken Puffs", "Puff pastry with curry chicken.", 30, "TTD 18"), createMeal("Cheese Pie", "Savory cheese pastry.", 5, "TTD 15")],
        },
        price_level: 2, // Moderate
        rating: 4.2,
        image_url: "https://picsum.photos/200/100?random=9"
      },
      {
        name: "TGI Fridays (Local Branch)",
         location: { address: "Price Plaza, Chaguanas, Trinidad", latitude: 10.52, longitude: -61.41 },
        cuisine_type: "American Casual Dining",
        tags: ["American", "Burgers", "Wings", "Bar", "Casual Dining"],
        menu: {
          Breakfast: [createMeal("Pancakes & Eggs", "Standard American breakfast.", 0, "TTD 60")],
          Lunch: [createMeal("Boneless Wings", "Chicken wings without bones.", 15, "TTD 70"), createMeal("Trini BBQ Burger", "Burger with local BBQ sauce.", 20, "TTD 85")],
          Dinner: [createMeal("Ribeye with Local Sides", "Steak with options like macaroni pie or plantain.", 10, "TTD 180"), createMeal("Curry Pasta", "Pasta with a Trinidadian curry twist.", 35, "TTD 110")],
        },
        price_level: 4, // Very Expensive
        rating: 3.9,
        image_url: "https://picsum.photos/200/100?random=10"
      },
    ],
    // Homemade meals remain as simple strings
    homemade: {
      Breakfast: [
        "Sada Roti & Tomato Choka", "Corn Soup", "Fry Aloo & Bread", "Buljol & Avocado", "Saltfish & Ground Provisions",
      ],
      Lunch: [
        "Pelau", "Stewed Beef & Callaloo", "Macaroni Pie & Fry Plantain", "Bake & Shark (homemade)", "Curried Mango & Dhal",
      ],
      Dinner: [
        "Curried Chicken & Dhal", "Oil Down", "Fish Broth with Provisions", "Cow Heel Soup", "Chicken Gizzards & Rice",
      ],
    },
  },
};

// Export time ranges for use in filtering logic
export const timeRanges = {
  BREAKFAST_START,
  BREAKFAST_END,
  LUNCH_START,
  LUNCH_END,
  DINNER_START,
  DINNER_END,
};

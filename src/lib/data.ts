// src/lib/data.ts
import type { LocationData, Restaurant, MealItem } from './interfaces';

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

const BREAKFAST_START = 5;
const BREAKFAST_END = 10;
const LUNCH_START = 11;
const LUNCH_END = 15;
const DINNER_START = 16;
const DINNER_END = 21;

// Helper function to create MealItem objects easily
const createMeal = (name: string, description: string, spicy_level: number, price: string): MealItem => ({
  name, description, spicy_level, price
});

const createSimpleMeal = (name: string): MealItem => ({ name });

export const currentRestaurantList: { Jamaica: LocationData; Trinidad: LocationData } = {
  Jamaica: {
    restaurants: [
       {
        name: "Juici Patties",
        location: { address: "Various Locations, Kingston, Jamaica", latitude: 18.01, longitude: -76.80 }, // Example coords
        cuisine_type: "Jamaican Fast Food",
        tags: ["Jamaican", "Patties", "Fast Food", "Affordable"],
        menu: {
          breakfast: [createMeal("Cornmeal Porridge", "Traditional Jamaican cornmeal porridge.", 10, "JMD 400"), createMeal("Callaloo & Bread", "Steamed callaloo served with slices of bread.", 5, "JMD 500")],
          lunch: [createMeal("Beef Patty", "Flaky pastry filled with seasoned ground beef.", 20, "JMD 300"), createMeal("Cheese Patty", "Beef patty with melted cheese.", 15, "JMD 350"), createMeal("Coco Bread", "Slightly sweet, soft bread.", 0, "JMD 150")],
          dinner: [createMeal("Curry Chicken", "Chicken simmered in Jamaican curry sauce.", 40, "JMD 900"), createMeal("Stew Peas", "Red kidney beans stewed with salted meat and spinners.", 30, "JMD 850"), createMeal("White Rice", "Plain steamed white rice.", 0, "JMD 200")],
        },
        price_level: 1,
        rating: 4.2,
        distance_meters: 0,
        image_url: "https://picsum.photos/200/100?random=1"
      },
      {
        name: "Island Grill",
        location: { address: "Various Locations, Kingston, Jamaica", latitude: 18.02, longitude: -76.79 }, // Example coords
        cuisine_type: "Jamaican Grill",
        tags: ["Jamaican", "Jerk", "Grilled", "Healthy Options"],
        menu: {
          breakfast: [createMeal("Saltfish Fritters", "Fried dumplings with salted codfish.", 15, "JMD 600"), createMeal("Ackee Wrap", "Scrambled ackee in a wrap.", 10, "JMD 700")],
          lunch: [createMeal("BBQ Chicken", "Chicken grilled with BBQ sauce.", 10, "JMD 1200"), createMeal("Festival", "Sweet fried cornmeal dumplings.", 0, "JMD 200"), createMeal("Plantain", "Fried ripe plantain.", 0, "JMD 250")],
          dinner: [createMeal("Jerk Chicken", "Spicy grilled jerk chicken.", 70, "JMD 1300"), createMeal("Rice & Peas", "Rice cooked with red kidney beans and coconut milk.", 5, "JMD 300"), createMeal("Callaloo", "Steamed leafy greens.", 5, "JMD 350")],
        },
        price_level: 2,
        rating: 4.5,
        distance_meters: 0,
        image_url: "https://picsum.photos/200/100?random=2"
      },
      {
        name: "Scotchies",
        location: { address: "Drax Hall, St. Ann, Jamaica", latitude: 18.40, longitude: -77.15 }, // Example coords
        cuisine_type: "Jamaican Jerk",
        tags: ["Jamaican", "Jerk", "Outdoor", "Rustic"],
        menu: {
          breakfast: [createMeal("Roast Breadfruit & Ackee (weekends)", "Seasonal weekend special.", 10, "JMD 900")],
          lunch: [createMeal("Jerk Pork", "Authentic smoked jerk pork.", 75, "JMD 1500"), createMeal("Festival", "Sweet fried cornmeal dumplings.", 0, "JMD 200")],
          dinner: [createMeal("Jerk Chicken", "Signature smoked jerk chicken.", 70, "JMD 1400"), createMeal("Roasted Yam", "Yam roasted over coals.", 5, "JMD 400"), createMeal("Sweet Potato", "Roasted sweet potato.", 0, "JMD 400")],
        },
        price_level: 3,
        rating: 4.7,
        distance_meters: 0,
        image_url: "https://picsum.photos/200/100?random=3"
      },
      {
        name: "Tastee Patties",
         location: { address: "Various Locations, Kingston, Jamaica", latitude: 18.00, longitude: -76.78 }, // Example coords
        cuisine_type: "Jamaican Fast Food",
        tags: ["Jamaican", "Patties", "Fast Food", "Breakfast", "Lunch"],
        menu: {
            breakfast: [
                createMeal("Ackee & Saltfish", "National dish of Jamaica.", 10, "JMD 800"),
                createMeal("Cornmeal Porridge", "Creamy cornmeal porridge.", 5, "JMD 400"),
                createMeal("Peanut Porridge", "Rich and nutty peanut porridge.", 5, "JMD 450"),
            ],
            lunch: [ // Combining lunch & dinner for simplicity based on provided menu
                createMeal("Beef Patty", "Classic Jamaican beef patty.", 20, "JMD 300"),
                createMeal("Chicken Patty", "Seasoned chicken filling.", 15, "JMD 300"),
                createMeal("Vegetable Patty", "Mixed vegetable filling.", 10, "JMD 300"),
                createMeal("Patty and Coco Bread", "Patty served in soft coco bread.", 15, "JMD 450"),
            ],
             dinner: [ // Combining lunch & dinner for simplicity based on provided menu
                createMeal("Beef Patty", "Classic Jamaican beef patty.", 20, "JMD 300"),
                createMeal("Chicken Patty", "Seasoned chicken filling.", 15, "JMD 300"),
                createMeal("Vegetable Patty", "Mixed vegetable filling.", 10, "JMD 300"),
                createMeal("Patty and Coco Bread", "Patty served in soft coco bread.", 15, "JMD 450"),
            ],
        },
        price_level: 1,
        rating: 4.1,
        distance_meters: 0,
        image_url: "https://picsum.photos/200/100?random=4"
      },
       {
        name: "Tracks & Records",
        location: { address: "Marketplace, Kingston, Jamaica", latitude: 18.015, longitude: -76.785 }, // Example coords
        cuisine_type: "Jamaican Fusion",
        tags: ["Jamaican", "Fusion", "Sports Bar", "Upscale Casual"],
        menu: {
          breakfast: [createMeal("Plantain Pancakes", "Pancakes made with ripe plantains.", 5, "JMD 1200"), createMeal("Ackee Bruschetta", "Ackee and saltfish on toasted bread.", 15, "JMD 1100")],
          lunch: [createMeal("Fish Tacos", "Grilled fish in soft tacos.", 25, "JMD 1600"), createMeal("Chicken Sliders", "Mini jerk chicken sandwiches.", 30, "JMD 1500")],
          dinner: [createMeal("Oxtail Pasta", "Braised oxtail in pasta.", 20, "JMD 2500"), createMeal("Jerk Chicken Alfredo", "Creamy Alfredo pasta with jerk chicken.", 40, "JMD 2400")],
        },
        price_level: 4,
        rating: 4.4,
        distance_meters: 0,
        image_url: "https://picsum.photos/200/100?random=5"
      },
      {
        name: "Nirvanna Indian Fusion Cuisine",
        location: { address: "Unit 1, 80 Lady Musgrave Rd, Kingston, Jamaica", latitude: 18.012413, longitude: -76.777725 },
        cuisine_type: "Indian Fusion",
        tags: ["Indian", "Fusion", "Fine Dining", "Vegetarian Options", "Spicy"],
        menu: {
          lunch: [
            createMeal("Butter Chicken", "Creamy tomato-based curry with tandoori chicken.", 50, "JMD 2000"),
            createMeal("Paneer Tikka Masala", "Grilled paneer in a rich, spicy tomato curry.", 60, "JMD 1900")
          ],
          dinner: [
            createMeal("Lamb Rogan Josh", "Tender lamb in a red Kashmiri chili sauce.", 70, "JMD 2800"),
            createMeal("Tandoori Mixed Grill", "Platter with chicken, shrimp, and lamb kebabs.", 65, "JMD 3200"),
            createMeal("Vegetable Biryani", "Fragrant spiced rice with mixed vegetables.", 40, "JMD 1800")
          ]
        },
        price_level: 3,
        rating: 4.6,
        distance_meters: 0, // Placeholder
        image_url: "https://picsum.photos/200/100?random=11" // Placeholder image
      }
    ],
    homemade: { // Still using simple strings for homemade, can be upgraded later
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
        "Jerk Pork with Yam",
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
        location: { address: "Various Locations, Port of Spain, Trinidad", latitude: 10.65, longitude: -61.51 }, // Example coords
        cuisine_type: "Trinidadian Fast Food",
        tags: ["Trinidadian", "Fast Food", "Chicken", "Affordable"],
        menu: {
          breakfast: [createMeal("Bake & Saltfish", "Fried bake with salted codfish.", 15, "TTD 30")],
          lunch: [createMeal("Spicy Wings", "Crispy spicy chicken wings.", 50, "TTD 45"), createMeal("Fried Chicken", "Classic fried chicken.", 10, "TTD 40"), createMeal("Fries", "Regular french fries.", 0, "TTD 15")],
          dinner: [createMeal("Chicken Sandwich", "Fried chicken breast sandwich.", 20, "TTD 35"), createMeal("Cole Slaw", "Creamy coleslaw.", 0, "TTD 10"), createMeal("Macaroni Pie", "Baked macaroni and cheese.", 5, "TTD 25")],
        },
        price_level: 1,
        rating: 4.0,
        distance_meters: 0,
        image_url: "https://picsum.photos/200/100?random=6"
      },
      {
        name: "Doubles King",
        location: { address: "Various Locations, Trinidad", latitude: 10.66, longitude: -61.50 }, // Example coords
        cuisine_type: "Trinidadian Street Food",
        tags: ["Trinidadian", "Street Food", "Doubles", "Vegetarian"],
        menu: {
          breakfast: [createMeal("Doubles", "Fried flatbread (bara) with curried chickpeas (channa).", 30, "TTD 7"), createMeal("Aloo Pie", "Fried dough filled with spiced potatoes.", 25, "TTD 8"), createMeal("Chutney", "Various sweet and spicy chutneys.", 5, "TTD 2")],
          lunch: [createMeal("Doubles Combo", "Multiple doubles with various chutneys.", 30, "TTD 20"), createMeal("Fried Channa", "Spiced fried chickpeas.", 10, "TTD 10")],
          dinner: [createMeal("Channa Roti", "Roti filled with curried chickpeas.", 25, "TTD 25"), createMeal("Pepper Sauce & Cucumber Chutney", "Condiments.", 60, "TTD 3")],
        },
        price_level: 1,
        rating: 4.3,
        distance_meters: 0,
        image_url: "https://picsum.photos/200/100?random=7"
      },
       {
        name: "Roti Cafe",
        location: { address: "Ariapita Ave, Port of Spain, Trinidad", latitude: 10.662, longitude: -61.525 }, // Example coords
        cuisine_type: "Trinidadian Roti",
        tags: ["Trinidadian", "Roti", "Curry", "Casual"],
        menu: {
          breakfast: [createMeal("Coconut Bake & Cheese", "Sweet coconut bread with cheese.", 5, "TTD 25")],
          lunch: [createMeal("Chicken Roti", "Roti filled with curried chicken.", 40, "TTD 35"), createMeal("Dhalpourie", "Split pea stuffed roti skin.", 10, "TTD 15")],
          dinner: [createMeal("Goat Roti", "Roti filled with curried goat.", 50, "TTD 45"), createMeal("Buss-up-Shut", "Shredded roti skin.", 5, "TTD 20")],
        },
        price_level: 2,
        rating: 4.4,
        distance_meters: 0,
        image_url: "https://picsum.photos/200/100?random=8"
      },
       {
        name: "Linda’s Bakery",
        location: { address: "Various Locations, Trinidad", latitude: 10.64, longitude: -61.49 }, // Example coords
        cuisine_type: "Trinidadian Bakery & Cafe",
        tags: ["Trinidadian", "Bakery", "Pastries", "Sandwiches", "Casual"],
        menu: {
          breakfast: [createMeal("Coconut Roll", "Sweet roll with coconut filling.", 0, "TTD 10"), createMeal("Currant Roll", "Roll with currants.", 0, "TTD 10"), createMeal("Sausage Roll", "Pastry with sausage filling.", 5, "TTD 12")],
          lunch: [createMeal("Bake & Shark", "Fried bake filled with seasoned fried shark (or fish).", 25, "TTD 50"), createMeal("Buljol Sandwich", "Salted codfish salad sandwich.", 10, "TTD 30")],
          dinner: [createMeal("Curry Chicken Puffs", "Puff pastry with curry chicken.", 30, "TTD 18"), createMeal("Cheese Pie", "Savory cheese pastry.", 5, "TTD 15")],
        },
        price_level: 2,
        rating: 4.2,
        distance_meters: 0,
        image_url: "https://picsum.photos/200/100?random=9"
      },
      {
        name: "TGI Fridays (Local Branch)",
         location: { address: "Price Plaza, Chaguanas, Trinidad", latitude: 10.52, longitude: -61.41 }, // Example coords
        cuisine_type: "American Casual Dining",
        tags: ["American", "Burgers", "Wings", "Bar", "Casual Dining"],
        menu: {
          breakfast: [createMeal("Pancakes & Eggs", "Standard American breakfast.", 0, "TTD 60")],
          lunch: [createMeal("Boneless Wings", "Chicken wings without bones.", 15, "TTD 70"), createMeal("Trini BBQ Burger", "Burger with local BBQ sauce.", 20, "TTD 85")],
          dinner: [createMeal("Ribeye with Local Sides", "Steak with options like macaroni pie or plantain.", 10, "TTD 180"), createMeal("Curry Pasta", "Pasta with a Trinidadian curry twist.", 35, "TTD 110")],
        },
        price_level: 4,
        rating: 3.9,
        distance_meters: 0,
        image_url: "https://picsum.photos/200/100?random=10"
      },
    ],
    homemade: { // Still using simple strings for homemade, can be upgraded later
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

export const timeRanges = {
  BREAKFAST_START,
  BREAKFAST_END,
  LUNCH_START,
  LUNCH_END,
  DINNER_START,
  DINNER_END,
};

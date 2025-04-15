'use client';

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ShakeEvent } from "@/components/shake-event";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Bagel_Fat_One } from "next/font/google";
import Image from 'next/image';

const bagel = Bagel_Fat_One({ subsets: ["latin"], weight: "400" });

interface Meal {
  meal: string;
  restaurant?: string;
}

const defaultMeals = {
  Jamaica: {
    restaurants: [
      {
        name: "Juici Patties",
        meals: {
          Breakfast: ["Cornmeal Porridge", "Callaloo & Bread"],
          Lunch: ["Beef Patty", "Cheese Patty", "Coco Bread"],
          Dinner: ["Curry Chicken", "Stew Peas", "White Rice"],
        },
      },
      {
        name: "Island Grill",
        meals: {
          Breakfast: ["Saltfish Fritters", "Ackee Wrap"],
          Lunch: ["BBQ Chicken", "Festival", "Plantain"],
          Dinner: ["Jerk Chicken", "Rice & Peas", "Callaloo"],
        },
      },
      {
        name: "Scotchies",
        meals: {
          Breakfast: ["Roast Breadfruit & Ackee (weekends)"],
          Lunch: ["Jerk Pork", "Festival"],
          Dinner: ["Jerk Chicken", "Roasted Yam", "Sweet Potato"],
        },
      },
      {
        name: "Tastee Patties",
        meals: {
          Breakfast: [
            "Ackee & Saltfish",
            "Callaloo Breakfast",
            "Chicken Breakfast",
            "Curry Chicken Breakfast",
            "Liver Breakfast",
            "Salt Mackerel",
            "Cornmeal Porridge",
            "Hominy Corn Porridge",
            "Peanut Porridge",
          ],
          Lunch: [
            "Beef Patty",
            "Beef with Cheese",
            "Chicken Patty",
            "Jerk Chicken",
            "Vegetable Patty",
            "Super Patty",
            "Chicken Loaf",
            "Meatloaf",
            "Dinner Roll",
            "Patty and Coco Bread (plain/wheat)",
          ],
          Dinner: [
            "Chicken Combo (includes Dinner Roll, Regular Fries, and 16oz Soda)",
            "Baked Chicken Combo Meal",
            "Chicken Nugget Combo (with Regular Fries and 16oz Soda)",
            "Curried Chicken (with 16oz Soda)",
            "Curried Mutton Combo Meal (with 16oz Soda)",
            "Stew Peas Combo Meal (with 16oz Soda)",
            "Ackee & Saltfish Sandwich",
            "Callaloo Sandwich",
            "Cheese Sandwich",
            "Chicken Sandwich",
            "Deli Ham Sandwich",
            "Fish Sandwich",
            "Chicken Soup",
            "Red Peas Soup",
          ],
        },
      },
      {
        name: "Tracks & Records",
        meals: {
          Breakfast: ["Plantain Pancakes", "Ackee Bruschetta"],
          Lunch: ["Fish Tacos", "Chicken Sliders"],
          Dinner: ["Oxtail Pasta", "Jerk Chicken Alfredo"],
        },
      },
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
        meals: {
          Breakfast: ["Bake & Saltfish"],
          Lunch: ["Spicy Wings", "Fried Chicken", "Fries"],
          Dinner: ["Chicken Sandwich", "Cole Slaw", "Macaroni Pie"],
        },
      },
      {
        name: "Doubles King",
        meals: {
          Breakfast: ["Doubles", "Aloo Pie", "Chutney"],
          Lunch: ["Doubles Combo", "Fried Channa"],
          Dinner: ["Channa Roti", "Pepper Sauce & Cucumber Chutney"],
        },
      },
      {
        name: "Roti Cafe",
        meals: {
          Breakfast: ["Coconut Bake & Cheese"],
          Lunch: ["Chicken Roti", "Dhalpourie"],
          Dinner: ["Goat Roti", "Buss-up-Shut"],
        },
      },
      {
        name: "Linda’s Bakery",
        meals: {
          Breakfast: ["Coconut Roll", "Currant Roll", "Sausage Roll"],
          Lunch: ["Bake & Shark", "Buljol Sandwich"],
          Dinner: ["Curry Chicken Puffs", "Cheese Pie"],
        },
      },
      {
        name: "TGI Fridays (Local Branch)",
        meals: {
          Breakfast: ["Pancakes & Eggs"],
          Lunch: ["Boneless Wings", "Trini BBQ Burger"],
          Dinner: ["Ribeye with Local Sides", "Curry Pasta"],
        },
      },
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

const imageList = [
  "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2Fmeat_%202.png?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2Ffries%202.png?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2Fegg%20and%20bacon%202.png?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2Fburger%201.png?alt=media",
];

// Time ranges for meals
const BREAKFAST_START = 5;   // 5:00 AM
const BREAKFAST_END = 10;     // 10:59 AM
const LUNCH_START = 11;       // 11:00 AM
const LUNCH_END = 15;         // 3:59 PM (15:59 in 24-hour format)
const DINNER_START = 16;      // 4:00 PM
const DINNER_END = 21;        // 9:30 PM (21:30 in 24-hour format)


export default function Home() {
  const [location, setLocation] = useState<"Jamaica" | "Trinidad">("Jamaica");
  const [category, setCategory] = useState<"Eat-In" | "Eat-Out">("Eat-In");
    const [mealType, setMealType] = useState<"Restaurants" | "Meals" | "Desserts">("Restaurants");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [customMeals, setCustomMeals] = useState<Meal[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [imageUrl, setImageUrl] = useState(imageList[0]);
  const { toast } = useToast();

  useEffect(() => {
    const storedMeals = localStorage.getItem(`${location}-customMeals`);
    if (storedMeals) {
      setCustomMeals(JSON.parse(storedMeals));
    }
  }, [location]);

  useEffect(() => {
    localStorage.setItem(`${location}-customMeals`, JSON.stringify(customMeals));
  }, [customMeals, location]);

  const getCurrentMealType = (): "Breakfast" | "Lunch" | "Dinner" => {
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour >= BREAKFAST_START && currentHour <= BREAKFAST_END) {
      return "Breakfast";
    } else if (currentHour >= LUNCH_START && currentHour <= LUNCH_END) {
      return "Lunch";
    } else {
      return "Dinner";
    }
  };

  const decideMeal = () => {
    setIsShaking(true);

    setTimeout(() => {
      setIsShaking(false);

      const currentMealType = getCurrentMealType();
      let availableMeals: { meal: string; restaurant?: string; }[] = [];

      if (category === "Eat-In") {
        availableMeals = Object.values(defaultMeals[location].homemade)
          .filter((mealList, key) => {
             const mealTime = Object.keys(defaultMeals[location].homemade)[key]
             return mealTime === currentMealType
          })
          .flatMap(mealList =>
            mealList.map(meal => ({ meal }))
          );
      } else {
        availableMeals = defaultMeals[location].restaurants.flatMap(restaurant => {
            if (restaurant.meals[currentMealType]) {
              return restaurant.meals[currentMealType].map(meal => ({ meal, restaurant: restaurant.name }))
            } else {
              return []
            }
          }
        );
      }


      if (availableMeals.length === 0) {
        toast({
          title: "No meals available!",
          description:
            `No ${currentMealType} meals available for the selected location and category.`,
        });
        return;
      }

      const randomIndex = Math.floor(Math.random() * availableMeals.length);
      setSelectedMeal(availableMeals[randomIndex]);

      //Change image
      const randomImageIndex = Math.floor(Math.random() * imageList.length);
      setImageUrl(imageList[randomImageIndex]);

    }, 2000);
  };

  const handleShake = () => {
    decideMeal();
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-white">
      <Toaster />

      {/* Top Bar with Logo */}
      <div className="w-full flex justify-start items-center p-4">
        <Image
            src="https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2FNumnum-logo.png?alt=media"
            alt="NumNum Logo"
            width={150}
            height={50}
          />
      </div>

      {/* Today's Pick Card */}
      <Card className="w-full max-w-md mb-4 shadow-md rounded-lg" style={{ backgroundColor: 'white', borderColor: '#C1C1C1' }}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-left">Today's Pick</CardTitle>
           <Image
            src={imageUrl}
            alt="Today's Pick"
            width={200}
            height={100}
            className="rounded-md mt-2 mx-auto"
          />
        </CardHeader>
        <CardContent className="flex flex-col items-start">
          {selectedMeal ? (
            <>
              <p className="text-md font-medium text-primary">
                {selectedMeal.restaurant && (
                  <>
                    Restaurant:{" "}
                    <span className="font-bold">{selectedMeal.restaurant}</span>
                    <br />
                  </>
                )}
                Meal: <span className="font-bold">{selectedMeal.meal}</span>
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">No meal selected yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Meal Picker Card */}
      <Card className="w-full max-w-md mb-4 shadow-md rounded-lg" style={{ backgroundColor: 'white', borderColor: '#C1C1C1' }}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Meal Picker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
           <Label htmlFor="location">Location</Label>
            <Select value={location} onValueChange={(value) => setLocation(value as "Jamaica" | "Trinidad")}>
              <SelectTrigger className="w-full shadow-sm" style={{ backgroundColor: '#F7F7F7' }}>
                <SelectValue placeholder="Choose your location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Jamaica">Jamaica 🇯🇲</SelectItem>
                <SelectItem value="Trinidad">Trinidad 🇹🇹</SelectItem>
              </SelectContent>
            </Select>
             <div style={{ marginBottom: '20px' }} />
            <Label htmlFor="mealType">Meal Type</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as "Eat-In" | "Eat-Out")}>
              <SelectTrigger className="w-full shadow-sm" style={{ backgroundColor: '#F7F7F7' }}>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Eat-In">Eat In</SelectItem>
                <SelectItem value="Eat-Out">Eat Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Roll the Dice Button */}
      {isShaking ? (
        <div className="flex flex-col items-center">
          <Progress value={50} className="w-full max-w-md mb-2" />
          <p className="text-sm text-muted-foreground">Shaking up your meal...</p>
        </div>
      ) : (
        <Button
          variant="primary"
          className="w-full max-w-md mb-4 shadow-sm"
          style={{ backgroundColor: '#55D519', color: 'white' }}
          onClick={decideMeal}
        >
          Roll the Dice 🎲
        </Button>
      )}
      <Button variant="link" onClick={decideMeal}>
        Don't have motion? Tap here to roll
      </Button>
      <Separator className="w-full max-w-md my-4" />
    </div>
  );
}


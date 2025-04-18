"use client";

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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bagel_Fat_One, Poppins } from "next/font/google";
import Image from "next/image";
import { db, seedRestaurants } from "@/services/firebase";
import { MapPin } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const bagel = Bagel_Fat_One({ subsets: ["latin"], weight: "400" });

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

interface Meal {
  meal: string;
  restaurant?: string;
}

const imageList = [
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

// Time ranges for meals
const BREAKFAST_START = 5; // 5:00 AM
const BREAKFAST_END = 10; // 10:59 AM
const LUNCH_START = 11; // 11:00 AM
const LUNCH_END = 15; // 3:59 PM (15:59 in 24-hour format)
const DINNER_START = 16; // 4:00 PM
const DINNER_END = 21; // 9:30 PM (21:30 in 24-hour format)

const imageUrl = "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2Fmeat_%202.png?alt=media"; // Replace with your URL

export default function Home() {
  const [location, setLocation] = useState<"Jamaica" | "Trinidad">("Jamaica");
    const [mealType, setMealType] = useState<"Restaurants" | "Meals" | "Desserts">("Restaurants");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [customMeals, setCustomMeals] = useState<Meal[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [imageUrl, setImageUrl] = useState(imageList[0]);
  const [lastMeal, setLastMeal] = useState<Meal | null>(null);
    const [moodValue, setMoodValue] = useState<number[]>([50]);
    const [hungerValue, setHungerValue] = useState<number[]>([50]);
        const [budgetValue, setBudgetValue] = useState<number[]>([50]);
        const [dineTypeValue, setDineTypeValue] = useState<number[]>([50]);
    const [currentLocation, setCurrentLocation] = useState<string | null>(null);


    const [isSliderActive, setIsSliderActive] = useState(false); // New state to track slider activity


  const { toast } = useToast();

    useEffect(() => {
    seedRestaurants(); // Seed the restaurants when the component mounts
  }, []);

    useEffect(() => {
    // Function to get the user's current location
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            // Successfully retrieved location
            const { latitude, longitude } = position.coords;
            try {
              // Reverse geocoding using OpenStreetMap's Nominatim API
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
              );
              const data = await response.json();

              if (data && data.address) {
                const { city, country } = data.address;
                setCurrentLocation(`${city}, ${country}`);
              } else {
                setCurrentLocation("Location unavailable");
              }
            } catch (error) {
              console.error("Error getting location:", error);
              setCurrentLocation("Location unavailable");
            }
          },
          (error) => {
            // Handle errors
            console.error("Error getting location:", error);
            setCurrentLocation("Location unavailable");
          }
        );
      } else {
        // Geolocation is not supported by the browser
        setCurrentLocation("Geolocation is not supported");
      }
    };

    getLocation(); // Call the get location function when the component mounts
  }, []);



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
      let availableMeals: { meal: string; restaurant?: string }[] = [];

      const currentRestaurantList = {
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
  ]
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

       const isEatIn = dineTypeValue[0] <= 50; //If dineTypeValue is less than 50 its considered eat in

      if (isEatIn) {
        availableMeals = Object.values(currentRestaurantList[location].homemade)
          .filter((mealList, key) => {
            const mealTime = Object.keys(
              currentRestaurantList[location].homemade
            )[key];
            return mealTime === currentMealType;
          })
          .flatMap((mealList) => mealList.map((meal) => ({ meal })));
      } else {
        availableMeals = currentRestaurantList[location].restaurants.flatMap(
          (restaurant) => {
            if (restaurant.meals[currentMealType]) {
              return restaurant.meals[currentMealType].map((meal) => ({
                meal,
                restaurant: restaurant.name,
              }));
            } else {
              return [];
            }
          }
        );
      }

      // Exclude the last selected meal
      let filteredMeals = availableMeals;
      if (lastMeal) {
        filteredMeals = availableMeals.filter(
          (meal) =>
            !(meal.meal === lastMeal.meal && meal.restaurant === lastMeal.restaurant)
        );
      }

      if (filteredMeals.length === 0) {
        toast({
          title: "No meals available!",
          description: `No ${currentMealType} meals available for the selected location and category.`,
        });
        return;
      }

      const randomIndex = Math.floor(Math.random() * filteredMeals.length);
      const newSelectedMeal = filteredMeals[randomIndex];
      setSelectedMeal(newSelectedMeal);
      setLastMeal(newSelectedMeal); // Store the selected meal as the last meal

      //Change image
      const randomImageIndex = Math.floor(Math.random() * imageList.length);
      setImageUrl(imageList[randomImageIndex]);
    }, 2000);
  };

  const handleShake = () => {
    decideMeal();
  };

  const getGreeting = () => {
    const currentMealType = getCurrentMealType();
    return `What's for ${currentMealType}?`;
  };

    const getMoodEmoji = (value: number): string => {
    if (value <= 33) {
      return '☹️'; // Sad
    } else if (value <= 66) {
      return '😐'; // Neutral
    } else {
      return '🥳'; // Adventurous
    }
  };

      const getHungerEmoji = (value: number): string => {
    if (value <= 50) {
      return '🤤'; // Peckish
    } else {
      return '😫'; // Famished
    }
  };
        const getBudgetEmoji = (value: number): string => {
    if (value <= 33) {
      return '😒'; // Stingy
    } else if (value <= 66) {
      return '🙂'; // Normal
    } else {
      return '🤑'; // Fancy
    }
  };
    const getDineTypeEmoji = (value: number): string => {
    if (value <= 50) {
      return '🏠'; // Eat In
    } else {
      return '🛵'; // Eat Out
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-white">
      <Toaster />
      <ShakeEvent onShake={handleShake} />

      {/* Top Bar with Logo */}
      <div className="w-full flex justify-between items-center p-4">
         <Image
          src="https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2FNumnum-logo.png?alt=media"
          alt="NumNum Logo"
          width={150} // Adjust as needed
          height={75} // Adjust as needed
          className="rounded-md"
        />
         <div className="flex items-center">
         <p className={`${poppins.className} text-xs`} style={{ color: '#1E1E1E' }}>{currentLocation}</p>
         <MapPin className="h-6 w-6 text-gray-500" />
         </div>
      </div>

      {/* Today's Pick Card */}
      <Card
        className="w-full max-w-md mb-4 shadow-md rounded-lg"
        style={{ backgroundColor: "white", borderColor: "#C1C1C1" }}
      >
        <CardHeader>
          <CardTitle className={`text-lg font-semibold text-left`} style={{color: '#1E1E1E'}}>
            Today's Pick
          </CardTitle>
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
            <p className="text-muted-foreground">{getGreeting()}</p>
          )}
        </CardContent>
      </Card>

      {/* Meal Picker Card */}
      <Card
        className="w-full max-w-md mb-4 shadow-md rounded-lg"
        style={{ backgroundColor: "white", borderColor: "#C1C1C1" }}
      >
        <CardHeader>
          <CardTitle className={`text-lg font-semibold ${bagel.className}`} style={{color: '#1E1E1E'}}>Meal Picker</CardTitle>
        </CardHeader>
        <CardContent className={`${poppins.className}`}>
          <div className="grid gap-4">
             
                 <Label htmlFor="dinetype" style={{color: '#1E1E1E'}}>Dine Type</Label>
               <div className="flex items-center justify-between">
                    <div style={{color: '#1E1E1E'}}>Eat In 🏠</div>
                  <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                    <Slider
                      defaultValue={[50]}
                                  max={100}
                      step={1}
                                            onValueChange={setDineTypeValue}
                                            onPointerDown={() => setIsSliderActive(true)}
                                            onPointerUp={() => setIsSliderActive(false)}
                                            aria-label="Budget"
                    />
                    </TooltipTrigger>
                      <TooltipContent side="top" align="center" className="data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-100 data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=open]:fade-in-100">
                         {getDineTypeEmoji(dineTypeValue[0])}
                      </TooltipContent>
                  </Tooltip>
                      <div style={{color: '#1E1E1E'}}>Eat Out 🛵</div>
                  </TooltipProvider>
                  </div>
                 
                  <Label htmlFor="mood" style={{color: '#1E1E1E'}}>Mood</Label>
               <div className="flex items-center justify-between">
                    <div style={{color: '#1E1E1E'}}>Sad ☹️ </div>
                  <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                    <Slider
                      defaultValue={[50]}
                                  max={100}
                      step={1}
                                            onValueChange={setMoodValue}
                                            onPointerDown={() => setIsSliderActive(true)}
                                            onPointerUp={() => setIsSliderActive(false)}
                                            aria-label="Mood"
                    />
                    </TooltipTrigger>
                      <TooltipContent side="top" align="center" className="data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-100 data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=open]:fade-in-100">
                        {getMoodEmoji(moodValue[0])}
                      </TooltipContent>
                  </Tooltip>
                      <div style={{color: '#1E1E1E'}}>Adventurous 🥳 </div>
                  </TooltipProvider>
                  </div>
                 
                      <Label htmlFor="hunger" style={{color: '#1E1E1E'}}>Hunger Level</Label>
               <div className="flex items-center justify-between">
                    <div style={{color: '#1E1E1E'}}>Peckish 🤤</div>
                  <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                    <Slider
                      defaultValue={[50]}
                                  max={100}
                      step={1}
                                            onValueChange={setHungerValue}
                                            onPointerDown={() => setIsSliderActive(true)}
                                            onPointerUp={() => setIsSliderActive(false)}
                                            aria-label="Hunger"
                    />
                    </TooltipTrigger>
                      <TooltipContent side="top" align="center" className="data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-100 data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=open]:fade-in-100">
                         {getHungerEmoji(hungerValue[0])}
                      </TooltipContent>
                  </Tooltip>
                      <div style={{color: '#1E1E1E'}}>Famished 😫</div>
                  </TooltipProvider>
                  </div>
                 
                                          <Label htmlFor="budget" style={{color: '#1E1E1E'}}>Pocket Feeling (Pricing)</Label>
               <div className="flex items-center justify-between">
                    <div style={{color: '#1E1E1E'}}>Stingy 😒</div>
                  <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                    <Slider
                      defaultValue={[50]}
                                  max={100}
                      step={1}
                                            onValueChange={setBudgetValue}
                                            onPointerDown={() => setIsSliderActive(true)}
                                            onPointerUp={() => setIsSliderActive(false)}
                                            aria-label="Budget"
                    />
                    </TooltipTrigger>
                      <TooltipContent side="top" align="center" className="data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-100 data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=open]:fade-in-100">
                         {getBudgetEmoji(budgetValue[0])}
                      </TooltipContent>
                  </Tooltip>
                      <div style={{color: '#1E1E1E'}}>Fancy 🤑</div>
                  </TooltipProvider>
                  </div>
          </div>
        </CardContent>
      </Card>

      {/* Roll the Dice Button */}
      {isShaking ? (
        <div className="flex flex-col items-center">
          <Progress value={50} className="w-full max-w-md mb-2" />
          <p className="text-sm text-muted-foreground">
            Shaking up your meal...
          </p>
        </div>
      ) : (
        <Button
          className="w-full max-w-md mb-4 shadow-sm"
          style={{ backgroundColor: "#55D519", color: "white" }}
          onClick={decideMeal}
        >
          Roll the Dice 🎲
        </Button>
      )}
    </div>
  );
}


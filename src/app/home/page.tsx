
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ShakeEvent } from "@/components/shake-event";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bagel_Fat_One, Poppins } from "next/font/google";
import Image from "next/image";
import { db, seedRestaurants } from "@/services/firebase"; // Assuming db and seedRestaurants might be used elsewhere
import { MapPin } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { imageList, currentRestaurantList, timeRanges } from "@/lib/data"; // Import data from lib
import {
  getCurrentMealType,
  getGreeting,
  getMoodEmoji,
  getHungerEmoji,
  getBudgetEmoji,
  getDineTypeEmoji,
  getSpicyEmoji,
} from "@/lib/utils"; // Import utils from lib
import type {
  Restaurant,
  MealItem,
  HomemadeMeal,
  SelectedMealResult,
} from "@/lib/interfaces"; // Import interfaces
import { hasCookie, setCookie, getCookie } from "cookies-next";

const bagel = Bagel_Fat_One({ subsets: ["latin"], weight: "400" });

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Define the type for the state holding the selected meal/restaurant info
type SelectionResult = {
  meal: MealItem;
  restaurant?: Restaurant;
  isHomemade: boolean;
} | null;


export default function Home() {
  // State management
  const [selectedMeal, setSelectedMeal] = useState<SelectionResult>(null);
  const [lastSelectedMealIdentifier, setLastSelectedMealIdentifier] = useState<string | null>(null);
  const [customMeals, setCustomMeals] = useState<MealItem[]>([]); // Assuming custom meals follow MealItem structure
  const [isShaking, setIsShaking] = useState(false);
  const [imageUrl, setImageUrl] = useState(imageList[0]);
  const [moodValue, setMoodValue] = useState<number[]>([50]);
  const [hungerValue, setHungerValue] = useState<number[]>([50]);
  const [budgetValue, setBudgetValue] = useState<number[]>([50]);
  const [dineTypeValue, setDineTypeValue] = useState<number[]>([50]); // 0-50 Eat In, 51-100 Eat Out
  const [spicyValue, setSpicyValue] = useState<number[]>([50]);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [isSliderActive, setIsSliderActive] = useState(false);
  const [locationPermissionRequested, setLocationPermissionRequested] = useState(false);


  const { toast } = useToast();

  // --- Effects ---

   useEffect(() => {
    const permissionCookie = getCookie('locationPermissionRequested');
    if (permissionCookie) {
      setLocationPermissionRequested(true);
      // Optionally, try getting location again if already requested but failed
       getLocation();
    } else {
       getLocation(); // Request on first visit if no cookie
    }
  }, []); // Run only once on mount


  // Load custom meals from local storage (example, needs better structure)
  useEffect(() => {
    const storedMeals = localStorage.getItem(`customMeals`); // Simplified key
    if (storedMeals) {
      try {
        setCustomMeals(JSON.parse(storedMeals));
      } catch (e) {
        console.error("Failed to parse custom meals from localStorage", e);
      }
    }
  }, []);

  // Save custom meals to local storage
  useEffect(() => {
    localStorage.setItem(`customMeals`, JSON.stringify(customMeals));
  }, [customMeals]);


    // Get user's current location using Geolocation API and Nominatim
   const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setCurrentLocation("Geolocation not supported");
      setLoadingLocation(false);
      setLocationPermissionRequested(true); // Mark as requested even if not supported
      setCookie('locationPermissionRequested', 'true', { maxAge: 60 * 60 * 24 * 365 }); // Set cookie for a year
      return;
    }

    if (locationPermissionRequested) {
       setLoadingLocation(false); // Don't repeatedly ask if already handled
       return;
    }

     setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || "Unknown City";
            const country = data.address.country || "Unknown Country";
            setCurrentLocation(`${city}, ${country}`);
          } else {
            setCurrentLocation("Location details unavailable");
          }
        } catch (error) {
          console.error("Error fetching location details:", error);
          setCurrentLocation("Location lookup failed");
        } finally {
          setLoadingLocation(false);
           setLocationPermissionRequested(true);
          setCookie('locationPermissionRequested', 'true', { maxAge: 60 * 60 * 24 * 365 });
        }
      },
      (error) => {
        console.error("Error getting geolocation:", error);
         if (error.code === error.PERMISSION_DENIED) {
             setCurrentLocation("Location permission denied");
         } else {
            setCurrentLocation("Location unavailable");
         }
        setLoadingLocation(false);
        setLocationPermissionRequested(true);
         setCookie('locationPermissionRequested', 'true', { maxAge: 60 * 60 * 24 * 365 });
      }
    );
  }, [locationPermissionRequested]); // Depend on permission requested state


  // --- Meal Decision Logic ---

  const decideMeal = () => {
    setIsShaking(true);

    setTimeout(() => {
      setIsShaking(false);

      const currentMealTime = getCurrentMealType(); // "Breakfast", "Lunch", "Dinner"
      const isEatIn = dineTypeValue[0] <= 50;

      let potentialMeals: { meal: MealItem; restaurant?: Restaurant; isHomemade: boolean }[] = [];

      // Determine location based on current display or default
      // For now, hardcoding to Jamaica as location selection is removed. Adapt if needed.
      const selectedLocation: keyof typeof currentRestaurantList = 'Jamaica'; // Hardcoded to Jamaica for now
      const locationData = currentRestaurantList[selectedLocation];


      if (isEatIn) {
        // Get homemade meals for the current meal time
        const homemadeMealNames = locationData.homemade[currentMealTime] || [];
         potentialMeals = homemadeMealNames.map(name => ({
             meal: { name }, // Create a basic MealItem
             isHomemade: true
         }));
      } else {
        // Get restaurant meals for the current meal time
        locationData.restaurants.forEach(restaurant => {
          const mealTimeKey = currentMealTime.toLowerCase() as keyof Restaurant['menu'];
          const mealsForTime = restaurant.menu[mealTimeKey];
          if (mealsForTime) {
            mealsForTime.forEach(meal => {
              potentialMeals.push({ meal, restaurant, isHomemade: false });
            });
          }
        });
      }

       // Add custom meals (assuming they fit MealItem structure and are always available)
      // customMeals.forEach(meal => {
      //     potentialMeals.push({ meal, isHomemade: false }); // Treat custom as eat-out for now
      // });


        // Filter out the last selected meal
        let filteredMeals = potentialMeals;
        if (lastSelectedMealIdentifier) {
            filteredMeals = potentialMeals.filter(({ meal, restaurant, isHomemade }) => {
                const identifier = isHomemade ? `homemade-${meal.name}` : `${restaurant?.name}-${meal.name}`;
                return identifier !== lastSelectedMealIdentifier;
            });
        }


       // --- Filtering based on sliders (Conceptual - Implement actual filtering logic here) ---
       // Example: Filter by budget
      const budgetMaxPriceLevel = budgetValue[0] <= 33 ? 1 : (budgetValue[0] <= 66 ? 3 : 5);
       filteredMeals = filteredMeals.filter(({ restaurant, isHomemade }) => {
           if (isHomemade) return true; // Homemade meals bypass budget filter for now
           return restaurant ? restaurant.price_level <= budgetMaxPriceLevel : true; // Allow if no price level
       });

       // Example: Filter by spice level (only if restaurant meal has spicy_level)
        const maxSpice = spicyValue[0]; // Use slider value directly
         filteredMeals = filteredMeals.filter(({ meal }) => {
             // Keep meals without spicy_level or if level is within range
             return typeof meal.spicy_level === 'undefined' || meal.spicy_level <= maxSpice;
         });


      // --- Final Selection ---
      if (filteredMeals.length === 0) {
        // If no meals match after filtering, try selecting from the *original* potential meals
        if (potentialMeals.length === 0) {
             toast({
                title: "No meals available!",
                description: `Couldn't find any ${currentMealTime} options. Try adjusting filters or adding custom meals.`,
                variant: "destructive",
            });
            return;
        }
        // Fallback to original list if filters are too strict
         filteredMeals = potentialMeals.filter(({ meal, restaurant, isHomemade }) => {
             const identifier = isHomemade ? `homemade-${meal.name}` : `${restaurant?.name}-${meal.name}`;
             return identifier !== lastSelectedMealIdentifier;
         });
         if (filteredMeals.length === 0) filteredMeals = potentialMeals; // Allow repeat if only one option
      }


      const randomIndex = Math.floor(Math.random() * filteredMeals.length);
      const newSelected = filteredMeals[randomIndex];

      setSelectedMeal(newSelected);

       // Set identifier for the next roll to avoid repetition
      const newIdentifier = newSelected.isHomemade
            ? `homemade-${newSelected.meal.name}`
            : `${newSelected.restaurant?.name}-${newSelected.meal.name}`;
        setLastSelectedMealIdentifier(newIdentifier);


      // Change image
      const randomImageIndex = Math.floor(Math.random() * imageList.length);
      setImageUrl(imageList[randomImageIndex]);

    }, 1000); // Shorter delay
  };

  const handleShake = useCallback(() => {
    if (!isSliderActive) { // Only shake if sliders are not being actively used
        decideMeal();
    }
  }, [decideMeal, isSliderActive]); // Add dependencies


  // --- Render ---
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-white">
      <Toaster />
       <ShakeEvent onShake={handleShake} threshold={20} shakeInterval={500} />

      {/* Top Bar with Logo and Location */}
        <div className="w-full flex justify-between items-center p-4 bg-white sticky top-0 z-10">
         <Image
          src="https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2FNumnum-logo.png?alt=media"
          alt="NumNum Logo"
          width={150}
          height={75}
          className="rounded-md"
          priority // Prioritize loading the logo
        />
         <div className="flex items-center space-x-1">
             <p className={`${poppins.className} text-xs text-[#1E1E1E]`}>
                  {loadingLocation ? "Loading location..." : currentLocation || "Location Unknown"}
             </p>
             <MapPin className="h-5 w-5 text-gray-500" />
         </div>
      </div>


      {/* Today's Pick Card */}
      <Card
        className="w-full max-w-md mb-4 shadow-md rounded-lg"
        style={{ backgroundColor: "white", borderColor: "#C1C1C1" }}
      >
        <CardHeader>
          <CardTitle className={`text-lg font-semibold text-left text-[#1E1E1E]`}>
            Today's Pick
          </CardTitle>
          <Image
            src={imageUrl} // Dynamic image URL
            alt="Today's Pick"
            width={200}
            height={100}
            className="rounded-md mt-2 mx-auto"
             priority // Prioritize loading the main image
          />
        </CardHeader>
         <CardContent className="flex flex-col items-start">
          {selectedMeal ? (
            <>
              <p className="text-md font-medium text-primary">
                 {selectedMeal.isHomemade ? (
                    "Homemade Meal"
                 ) : selectedMeal.restaurant ? (
                   <>
                     Restaurant:{" "}
                     <span className="font-bold">{selectedMeal.restaurant.name}</span>
                   </>
                 ) : (
                   "Custom Meal" // Or handle custom restaurant name if added
                 )}
              </p>
               <p className="text-md font-medium mt-1">
                 Meal: <span className="font-bold">{selectedMeal.meal.name}</span>
               </p>
                {selectedMeal.meal.description && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedMeal.meal.description}</p>
                )}
                {typeof selectedMeal.meal.spicy_level !== 'undefined' && (
                     <p className="text-sm text-muted-foreground mt-1">Spice: {getSpicyEmoji(selectedMeal.meal.spicy_level, 100)}</p>
                 )}
                 {selectedMeal.meal.price && (
                     <p className="text-sm text-muted-foreground mt-1">Price: {selectedMeal.meal.price}</p>
                 )}
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
         <CardContent className={`${poppins.className} space-y-5`}> {/* Increased space */}

          {/* Dine Type Slider */}
           <div className="grid gap-2">
             <Label htmlFor="dinetype" style={{color: '#1E1E1E'}}>Dine Type</Label>
               <div className="flex items-center justify-between">
                    <div style={{color: '#1E1E1E'}}>Eat In 🏠</div>
                  <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                    <Slider
                      defaultValue={[50]}
                       value={dineTypeValue}
                        max={100}
                      step={1}
                         onValueChange={setDineTypeValue}
                         onPointerDown={() => setIsSliderActive(true)}
                         onPointerUp={() => setIsSliderActive(false)}
                         aria-label="Dine Type"
                         className="w-[60%]" // Adjust width as needed
                    />
                    </TooltipTrigger>
                      <TooltipContent side="top" align="center">
                         {getDineTypeEmoji(dineTypeValue[0], 100)}
                      </TooltipContent>
                  </Tooltip>
                  </TooltipProvider>
                    <div style={{color: '#1E1E1E'}}>Eat Out 🛵</div>
                </div>
            </div>

             {/* Mood Slider */}
           <div className="grid gap-2">
               <Label htmlFor="mood" style={{color: '#1E1E1E'}}>Mood</Label>
               <div className="flex items-center justify-between">
                 <div style={{color: '#1E1E1E'}}>Sad ☹️ </div>
                 <TooltipProvider>
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Slider
                          value={moodValue}
                         max={100}
                         step={1}
                          onValueChange={setMoodValue}
                         onPointerDown={() => setIsSliderActive(true)}
                          onPointerUp={() => setIsSliderActive(false)}
                         aria-label="Mood"
                         className="w-[60%]"
                       />
                     </TooltipTrigger>
                     <TooltipContent side="top" align="center">
                       {getMoodEmoji(moodValue[0], 100)}
                     </TooltipContent>
                   </Tooltip>
                 </TooltipProvider>
                 <div style={{color: '#1E1E1E'}}>Adventurous 🥳 </div>
               </div>
             </div>

              {/* Hunger Level Slider */}
             <div className="grid gap-2">
                 <Label htmlFor="hunger" style={{color: '#1E1E1E'}}>Hunger Level</Label>
                 <div className="flex items-center justify-between">
                     <div style={{color: '#1E1E1E'}}>Peckish 🤤</div>
                     <TooltipProvider>
                         <Tooltip>
                             <TooltipTrigger asChild>
                                 <Slider
                                     value={hungerValue}
                                     max={100}
                                     step={1}
                                     onValueChange={setHungerValue}
                                     onPointerDown={() => setIsSliderActive(true)}
                                     onPointerUp={() => setIsSliderActive(false)}
                                     aria-label="Hunger Level"
                                     className="w-[60%]"
                                 />
                             </TooltipTrigger>
                             <TooltipContent side="top" align="center">
                                 {getHungerEmoji(hungerValue[0], 100)}
                             </TooltipContent>
                         </Tooltip>
                     </TooltipProvider>
                     <div style={{color: '#1E1E1E'}}>Famished 😫</div>
                 </div>
             </div>

              {/* Budget Slider */}
               <div className="grid gap-2">
                   <Label htmlFor="budget" style={{color: '#1E1E1E'}}>Pocket Feeling (Pricing)</Label>
                   <div className="flex items-center justify-between">
                       <div style={{color: '#1E1E1E'}}>Stingy 😒</div>
                       <TooltipProvider>
                           <Tooltip>
                               <TooltipTrigger asChild>
                                   <Slider
                                       value={budgetValue}
                                       max={100}
                                       step={1}
                                       onValueChange={setBudgetValue}
                                       onPointerDown={() => setIsSliderActive(true)}
                                       onPointerUp={() => setIsSliderActive(false)}
                                       aria-label="Budget"
                                       className="w-[60%]"
                                   />
                               </TooltipTrigger>
                               <TooltipContent side="top" align="center">
                                   {getBudgetEmoji(budgetValue[0], 100)}
                               </TooltipContent>
                           </Tooltip>
                       </TooltipProvider>
                       <div style={{color: '#1E1E1E'}}>Fancy 🤑</div>
                   </div>
               </div>

               {/* Spicy Level Slider */}
              <div className="grid gap-2">
                  <Label htmlFor="spicy" style={{color: '#1E1E1E'}}>Spicy Level</Label>
                  <div className="flex items-center justify-between">
                      <div style={{color: '#1E1E1E'}}>No Spice 😇</div>
                      <TooltipProvider>
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <Slider
                                      value={spicyValue}
                                      max={100}
                                      step={1}
                                      onValueChange={setSpicyValue}
                                      onPointerDown={() => setIsSliderActive(true)}
                                      onPointerUp={() => setIsSliderActive(false)}
                                      aria-label="Spicy Level"
                                      className="w-[60%]"
                                  />
                              </TooltipTrigger>
                              <TooltipContent side="top" align="center">
                                  {getSpicyEmoji(spicyValue[0], 100)}
                              </TooltipContent>
                          </Tooltip>
                      </TooltipProvider>
                      <div style={{color: '#1E1E1E'}}>Fire Breather 🔥🔥🔥</div>
                  </div>
              </div>


        </CardContent>
      </Card>

      {/* Roll the Dice Button */}
      <div className="w-full max-w-md mb-4">
          {isShaking ? (
            <div className="flex flex-col items-center">
              <Progress value={50} className="w-full mb-2" />
              <p className="text-sm text-muted-foreground">
                Shaking up your meal...
              </p>
            </div>
          ) : (
            <Button
              className="w-full shadow-sm rounded-full" // Added rounded-full
              style={{ backgroundColor: "#55D519", color: "white" }}
              onClick={decideMeal}
            >
              Roll the Dice 🎲
            </Button>
          )}
      </div>

    </div> // Close main container div
  );
}

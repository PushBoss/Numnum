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
import { db, seedRestaurants } from "@/services/firebase"; // Assuming seedRestaurants is still needed for fallback
import { auth } from "@/lib/firebaseClient"; // Import auth from client file
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuthState } from 'react-firebase-hooks/auth';
import { MapPin } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { imageList, currentRestaurantList as localRestaurantData } from "@/lib/data"; // Keep local data for fallback
import { getCurrentMealType, getGreeting, getMoodEmoji, getHungerEmoji, getBudgetEmoji, getDineTypeEmoji, getSpicyEmoji } from "@/lib/utils";
import type { SelectedMealResult, Suggestion, UserPreferences, Restaurant as LocalRestaurant, MealItem } from "@/lib/interfaces"; // Ensure MealItem is imported
import { doc, setDoc, getDoc } from "firebase/firestore";

const bagel = Bagel_Fat_One({ subsets: ["latin"], weight: "400" });

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Need this client-side for image URLs

export default function Home() {
  const [user, loadingAuth, errorAuth] = useAuthState(auth);
  const functions = getFunctions(); // Get functions instance
  const restaurantFinder = httpsCallable<{preferences: UserPreferences}, {suggestions: Suggestion[]}>(functions, 'restaurantFinder');

  const [selectedResult, setSelectedResult] = useState<SelectedMealResult | null>(null);
  const [lastResult, setLastResult] = useState<SelectedMealResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [imageUrl, setImageUrl] = useState(imageList[0]); // For the card image

  // User Preferences State
  const [preferences, setPreferences] = useState<UserPreferences>({
    latitude: undefined,
    longitude: undefined,
    mood_level: 50,
    hunger_level: 50,
    dine_preference: 50, // 'eat_out' by default
    budget_level: 50,
    spicy_level: 50,
    locationPermissionGranted: undefined,
  });

  const [currentLocationDisplay, setCurrentLocationDisplay] = useState<string | null>("Fetching location...");
  const [isSliderActive, setIsSliderActive] = useState(false);
  const { toast } = useToast();

   // Effect to ask for location permission on mount if not already granted/denied
   useEffect(() => {
    const checkLocationPermission = async () => {
      if (preferences.locationPermissionGranted !== undefined) {
        if (preferences.locationPermissionGranted) {
            getLocation(); // Get location if permission was previously granted
        } else {
            setCurrentLocationDisplay("Location permission denied");
        }
        return; // Don't ask again if status is known
      }

      if (navigator.geolocation) {
        navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
          if (permissionStatus.state === 'granted') {
            setPreferences(prev => ({ ...prev, locationPermissionGranted: true }));
            getLocation();
          } else if (permissionStatus.state === 'prompt') {
            // Ask for permission - this happens implicitly with getCurrentPosition
             getLocation(); // This will trigger the browser prompt
          } else {
            // Denied
            setPreferences(prev => ({ ...prev, locationPermissionGranted: false }));
            setCurrentLocationDisplay("Location permission denied");
            toast({ title: "Location Needed", description: "Please enable location services to find nearby restaurants.", variant: "destructive" });
          }
          permissionStatus.onchange = () => {
             if (permissionStatus.state === 'granted') {
                setPreferences(prev => ({ ...prev, locationPermissionGranted: true }));
                getLocation();
            } else {
                 setPreferences(prev => ({ ...prev, locationPermissionGranted: false }));
                 setCurrentLocationDisplay("Location permission denied");
            }
          };
        });
      } else {
        setCurrentLocationDisplay("Geolocation not supported");
        setPreferences(prev => ({ ...prev, locationPermissionGranted: false }));
      }
    };

    if (user) { // Only run if user is logged in
        checkLocationPermission();
    } else if (!loadingAuth) {
        setCurrentLocationDisplay("Login required");
    }
  }, [user, loadingAuth]); // Re-run if user logs in/out

   // Function to get the user's current location
    const getLocation = () => {
        if (!navigator.geolocation) {
            setCurrentLocationDisplay("Geolocation not supported");
            setPreferences(prev => ({ ...prev, locationPermissionGranted: false }));
            return;
        }

        setCurrentLocationDisplay("Fetching location..."); // Indicate fetching
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setPreferences(prev => ({
              ...prev,
              latitude,
              longitude,
              locationTimestamp: Date.now(),
              locationPermissionGranted: true, // Explicitly set granted on success
            }));

            // Fetch city/country (Reverse Geocoding)
             try {
              // Using OpenStreetMap Nominatim API (free, requires attribution)
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
              );
              const data = await response.json();
              if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown City';
                const country = data.address.country || 'Unknown Country';
                setCurrentLocationDisplay(`${city}, ${country}`);
              } else {
                setCurrentLocationDisplay("Location name unavailable");
              }
            } catch (error) {
              console.error("Error getting location name:", error);
              setCurrentLocationDisplay("Location name error");
            }

            // Save preferences to Firestore
            if (user) {
                saveUserPreferences({ ...preferences, latitude, longitude, locationPermissionGranted: true });
            }
          },
          (error) => {
            console.error("Error getting geolocation:", error);
            setCurrentLocationDisplay("Location unavailable");
             setPreferences(prev => ({ ...prev, locationPermissionGranted: false })); // Permission denied or error
            toast({ title: "Location Error", description: error.message, variant: "destructive" });
             if (user) {
                 saveUserPreferences({ ...preferences, locationPermissionGranted: false }); // Save denied status
             }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Options
        );
    };

   // Function to save preferences to Firestore
    const saveUserPreferences = async (prefsToSave: UserPreferences) => {
        if (!user || !db) return; // Ensure db is initialized
        const userPrefsRef = doc(db, "user_preferences", user.uid);
        try {
        await setDoc(userPrefsRef, prefsToSave, { merge: true }); // Use merge to avoid overwriting unrelated fields
        // logger.info("User preferences saved to Firestore for user:", user.uid);
        } catch (error) {
        console.error("Error saving user preferences:", error);
        toast({ title: "Error", description: "Could not save preferences.", variant: "destructive" });
        }
    };

    // Effect to load preferences from Firestore when user logs in
    useEffect(() => {
        const loadUserPreferences = async () => {
        if (!user || !db) return; // Ensure db is initialized
        const userPrefsRef = doc(db, "user_preferences", user.uid);
        try {
            const docSnap = await getDoc(userPrefsRef);
            if (docSnap.exists()) {
            const loadedPrefs = docSnap.data() as UserPreferences;
            setPreferences(prev => ({ ...prev, ...loadedPrefs })); // Merge loaded prefs with defaults/current state
            // logger.info("User preferences loaded from Firestore for user:", user.uid);
            // If location is present and permission granted, update display name
                if (loadedPrefs.latitude && loadedPrefs.longitude && loadedPrefs.locationPermissionGranted) {
                    try {
                        const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loadedPrefs.latitude}&lon=${loadedPrefs.longitude}`
                        );
                        const data = await response.json();
                         if (data && data.address) {
                            const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown City';
                            const country = data.address.country || 'Unknown Country';
                            setCurrentLocationDisplay(`${city}, ${country}`);
                        } else {
                            setCurrentLocationDisplay("Location name unavailable");
                        }
                    } catch(e) {
                        setCurrentLocationDisplay("Location name error");
                    }
                } else if (!loadedPrefs.locationPermissionGranted) {
                     setCurrentLocationDisplay("Location permission denied");
                }

            } else {
            // logger.info("No preferences found for user, using defaults:", user.uid);
            // If no prefs saved, attempt to get location immediately if permission might be granted
                 if (preferences.locationPermissionGranted !== false) {
                    getLocation();
                 }
            }
        } catch (error) {
            console.error("Error loading user preferences:", error);
            toast({ title: "Error", description: "Could not load preferences.", variant: "destructive" });
        }
        };

        loadUserPreferences();
    }, [user]); // Rerun when user changes

   // --- Meal Decision Logic ---
    const decideMeal = async () => {
        if (!user) {
        toast({ title: "Login Required", description: "Please log in to get meal suggestions.", variant: "destructive" });
        return;
        }
        if (preferences.latitude === undefined || preferences.longitude === undefined) {
             toast({ title: "Location Needed", description: "Enable location to find nearby restaurants.", variant: "destructive" });
             getLocation(); // Attempt to get location again
            return;
        }

        setIsRolling(true);
        setImageUrl(imageList[Math.floor(Math.random() * imageList.length)]); // Change image immediately

        try {
            const result = await restaurantFinder({ preferences });
            const suggestions = result.data.suggestions;

            if (suggestions && suggestions.length > 0) {
                // Filter out the last selected result IF it came from the API
                let filteredSuggestions = suggestions;
                 if (lastResult && lastResult.isApiSuggestion) {
                    filteredSuggestions = suggestions.filter(s => s.place_id !== (lastResult.restaurant as Suggestion)?.place_id);
                     if (filteredSuggestions.length === 0 && suggestions.length > 0) {
                        // If filtering removed all, just use the original list but maybe pick a different one
                        filteredSuggestions = suggestions;
                    }
                }

                 if (filteredSuggestions.length === 0) {
                    // This should rarely happen if the above logic is correct, but as a fallback:
                    toast({ title: "Try again!", description: "Found suggestions, but trying to avoid repeats." });
                     setIsRolling(false);
                    return;
                 }


                const randomIndex = Math.floor(Math.random() * filteredSuggestions.length);
                const newSelectedSuggestion = filteredSuggestions[randomIndex];

                const newResult: SelectedMealResult = {
                    restaurant: newSelectedSuggestion,
                    isHomemade: false,
                    isApiSuggestion: true,
                };
                setSelectedResult(newResult);
                setLastResult(newResult); // Store the selected suggestion

            } else {
                // Fallback to local data if API returns no results
                toast({ title: "Using Local Data", description: "Couldn't find nearby places matching criteria, using fallback list." });
                decideMealFromLocalData(); // Call the local fallback
            }

        } catch (error: any) {
            console.error("Error calling restaurantFinder function:", error);
            toast({ title: "Error Finding Restaurants", description: error.message || "Could not get suggestions.", variant: "destructive" });
             // Fallback to local data on error
            decideMealFromLocalData();
        } finally {
            setIsRolling(false);
        }
    };

    // Fallback function using local data
    const decideMealFromLocalData = () => {
         const currentMealType = getCurrentMealType();
        // Determine location based on fetched coordinates if possible, else default
        // This needs a more robust way to map lat/lng to Jamaica/Trinidad if using local data strictly
         const locationKey: "Jamaica" | "Trinidad" = "Jamaica"; // Basic default, improve if needed

        const locationData = localRestaurantData[locationKey];
        if (!locationData) {
            toast({ title: "Error", description: "Invalid location data.", variant: "destructive"});
            return;
        }

         const isEatIn = preferences.dine_preference <= 50; // Example mapping

        let availableMeals: { meal: string; restaurant?: string; isHomemade: boolean }[] = [];

         if (isEatIn) {
            const homemadeMeals = locationData.homemade[currentMealType] || [];
             availableMeals = homemadeMeals.map(meal => ({ meal, isHomemade: true }));
        } else {
            availableMeals = locationData.restaurants.flatMap(restaurant => {
                 const mealsForTime = restaurant.menu[currentMealType] || [];
                 return mealsForTime.map(mealItem => ({ meal: mealItem.name, restaurant: restaurant.name, isHomemade: false }));
            });
        }

         // Filter out the last selected meal IF it came from local data
         let filteredMeals = availableMeals;
          if (lastResult && !lastResult.isApiSuggestion) {
            filteredMeals = availableMeals.filter(
                (m) => !(m.meal === lastResult.meal?.name && m.restaurant === (lastResult.restaurant as LocalRestaurant)?.name)
            );
             if (filteredMeals.length === 0 && availableMeals.length > 0) {
                filteredMeals = availableMeals; // Avoid getting stuck if only one option
             }
        }


        if (filteredMeals.length === 0) {
            toast({
            title: "No meals available!",
            description: `No ${currentMealType} meals found for your criteria in the local list.`,
            });
            return;
        }

        const randomIndex = Math.floor(Math.random() * filteredMeals.length);
        const newSelectedLocalMeal = filteredMeals[randomIndex];

        // Find the full MealItem and Restaurant details from local data if possible
        let mealDetail: MealItem | undefined;
        let restaurantDetail: LocalRestaurant | undefined;
         if (!newSelectedLocalMeal.isHomemade && newSelectedLocalMeal.restaurant) {
             restaurantDetail = locationData.restaurants.find(r => r.name === newSelectedLocalMeal.restaurant);
             if (restaurantDetail) {
                 const menuTime = restaurantDetail.menu[currentMealType];
                 mealDetail = menuTime?.find(m => m.name === newSelectedLocalMeal.meal);
             }
         } else if (newSelectedLocalMeal.isHomemade) {
            mealDetail = { name: newSelectedLocalMeal.meal }; // Simple object for homemade
         }


        const newResult: SelectedMealResult = {
            meal: mealDetail || { name: newSelectedLocalMeal.meal }, // Fallback to just name if details not found
            restaurant: restaurantDetail,
            isHomemade: newSelectedLocalMeal.isHomemade,
            isApiSuggestion: false,
        };

        setSelectedResult(newResult);
        setLastResult(newResult);
    };


    const handleShake = () => {
        decideMeal();
    };

     // Update preferences state and save to Firestore on slider change
     const handlePreferenceChange = (key: keyof UserPreferences, value: number) => {
        const newPrefs = { ...preferences, [key]: value };
        setPreferences(newPrefs);
        saveUserPreferences(newPrefs); // Debounce this in a real app
    };

    const getPhotoUrl = (photoReference?: string): string => {
        if (!photoReference || !GOOGLE_MAPS_API_KEY) {
        // Return a placeholder or a default image from your imageList
        return imageList[Math.floor(Math.random() * imageList.length)];
        }
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
    };


  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-white">
      <Toaster />
       {typeof window !== 'undefined' && <ShakeEvent onShake={handleShake} />} {/* Ensure ShakeEvent runs client-side */}

       {/* Top Bar with Logo and Location */}
      <div className="w-full flex justify-between items-center p-4 bg-white">
         <Image
          src="https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2FNumnum-logo.png?alt=media"
          alt="NumNum Logo"
          width={150}
          height={75}
          className="rounded-md"
          priority // Prioritize loading the logo
        />
         <div className="flex items-center">
             <p className={`${poppins.className} text-xs mr-1`} style={{ color: '#1E1E1E' }}>
               {currentLocationDisplay || "Location Unknown"}
            </p>
            <MapPin className="h-5 w-5 text-gray-600" />
         </div>
      </div>

       {/* Today's Pick Card */}
       <Card
         className="w-full max-w-md mb-4 shadow-md rounded-lg"
         style={{ backgroundColor: "white", borderColor: "#C1C1C1" }}
       >
         <CardHeader className="text-left"> {/* Ensure header content is left-aligned */}
           <CardTitle className={`text-lg font-semibold text-left`} style={{color: '#1E1E1E'}}>
             Today's Pick
           </CardTitle>
            {/* Conditional image rendering */}
           {selectedResult && selectedResult.restaurant ? (
             <Image
                src={getPhotoUrl((selectedResult.restaurant as Suggestion)?.photo_reference)}
                alt={selectedResult.restaurant.name || "Meal image"}
                width={200}
                height={100}
                className="rounded-md mt-2 mx-auto object-cover" // Added object-cover
                unoptimized={!GOOGLE_MAPS_API_KEY} // Avoid optimizing if using placeholder
              />
           ) : (
               <Image
                    src={imageUrl} // Show placeholder from list initially or if no suggestion
                    alt="Placeholder meal image"
                    width={200}
                    height={100}
                    className="rounded-md mt-2 mx-auto object-cover"
                />
           )}
         </CardHeader>
         <CardContent className="flex flex-col items-start">
            {selectedResult ? (
              <>
                 <p className="text-md font-medium text-primary">
                  {selectedResult.restaurant && (
                    <>
                      {selectedResult.isApiSuggestion ? "Restaurant" : (selectedResult.isHomemade ? "Source" : "Restaurant")}:{" "}
                      <span className="font-bold">{selectedResult.isHomemade ? "Homemade" : selectedResult.restaurant.name}</span>
                      <br />
                    </>
                  )}
                   Meal: <span className="font-bold">{selectedResult.meal?.name || "Suggestion"}</span>
                   {selectedResult.isApiSuggestion && (selectedResult.restaurant as Suggestion)?.rating && (
                       <><br/>Rating: <span className="font-bold">{(selectedResult.restaurant as Suggestion).rating}⭐</span></>
                   )}
                   {selectedResult.isApiSuggestion && (selectedResult.restaurant as Suggestion)?.distance !== undefined && (
                       <><br/>Distance: <span className="font-bold">{~~((selectedResult.restaurant as Suggestion).distance! / 1609)} mi</span></> // Approx miles
                   )}
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
          <div className="grid gap-4"> {/* Increased gap */}

             {/* Dine Type Slider */}
             <div className="grid gap-2">
                <Label htmlFor="dinetype" style={{color: '#1E1E1E'}}>Dine Type</Label>
                 <div className="flex items-center justify-between">
                      <div style={{color: '#1E1E1E'}}>Eat In 🏠</div>
                    <TooltipProvider>
                    <Tooltip open={isSliderActive}>
                      <TooltipTrigger asChild>
                      <Slider
                        value={[preferences.dine_preference]}
                        max={100}
                        step={1}
                        onValueChange={(value) => handlePreferenceChange('dine_preference', value[0])}
                        onPointerDown={() => setIsSliderActive(true)}
                        onPointerUp={() => setIsSliderActive(false)}
                        aria-label="Dine Type"
                         className="w-[60%]" // Adjust width as needed
                      />
                      </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                           {getDineTypeEmoji(preferences.dine_preference, 100)}
                        </TooltipContent>
                    </Tooltip>
                        <div style={{color: '#1E1E1E'}}>Eat Out 🛵</div>
                    </TooltipProvider>
                    </div>
             </div>

             {/* Mood Slider */}
              <div className="grid gap-2">
                 <Label htmlFor="mood" style={{color: '#1E1E1E'}}>Mood</Label>
                 <div className="flex items-center justify-between">
                      <div style={{color: '#1E1E1E'}}>Sad ☹️</div>
                    <TooltipProvider>
                    <Tooltip open={isSliderActive}>
                      <TooltipTrigger asChild>
                      <Slider
                         value={[preferences.mood_level]}
                        max={100}
                        step={1}
                         onValueChange={(value) => handlePreferenceChange('mood_level', value[0])}
                        onPointerDown={() => setIsSliderActive(true)}
                        onPointerUp={() => setIsSliderActive(false)}
                        aria-label="Mood"
                         className="w-[60%]"
                      />
                      </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          {getMoodEmoji(preferences.mood_level, 100)}
                        </TooltipContent>
                    </Tooltip>
                        <div style={{color: '#1E1E1E'}}>Adventurous 🥳</div>
                    </TooltipProvider>
                    </div>
              </div>

             {/* Hunger Level Slider */}
              <div className="grid gap-2">
                 <Label htmlFor="hunger" style={{color: '#1E1E1E'}}>Hunger Level</Label>
                  <div className="flex items-center justify-between">
                       <div style={{color: '#1E1E1E'}}>Peckish 🤤</div>
                     <TooltipProvider>
                     <Tooltip open={isSliderActive}>
                       <TooltipTrigger asChild>
                       <Slider
                          value={[preferences.hunger_level]}
                         max={100}
                         step={1}
                           onValueChange={(value) => handlePreferenceChange('hunger_level', value[0])}
                           onPointerDown={() => setIsSliderActive(true)}
                            onPointerUp={() => setIsSliderActive(false)}
                         aria-label="Hunger"
                           className="w-[60%]"
                       />
                       </TooltipTrigger>
                         <TooltipContent side="top" align="center">
                            {getHungerEmoji(preferences.hunger_level, 100)}
                         </TooltipContent>
                     </Tooltip>
                         <div style={{color: '#1E1E1E'}}>Famished 😫</div>
                     </TooltipProvider>
                     </div>
              </div>

               {/* Budget Slider */}
                <div className="grid gap-2">
                    <Label htmlFor="budget" style={{color: '#1E1E1E'}}>Pocket Feeling (Pricing)</Label>
                     <div className="flex items-center justify-between">
                          <div style={{color: '#1E1E1E'}}>Stingy 😒</div>
                        <TooltipProvider>
                        <Tooltip open={isSliderActive}>
                          <TooltipTrigger asChild>
                          <Slider
                             value={[preferences.budget_level]}
                            max={100}
                            step={1}
                               onValueChange={(value) => handlePreferenceChange('budget_level', value[0])}
                               onPointerDown={() => setIsSliderActive(true)}
                               onPointerUp={() => setIsSliderActive(false)}
                            aria-label="Budget"
                              className="w-[60%]"
                          />
                          </TooltipTrigger>
                            <TooltipContent side="top" align="center">
                               {getBudgetEmoji(preferences.budget_level, 100)}
                            </TooltipContent>
                        </Tooltip>
                            <div style={{color: '#1E1E1E'}}>Fancy 🤑</div>
                        </TooltipProvider>
                        </div>
                 </div>

                 {/* Spicy Level Slider */}
                <div className="grid gap-2">
                    <Label htmlFor="spicy" style={{color: '#1E1E1E'}}>Spicy Level</Label>
                     <div className="flex items-center justify-between">
                          <div style={{color: '#1E1E1E'}}>No Spice 😇</div>
                        <TooltipProvider>
                        <Tooltip open={isSliderActive}>
                          <TooltipTrigger asChild>
                          <Slider
                             value={[preferences.spicy_level]}
                            max={100}
                            step={1}
                             onValueChange={(value) => handlePreferenceChange('spicy_level', value[0])}
                            onPointerDown={() => setIsSliderActive(true)}
                            onPointerUp={() => setIsSliderActive(false)}
                            aria-label="Spicy Level"
                             className="w-[60%]"
                          />
                          </TooltipTrigger>
                            <TooltipContent side="top" align="center">
                              {getSpicyEmoji(preferences.spicy_level, 100)}
                            </TooltipContent>
                        </Tooltip>
                            <div style={{color: '#1E1E1E'}}>Fire 🔥🔥🔥</div>
                        </TooltipProvider>
                        </div>
                </div>
          </div>
        </CardContent>
      </Card>

       {/* Roll the Dice Button */}
      {isRolling ? (
        <div className="flex flex-col items-center w-full max-w-md mb-4">
          <Progress value={50} className="w-full mb-2 animate-pulse" /> {/* Added animate-pulse */}
          <p className="text-sm text-muted-foreground">
            Rolling the dice...
          </p>
        </div>
      ) : (
        <Button
          className="w-full max-w-md mb-4 shadow-sm rounded-full" // Added rounded-full
          style={{ backgroundColor: "#55D519", color: "white" }}
          onClick={decideMeal}
          disabled={loadingAuth || preferences.latitude === undefined} // Disable if loading auth or location unknown
        >
          Roll the Dice 🎲
        </Button>
      )}
    </div>
  );
}

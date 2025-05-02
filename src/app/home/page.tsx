"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ShakeEvent } from "@/components/shake-event";
import { Progress } from "@/components/ui/progress";
import { Bagel_Fat_One, Poppins } from "next/font/google";
import Image from "next/image";
import { db } from "@/services/firebase"; // Assuming db is needed for saving preferences
import { auth } from "@/lib/firebaseClient"; // Import auth from client file
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuthState } from 'react-firebase-hooks/auth';
import { MapPin } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { imageList, currentRestaurantList as localRestaurantData } from "@/lib/data"; // Keep local data
import { getCurrentMealType, getGreeting, getMoodEmoji, getHungerEmoji, getBudgetEmoji, getDineTypeEmoji, getSpicyEmoji } from "@/lib/utils";
import type { SelectedMealResult, Suggestion, UserPreferences, Restaurant as LocalRestaurant, MealItem } from "@/lib/interfaces"; // Ensure MealItem is imported
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Label } from "@/components/ui/label";

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
    dine_preference: 50, // Start in the middle
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
        // console.info("User preferences saved to Firestore for user:", user.uid);
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
            // Only update preferences if they exist in Firestore, keeping local defaults otherwise
            const validLoadedPrefs = Object.fromEntries(
                Object.entries(loadedPrefs).filter(([_, v]) => v !== undefined && v !== null)
            );
            setPreferences(prev => ({ ...prev, ...validLoadedPrefs }));
            // console.info("User preferences loaded from Firestore for user:", user.uid);
            // If location is present and permission granted, update display name
                if (loadedPrefs.latitude && loadedPrefs.longitude && loadedPrefs.locationPermissionGranted !== false) {
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
                } else if (loadedPrefs.locationPermissionGranted === false) {
                     setCurrentLocationDisplay("Location permission denied");
                } else {
                    // If location isn't saved, try getting it
                    getLocation();
                }

            } else {
             // console.info("No preferences found for user, using defaults and getting location:", user.uid);
             // If no prefs saved, attempt to get location immediately
                 getLocation();
            }
        } catch (error) {
            console.error("Error loading user preferences:", error);
            toast({ title: "Error", description: "Could not load preferences.", variant: "destructive" });
        }
        };

        if (user) {
            loadUserPreferences();
        } else {
             // Reset preferences to default if user logs out
             setPreferences({
                latitude: undefined,
                longitude: undefined,
                mood_level: 50,
                hunger_level: 50,
                dine_preference: 50,
                budget_level: 50,
                spicy_level: 50,
                locationPermissionGranted: undefined,
            });
            setCurrentLocationDisplay("Login required");
        }
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

        const isEatIn = preferences.dine_preference <= 50;

        if (isEatIn) {
            // Logic for Eating In (use local homemade data)
            decideMealFromLocalData();
            setIsRolling(false); // Stop rolling animation for local data decision
        } else {
            // Logic for Eating Out (use API)
            try {
                const result = await restaurantFinder({ preferences });
                const suggestions = result.data.suggestions;

                if (suggestions && suggestions.length > 0) {
                    let filteredSuggestions = suggestions;
                    if (lastResult && lastResult.isApiSuggestion) {
                        filteredSuggestions = suggestions.filter(s => s.place_id !== (lastResult.restaurant as Suggestion)?.place_id);
                        if (filteredSuggestions.length === 0 && suggestions.length > 0) {
                            filteredSuggestions = suggestions; // Avoid getting stuck
                        }
                    }

                    if (filteredSuggestions.length === 0) {
                        toast({ title: "Try again!", description: "Found suggestions, but trying to avoid repeats." });
                        setIsRolling(false);
                        return;
                    }

                    const randomIndex = Math.floor(Math.random() * filteredSuggestions.length);
                    const newSelectedSuggestion = filteredSuggestions[randomIndex];

                    const newResult: SelectedMealResult = {
                        restaurant: newSelectedSuggestion,
                        meal: { name: newSelectedSuggestion.name }, // Use restaurant name as meal name for API results initially
                        isHomemade: false,
                        isApiSuggestion: true,
                    };
                    setSelectedResult(newResult);
                    setLastResult(newResult);

                } else {
                    // Fallback to local data if API returns no results (for Eat Out scenario)
                    toast({ title: "Using Local Data", description: "Couldn't find nearby places, using local restaurant list." });
                    decideMealFromLocalData(true); // Pass flag indicating it's an Eat Out fallback
                }

            } catch (error: any) {
                console.error("Error calling restaurantFinder function:", error);
                toast({ title: "Error Finding Restaurants", description: error.message || "Could not get suggestions.", variant: "destructive" });
                // Fallback to local data on error (for Eat Out scenario)
                decideMealFromLocalData(true); // Pass flag indicating it's an Eat Out fallback
            } finally {
                setIsRolling(false);
            }
        }
    };

    // Fallback function using local data
    const decideMealFromLocalData = (isEatOutFallback = false) => {
         const currentMealType = getCurrentMealType();
         // Determine location based on fetched coordinates if possible, else default
         // Basic mapping: Use Trinidad if longitude is more westerly (greater negative value)
         const locationKey: "Jamaica" | "Trinidad" = (preferences.longitude ?? -76) < -65 ? "Trinidad" : "Jamaica";

         const locationData = localRestaurantData[locationKey];
         if (!locationData) {
             toast({ title: "Error", description: "Invalid location data.", variant: "destructive"});
             return;
         }

         let availableMeals: { meal: MealItem; restaurant?: LocalRestaurant; isHomemade: boolean }[] = [];

          // Get custom meals from localStorage (consider moving this to state if needed more broadly)
          let customMeals: MealItem[] = [];
          try {
              const storedMeals = localStorage.getItem('customMeals');
              if (storedMeals) {
                  customMeals = JSON.parse(storedMeals).map((m: { meal: string; restaurant?: string }) => ({ name: m.meal }));
              }
          } catch (e) {
              console.error("Error parsing custom meals from localStorage", e);
          }


         if (!isEatOutFallback) { // Eat In scenario
             const homemadeMealsForTime = locationData.homemade[currentMealType] || [];
             // Combine local homemade and custom meals
             const allPossibleHomemade = [...homemadeMealsForTime.map(name => ({ name })), ...customMeals];
             availableMeals = allPossibleHomemade.map(mealItem => ({
                meal: mealItem,
                isHomemade: true
             }));
         } else { // Eat Out fallback scenario
             availableMeals = locationData.restaurants.flatMap(restaurant => {
                 const mealsForTime = restaurant.menu[currentMealType] || [];
                 return mealsForTime.map(mealItem => ({
                    meal: mealItem,
                    restaurant: restaurant,
                    isHomemade: false
                 }));
             });
         }

          // Filter out the last selected meal IF it came from local data
          let filteredMeals = availableMeals;
           if (lastResult && !lastResult.isApiSuggestion) {
               filteredMeals = availableMeals.filter(m => !(
                   m.meal.name === lastResult.meal?.name &&
                   (m.isHomemade === lastResult.isHomemade) && // Ensure same source type
                   (!m.isHomemade && !lastResult.isHomemade && m.restaurant?.name === (lastResult.restaurant as LocalRestaurant)?.name) // Match restaurant if not homemade
               ));
               if (filteredMeals.length === 0 && availableMeals.length > 0) {
                  filteredMeals = availableMeals; // Avoid getting stuck
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
         const newSelectedLocalMealData = filteredMeals[randomIndex];

         const newResult: SelectedMealResult = {
             meal: newSelectedLocalMealData.meal,
             restaurant: newSelectedLocalMealData.restaurant, // Will be undefined for homemade
             isHomemade: newSelectedLocalMealData.isHomemade,
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
        // Debounce this in a real app for performance
        saveUserPreferences(newPrefs);
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
      {typeof window !== 'undefined' && <ShakeEvent onShake={handleShake} />}

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
         <CardHeader className="text-left">
           <CardTitle className={`text-lg font-semibold text-left`} style={{color: '#1E1E1E'}}>
             Today's Pick
           </CardTitle>
           {/* Conditional image rendering */}
            <Image
                src={selectedResult && selectedResult.isApiSuggestion ? getPhotoUrl((selectedResult.restaurant as Suggestion)?.photo_reference) : imageUrl}
                alt={selectedResult?.meal?.name || "Meal image"}
                width={200}
                height={100}
                className="rounded-md mt-2 mx-auto object-cover" // Added object-cover
                unoptimized={!GOOGLE_MAPS_API_KEY && selectedResult?.isApiSuggestion} // Avoid optimizing placeholders or if API key missing for Places photos
             />
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
                   {!selectedResult.isApiSuggestion && !selectedResult.isHomemade && (selectedResult.restaurant as LocalRestaurant)?.rating && (
                     <><br/>Rating: <span className="font-bold">{(selectedResult.restaurant as LocalRestaurant).rating}⭐</span></>
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
                    <Tooltip open={isSliderActive && preferences.dine_preference !== undefined}>
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
                    <Tooltip open={isSliderActive && preferences.mood_level !== undefined}>
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
                     <Tooltip open={isSliderActive && preferences.hunger_level !== undefined}>
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
                        <Tooltip open={isSliderActive && preferences.budget_level !== undefined}>
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
                        <Tooltip open={isSliderActive && preferences.spicy_level !== undefined}>
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


"use client";

import { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ShakeEvent } from "@/components/shake-event";
import { Progress } from "@/components/ui/progress";
import { Poppins, Bagel_Fat_One } from "next/font/google";
import Image from "next/image";
import { db, auth } from "@/lib/firebaseClient"; // Import client-side auth and db
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuthState } from 'react-firebase-hooks/auth';
import { MapPin, ThumbsUp, ThumbsDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getGreeting, getMoodEmoji, getHungerEmoji, getBudgetEmoji, getDineTypeEmoji, getSpicyEmoji, getCurrentMealType } from "@/lib/utils";
import { currentRestaurantList, imageList, timeRanges } from '@/lib/data'; // Import local data
import type { LocationData, MealItem, LocalRestaurant, UserPreferences, Suggestion, SelectedMealResult } from '@/lib/interfaces'; // Import interfaces
import { doc, getDoc, setDoc, collection, addDoc, getDocs } from "firebase/firestore"; // Firestore imports
import { hasCookie, setCookie } from 'cookies-next'; // Import cookie helpers

const bagel = Bagel_Fat_One({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });


export default function Home() {
  const [user, loadingAuth, errorAuth] = auth ? useAuthState(auth) : [null, true, null];
  const functions = auth ? getFunctions() : null; // Get functions instance only if auth is available
  const restaurantFinder = functions ? httpsCallable<{preferences: UserPreferences}, {suggestions: Suggestion[]}>(functions, 'restaurantFinder') : null;

  const [selectedResult, setSelectedResult] = useState<SelectedMealResult | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isRolling, setIsRolling] = useState(false); // To prevent multiple clicks/shakes
  const [location, setLocation] = useState<{ city: string; country: string } | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    mood_level: 50,
    hunger_level: 50,
    dine_preference: 50, // Default to middle (mix of eat in/out or moderate distance)
    budget_level: 50,
    spicy_level: 50,
  });
  const [feedbackGiven, setFeedbackGiven] = useState(false); // Track feedback for current suggestion
  const lastSelectedMealRef = useRef<SelectedMealResult | null>(null); // Ref to track last selection
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState(imageList[Math.floor(Math.random() * imageList.length)]); // Initialize with random
  const [hasAskedLocation, setHasAskedLocation] = useState(false);


  // Fetch or set location permission cookie
  useEffect(() => {
    if (hasCookie('locationPermissionAsked')) {
      setHasAskedLocation(true);
    }
  }, []);

  // Get user's location
  const getLocation = () => {
    if (!navigator.geolocation) {
       toast({ title: "Location Error", description: "Geolocation is not supported by this browser.", variant: "destructive" });
       setLocation({ city: "Unsupported", country: "Browser" });
       return;
    }

    // Only set cookie if we haven't asked before during this session/lifetime
    if (!hasAskedLocation) {
        setCookie('locationPermissionAsked', 'true', { maxAge: 60 * 60 * 24 * 30 }); // Set cookie for 30 days
        setHasAskedLocation(true); // Update state immediately
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
         setUserLocation({ latitude, longitude });
         setPreferences(prev => ({ ...prev, latitude, longitude })); // Store in preferences state
        // Use a reverse geocoding service
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || "Unknown City";
          const country = data.address.country || "Unknown Country";
          setLocation({ city, country });
          // Save country preference if it's Jamaica or Trinidad
          if (country === 'Jamaica' || country === 'Trinidad') {
            setPreferences(prev => ({ ...prev, country: country as 'Jamaica' | 'Trinidad' }));
          }
        } catch (error) {
          console.error("Error fetching location name:", error);
          setLocation({ city: "Unknown", country: "Location" }); // Fallback
           toast({ title: "Location Error", description: "Could not determine location name.", variant: "destructive" });
        }
      },
      (error) => {
        console.error("Error getting location:", error);
         toast({ title: "Location Error", description: "Could not get location. Please enable location services.", variant: "destructive" });
        setLocation({ city: "Enable", country: "Location" }); // Prompt user
        // Clear location from preferences if permission is denied
        setPreferences(prev => ({ ...prev, latitude: undefined, longitude: undefined }));
        setUserLocation(null);
      }
    );
  };

  // Fetch user preferences from Firestore on login and attempt location fetching
  useEffect(() => {
    const fetchUserDataAndLocation = async () => {
        // Add check for db instance
        if (user && db) {
            // Fetch Preferences first
            const prefsRef = doc(db, 'user_preferences', user.uid);
            const docSnap = await getDoc(prefsRef);
            let fetchedPrefs: Partial<UserPreferences> = {};
            if (docSnap.exists()) {
                fetchedPrefs = docSnap.data() as Partial<UserPreferences>;
                console.log("Fetched preferences:", fetchedPrefs);
            } else {
                console.log("No preferences found for user, will use defaults and save.");
                // Optionally save default preferences if none exist later
            }

             // Attempt to get current location
            if (navigator.geolocation) {
                if (!hasAskedLocation) {
                    setCookie('locationPermissionAsked', 'true', { maxAge: 60 * 60 * 24 * 30 });
                    setHasAskedLocation(true);
                }
                 navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        setUserLocation({ latitude, longitude });
                         // Reverse geocode
                        try {
                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                            const data = await response.json();
                            const city = data.address.city || data.address.town || data.address.village || "Unknown City";
                            const country = data.address.country || "Unknown Country";
                            setLocation({ city, country });

                            // Update preferences state with fetched prefs AND current location
                            setPreferences(prev => ({
                                ...prev, // Keep component defaults initially
                                ...fetchedPrefs, // Overwrite with Firestore prefs
                                latitude, // Overwrite with current location
                                longitude, // Overwrite with current location
                                country: (country === 'Jamaica' || country === 'Trinidad') ? country as 'Jamaica' | 'Trinidad' : fetchedPrefs.country // Set country if applicable
                            }));
                        } catch (error) {
                            console.error("Error fetching location name:", error);
                             setLocation({ city: "Error", country: "Geocoding" });
                             // Update preferences state with fetched prefs but NO current location
                             setPreferences(prev => ({
                                 ...prev,
                                 ...fetchedPrefs,
                                 latitude: fetchedPrefs.latitude, // Use potentially saved lat/lng
                                 longitude: fetchedPrefs.longitude,
                             }));
                        }
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                        toast({ title: "Location Error", description: "Could not get location. Please enable location services.", variant: "destructive" });
                         setLocation({ city: "Enable", country: "Location" });
                         // Update preferences state with fetched prefs but NO current location
                          setPreferences(prev => ({
                            ...prev,
                            ...fetchedPrefs,
                            latitude: fetchedPrefs.latitude, // Use potentially saved lat/lng
                            longitude: fetchedPrefs.longitude,
                        }));
                        setUserLocation(null);
                    }
                );
            } else {
                toast({ title: "Location Error", description: "Geolocation is not supported.", variant: "destructive" });
                setLocation({ city: "Unsupported", country: "Browser" });
                // Update preferences state with fetched prefs but NO current location
                 setPreferences(prev => ({
                    ...prev,
                    ...fetchedPrefs,
                    latitude: fetchedPrefs.latitude,
                    longitude: fetchedPrefs.longitude,
                }));
            }
        } else if (!loadingAuth && !user) { // Handle logged out state
             setPreferences({
                 mood_level: 50,
                 hunger_level: 50,
                 dine_preference: 50,
                 budget_level: 50,
                 spicy_level: 50,
             });
             setLocation(null); // Clear location display
             setUserLocation(null);
             setSelectedResult(null); // Clear suggestion
             lastSelectedMealRef.current = null;
             setFeedbackGiven(false);
        } else if (user && !db) {
            console.log("User logged in but DB not yet initialized. Waiting for DB...");
            // Optionally, you could set a state here to indicate waiting for DB
        }
    };

    fetchUserDataAndLocation();

  }, [user, loadingAuth, db, hasAskedLocation]); // Re-run when user logs in/out or cookie status known


  // Save user preferences to Firestore (debounced)
  const saveUserPreferences = async (prefsToSave: UserPreferences) => {
    // Add check for db instance
    if (!user || !db) {
        console.log("Cannot save preferences: User not logged in or DB not initialized.");
        return;
    }
    // Ensure lat/lng are numbers before saving
    const cleanedPrefs = {
        ...prefsToSave,
        latitude: typeof prefsToSave.latitude === 'number' ? prefsToSave.latitude : undefined,
        longitude: typeof prefsToSave.longitude === 'number' ? prefsToSave.longitude : undefined,
    };

    const prefsRef = doc(db, 'user_preferences', user.uid);
    try {
      await setDoc(prefsRef, cleanedPrefs, { merge: true }); // Merge to avoid overwriting unrelated fields
      console.log("Preferences saved:", cleanedPrefs);
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({ title: "Error", description: "Could not save preferences.", variant: "destructive" });
    }
  };


  // Debounce preference saving
  useEffect(() => {
    const handler = setTimeout(() => {
      if (user && !loadingAuth && db) { // Only save if user is logged in, not loading auth state, AND db is available
        // Pass only the necessary fields for UserPreferences
        const prefsToSave: UserPreferences = {
            mood_level: preferences.mood_level,
            hunger_level: preferences.hunger_level,
            dine_preference: preferences.dine_preference,
            budget_level: preferences.budget_level,
            spicy_level: preferences.spicy_level,
            // Include location and country only if they are valid
            ...(userLocation && { latitude: userLocation.latitude, longitude: userLocation.longitude }),
            ...(preferences.country && { country: preferences.country }),
             ...(preferences.favoriteMeals && { favoriteMeals: preferences.favoriteMeals }),
             ...(preferences.favoriteRestaurants && { favoriteRestaurants: preferences.favoriteRestaurants }),
        };
        saveUserPreferences(prefsToSave);
      }
    }, 1000); // Save after 1 second of inactivity

    return () => {
      clearTimeout(handler);
    };
  }, [preferences, user, loadingAuth, userLocation, db]); // Depend on preferences, user state, auth loading, userLocation, and db


   // --- Helper to get the best Photo URL ---
   const getPhotoUrl = (result: SelectedMealResult | null): string => {
        // If no result yet, or rolling, show a random image
        if (!result || isRolling) {
            return imageList[Math.floor(Math.random() * imageList.length)];
        }

        // 1. Prioritize API Suggestion Photo (Google Places)
        if (result.isApiSuggestion && (result.restaurant as Suggestion)?.photo_reference && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
            return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${(result.restaurant as Suggestion).photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
        }

        // 2. Use Specific Local Restaurant Image URL if available (not homemade)
        if (!result.isHomemade && (result.restaurant as LocalRestaurant)?.image_url) {
            return (result.restaurant as LocalRestaurant).image_url!;
        }

         // 3. Fallback to a random image from the list if no specific image found
         const randomIndex = Math.floor(Math.random() * imageList.length);
         return imageList[randomIndex];
     };


  // Decide Meal Logic
  const decideMeal = async () => {
     if (isRolling || loadingAuth) return; // Prevent multiple simultaneous rolls or if auth is loading

     if (!user) {
        toast({ title: "Login Required", description: "Please log in to get meal suggestions.", variant: 'destructive' });
        return;
      }

     setIsRolling(true);
     setFeedbackGiven(false); // Reset feedback state for new suggestion
     // Fetch a new random image URL for the rolling state
     setImageUrl(imageList[Math.floor(Math.random() * imageList.length)]);


     const isEatIn = preferences.dine_preference <= 50; // Determine based on slider
     let finalResult: SelectedMealResult | null = null;

     // Ensure location data exists in preferences before proceeding with API call
     if (!isEatIn && (preferences.latitude === undefined || preferences.longitude === undefined)) {
         toast({ title: "Location Needed", description: "Please enable location services or ensure it's saved in your profile.", variant: "destructive" });
         setIsRolling(false);
         return;
     }


     if (isEatIn) {
         // --- Logic for Eating In (Homemade + Custom from Firestore) ---
        finalResult = await decideMealFromLocalData(false); // Fetch custom meals inside
     } else {
         // --- Logic for Eating Out (API Call or Local Restaurant Fallback) ---
         if (!restaurantFinder) {
              toast({ title: "Error", description: "Restaurant finding service unavailable.", variant: "destructive" });
              setIsRolling(false);
              return;
          }

         try {
            // Prepare preferences for the API call, ensuring lat/lng exist
            const apiPreferences: UserPreferences = {
                ...preferences,
                latitude: preferences.latitude!, // Use non-null assertion as we checked above
                longitude: preferences.longitude!,
            };

             const result = await restaurantFinder({ preferences: apiPreferences });
             const suggestions = result.data.suggestions;

             if (suggestions && suggestions.length > 0) {
                 // Filter out the very last selected API suggestion to avoid immediate repeats
                 const filteredSuggestions = suggestions.filter(s =>
                     !lastSelectedMealRef.current || !lastSelectedMealRef.current.isApiSuggestion || s.place_id !== (lastSelectedMealRef.current.restaurant as Suggestion).place_id
                 );

                 if (filteredSuggestions.length === 0 && suggestions.length > 0) {
                    // If filtering removed all, just use the original list's first item
                    finalResult = {
                        restaurant: suggestions[0],
                        meal: { name: suggestions[0].name }, // Use restaurant name as meal initially
                        isHomemade: false,
                        isApiSuggestion: true,
                    };
                 } else if (filteredSuggestions.length > 0){
                    const randomIndex = Math.floor(Math.random() * filteredSuggestions.length);
                    const newSelectedSuggestion = filteredSuggestions[randomIndex];
                    finalResult = {
                       restaurant: newSelectedSuggestion,
                       meal: { name: newSelectedSuggestion.name }, // Use restaurant name as meal initially
                       isHomemade: false,
                       isApiSuggestion: true,
                     };
                 } else {
                      // No suggestions at all from API
                     toast({ title: "Using Local Restaurants", description: "Couldn't find nearby places, showing local options." });
                     finalResult = await decideMealFromLocalData(true); // Fallback to local restaurants
                 }

             } else {
                 toast({ title: "Using Local Restaurants", description: "Couldn't find nearby places, showing local options." });
                 finalResult = await decideMealFromLocalData(true); // Fallback to local restaurants
             }

         } catch (error: any) {
             console.error("Error calling restaurantFinder:", error);
             toast({ title: "Error Finding Restaurants", description: error.details || error.message || "Could not fetch suggestions. Using local options.", variant: "destructive" });
             finalResult = await decideMealFromLocalData(true); // Fallback on error
         }
     }

     // --- Update State After Decision ---
     if (finalResult) {
         setSelectedResult(finalResult);
         lastSelectedMealRef.current = finalResult; // Update ref
         setImageUrl(getPhotoUrl(finalResult)); // Set image based on the final result
     } else {
         // Handle case where no result was found
         setSelectedResult(null);
         setImageUrl(getPhotoUrl(null)); // Set to default random image
         toast({ title: "No suggestions found", description: "Try adjusting your preferences!", variant: "destructive" });
     }

     setIsRolling(false); // Stop rolling after processing
   };

 // Helper to get custom meals from Firestore
  const getCustomMeals = async (): Promise<MealItem[]> => {
    // Add check for db instance
    if (!user || !db) {
        console.log("Cannot get custom meals: User not logged in or DB not initialized.");
        return [];
    }
    try {
      const mealsColRef = collection(db, "users", user.uid, "custom_meals");
      const querySnapshot = await getDocs(mealsColRef);
      const fetchedMeals: MealItem[] = [];
      querySnapshot.forEach((doc) => {
         // Map Firestore data to MealItem structure if needed
         const data = doc.data();
         fetchedMeals.push({ name: data.meal, description: data.restaurant || undefined });
      });
      return fetchedMeals;
    } catch (error) {
      console.error("Error fetching custom meals:", error);
      return []; // Return empty array on error
    }
  };


  // Decide Meal From Local Data (Handles Eat-In and Eat-Out Fallback)
  const decideMealFromLocalData = async (isEatOutFallback = false): Promise<SelectedMealResult | null> => {
      const currentMealType = getCurrentMealType();
      // Determine the user's effective country for local data
      // Prioritize saved preference, then current location, then default to Jamaica
      const locationKey = preferences.country || (location?.country === 'Jamaica' || location?.country === 'Trinidad' ? location.country : 'Jamaica');
      const locationData = currentRestaurantList[locationKey];

      if (!locationData) {
          toast({ title: "Error", description: `Could not load local data for ${locationKey}.`, variant: "destructive" });
          return null;
      }

      let availableResults: SelectedMealResult[] = [];

      if (isEatOutFallback) {
          // Fallback for Eat Out: Use local RESTAURANTS only for the current meal time
          locationData.restaurants.forEach(restaurant => {
              const mealsForTime = restaurant.menu[currentMealType];
              if (mealsForTime) {
                  mealsForTime.forEach(meal => {
                      availableResults.push({
                          restaurant: restaurant, // Store the full LocalRestaurant object
                          meal: meal,
                          isHomemade: false,
                          isApiSuggestion: false,
                      });
                  });
              }
          });
      } else {
           // Eat In: Use HOMEMADE meals for the current meal time + CUSTOM meals
           const homemadeMealsForTime = locationData.homemade[currentMealType] || [];
           homemadeMealsForTime.forEach(mealName => {
               availableResults.push({
                   restaurant: { name: "Homemade", location: { address: '', latitude: 0, longitude: 0 }, cuisine_type: 'Home', menu: {}, price_level: 0 }, // Dummy restaurant for homemade
                   meal: { name: mealName },
                   isHomemade: true,
                   isApiSuggestion: false,
               });
           });

           // Fetch and add custom meals
           const customMealsList = await getCustomMeals();
           customMealsList.forEach(customMeal => {
                availableResults.push({
                     restaurant: customMeal.description ? { name: customMeal.description, location: { address: '', latitude: 0, longitude: 0 }, cuisine_type: 'Custom', menu: {}, price_level: 0 } : { name: "Custom Meal", location: { address: '', latitude: 0, longitude: 0 }, cuisine_type: 'Custom', menu: {}, price_level: 0 },
                     meal: { name: customMeal.name },
                     isHomemade: !customMeal.description, // Consider it homemade if no restaurant specified
                     isApiSuggestion: false,
                 });
           });
      }

      if (availableResults.length === 0) {
          toast({ title: "No Options", description: `No ${isEatOutFallback ? 'local restaurants' : 'homemade or custom meals'} found for ${currentMealType} in ${locationKey}.`, variant: "destructive"});
          return null;
      }

      // Filter out the last selected *local* meal to avoid immediate repeats
      const filteredResults = availableResults.filter(result => {
        if (!lastSelectedMealRef.current || lastSelectedMealRef.current.isApiSuggestion || lastSelectedMealRef.current.isHomemade !== result.isHomemade) {
          return true; // Keep if last was API or different type (homemade vs restaurant)
        }
        // Compare local restaurants by name, homemade/custom meals by name
        const lastRestName = (lastSelectedMealRef.current.restaurant as LocalRestaurant).name;
        const currentRestName = (result.restaurant as LocalRestaurant).name;
        const lastMealName = lastSelectedMealRef.current.meal.name;
        const currentMealName = result.meal.name;

        if(result.isHomemade){
            return lastMealName !== currentMealName;
        } else {
             // For restaurant meals, compare both restaurant and meal name for more variety
            return !(lastRestName === currentRestName && lastMealName === currentMealName);
        }
      });


      if (filteredResults.length === 0 && availableResults.length > 0) {
           // If filtering removed everything, just pick randomly from the original list
           const randomIndex = Math.floor(Math.random() * availableResults.length);
           return availableResults[randomIndex];
      } else if (filteredResults.length > 0) {
            const randomIndex = Math.floor(Math.random() * filteredResults.length);
            return filteredResults[randomIndex];
      } else {
            // Should not happen if availableResults had items, but handle defensively
            toast({ title: "No Options", description: `No suitable ${isEatOutFallback ? 'local restaurants' : 'homemade or custom meals'} found for ${currentMealType} in ${locationKey}.`, variant: "destructive"});
            return null;
      }
  };


  // Shake Handler
  const handleShake = () => {
    if (!isRolling && !loadingAuth) { // Prevent triggering during roll or auth loading
      decideMeal();
    }
  };

  // Preference Change Handler
   const handlePreferenceChange = (key: keyof UserPreferences, value: number | string) => {
     setPreferences(prev => ({ ...prev, [key]: value }));
     // Debounced saving happens in the useEffect hook
   };


  // Handle Feedback
   const handleFeedback = async (liked: boolean) => {
     // Add check for db instance
     if (!user || !selectedResult || feedbackGiven || !db) {
         console.log("Cannot record feedback: User not logged in, no result, feedback already given, or DB not initialized.");
         return;
     }

     setFeedbackGiven(true); // Mark feedback as given for this suggestion

     const feedbackData = {
       userId: user.uid,
       suggestion: {
         restaurantName: (selectedResult.restaurant as LocalRestaurant | Suggestion).name,
         mealName: selectedResult.meal.name,
         isApi: selectedResult.isApiSuggestion,
         isHomemade: selectedResult.isHomemade,
         placeId: selectedResult.isApiSuggestion ? (selectedResult.restaurant as Suggestion).place_id : undefined,
       },
       preferencesSnapshot: preferences, // Capture preferences at the time of feedback
       liked: liked,
       timestamp: new Date(),
     };

     try {
       // Store feedback in Firestore (e.g., in a 'feedback' collection)
       await addDoc(collection(db, "feedback"), feedbackData);
       toast({ title: "Feedback Recorded", description: "Thanks for your feedback!" });
       // --- TODO: Optional Gemini Integration Call ---
       // Call your Gemini function here if configured
       // Example:
       // const updateProfileFunction = httpsCallable(functions, 'updateUserProfileWithGemini');
       // await updateProfileFunction({ feedback: feedbackData });
       // toast({ title: "Profile Updated", description: "Thanks! Your preferences are learning." });

     } catch (error) {
       console.error("Error saving feedback:", error);
       toast({ title: "Error", description: "Could not save feedback.", variant: "destructive" });
       setFeedbackGiven(false); // Allow trying again if saving failed
     }
   };


  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-white">
      <Toaster />
       {/* Conditionally render ShakeEvent only on client-side */}
       {typeof window !== 'undefined' && <ShakeEvent onShake={handleShake} />}


      {/* Top Bar */}
        <div className="w-full flex justify-between items-center p-4 bg-white">
           {/* Logo */}
           <Image
             src="https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2FNumnum-logo.png?alt=media"
             alt="NumNum Logo"
             width={150} // Adjust width as needed
             height={40} // Adjust height as needed
             className="object-contain" // Maintain aspect ratio
             data-ai-hint="logo brand company"
           />
           {/* Location */}
            <div className="flex items-center space-x-1">
              <p className={`${poppins.className} text-[10px]`} style={{ color: '#1E1E1E' }}>
                  {loadingAuth ? "Loading..." : location ? `${location.city}, ${location.country}` : "Getting Location..."}
              </p>
             <MapPin className="h-4 w-4 text-gray-500" />
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
              <Image
                 src={imageUrl} // Use the imageUrl state variable
                 alt={selectedResult?.meal?.name || "Meal suggestion"}
                 width={200}
                 height={100}
                 className="rounded-md mt-2 mx-auto object-cover"
                 data-ai-hint="meal food plate restaurant dish logo" // Update hint
                 key={imageUrl} // Add key to force re-render when URL changes
              />
          </CardHeader>
         <CardContent className="flex flex-col items-start">
           {isRolling ? (
              <div className="w-full flex flex-col items-center">
                  <Progress value={50} className="w-full mb-2" />
                  <p className="text-sm text-muted-foreground">Shaking up your meal...</p>
              </div>
           ) : selectedResult ? (
             <>
               <p className="text-md font-medium" style={{ color: '#1E1E1E' }}>
                 {selectedResult.isHomemade
                   ? "Homemade"
                   : selectedResult.restaurant?.name || "Restaurant"}
               </p>
               <p className="text-lg font-bold mb-2" style={{ color: '#1E1E1E' }}>
                 {selectedResult.meal.name}
               </p>
               {!selectedResult.isHomemade && (selectedResult.restaurant as Suggestion)?.address && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {(selectedResult.restaurant as Suggestion).address}
                  </p>
                )}
               {!selectedResult.isHomemade && (selectedResult.restaurant as Suggestion)?.distance && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Approx. {((selectedResult.restaurant as Suggestion).distance! / 1609).toFixed(1)} miles away
                  </p>
                )}

               {/* Feedback Buttons */}
                {!feedbackGiven && user && ( // Only show if user is logged in and hasn't given feedback
                  <div className="flex justify-center space-x-4 w-full mt-2">
                    <Button variant="ghost" size="icon" onClick={() => handleFeedback(false)} aria-label="Dislike suggestion">
                      <ThumbsDown className="h-6 w-6 text-red-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleFeedback(true)} aria-label="Like suggestion">
                      <ThumbsUp className="h-6 w-6 text-green-500" />
                    </Button>
                  </div>
                )}
                 {feedbackGiven && <p className="text-sm text-green-600 text-center w-full mt-2">Thanks for the feedback!</p>}
             </>
           ) : (
              <p className="text-muted-foreground">{loadingAuth ? "Loading..." : getGreeting()}</p>
           )}
         </CardContent>
       </Card>

      {/* Meal Picker Card */}
      <Card className={`w-full max-w-md mb-4 shadow-md rounded-lg ${poppins.className}`} style={{backgroundColor: 'white', borderColor: '#C1C1C1', color: '#1E1E1E'}}>
        <CardHeader>
          <CardTitle className={`${bagel.className} text-lg font-semibold`} style={{color: '#1E1E1E'}}>Meal Picker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6"> {/* Increased spacing */}


           {/* Mood Slider */}
            <div className="grid gap-2">
                 <Label htmlFor="mood" style={{color: '#1E1E1E'}}>Mood</Label>
                 <div className="flex justify-between text-xs mb-1" style={{color: '#1E1E1E'}}>
                   <span>Faves 🤩</span>
                   <span>Adventurous 🥳</span>
                 </div>
                 <TooltipProvider>
                     <Tooltip>
                         <TooltipTrigger asChild>
                               <Slider
                                  id="mood"
                                  min={0}
                                  max={100}
                                  step={1}
                                  value={[preferences.mood_level]}
                                  onValueChange={(value) => handlePreferenceChange('mood_level', value[0])}
                                  className="w-full"
                                  thumbClassName="flex items-center justify-center" // Class for the thumb
                                >
                                   {/* Emoji inside thumb - updated logic in ui/slider.tsx */}
                                </Slider>
                          </TooltipTrigger>
                          <TooltipContent>
                             <p>{getMoodEmoji(preferences.mood_level, 100)} {preferences.mood_level === 50 ? 'Neutral' : preferences.mood_level < 50 ? 'Faves' : 'Adventurous'}</p>
                          </TooltipContent>
                      </Tooltip>
                 </TooltipProvider>
                 {/* Scale markings */}
                  <div className="flex justify-between text-xs mt-1" style={{color: '#1E1E1E'}}>
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
            </div>

             {/* Hunger Slider */}
            <div className="grid gap-2">
              <Label htmlFor="hunger" style={{color: '#1E1E1E'}}>Hunger Level</Label>
                 <div className="flex justify-between text-xs mb-1" style={{color: '#1E1E1E'}}>
                   <span>Peckish 🤤</span>
                   <span>Famished 😫</span>
                 </div>
                 <TooltipProvider>
                     <Tooltip>
                         <TooltipTrigger asChild>
                              <Slider
                                id="hunger"
                                min={0}
                                max={100}
                                step={1}
                                value={[preferences.hunger_level]}
                                onValueChange={(value) => handlePreferenceChange('hunger_level', value[0])}
                                className="w-full"
                                thumbClassName="flex items-center justify-center"
                              />
                          </TooltipTrigger>
                          <TooltipContent>
                             <p>{getHungerEmoji(preferences.hunger_level, 100)} {preferences.hunger_level <= 50 ? 'Peckish' : 'Famished'}</p>
                          </TooltipContent>
                      </Tooltip>
                 </TooltipProvider>
                  <div className="flex justify-between text-xs mt-1" style={{color: '#1E1E1E'}}>
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
            </div>


            {/* Budget Slider */}
            <div className="grid gap-2">
              <Label htmlFor="budget" style={{color: '#1E1E1E'}}>Pocket Feeling (Budget)</Label>
                <div className="flex justify-between text-xs mb-1" style={{color: '#1E1E1E'}}>
                   <span>Stingy 😒</span>
                   <span>Fancy 🤑</span>
                 </div>
               <TooltipProvider>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Slider
                          id="budget"
                          min={0}
                          max={100}
                          step={1}
                          value={[preferences.budget_level]}
                          onValueChange={(value) => handlePreferenceChange('budget_level', value[0])}
                          className="w-full"
                           thumbClassName="flex items-center justify-center"
                        />
                    </TooltipTrigger>
                     <TooltipContent>
                         <p>{getBudgetEmoji(preferences.budget_level, 100)} {preferences.budget_level <= 33 ? 'Stingy' : preferences.budget_level <= 66 ? 'Normal' : 'Fancy'}</p>
                    </TooltipContent>
                 </Tooltip>
               </TooltipProvider>
                 <div className="flex justify-between text-xs mt-1" style={{color: '#1E1E1E'}}>
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
            </div>

             {/* Dine Type Slider */}
             <div className="grid gap-2">
               <Label htmlFor="dinetype" style={{color: '#1E1E1E'}}>Dine Type</Label>
                 <div className="flex items-center justify-between text-xs mb-1">
                      <div style={{color: '#1E1E1E'}}>Eat In 🏠</div>
                      <div style={{color: '#1E1E1E'}}>Eat Out 🛵</div>
                  </div>
                <TooltipProvider>
                  <Tooltip>
                     <TooltipTrigger asChild>
                         <Slider
                           id="dinetype"
                           min={0}
                           max={100}
                           step={1} // Finer control if needed, or step={50} for just two options
                           value={[preferences.dine_preference]}
                           onValueChange={(value) => handlePreferenceChange('dine_preference', value[0])}
                           className="w-full"
                            thumbClassName="flex items-center justify-center"
                         />
                      </TooltipTrigger>
                      <TooltipContent>
                         <p>{getDineTypeEmoji(preferences.dine_preference, 100)} {preferences.dine_preference <= 50 ? 'Eating In' : 'Eating Out'}</p>
                      </TooltipContent>
                   </Tooltip>
                </TooltipProvider>
                 <div className="flex justify-between text-xs mt-1" style={{color: '#1E1E1E'}}>
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
             </div>

            {/* Spicy Level Slider */}
            <div className="grid gap-2">
               <Label htmlFor="spicy" style={{color: '#1E1E1E'}}>Spicy Level</Label>
                 <div className="flex justify-between text-xs mb-1" style={{color: '#1E1E1E'}}>
                    <span>No Spice 😇</span>
                    <span>Fire Breather 🔥🔥🔥</span>
                  </div>
                 <TooltipProvider>
                   <Tooltip>
                     <TooltipTrigger asChild>
                         <Slider
                            id="spicy"
                            min={0}
                            max={100}
                            step={1}
                            value={[preferences.spicy_level]}
                            onValueChange={(value) => handlePreferenceChange('spicy_level', value[0])}
                            className="w-full"
                             thumbClassName="flex items-center justify-center"
                          />
                     </TooltipTrigger>
                      <TooltipContent>
                          <p>{getSpicyEmoji(preferences.spicy_level, 100)} {preferences.spicy_level <= 33 ? 'Mild' : preferences.spicy_level <= 66 ? 'Medium' : 'Hot!'}</p>
                       </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex justify-between text-xs mt-1" style={{color: '#1E1E1E'}}>
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
             </div>

        </CardContent>
      </Card>

      {/* Roll the Dice Button */}
       <Button
          className="w-full max-w-md mb-4 shadow-sm rounded-full"
          onClick={decideMeal}
          disabled={isRolling || loadingAuth || (!userLocation && preferences.dine_preference > 50)} // Disable if rolling, auth loading, or eat out without location
          style={{ backgroundColor: '#55D519', color: 'white' }}
        >
          {isRolling ? 'Rolling...' : 'Roll the Dice 🎲'}
        </Button>
     </div>
   );
 }

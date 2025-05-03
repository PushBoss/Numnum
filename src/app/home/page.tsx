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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Make sure Label is imported
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ShakeEvent } from "@/components/shake-event";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Bagel_Fat_One, Poppins } from "next/font/google";
import Image from "next/image";
import { db, auth, firebaseApp, functions } from "@/lib/firebaseClient"; // Import firebaseApp and functions
import { httpsCallable } from "firebase/functions"; // Import httpsCallable
import { useAuthState } from 'react-firebase-hooks/auth';
import { MapPin, ThumbsUp, ThumbsDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { imageList, currentRestaurantList } from "@/lib/data"; // Use updated local data
import { getCurrentMealType, getGreeting, getMoodEmoji, getHungerEmoji, getBudgetEmoji, getDineTypeEmoji, getSpicyEmoji } from "@/lib/utils";
import type { SelectedMealResult, Suggestion, UserPreferences, Restaurant as LocalRestaurant, MealItem } from "@/lib/interfaces"; // Ensure MealItem is imported
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getCookie, hasCookie, setCookie } from 'cookies-next';
import { useRouter } from "next/navigation";


const bagel = Bagel_Fat_One({ subsets: ["latin"], weight: "400" });

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Need this client-side for image URLs

export default function Home() {
  // Conditionally call useAuthState only when auth is available
  const [user, loadingAuth, errorAuth] = auth ? useAuthState(auth) : [null, true, null];
  // Initialize callable only if functions is available
  const restaurantFinder = functions ? httpsCallable<{preferences: UserPreferences}, {suggestions: Suggestion[]}>(functions, 'restaurantFinder') : undefined;
    const router = useRouter();


  const [selectedResult, setSelectedResult] = useState<SelectedMealResult | null>(null);
  const [lastResult, setLastResult] = useState<SelectedMealResult | null>(null);
  const [isRolling, setIsRolling] = useState(isRolling);
  const [imageUrl, setImageUrl] = useState(imageList[Math.floor(Math.random() * imageList.length)]); // Default image
  const lastSelectedMealRef = useRef<SelectedMealResult | null>(null); // Ref to track last selected meal
  const [feedbackGiven, setFeedbackGiven] = useState(false); // State for feedback

  // User Preferences State
  const [preferences, setPreferences] = useState<UserPreferences>({
    latitude: undefined,
    longitude: undefined,
    mood_level: 50, // Default to Faves
    hunger_level: 50,
    dine_preference: 50, // Start in the middle (Eat In/Out boundary)
    budget_level: 50,
    spicy_level: 50,
    locationPermissionGranted: undefined,
    country: undefined, // Add country
    favoriteMeals: [], // Add favorites
    favoriteRestaurants: [],
  });

  const [currentLocationDisplay, setCurrentLocationDisplay] = useState<string | null>("Fetching location...");
  const [isSliderActive, setIsSliderActive] = useState(false);
  const { toast } = useToast();

  // Function to load preferences from Firestore when user logs in
   const loadUserPreferences = async () => {
        if (!user || !db) return; // Ensure db is initialized
        // console.log("Loading preferences for user:", user.uid);
        const userPrefsRef = doc(db, "user_preferences", user.uid);
        try {
            const docSnap = await getDoc(userPrefsRef);
            if (docSnap.exists()) {
                const loadedPrefs = docSnap.data() as UserPreferences;
                // console.log("Loaded preferences from Firestore:", loadedPrefs);

                 // Only update preferences if they exist in Firestore, keeping local defaults otherwise
                const validLoadedPrefs: Partial<UserPreferences> = Object.fromEntries(
                     Object.entries(loadedPrefs).filter(([_, v]) => v !== undefined && v !== null)
                 );

                 // Merge loaded prefs with defaults, ensuring favorites are arrays
                 setPreferences(prev => ({
                     ...prev,
                     ...validLoadedPrefs,
                     favoriteMeals: Array.isArray(validLoadedPrefs.favoriteMeals) ? validLoadedPrefs.favoriteMeals : [],
                     favoriteRestaurants: Array.isArray(validLoadedPrefs.favoriteRestaurants) ? validLoadedPrefs.favoriteRestaurants : [],
                 }));

                console.info("User preferences loaded and merged:", preferences);


                 // --- Location Display Logic ---
                if (loadedPrefs.locationPermissionGranted === false) {
                     setCurrentLocationDisplay("Location permission denied");
                } else if (loadedPrefs.latitude && loadedPrefs.longitude) {
                    // If location exists in prefs, try reverse geocoding
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loadedPrefs.latitude}&lon=${loadedPrefs.longitude}`
                        );
                        const data = await response.json();
                        if (data && data.address) {
                            const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown City';
                            const countryName = data.address.country || 'Unknown Country';
                            setCurrentLocationDisplay(`${city}, ${countryName}`);
                            // Update country preference if not already set or derived differently
                            const derivedCountry = countryName.toLowerCase().includes('jamaica') ? 'Jamaica' : countryName.toLowerCase().includes('trinidad') ? 'Trinidad' : undefined;
                            if (!preferences.country && derivedCountry) {
                                setPreferences(prev => ({ ...prev, country: derivedCountry }));
                                // Don't save here, save happens on preference change or explicit action
                            }
                        } else {
                            setCurrentLocationDisplay(loadedPrefs.country || "Location name unavailable"); // Fallback
                        }
                    } catch (e) {
                        console.error("Reverse geocoding error:", e);
                        setCurrentLocationDisplay(loadedPrefs.country || "Location name error"); // Fallback
                    }
                } else if (loadedPrefs.country) {
                    // If no lat/lon but country exists
                    setCurrentLocationDisplay(loadedPrefs.country);
                } else {
                    // No location data in prefs, attempt to get it if permission allows
                     if (!getCookie('locationPermission')) {
                        getLocation(); // Try getting location if no cookie exists
                     } else if (getCookie('locationPermission') === 'denied') {
                         setCurrentLocationDisplay("Location permission denied");
                     } else {
                         // Permission granted previously, but no location stored? Attempt to get it.
                         getLocation();
                     }
                }
                // --- End Location Display Logic ---

            } else {
                console.info("No preferences found for user, redirecting to onboarding:", user.uid);
                // If no prefs found, likely means onboarding is needed.
                 // Check if user just signed up (this logic might need refinement based on your auth flow)
                 // Firebase user metadata is not always reliable immediately after creation.
                 // A better approach might be a flag set during onboarding completion.
                 // For now, assume if no prefs exist, onboarding is needed.
                router.push('/onboarding');
            }
        } catch (error) {
            console.error("Error loading user preferences:", error);
            toast({ title: "Error", description: "Could not load preferences.", variant: "destructive" });
             // Attempt to get location even if loading prefs fails, if permissions allow
            if (!getCookie('locationPermission') || getCookie('locationPermission') === 'granted') {
                getLocation();
            }
        }
    };


   // Effect to ask for location permission and load preferences
   useEffect(() => {
    const checkAndLoad = async () => {
      if (loadingAuth) return; // Wait until auth state is resolved

      if (!user) {
          setCurrentLocationDisplay("Login required");
          // Maybe redirect to login if that's the desired behavior?
          // router.push('/login');
          return;
      }

      // 1. Check/Request Location Permission
      const locationPermissionCookie = getCookie('locationPermission');

      if (locationPermissionCookie === 'granted') {
        setPreferences(prev => ({ ...prev, locationPermissionGranted: true }));
        await getLocation(); // Get location if permission was previously granted
      } else if (locationPermissionCookie === 'denied') {
         setPreferences(prev => ({ ...prev, locationPermissionGranted: false }));
         setCurrentLocationDisplay("Location permission denied");
         await loadUserPreferences(); // Load preferences even if location denied
         return; // Don't proceed further with location checks if denied
      } else {
          // No cookie, proceed with permission check/request
          if (navigator.geolocation) {
            navigator.permissions.query({ name: 'geolocation' }).then(async (permissionStatus) => {
              if (permissionStatus.state === 'granted') {
                setPreferences(prev => ({ ...prev, locationPermissionGranted: true }));
                setCookie('locationPermission', 'granted', { maxAge: 60 * 60 * 24 * 7 });
                await getLocation(); // Get location on grant
              } else if (permissionStatus.state === 'prompt') {
                 await getLocation(); // This will trigger the browser prompt
              } else { // Denied state
                setPreferences(prev => ({ ...prev, locationPermissionGranted: false }));
                 setCookie('locationPermission', 'denied', { maxAge: 60 * 60 * 24 * 7 });
                setCurrentLocationDisplay("Location permission denied");
                toast({ title: "Location Needed", description: "Please enable location services to find nearby restaurants.", variant: "destructive" });
              }
              // Setup listener for future changes (optional but good practice)
              permissionStatus.onchange = async () => {
                 if (permissionStatus.state === 'granted') {
                    setPreferences(prev => ({ ...prev, locationPermissionGranted: true }));
                    setCookie('locationPermission', 'granted', { maxAge: 60 * 60 * 24 * 7 });
                    await getLocation();
                 } else {
                     setPreferences(prev => ({ ...prev, locationPermissionGranted: false }));
                     setCookie('locationPermission', 'denied', { maxAge: 60 * 60 * 24 * 7 });
                     setCurrentLocationDisplay("Location permission denied");
                 }
                 await loadUserPreferences(); // Reload preferences after permission change
              };
            });
          } else {
            setCurrentLocationDisplay("Geolocation not supported");
            setPreferences(prev => ({ ...prev, locationPermissionGranted: false }));
            setCookie('locationPermission', 'denied', { maxAge: 60 * 60 * 24 * 7 });
          }
      }

      // 2. Load User Preferences (After location check/attempt)
      await loadUserPreferences();
    };

    checkAndLoad();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadingAuth]); // Re-run if user logs in/out or auth loading state changes


   // Function to get the user's current location
    const getLocation = async () => {
        if (!navigator.geolocation) {
            setCurrentLocationDisplay("Geolocation not supported");
            setPreferences(prev => ({ ...prev, locationPermissionGranted: false }));
            setCookie('locationPermission', 'denied', { maxAge: 60 * 60 * 24 * 7 });
            return;
        }

        setCurrentLocationDisplay("Fetching location..."); // Indicate fetching
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                 navigator.geolocation.getCurrentPosition(resolve, reject, {
                     enableHighAccuracy: true,
                     timeout: 10000,
                     maximumAge: 0
                 });
            });

            const { latitude, longitude } = position.coords;
            const newPrefs = {
                ...preferences,
                latitude,
                longitude,
                locationTimestamp: Date.now(),
                locationPermissionGranted: true,
            };
            setPreferences(newPrefs); // Update state first for immediate UI feedback
             setCookie('locationPermission', 'granted', { maxAge: 60 * 60 * 24 * 7 }); // Update cookie on success

            // Fetch city/country (Reverse Geocoding)
            try {
                const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
                );
                const data = await response.json();
                if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown City';
                const countryName = data.address.country || 'Unknown Country';
                 setCurrentLocationDisplay(`${city}, ${countryName}`);
                 // Update country pref if needed
                  const derivedCountry = countryName.toLowerCase().includes('jamaica') ? 'Jamaica' : countryName.toLowerCase().includes('trinidad') ? 'Trinidad' : undefined;
                  if (derivedCountry && newPrefs.country !== derivedCountry) {
                      newPrefs.country = derivedCountry; // Update the object we're about to save
                      setPreferences(prev => ({ ...prev, country: derivedCountry })); // Update state too
                  }
                } else {
                  setCurrentLocationDisplay(newPrefs.country || "Location name unavailable");
                }
            } catch (error) {
                console.error("Error getting location name:", error);
                 setCurrentLocationDisplay(newPrefs.country || "Location name error");
            }

            // Save preferences to Firestore
            if (user) {
                await saveUserPreferences(newPrefs); // Save the updated prefs object
            }
        } catch (error: any) {
             console.error("Error getting geolocation:", error);
             setCurrentLocationDisplay("Location unavailable");
             const deniedPrefs = { ...preferences, locationPermissionGranted: false };
             setPreferences(deniedPrefs); // Permission denied or error
             setCookie('locationPermission', 'denied', { maxAge: 60 * 60 * 24 * 7 }); // Update cookie on error
             toast({ title: "Location Error", description: error.message, variant: "destructive" });
             if (user) {
                 await saveUserPreferences(deniedPrefs); // Save denied status
             }
        }
    };

   // Function to save preferences to Firestore
    const saveUserPreferences = async (prefsToSave: UserPreferences) => {
        if (!user || !db) return; // Ensure db is initialized
        const userPrefsRef = doc(db, "user_preferences", user.uid);
        // console.log("Attempting to save preferences:", prefsToSave);
        try {
            // Ensure favorites are arrays before saving
            const cleanPrefs = {
                 ...prefsToSave,
                 favoriteMeals: Array.isArray(prefsToSave.favoriteMeals) ? prefsToSave.favoriteMeals : [],
                 favoriteRestaurants: Array.isArray(prefsToSave.favoriteRestaurants) ? prefsToSave.favoriteRestaurants : [],
             };
            await setDoc(userPrefsRef, cleanPrefs, { merge: true }); // Use merge
            // console.info("User preferences saved successfully for user:", user.uid);
        } catch (error) {
            console.error("Error saving user preferences:", error);
            toast({ title: "Error", description: "Could not save preferences.", variant: "destructive" });
        }
    };


   // --- Meal Decision Logic ---
    const decideMeal = async () => {
        if (!user) {
            toast({ title: "Login Required", description: "Please log in to get meal suggestions.", variant: "destructive" });
            return;
        }
        // Removed API flow check as it's now handled by the Cloud Function
        // if (!getNearbyRestaurants) { ... }

        // Choose a random image for the card *before* deciding the meal source
        const randomCardImage = imageList[Math.floor(Math.random() * imageList.length)];
        setImageUrl(randomCardImage); // Set card image immediately

        setIsRolling(true);
        setFeedbackGiven(false); // Reset feedback state on new roll

        const isEatIn = preferences.dine_preference <= 50;

        if (isEatIn) {
            // --- Logic for Eating In (Homemade + Custom) ---
             decideMealFromLocalData(false); // Pass false for Eat In
             // No need to call API or setIsRolling(false) here, decideMealFromLocalData handles it
        } else {
            // --- Logic for Eating Out (API Call via Cloud Function) ---
            if (preferences.latitude === undefined || preferences.longitude === undefined) {
                toast({ title: "Location Needed", description: "Enable location to find nearby restaurants.", variant: "destructive" });
                if (!getCookie('locationPermission') || getCookie('locationPermission') === 'granted') {
                     await getLocation(); // Attempt to get location again if not denied by cookie
                }
                setIsRolling(false); // Stop rolling if location is missing
                return;
            }
             if (!restaurantFinder) {
                 toast({ title: "Error", description: "Restaurant finder function not available. Please try again later.", variant: "destructive"});
                 setIsRolling(false);
                 return;
             }

            try {
                 // console.log("Calling restaurantFinder Cloud Function with preferences:", preferences);
                const result = await restaurantFinder({ preferences });
                 // console.log("restaurantFinder Cloud Function result:", result);
                const suggestions = result.data.suggestions;

                if (suggestions && suggestions.length > 0) {
                     let filteredSuggestions = suggestions;
                     // Avoid repeating the very last suggestion if it was from the API
                     if (lastSelectedMealRef.current && lastSelectedMealRef.current.isApiSuggestion) {
                         const lastPlaceId = (lastSelectedMealRef.current.restaurant as Suggestion)?.place_id;
                         filteredSuggestions = suggestions.filter(s => s.place_id !== lastPlaceId);
                         if (filteredSuggestions.length === 0 && suggestions.length > 0) {
                             // If filtering removed all options, fall back to the original list to avoid getting stuck
                             filteredSuggestions = suggestions;
                             // console.log("Filtering removed all suggestions, falling back to original list.");
                         } else {
                            // console.log(`Filtered out last suggestion ID: ${lastPlaceId}`);
                         }
                     }


                    const randomIndex = Math.floor(Math.random() * filteredSuggestions.length);
                    const newSelectedSuggestion = filteredSuggestions[randomIndex];

                    const newResult: SelectedMealResult = {
                        restaurant: newSelectedSuggestion,
                        // For API results, use restaurant name as meal name, or fetch details for menu item?
                        // For simplicity, using restaurant name for now.
                        meal: { name: newSelectedSuggestion.name },
                        isHomemade: false,
                        isApiSuggestion: true,
                    };
                    setSelectedResult(newResult);
                    lastSelectedMealRef.current = newResult; // Update ref

                    // Use getPhotoUrl to get the image, including fallback logic
                    setImageUrl(getPhotoUrl(newSelectedSuggestion.photo_reference));


                } else {
                     // console.log("No suggestions returned from API, falling back to local data.");
                    toast({ title: "Using Local Restaurants", description: "Couldn't find nearby places matching filters, showing local options." });
                    decideMealFromLocalData(true); // Pass flag indicating Eat Out fallback
                }

            } catch (error: any) {
                console.error("Error calling restaurantFinder Cloud Function:", error);
                 // Provide more context in the error message
                 const detail = error.details ? ` (${error.details})` : '';
                 const message = error.message || "Could not get suggestions.";
                 toast({
                     title: "Error Finding Restaurants",
                     description: `${message}${detail}`,
                     variant: "destructive"
                 });
                 // Fallback to local data on error
                 decideMealFromLocalData(true); // Pass flag indicating Eat Out fallback
            } finally {
                 setIsRolling(false); // Stop rolling after API call (success or fail) or fallback
            }
        }
    };

    // Updated to handle Eat In OR Eat Out fallback (local restaurants)
    const decideMealFromLocalData = (isEatOutFallback = false) => {
         const currentMealType = getCurrentMealType();
         // Determine location based on user preference FIRST, then geocoding, then default
         const locationKey: "Jamaica" | "Trinidad" = preferences.country ||
             ((currentLocationDisplay?.toLowerCase().includes('jamaica') || (preferences.longitude ?? -76) >= -79 && (preferences.longitude ?? -76) <= -76)
                 ? "Jamaica"
                 : (currentLocationDisplay?.toLowerCase().includes('trinidad') || (preferences.longitude ?? -61) >= -62 && (preferences.longitude ?? -61) <= -60)
                     ? "Trinidad"
                     : "Jamaica"); // Default to Jamaica if all else fails

         // console.log(`Deciding local meal for: ${locationKey}, Meal Time: ${currentMealType}, Eat Out Fallback: ${isEatOutFallback}`);


         const locationData = currentRestaurantList[locationKey];

         if (!locationData) {
             toast({ title: "Error", description: `Invalid local data for ${locationKey}.`, variant: "destructive"});
             setIsRolling(false); // Stop rolling if data is invalid
             return;
         }

         let availableResults: SelectedMealResult[] = [];
         let customMealsData: MealItem[] = [];

          // Get custom meals from Firestore (assuming they are loaded into state already)
           // Map FirestoreMeal[] from state to MealItem[] format if needed, or adjust logic
            if (Array.isArray(preferences.favoriteMeals)) { // Use preferences for custom/favorite logic
                 customMealsData = preferences.favoriteMeals.map(name => ({ name })); // Basic mapping for now
             }


         if (!isEatOutFallback) { // Eat In scenario (Homemade + Custom from preferences)
             const homemadeMealNames = locationData.homemade[currentMealType] || [];
             const homemadeMealItems: MealItem[] = homemadeMealNames.map(name => ({ name })); // Convert names to MealItem

             const allPossibleEatIn = [...homemadeMealItems, ...customMealsData]; // Combine homemade and user's favorites

              availableResults = allPossibleEatIn.map(mealItem => ({
                 meal: mealItem,
                 isHomemade: true, // Mark both homemade and custom as "isHomemade" for Eat In
                 isApiSuggestion: false,
              }));

              // Prioritize favorite meals if mood slider is low (faves)
              if (preferences.mood_level <= 33 && Array.isArray(preferences.favoriteMeals) && preferences.favoriteMeals.length > 0) {
                  availableResults = availableResults.sort((a, b) => {
                     const aIsFav = preferences.favoriteMeals!.includes(a.meal!.name);
                     const bIsFav = preferences.favoriteMeals!.includes(b.meal!.name);
                     if (aIsFav && !bIsFav) return -1; // Prioritize a
                     if (!aIsFav && bIsFav) return 1;  // Prioritize b
                     return 0; // Keep original order otherwise
                 });
                 // console.log("Prioritized favorite meals for Eat In.");
              }

         } else { // Eat Out fallback scenario (Local Restaurants only for the determined location)
              availableResults = locationData.restaurants.flatMap(restaurant => {
                 const mealsForTime = restaurant.menu[currentMealType] || [];
                 // Map Restaurant to the Suggestion-like structure for consistency
                 return mealsForTime.map(mealItem => ({
                    meal: mealItem,
                    restaurant: restaurant, // Store the whole local restaurant object
                    isHomemade: false,
                    isApiSuggestion: false,
                 }));
             });
              // Prioritize favorite restaurants if mood slider is low (faves)
              if (preferences.mood_level <= 33 && Array.isArray(preferences.favoriteRestaurants) && preferences.favoriteRestaurants.length > 0) {
                  availableResults = availableResults.sort((a, b) => {
                     // Ensure restaurant exists before accessing name
                     const aRestName = (a.restaurant as LocalRestaurant)?.name;
                     const bRestName = (b.restaurant as LocalRestaurant)?.name;
                     if (!aRestName || !bRestName) return 0; // Handle cases where restaurant might be missing

                     const aIsFav = preferences.favoriteRestaurants!.includes(aRestName);
                     const bIsFav = preferences.favoriteRestaurants!.includes(bRestName);
                      if (aIsFav && !bIsFav) return -1;
                      if (!aIsFav && bIsFav) return 1;
                      return 0;
                  });
                 // console.log("Prioritized favorite restaurants for Eat Out fallback.");
              }
         }

          // Filter out the last selected meal IF it came from local data and matches structure
          let filteredResults = availableResults;
           if (lastSelectedMealRef.current && !lastSelectedMealRef.current.isApiSuggestion) { // Filter only if last was also local
               filteredResults = availableResults.filter(res => {
                   const last = lastSelectedMealRef.current!;
                   // Check meal name match
                    const mealMatch = res.meal?.name === last.meal?.name;
                   // Check if both are homemade or both are restaurant meals
                   const typeMatch = res.isHomemade === last.isHomemade;
                   // If both are restaurant meals, check restaurant name match
                   const restaurantMatch = !res.isHomemade && !last.isHomemade ?
                        (res.restaurant as LocalRestaurant)?.name === (last.restaurant as LocalRestaurant)?.name : true; // If homemade, restaurant doesn't matter

                   return !(mealMatch && typeMatch && restaurantMatch);
               });
               if (filteredResults.length === 0 && availableResults.length > 0) {
                  filteredResults = availableResults; // Avoid getting stuck
                 // console.log("Filtering removed all local results, falling back to original list.");
               } else {
                   // console.log(`Filtered out last local result: ${lastSelectedMealRef.current?.meal?.name}`);
               }
           }

         if (filteredResults.length === 0) {
             toast({
                 title: "No meals available!",
                 description: `No ${isEatOutFallback ? 'local restaurant' : 'homemade/custom'} ${currentMealType} meals found for ${locationKey}. Try adjusting filters or adding custom meals!`,
                 variant: "destructive"
             });
             setIsRolling(false); // Stop rolling if no meals found
             return;
         }

         const randomIndex = Math.floor(Math.random() * filteredResults.length);
         const newSelectedLocalResult = filteredResults[randomIndex];

         setSelectedResult(newSelectedLocalResult);
         lastSelectedMealRef.current = newSelectedLocalResult; // Update ref

         // Use getPhotoUrl for consistency, will fall back to random image if local restaurant has no image_url
         setImageUrl(getPhotoUrl(undefined, (newSelectedLocalResult.restaurant as LocalRestaurant)?.image_url));
         setIsRolling(false); // Stop rolling after selection
     };


    const handleShake = () => {
        if (!isRolling) { // Prevent triggering multiple times while rolling
             decideMeal();
        }
    };

     // Update preferences state and save to Firestore on slider change
     const handlePreferenceChange = (key: keyof UserPreferences, value: number | string | boolean | string[] | undefined) => {
        const newPrefs = { ...preferences, [key]: value };
        setPreferences(newPrefs);
        // Debounce this in a real app for performance
        if (user) { // Only save if user is logged in
            saveUserPreferences(newPrefs);
        }
    };

    // Get photo URL from Google Places Photo Reference or return a random fallback
    const getPhotoUrl = (photoReference?: string, localImageUrl?: string): string => {
        if (photoReference && GOOGLE_MAPS_API_KEY) {
             return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
        }
        if (localImageUrl) {
            return localImageUrl;
        }
        // Fallback to random image from the list
        return imageList[Math.floor(Math.random() * imageList.length)];
    };

    // Handle user feedback (like/dislike)
    const handleFeedback = async (liked: boolean) => {
        if (!user || !selectedResult) return;
        setFeedbackGiven(true); // Mark feedback as given

        // Update favorite lists based on feedback
        if (liked) {
            let updatedPrefs = { ...preferences };
            let favoritesUpdated = false;

             // Add Meal to Favorites
            if (selectedResult.meal && !updatedPrefs.favoriteMeals?.includes(selectedResult.meal.name)) {
                updatedPrefs.favoriteMeals = [...(updatedPrefs.favoriteMeals || []), selectedResult.meal.name];
                 favoritesUpdated = true;
            }

            // Add Restaurant to Favorites (only if it's a restaurant suggestion)
             const restaurantName = (selectedResult.restaurant as Suggestion | LocalRestaurant)?.name; // Get name regardless of type
             if (restaurantName && !selectedResult.isHomemade && !updatedPrefs.favoriteRestaurants?.includes(restaurantName)) {
                 updatedPrefs.favoriteRestaurants = [...(updatedPrefs.favoriteRestaurants || []), restaurantName];
                 favoritesUpdated = true;
             }


             if (favoritesUpdated) {
                 setPreferences(updatedPrefs);
                 await saveUserPreferences(updatedPrefs); // Save updated favorites to Firestore
                 toast({
                     title: "Added to Favorites!",
                     description: "We'll remember you like this.",
                 });
             } else {
                 // If neither list was updated (already favorited), maybe show a different message?
                 toast({
                     title: "Noted!",
                     description: "This is already in your favorites.",
                 });
             }

        } else {
             // Handle Dislike - remove from favorites if it exists there
              let updatedPrefs = { ...preferences };
             let favoritesUpdated = false;

             // Remove Meal from Favorites
             if (selectedResult.meal && updatedPrefs.favoriteMeals?.includes(selectedResult.meal.name)) {
                 updatedPrefs.favoriteMeals = updatedPrefs.favoriteMeals.filter(m => m !== selectedResult.meal!.name);
                 favoritesUpdated = true;
             }

             // Remove Restaurant from Favorites
             const restaurantName = (selectedResult.restaurant as Suggestion | LocalRestaurant)?.name;
             if (restaurantName && !selectedResult.isHomemade && updatedPrefs.favoriteRestaurants?.includes(restaurantName)) {
                 updatedPrefs.favoriteRestaurants = updatedPrefs.favoriteRestaurants.filter(r => r !== restaurantName);
                 favoritesUpdated = true;
             }

             if (favoritesUpdated) {
                 setPreferences(updatedPrefs);
                 await saveUserPreferences(updatedPrefs);
                 toast({
                     title: "Removed from Favorites",
                     description: "We'll remember you didn't like this.",
                 });
             } else {
                 toast({
                     title: "Feedback Received",
                     description: "Thanks! We'll adjust future suggestions.",
                 });
             }
            // Optionally: Add logic to decrease preference score or call Gemini
        }

        // TODO: Implement Gemini API call here for more sophisticated learning
        // console.log(`User ${liked ? 'liked' : 'disliked'} suggestion:`, selectedResult);
        // ... Call Cloud Function to interact with Gemini ...
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
              <Image
                 src={imageUrl} // Use the state variable imageUrl
                 alt={selectedResult?.meal?.name || "Meal image"}
                 width={200}
                 height={100}
                 className="rounded-md mt-2 mx-auto object-cover" // Added object-cover and mx-auto
                 unoptimized={!GOOGLE_MAPS_API_KEY && selectedResult?.isApiSuggestion} // Avoid optimizing placeholders or if API key missing for Places photos
                 data-ai-hint="meal food plate restaurant dish" // Added AI hint
              />
          </CardHeader>
         <CardContent className="flex flex-col items-start">
             {isRolling ? (
                 <div className="flex flex-col items-center w-full">
                     <Progress value={50} className="w-full mb-2 animate-pulse" />
                     <p className="text-sm text-muted-foreground">
                         Rolling the dice... <span className="bounce">🎲</span>
                     </p>
                 </div>
             ) : selectedResult ? (
              <>
                 <p className="text-md font-medium text-primary">
                  {selectedResult.restaurant && !selectedResult.isHomemade && (
                      <>
                       {selectedResult.isApiSuggestion ? "Restaurant" : "Local Spot"}:{" "}
                       <span className="font-bold">{(selectedResult.restaurant as Suggestion | LocalRestaurant).name}</span>
                       <br />
                      </>
                  )}
                  {selectedResult.isHomemade && (
                       <>Source: <span className="font-bold">Homemade/Custom</span><br/></>
                  )}
                   Meal: <span className="font-bold">{selectedResult.meal?.name || "Suggestion"}</span>

                    {/* Display Rating (API or Local) */}
                    {(selectedResult.isApiSuggestion && (selectedResult.restaurant as Suggestion)?.rating) && (
                        <><br/>Rating: <span className="font-bold">{(selectedResult.restaurant as Suggestion).rating}⭐</span></>
                    )}
                    {(!selectedResult.isApiSuggestion && !selectedResult.isHomemade && (selectedResult.restaurant as LocalRestaurant)?.rating) && (
                        <><br/>Rating: <span className="font-bold">{(selectedResult.restaurant as LocalRestaurant).rating}⭐</span></>
                    )}

                   {/* Display Distance (API only) */}
                    {(selectedResult.isApiSuggestion && (selectedResult.restaurant as Suggestion)?.distance !== undefined) && (
                       <><br/>Distance: <span className="font-bold">{~~((selectedResult.restaurant as Suggestion).distance! / 1609)} mi</span></> // Approx miles
                    )}
                </p>

                 {/* Thumbs Up/Down Buttons */}
                 {!feedbackGiven && (
                     <div className="mt-4 flex w-full justify-center space-x-4"> {/* Centered feedback */}
                         <Button variant="ghost" size="icon" onClick={() => handleFeedback(true)} aria-label="Like suggestion">
                             <ThumbsUp className="h-6 w-6 text-green-500 hover:text-green-600" />
                         </Button>
                         <Button variant="ghost" size="icon" onClick={() => handleFeedback(false)} aria-label="Dislike suggestion">
                             <ThumbsDown className="h-6 w-6 text-red-500 hover:text-red-600" />
                         </Button>
                     </div>
                 )}
                 {feedbackGiven && (
                    <p className="mt-4 text-sm text-muted-foreground self-center">Thanks for the feedback!</p>
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
                         aria-label="Dine Type: Eat In or Eat Out"
                          className="w-[60%]" // Adjust width as needed
                          style={{ backgroundColor: '#F7F7F7' }}
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
                     <div style={{color: '#1E1E1E'}}>Faves 🤩</div>
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
                        aria-label="Mood: Favorites or Adventurous"
                         className="w-[60%]"
                         style={{ backgroundColor: '#F7F7F7' }}
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
                         aria-label="Hunger Level: Peckish or Famished"
                           className="w-[60%]"
                           style={{ backgroundColor: '#F7F7F7' }}
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
                            aria-label="Budget: Stingy or Fancy"
                              className="w-[60%]"
                              style={{ backgroundColor: '#F7F7F7' }}
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
                             aria-label="Spicy Level: No Spice or Fire Breather"
                              className="w-[60%]"
                              style={{ backgroundColor: '#F7F7F7' }}
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
         <Button
          className="w-full max-w-md mb-4 shadow-sm rounded-full" // Added rounded-full
          style={{ backgroundColor: "#55D519", color: "white" }}
          onClick={decideMeal}
          disabled={isRolling || loadingAuth || (preferences.dine_preference > 50 && preferences.latitude === undefined)} // Disable if rolling, loading auth, or location unknown AND eating out
          aria-live="polite" // Announce changes for screen readers
        >
            {isRolling ? "Rolling..." : "Roll the Dice 🎲"}
         </Button>
     </div>
   );
 }

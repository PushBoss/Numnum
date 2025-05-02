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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ShakeEvent } from "@/components/shake-event";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Bagel_Fat_One, Poppins } from "next/font/google";
import Image from "next/image";
import { db, auth } from "@/lib/firebaseClient"; // Import auth from client file
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuthState } from 'react-firebase-hooks/auth';
import { MapPin } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { imageList, currentRestaurantList as localRestaurantData } from "@/lib/data"; // Keep local data
import { getCurrentMealType, getGreeting, getMoodEmoji, getHungerEmoji, getBudgetEmoji, getDineTypeEmoji, getSpicyEmoji } from "@/lib/utils";
import type { SelectedMealResult, Suggestion, UserPreferences, Restaurant as LocalRestaurant, MealItem } from "@/lib/interfaces"; // Ensure MealItem is imported
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getCookie, hasCookie, setCookie } from 'cookies-next';

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
  const functions = getFunctions(); // Get functions instance
  const restaurantFinder = httpsCallable<{preferences: UserPreferences}, {suggestions: Suggestion[]}>(functions, 'restaurantFinder');

  const [selectedResult, setSelectedResult] = useState<SelectedMealResult | null>(null);
  const [lastResult, setLastResult] = useState<SelectedMealResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [imageUrl, setImageUrl] = useState(imageList[Math.floor(Math.random() * imageList.length)]); // Default image
  const lastSelectedMealRef = useRef<SelectedMealResult | null>(null); // Ref to track last selected meal

  // User Preferences State
  const [preferences, setPreferences] = useState<UserPreferences>({
    latitude: undefined,
    longitude: undefined,
    mood_level: 50,
    hunger_level: 50,
    dine_preference: 50, // Start in the middle (Eat In/Out boundary)
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
      const locationPermissionCookie = getCookie('locationPermission');

      if (locationPermissionCookie === 'granted') {
        setPreferences(prev => ({ ...prev, locationPermissionGranted: true }));
        getLocation(); // Get location if permission was previously granted
        return;
      } else if (locationPermissionCookie === 'denied') {
         setPreferences(prev => ({ ...prev, locationPermissionGranted: false }));
         setCurrentLocationDisplay("Location permission denied");
         return;
      }
      // If no cookie, proceed with permission check

      if (navigator.geolocation) {
        navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
          if (permissionStatus.state === 'granted') {
            setPreferences(prev => ({ ...prev, locationPermissionGranted: true }));
            setCookie('locationPermission', 'granted', { maxAge: 60 * 60 * 24 * 7 }); // Store for 7 days
            getLocation();
          } else if (permissionStatus.state === 'prompt') {
             getLocation(); // This will trigger the browser prompt
          } else {
            setPreferences(prev => ({ ...prev, locationPermissionGranted: false }));
             setCookie('locationPermission', 'denied', { maxAge: 60 * 60 * 24 * 7 }); // Store for 7 days
            setCurrentLocationDisplay("Location permission denied");
            toast({ title: "Location Needed", description: "Please enable location services to find nearby restaurants.", variant: "destructive" });
          }
          permissionStatus.onchange = () => {
             if (permissionStatus.state === 'granted') {
                setPreferences(prev => ({ ...prev, locationPermissionGranted: true }));
                setCookie('locationPermission', 'granted', { maxAge: 60 * 60 * 24 * 7 });
                getLocation();
            } else {
                 setPreferences(prev => ({ ...prev, locationPermissionGranted: false }));
                 setCookie('locationPermission', 'denied', { maxAge: 60 * 60 * 24 * 7 });
                 setCurrentLocationDisplay("Location permission denied");
            }
          };
        });
      } else {
        setCurrentLocationDisplay("Geolocation not supported");
        setPreferences(prev => ({ ...prev, locationPermissionGranted: false }));
        setCookie('locationPermission', 'denied', { maxAge: 60 * 60 * 24 * 7 });
      }
    };

    if (user) { // Only run if user is logged in
        checkLocationPermission();
    } else if (!loadingAuth) {
        setCurrentLocationDisplay("Login required");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadingAuth]); // Re-run if user logs in/out

   // Function to get the user's current location
    const getLocation = () => {
        if (!navigator.geolocation) {
            setCurrentLocationDisplay("Geolocation not supported");
            setPreferences(prev => ({ ...prev, locationPermissionGranted: false }));
            setCookie('locationPermission', 'denied', { maxAge: 60 * 60 * 24 * 7 });
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
            setCookie('locationPermission', 'granted', { maxAge: 60 * 60 * 24 * 7 }); // Update cookie on success

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
             setCookie('locationPermission', 'denied', { maxAge: 60 * 60 * 24 * 7 }); // Update cookie on error
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
                } else if (!getCookie('locationPermission')) { // Only try getting location if cookie doesn't exist
                    getLocation();
                }

            } else {
             // console.info("No preferences found for user, using defaults and getting location:", user.uid);
             // If no prefs saved, attempt to get location immediately if no cookie exists
                 if (!getCookie('locationPermission')) {
                     getLocation();
                 } else if (getCookie('locationPermission') === 'denied') {
                    setCurrentLocationDisplay("Location permission denied");
                 }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]); // Rerun when user changes

   // --- Meal Decision Logic ---
    const decideMeal = async () => {
        if (!user) {
            toast({ title: "Login Required", description: "Please log in to get meal suggestions.", variant: "destructive" });
            return;
        }

        // Choose a random image for the card *before* deciding the meal source
        const randomCardImage = imageList[Math.floor(Math.random() * imageList.length)];
        setImageUrl(randomCardImage); // Set card image immediately

        setIsRolling(true);

        const isEatIn = preferences.dine_preference <= 50;

        if (isEatIn) {
            // --- Logic for Eating In (Homemade + Custom) ---
            decideMealFromLocalData(false); // Explicitly pass false for Eat In
            setIsRolling(false); // Stop rolling animation
        } else {
            // --- Logic for Eating Out (API Call) ---
            if (preferences.latitude === undefined || preferences.longitude === undefined) {
                toast({ title: "Location Needed", description: "Enable location to find nearby restaurants.", variant: "destructive" });
                if (!getCookie('locationPermission') || getCookie('locationPermission') === 'granted') {
                    getLocation(); // Attempt to get location again if not denied by cookie
                }
                setIsRolling(false);
                return;
            }

            try {
                const result = await restaurantFinder({ preferences });
                const suggestions = result.data.suggestions;

                if (suggestions && suggestions.length > 0) {
                     let filteredSuggestions = suggestions;
                    // Avoid repeating the very last suggestion if it was from the API and the same type
                    if (lastSelectedMealRef.current && lastSelectedMealRef.current.isApiSuggestion) {
                        filteredSuggestions = suggestions.filter(s => s.place_id !== (lastSelectedMealRef.current!.restaurant as Suggestion)?.place_id);
                        if (filteredSuggestions.length === 0 && suggestions.length > 0) {
                            filteredSuggestions = suggestions; // Avoid getting stuck
                        }
                    }

                     if (filteredSuggestions.length === 0) {
                        toast({ title: "No New Places Found", description: "Try adjusting your filters or rolling again." });
                        setIsRolling(false);
                        return;
                    }

                    const randomIndex = Math.floor(Math.random() * filteredSuggestions.length);
                    const newSelectedSuggestion = filteredSuggestions[randomIndex];

                    const newResult: SelectedMealResult = {
                        restaurant: newSelectedSuggestion,
                        meal: { name: newSelectedSuggestion.name }, // Use restaurant name as meal name for API results
                        isHomemade: false,
                        isApiSuggestion: true,
                    };
                    setSelectedResult(newResult);
                    lastSelectedMealRef.current = newResult; // Update ref

                    // Use getPhotoUrl to get the image, including fallback logic
                    setImageUrl(getPhotoUrl(newSelectedSuggestion.photo_reference));


                } else {
                    toast({ title: "Using Local Restaurants", description: "Couldn't find nearby places, showing local options." });
                    decideMealFromLocalData(true); // Pass flag indicating Eat Out fallback
                }

            } catch (error: any) {
                console.error("Error calling restaurantFinder function:", error);
                // Provide more context in the error message
                const detail = error.details ? ` (${error.details})` : '';
                toast({
                    title: "Error Finding Restaurants",
                    description: `${error.message || "Could not get suggestions."}${detail}`,
                    variant: "destructive"
                });
                decideMealFromLocalData(true); // Pass flag indicating Eat Out fallback
            } finally {
                setIsRolling(false);
            }
        }
    };

    // Updated to handle Eat In OR Eat Out fallback (local restaurants)
    const decideMealFromLocalData = (isEatOutFallback = false) => {
         const currentMealType = getCurrentMealType();
         // Determine location based on longitude, default to Jamaica if longitude is undefined or if location name suggests it
         const locationKey: "Jamaica" | "Trinidad" =
            (currentLocationDisplay?.toLowerCase().includes('jamaica') || (preferences.longitude ?? -76) >= -79 && (preferences.longitude ?? -76) <= -76)
                ? "Jamaica"
                : "Trinidad";

         const locationData = localRestaurantData[locationKey];


         if (!locationData) {
             toast({ title: "Error", description: "Invalid location data.", variant: "destructive"});
             setIsRolling(false); // Stop rolling if data is invalid
             return;
         }

         let availableMeals: { meal: MealItem; restaurant?: LocalRestaurant; isHomemade: boolean }[] = [];
         let customMeals: MealItem[] = [];

         // Get custom meals from localStorage
         try {
             const storedMeals = localStorage.getItem('customMeals');
             if (storedMeals) {
                 customMeals = JSON.parse(storedMeals).map((m: { meal: string; restaurant?: string }) => ({ name: m.meal }));
             }
         } catch (e) {
             console.error("Error parsing custom meals from localStorage", e);
         }

         if (!isEatOutFallback) { // Eat In scenario (Homemade + Custom)
             const homemadeMealsForTime = locationData.homemade[currentMealType] || [];
              // Ensure homemadeMealsForTime is treated as MealItem[] or compatible structure
            const allPossibleHomemade: MealItem[] = [
                 ...(homemadeMealsForTime.map(name => ({ name }))), // Convert strings to MealItem
                ...customMeals
             ];

             availableMeals = allPossibleHomemade.map(mealItem => ({
                meal: mealItem,
                isHomemade: true,
             }));
         } else { // Eat Out fallback scenario (Local Restaurants only)
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
           if (lastSelectedMealRef.current && !lastSelectedMealRef.current.isApiSuggestion) { // Filter only if last was also local
               filteredMeals = availableMeals.filter(m => !(
                   m.meal.name === lastSelectedMealRef.current!.meal?.name &&
                   (m.isHomemade === lastSelectedMealRef.current!.isHomemade) &&
                   (!m.isHomemade && !lastSelectedMealRef.current!.isHomemade && m.restaurant?.name === (lastSelectedMealRef.current!.restaurant as LocalRestaurant)?.name)
               ));
               if (filteredMeals.length === 0 && availableMeals.length > 0) {
                  filteredMeals = availableMeals; // Avoid getting stuck
               }
           }

         if (filteredMeals.length === 0) {
             toast({
                 title: "No meals available!",
                 description: `No ${isEatOutFallback ? 'local restaurant' : 'homemade/custom'} ${currentMealType} meals found for ${locationKey}. Try rolling again!`,
                 variant: "destructive" // Use destructive variant for errors/warnings
             });
             setIsRolling(false); // Stop rolling if no meals found
             return;
         }

         const randomIndex = Math.floor(Math.random() * filteredMeals.length);
         const newSelectedLocalMealData = filteredMeals[randomIndex];

         const newResult: SelectedMealResult = {
             meal: newSelectedLocalMealData.meal,
             restaurant: newSelectedLocalMealData.restaurant,
             isHomemade: newSelectedLocalMealData.isHomemade,
             isApiSuggestion: false,
         };

         setSelectedResult(newResult);
         lastSelectedMealRef.current = newResult; // Update ref

         // Use getPhotoUrl for consistency, will fall back to random image if local restaurant has no image_url
         setImageUrl(getPhotoUrl(undefined, newSelectedLocalMealData.restaurant?.image_url));
         setIsRolling(false); // Stop rolling after selection
     };


    const handleShake = () => {
        if (!isRolling) { // Prevent triggering multiple times while rolling
             decideMeal();
        }
    };

     // Update preferences state and save to Firestore on slider change
     const handlePreferenceChange = (key: keyof UserPreferences, value: number) => {
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
                data-ai-hint="meal food plate"
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
          disabled={loadingAuth || preferences.latitude === undefined && preferences.dine_preference > 50} // Disable if loading auth or location unknown AND eating out
        >
          Roll the Dice 🎲
        </Button>
      )}
    </div>
  );
}

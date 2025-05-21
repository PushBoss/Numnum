
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
import { Bagel_Fat_One, Poppins } from "next/font/google";
import Image from "next/image";
import { db, auth } from "@/lib/firebaseClient"; // Import client-side auth and db
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuthState } from 'react-firebase-hooks/auth';
import { MapPin, ThumbsUp, ThumbsDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getGreeting, getMoodEmoji, getHungerEmoji, getBudgetEmoji, getDineTypeEmoji, getSpicyEmoji, getCurrentMealType } from "@/lib/utils";
import { currentRestaurantList, imageList, mealImageMap } from '@/lib/data';
import type { UserPreferences, Suggestion, SelectedMealResult, MealItem, LocalRestaurant } from '@/lib/interfaces';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { hasCookie, setCookie } from 'cookies-next';


const bagel = Bagel_Fat_One({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });


export default function Home() {
  const [user, loadingAuth, errorAuth] = auth ? useAuthState(auth) : [null, true, null];
  const functions = auth ? getFunctions() : null;
  const restaurantFinder = functions ? httpsCallable<{preferences: UserPreferences}, {suggestions: Suggestion[]}>(functions, 'restaurantFinder') : null;

  const [selectedResult, setSelectedResult] = useState<SelectedMealResult | null>(null);
  const [isShaking, setIsShaking] = useState(false); // For shake event feedback
  const [isRolling, setIsRolling] = useState(false);
  const [location, setLocation] = useState<{ city: string; country: string } | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    mood_level: 50,
    hunger_level: 50,
    dine_preference: 50,
    budget_level: 50,
    spicy_level: 50,
  });
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const lastSelectedMealRef = useRef<SelectedMealResult | null>(null);
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState(imageList[Math.floor(Math.random() * imageList.length)]);
  const [hasAskedLocation, setHasAskedLocation] = useState(false);


  useEffect(() => {
    if (loadingAuth) {
      console.log("Auth state is loading...");
    }
    if (errorAuth) {
      console.error("Firebase Auth Error:", errorAuth);
      toast({ title: "Authentication Error", description: errorAuth.message, variant: "destructive" });
    }
    if (!auth) {
      console.warn("Firebase Auth instance is not available. User-specific features might be limited.");
    }
    if (!db) {
      console.warn("Firebase Firestore instance is not available. Data operations will fail.");
    }
     if (!functions) {
      console.warn("Firebase Functions instance is not available. Cloud function calls will fail.");
    }
  }, [loadingAuth, errorAuth, toast, functions]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
        const cookieExists = hasCookie('locationPermissionAsked');
        setHasAskedLocation(cookieExists); // Set based on cookie presence
    }
  }, []);

  const getLocation = () => {
    if (typeof window !== 'undefined' && !navigator.geolocation) {
       toast({ title: "Location Error", description: "Geolocation is not supported by this browser.", variant: "destructive" });
       setLocation({ city: "Unsupported", country: "Browser" });
       return;
    }

    if (typeof window !== 'undefined' && !hasAskedLocation) {
        setCookie('locationPermissionAsked', 'true', { maxAge: 60 * 60 * 24 * 30 });
        setHasAskedLocation(true);
    }
    if (typeof window !== 'undefined'){
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
             setUserLocation({ latitude, longitude });
             setPreferences(prev => ({ ...prev, latitude, longitude }));
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
              );
              const data = await response.json();
              const city = data.address.city || data.address.town || data.address.village || "Unknown City";
              const country = data.address.country || "Unknown Country";
              setLocation({ city, country });
              if (country === 'Jamaica' || country === 'Trinidad') {
                setPreferences(prev => ({ ...prev, country: country as 'Jamaica' | 'Trinidad' }));
              }
            } catch (error) {
              console.error("Error fetching location name:", error);
              setLocation({ city: "Unknown", country: "Location" });
               toast({ title: "Location Error", description: "Could not determine location name.", variant: "destructive" });
            }
          },
          (error) => {
            console.error("Error getting location:", error);
             toast({ title: "Location Error", description: "Could not get location. Please enable location services.", variant: "destructive" });
            setLocation({ city: "Enable", country: "Location" });
            setPreferences(prev => ({ ...prev, latitude: undefined, longitude: undefined }));
            setUserLocation(null);
          }
        );
    }
  };

  useEffect(() => {
    const fetchUserDataAndLocation = async () => {
        if (user && db) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            let fetchedPrefs: Partial<UserPreferences> = {};

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                fetchedPrefs = userData.preferences || {}; // Assuming preferences are nested
            }


            if (typeof window !== 'undefined' && navigator.geolocation) {
                if (!hasAskedLocation) {
                    setCookie('locationPermissionAsked', 'true', { maxAge: 60 * 60 * 24 * 30 }); // Expires in 30 days
                    setHasAskedLocation(true);
                }
                 navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        setUserLocation({ latitude, longitude });
                        try {
                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                            const data = await response.json();
                            const city = data.address.city || data.address.town || data.address.village || "Unknown City";
                            const country = data.address.country || "Unknown Country";
                            setLocation({ city, country });
                            setPreferences(prev => ({
                                ...prev, ...fetchedPrefs, latitude, longitude,
                                country: (country === 'Jamaica' || country === 'Trinidad') ? country as 'Jamaica' | 'Trinidad' : fetchedPrefs.country
                            }));
                        } catch (error) {
                            console.error("Error fetching location name:", error);
                             setLocation({ city: "Error", country: "Geocoding" });
                             setPreferences(prev => ({ ...prev, ...fetchedPrefs, latitude: fetchedPrefs.latitude, longitude: fetchedPrefs.longitude }));
                        }
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                        toast({ title: "Location Error", description: "Could not get location. Please enable location services.", variant: "destructive" });
                         setLocation({ city: "Enable", country: "Location" });
                          setPreferences(prev => ({ ...prev, ...fetchedPrefs, latitude: fetchedPrefs.latitude, longitude: fetchedPrefs.longitude }));
                        setUserLocation(null);
                    }
                );
            } else {
                if (typeof window !== 'undefined') {
                    toast({ title: "Location Error", description: "Geolocation is not supported.", variant: "destructive" });
                }
                setLocation({ city: "Unsupported", country: "Browser" });
                 setPreferences(prev => ({ ...prev, ...fetchedPrefs, latitude: fetchedPrefs.latitude, longitude: fetchedPrefs.longitude }));
            }
        } else if (!loadingAuth && !user) {
             setPreferences({ mood_level: 50, hunger_level: 50, dine_preference: 50, budget_level: 50, spicy_level: 50 });
             setLocation(null);
             setUserLocation(null);
             setSelectedResult(null);
             lastSelectedMealRef.current = null;
             setFeedbackGiven(false);
        } else if (user && !db) {
            console.warn("User logged in but DB not yet initialized. Waiting for DB...");
        }
    };
    if (typeof window !== 'undefined') { // Ensure this only runs client-side
        fetchUserDataAndLocation();
    }
  }, [user, loadingAuth, db, hasAskedLocation, toast]);

  const saveUserPreferences = async (prefsToSave: UserPreferences) => {
    if (!user || !db) {
        console.warn("Cannot save preferences: User not logged in or DB not initialized.");
        return;
    }
    const cleanedPrefs: Partial<UserPreferences> = { // Allow partial for flexibility
        mood_level: prefsToSave.mood_level,
        hunger_level: prefsToSave.hunger_level,
        dine_preference: prefsToSave.dine_preference,
        budget_level: prefsToSave.budget_level,
        spicy_level: prefsToSave.spicy_level,
    };
     if (typeof prefsToSave.latitude === 'number') cleanedPrefs.latitude = prefsToSave.latitude;
     if (typeof prefsToSave.longitude === 'number') cleanedPrefs.longitude = prefsToSave.longitude;
     if (prefsToSave.country) cleanedPrefs.country = prefsToSave.country;
     if (prefsToSave.favoriteMeals) cleanedPrefs.favoriteMeals = prefsToSave.favoriteMeals;
     if (prefsToSave.favoriteRestaurants) cleanedPrefs.favoriteRestaurants = prefsToSave.favoriteRestaurants;


    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, { preferences: cleanedPrefs, lastUpdated: serverTimestamp() }, { merge: true });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({ title: "Error", description: "Could not save preferences.", variant: "destructive" });
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (user && !loadingAuth && db) {
        const prefsToSave: UserPreferences = {
            mood_level: preferences.mood_level,
            hunger_level: preferences.hunger_level,
            dine_preference: preferences.dine_preference,
            budget_level: preferences.budget_level,
            spicy_level: preferences.spicy_level,
            ...(userLocation && { latitude: userLocation.latitude, longitude: userLocation.longitude }),
            ...(preferences.country && { country: preferences.country }),
            ...(preferences.favoriteMeals && { favoriteMeals: preferences.favoriteMeals }),
            ...(preferences.favoriteRestaurants && { favoriteRestaurants: preferences.favoriteRestaurants }),
        };
        saveUserPreferences(prefsToSave);
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [preferences, user, loadingAuth, userLocation, db]);


   const getPhotoUrl = (result: SelectedMealResult | null): string => {
        if (!result || isRolling) {
            const randomIndex = Math.floor(Math.random() * imageList.length);
            return imageList[randomIndex];
        }
        if (!result.isApiSuggestion && !result.isHomemade && (result.restaurant as LocalRestaurant)?.image_url) {
            return (result.restaurant as LocalRestaurant).image_url!;
        }
        if (result.isApiSuggestion && (result.restaurant as Suggestion)?.photo_reference && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
            return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${(result.restaurant as Suggestion).photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
        }
        const mealName = result.meal.name;
        if (mealImageMap[mealName]) {
            return mealImageMap[mealName];
        }
         const randomIndex = Math.floor(Math.random() * imageList.length);
         return imageList[randomIndex];
     };

  const decideMeal = async () => {
     if (isRolling || loadingAuth || !auth) {
        console.warn("Roll prevented: already rolling, auth loading, or auth not available.");
        return;
     }
     if (!user) {
        toast({ title: "Login Required", description: "Please log in to get meal suggestions.", variant: 'destructive' });
        return;
      }
     setIsRolling(true);
     setFeedbackGiven(false);
     setImageUrl(getPhotoUrl(null)); // Set to random image during roll

     const isEatOut = preferences.dine_preference > 50; // Determine based on dine_preference slider
     let finalResult: SelectedMealResult | null = null;

     if (isEatOut && (preferences.latitude === undefined || preferences.longitude === undefined)) {
         toast({ title: "Location Needed", description: "Please enable location services or ensure it's saved in your profile for Eat Out suggestions.", variant: "destructive" });
         setIsRolling(false);
         return;
     }

     if (!isEatOut) { // Eat In
        finalResult = await decideMealFromLocalData(false);
     } else { // Eat Out
         if (!restaurantFinder) {
              toast({ title: "Error", description: "Restaurant finding service unavailable.", variant: "destructive" });
              setIsRolling(false);
              return;
          }
         try {
            const apiPreferences: UserPreferences = {
                ...preferences,
                latitude: preferences.latitude!,
                longitude: preferences.longitude!,
            };
             const result = await restaurantFinder({ preferences: apiPreferences });
             const suggestions = result.data.suggestions;

             if (suggestions && suggestions.length > 0) {
                 const filteredSuggestions = suggestions.filter(s =>
                     !lastSelectedMealRef.current || !lastSelectedMealRef.current.isApiSuggestion || s.place_id !== (lastSelectedMealRef.current.restaurant as Suggestion).place_id
                 );

                 if (filteredSuggestions.length === 0 && suggestions.length > 0) { // If all suggestions are same as last, pick one
                    finalResult = { restaurant: suggestions[0], meal: { name: suggestions[0].name }, isHomemade: false, isApiSuggestion: true };
                 } else if (filteredSuggestions.length > 0){
                    const randomIndex = Math.floor(Math.random() * filteredSuggestions.length);
                    finalResult = { restaurant: filteredSuggestions[randomIndex], meal: { name: filteredSuggestions[randomIndex].name }, isHomemade: false, isApiSuggestion: true };
                 } else { // No API suggestions, fallback to local
                     toast({ title: "Using Local Restaurants", description: "Couldn't find new nearby places, showing local options for eating out." });
                     finalResult = await decideMealFromLocalData(true); // true for eat-out fallback
                 }
             } else { // No API suggestions at all
                 toast({ title: "Using Local Restaurants", description: "Couldn't find any nearby places, showing local options for eating out." });
                 finalResult = await decideMealFromLocalData(true); // true for eat-out fallback
             }
         } catch (error: any) {
             console.error("Error calling restaurantFinder:", error);
             toast({ title: "Error Finding Restaurants", description: error.details || error.message || "Could not fetch suggestions. Using local options.", variant: "destructive" });
             finalResult = await decideMealFromLocalData(true); // true for eat-out fallback
         }
     }

     if (finalResult) {
         setSelectedResult(finalResult);
         lastSelectedMealRef.current = finalResult;
         setImageUrl(getPhotoUrl(finalResult)); // Update image based on the new result
     } else {
         setSelectedResult(null);
         setImageUrl(getPhotoUrl(null)); // Fallback to random image
         toast({ title: "No suggestions found", description: "Try adjusting your preferences or adding custom meals!", variant: "destructive" });
     }
     setIsRolling(false);
   };

  const getCustomMeals = async (): Promise<MealItem[]> => {
    if (!user || !db) {
        console.warn("Cannot get custom meals: User not logged in or DB not initialized.");
        return [];
    }
    try {
      const mealsColRef = collection(db, "users", user.uid, "custom_meals");
      const querySnapshot = await getDocs(mealsColRef);
      const fetchedMeals: MealItem[] = [];
      querySnapshot.forEach((doc) => {
         const data = doc.data();
         fetchedMeals.push({ name: data.meal, description: data.restaurant || undefined });
      });
      return fetchedMeals;
    } catch (error) {
      console.error("Error fetching custom meals:", error);
      return [];
    }
  };

  const decideMealFromLocalData = async (isEatOutFallback = false): Promise<SelectedMealResult | null> => {
      const currentMealType = getCurrentMealType();
      const effectiveCountry = preferences.country || (location?.country === 'Jamaica' || location?.country === 'Trinidad' ? location.country : 'Jamaica');
      const locationData = currentRestaurantList[effectiveCountry as 'Jamaica' | 'Trinidad'];

      if (!locationData) {
          toast({ title: "Error", description: `Could not load local data for ${effectiveCountry}.`, variant: "destructive" });
          return null;
      }
      let availableResults: SelectedMealResult[] = [];

      if (isEatOutFallback) { // Suggesting from local restaurants for "Eat Out"
          locationData.restaurants.forEach(restaurant => {
              const mealsForTime = restaurant.menu[currentMealType] || [];
              const desserts = restaurant.menu.Desserts || [];
              const combinedMeals = [...mealsForTime, ...(currentMealType !== 'Breakfast' ? desserts : [])];

              combinedMeals.forEach(meal => {
                  availableResults.push({ restaurant: restaurant, meal: meal, isHomemade: false, isApiSuggestion: false });
              });
          });
      } else { // Suggesting homemade or custom for "Eat In"
           const homemadeMealsForTime = locationData.homemade[currentMealType] || [];
           homemadeMealsForTime.forEach(mealName => { // Homemade meals are just strings
               availableResults.push({ restaurant: { name: "Homemade", locations: [], cuisine_type: 'Home', menu: {}, price_level: 0 }, meal: { name: mealName }, isHomemade: true, isApiSuggestion: false });
           });
           const customMealsList = await getCustomMeals();
           customMealsList.forEach(customMeal => {
                availableResults.push({
                     restaurant: customMeal.description ? { name: customMeal.description, locations: [], cuisine_type: 'Custom', menu: {}, price_level: 0 } : { name: "Custom Meal", locations: [], cuisine_type: 'Custom', menu: {}, price_level: 0 },
                     meal: { name: customMeal.name }, isHomemade: !customMeal.description, isApiSuggestion: false,
                 });
           });
      }

      if (availableResults.length === 0) {
          toast({ title: "No Options", description: `No ${isEatOutFallback ? 'local restaurants' : 'homemade or custom meals'} found for ${currentMealType} in ${effectiveCountry}.`, variant: "destructive"});
          return null;
      }

      const filteredResults = availableResults.filter(result => {
        if (!lastSelectedMealRef.current || lastSelectedMealRef.current.isApiSuggestion || lastSelectedMealRef.current.isHomemade !== result.isHomemade) return true;
        const lastRestName = (lastSelectedMealRef.current.restaurant as LocalRestaurant).name;
        const currentRestName = (result.restaurant as LocalRestaurant).name;
        const lastMealName = lastSelectedMealRef.current.meal.name;
        const currentMealName = result.meal.name;

        if(result.isHomemade) return lastMealName !== currentMealName;
        else return !(lastRestName === currentRestName && lastMealName === currentMealName);
      });

      if (filteredResults.length === 0 && availableResults.length > 0) {
           return availableResults[Math.floor(Math.random() * availableResults.length)];
      } else if (filteredResults.length > 0) {
            return filteredResults[Math.floor(Math.random() * filteredResults.length)];
      } else {
            toast({ title: "No New Options", description: `No new ${isEatOutFallback ? 'local restaurants' : 'homemade or custom meals'} found. Try again later or adjust preferences.`, variant: "destructive"});
            return null; // Or return the last suggestion if you want to show something
      }
  };

  const handleShake = () => {
    if (!isRolling && !loadingAuth && auth && user) {
      decideMeal();
    } else {
        console.warn("Shake prevented: already rolling, auth loading, auth not available, or no user.");
    }
  };

   const handlePreferenceChange = (key: keyof UserPreferences, value: number | string) => {
     setPreferences(prev => ({ ...prev, [key]: value }));
   };

   const handleFeedback = async (liked: boolean) => {
     if (!user || !selectedResult || feedbackGiven || !db) {
         console.warn("Cannot record feedback: User not logged in, no result, feedback already given, or DB not initialized.");
         return;
     }
     setFeedbackGiven(true);
     const feedbackData = {
       userId: user.uid,
       suggestion: {
         restaurantName: (selectedResult.restaurant as LocalRestaurant | Suggestion).name,
         mealName: selectedResult.meal.name,
         isApi: selectedResult.isApiSuggestion,
         isHomemade: selectedResult.isHomemade,
         placeId: selectedResult.isApiSuggestion ? (selectedResult.restaurant as Suggestion).place_id : undefined,
       },
       preferencesSnapshot: preferences,
       liked: liked,
       timestamp: serverTimestamp(),
     };
     try {
       await addDoc(collection(db, "feedback"), feedbackData);
       toast({ title: "Feedback Recorded", description: "Thanks for your feedback!" });

        // Update favoriteMeals or favoriteRestaurants based on feedback
        if (liked) {
            const currentFavMeals = preferences.favoriteMeals || [];
            const currentFavRestaurants = preferences.favoriteRestaurants || [];
            let updatedPrefs = { ...preferences };

            if (!selectedResult.isHomemade && !currentFavRestaurants.includes((selectedResult.restaurant as LocalRestaurant | Suggestion).name)) {
                updatedPrefs.favoriteRestaurants = [...currentFavRestaurants, (selectedResult.restaurant as LocalRestaurant | Suggestion).name];
            }
            if (!currentFavMeals.includes(selectedResult.meal.name)) {
                 updatedPrefs.favoriteMeals = [...currentFavMeals, selectedResult.meal.name];
            }
            setPreferences(updatedPrefs); // Update local state
            saveUserPreferences(updatedPrefs); // Save to Firestore
        }

     } catch (error) {
       console.error("Error saving feedback:", error);
       toast({ title: "Error", description: "Could not save feedback.", variant: "destructive" });
       setFeedbackGiven(false);
     }
   };

  if (loadingAuth && !user) { // Show loading only if user is not yet determined
    return <div className="flex items-center justify-center min-h-screen">Loading user data...</div>;
  }


  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-white">
      <Toaster />
       {typeof window !== 'undefined' && <ShakeEvent onShake={handleShake} />}
        <div className="w-full flex justify-between items-center p-4 bg-white">
           <Image
             src="https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2FNumnum-logo.png?alt=media"
             alt="NumNum Logo"
             width={150}
             height={40}
             className="object-contain"
             data-ai-hint="logo brand company"
           />
            <div className="flex items-center space-x-1">
              <p className={`${poppins.className} text-[10px]`} style={{ color: '#1E1E1E' }}>
                  {loadingAuth && !location ? "Loading..." : location ? `${location.city}, ${location.country}` : "Getting Location..."}
              </p>
             <MapPin className="h-4 w-4 text-gray-500" />
            </div>
        </div>
       <Card
         className="w-full max-w-md mb-4 shadow-md rounded-lg"
         style={{ backgroundColor: "white", borderColor: "#C1C1C1" }}
       >
          <CardHeader className="text-left">
            <CardTitle className={`text-lg font-semibold text-left`} style={{color: '#1E1E1E'}}>
             Today's Pick
            </CardTitle>
              <Image
                 src={imageUrl}
                 alt={selectedResult?.meal?.name || "Meal suggestion"}
                 width={200}
                 height={100}
                 className="rounded-md mt-2 mx-auto object-cover"
                 data-ai-hint="meal food plate restaurant dish logo"
                 key={imageUrl} // Add key to re-render image on change
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
                 {selectedResult.isHomemade ? "Homemade" : (selectedResult.restaurant as LocalRestaurant | Suggestion).name || "Restaurant"}
               </p>
               <p className="text-lg font-bold mb-2" style={{ color: '#1E1E1E' }}>
                 {selectedResult.meal.name}
               </p>
               {!selectedResult.isHomemade && (selectedResult.restaurant as LocalRestaurant).locations && (selectedResult.restaurant as LocalRestaurant).locations.length > 0 && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {(selectedResult.restaurant as LocalRestaurant).locations[0].address}
                  </p>
                )}
                {!selectedResult.isHomemade && (selectedResult.restaurant as Suggestion)?.address && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {(selectedResult.restaurant as Suggestion).address}
                  </p>
                )}
               {!selectedResult.isHomemade && (selectedResult.restaurant as Suggestion)?.distance !== undefined && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Approx. {((selectedResult.restaurant as Suggestion).distance! / 1609).toFixed(1)} miles away
                  </p>
                )}
                {!feedbackGiven && user && (
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
              <p className="text-muted-foreground">{loadingAuth && !user ? "Loading..." : getGreeting()}</p>
           )}
         </CardContent>
       </Card>
       <Card className={`w-full max-w-md mb-4 shadow-md rounded-lg ${poppins.className}`} style={{backgroundColor: 'white', borderColor: '#C1C1C1', color: '#1E1E1E'}}>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <CardHeader className="p-4"> {/* Adjust padding as needed */}
                <CardTitle className={`${bagel.className} text-lg font-semibold`} style={{color: '#1E1E1E'}}>Meal Picker</CardTitle>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-6 p-4"> {/* Adjust padding as needed */}
                  <div className="grid gap-2">
                       <Label htmlFor="mood" style={{ color: '#1E1E1E' }}>Mood</Label>
                       <div className="flex justify-between text-xs mb-1" style={{ color: '#1E1E1E' }}>
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
                                        className="w-full flex items-center justify-center"
                                      />
                                </TooltipTrigger>
                                <TooltipContent>
                                   <p>{getMoodEmoji(preferences.mood_level, 100)} {preferences.mood_level <= 50 ? 'Faves' : 'Adventurous'}</p>
                                </TooltipContent>
                            </Tooltip>
                       </TooltipProvider>
                        <div className="flex justify-between text-xs mt-1" style={{ color: '#1E1E1E' }}>
                          <span>0</span>
                          <span>50</span>
                          <span>100</span>
                        </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hunger" style={{ color: '#1E1E1E' }}>Hunger Level</Label>
                       <div className="flex justify-between text-xs mb-1" style={{ color: '#1E1E1E' }}>
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
                                      className="w-full flex items-center justify-center"
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                   <p>{getHungerEmoji(preferences.hunger_level, 100)} {preferences.hunger_level <= 50 ? 'Peckish' : 'Famished'}</p>
                                </TooltipContent>
                            </Tooltip>
                       </TooltipProvider>
                        <div className="flex justify-between text-xs mt-1" style={{ color: '#1E1E1E' }}>
                          <span>0</span>
                          <span>50</span>
                          <span>100</span>
                        </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="budget" style={{ color: '#1E1E1E' }}>Pocket Feeling (Budget)</Label>
                      <div className="flex justify-between text-xs mb-1" style={{ color: '#1E1E1E' }}>
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
                                className="w-full flex items-center justify-center"
                              />
                          </TooltipTrigger>
                           <TooltipContent>
                               <p>{getBudgetEmoji(preferences.budget_level, 100)} {preferences.budget_level <= 33 ? 'Stingy' : preferences.budget_level <= 66 ? 'Normal' : 'Fancy'}</p>
                          </TooltipContent>
                       </Tooltip>
                     </TooltipProvider>
                       <div className="flex justify-between text-xs mt-1" style={{ color: '#1E1E1E' }}>
                          <span>0</span>
                          <span>50</span>
                          <span>100</span>
                        </div>
                  </div>
                   <div className="grid gap-2">
                     <Label htmlFor="dinetype" style={{ color: '#1E1E1E' }}>Dine Type</Label>
                       <div className="flex items-center justify-between text-xs mb-1">
                            <div style={{ color: '#1E1E1E' }}>Eat In 🏠</div>
                            <div style={{ color: '#1E1E1E' }}>Eat Out 🛵</div>
                        </div>
                      <TooltipProvider>
                        <Tooltip>
                           <TooltipTrigger asChild>
                               <Slider
                                 id="dinetype"
                                 min={0}
                                 max={100}
                                 step={1}
                                 value={[preferences.dine_preference]}
                                 onValueChange={(value) => handlePreferenceChange('dine_preference', value[0])}
                                 className="w-full flex items-center justify-center"
                               />
                            </TooltipTrigger>
                            <TooltipContent>
                               <p>{getDineTypeEmoji(preferences.dine_preference, 100)} {preferences.dine_preference <= 50 ? 'Eating In' : 'Eating Out'}</p>
                            </TooltipContent>
                         </Tooltip>
                      </TooltipProvider>
                       <div className="flex justify-between text-xs mt-1" style={{ color: '#1E1E1E' }}>
                          <span>0</span>
                          <span>50</span>
                          <span>100</span>
                        </div>
                   </div>
                  <div className="grid gap-2">
                     <Label htmlFor="spicy" style={{ color: '#1E1E1E' }}>Spicy Level</Label>
                       <div className="flex justify-between text-xs mb-1" style={{ color: '#1E1E1E' }}>
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
                                  className="w-full flex items-center justify-center"
                                />
                           </TooltipTrigger>
                            <TooltipContent>
                                <p>{getSpicyEmoji(preferences.spicy_level, 100)} {preferences.spicy_level <= 33 ? 'Mild' : preferences.spicy_level <= 66 ? 'Medium' : 'Hot!'}</p>
                             </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className="flex justify-between text-xs mt-1" style={{ color: '#1E1E1E' }}>
                          <span>0</span>
                          <span>50</span>
                          <span>100</span>
                        </div>
                   </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
       <Button
          className="w-full max-w-md mb-4 shadow-sm rounded-full"
          onClick={decideMeal}
          disabled={isRolling || (loadingAuth && !user) || (preferences.dine_preference > 50 && !userLocation && !preferences.latitude) || !auth || !user}
          style={{ backgroundColor: '#55D519', color: 'white' }}
        >
          {isRolling ? 'Rolling...' : 'Roll the Dice 🎲'}
        </Button>
     </div>
   );
 }

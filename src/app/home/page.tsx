// src/app/home/page.tsx
// ... imports ...

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Important!

export default function Home() {
  // ... existing state ...
  const [imageUrl, setImageUrl] = useState(imageList[Math.floor(Math.random() * imageList.length)]); // Initialize with random

  // ... existing functions (getLocation, saveUserPreferences, etc.) ...

  // --- Helper to get the best Photo URL ---
  const getPhotoUrl = (result: SelectedMealResult | null): string => {
    if (!result) {
      // Default random image if no result
      return imageList[Math.floor(Math.random() * imageList.length)];
    }

    // 1. Prioritize Google Places API Photo
    if (result.isApiSuggestion && (result.restaurant as Suggestion)?.photo_reference && GOOGLE_MAPS_API_KEY) {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${(result.restaurant as Suggestion).photo_reference}&key=${GOOGLE_MAPS_API_KEY}`;
    }

    // 2. Use Specific Local Image URL if available (not homemade)
    if (!result.isHomemade && (result.restaurant as LocalRestaurant)?.image_url) {
      return (result.restaurant as LocalRestaurant).image_url!;
    }

    // 3. Fallback to a random image from the list
    return imageList[Math.floor(Math.random() * imageList.length)];
  };


   // --- Meal Decision Logic ---
    const decideMeal = async () => {
      // ... (login check, get isEatIn) ...

      setIsRolling(true);
      setFeedbackGiven(false);

      let finalResult: SelectedMealResult | null = null; // Variable to hold the result

      if (isEatIn) {
        // --- Logic for Eating In (Homemade + Custom) ---
         finalResult = decideMealFromLocalData(false); // Get result from local function
      } else {
        // --- Logic for Eating Out (API Call or Local Fallback) ---
        if (preferences.latitude === undefined || preferences.longitude === undefined) {
          // ... (handle missing location) ...
          setIsRolling(false);
          return;
        }
         if (!restaurantFinder) {
           // ... (handle missing function) ...
           setIsRolling(false);
           return;
         }

        try {
          const result = await restaurantFinder({ preferences });
          const suggestions = result.data.suggestions;

          if (suggestions && suggestions.length > 0) {
             // ... (filter suggestions to avoid repeats) ...
            const randomIndex = Math.floor(Math.random() * filteredSuggestions.length);
            const newSelectedSuggestion = filteredSuggestions[randomIndex];

            finalResult = { // Assign to finalResult
              restaurant: newSelectedSuggestion,
              meal: { name: newSelectedSuggestion.name }, // Use restaurant name as meal initially
              isHomemade: false,
              isApiSuggestion: true,
            };

          } else {
             toast({ title: "Using Local Restaurants", description: "Couldn't find nearby places, showing local options." });
             finalResult = decideMealFromLocalData(true); // Get result from local fallback
          }

        } catch (error: any) {
           // ... (handle API error) ...
           finalResult = decideMealFromLocalData(true); // Get result from local fallback on error
        }
      }

      // --- Update State After Decision ---
      if (finalResult) {
         setSelectedResult(finalResult);
         lastSelectedMealRef.current = finalResult; // Update ref
         setImageUrl(getPhotoUrl(finalResult)); // Set image based on the final result
      } else {
         // Handle case where no result was found (though decideMealFromLocalData should prevent this if data exists)
         setSelectedResult(null);
         setImageUrl(getPhotoUrl(null)); // Set to default random image
         toast({ title: "No suggestions found", description: "Try adjusting your preferences!", variant: "destructive" });
      }

      setIsRolling(false); // Stop rolling after processing
    };

    // --- Local Data Decision Logic ---
    const decideMealFromLocalData = (isEatOutFallback = false): SelectedMealResult | null => { // Return the result or null
         // ... (get currentMealType, locationKey, locationData) ...

         let availableResults: SelectedMealResult[] = [];
         // ... (populate availableResults based on isEatOutFallback and locationData) ...

         // ... (filter out last selected local meal) ...

         if (filteredResults.length === 0) {
           // ... (show toast if no meals found) ...
           return null; // Indicate no result found
         }

         const randomIndex = Math.floor(Math.random() * filteredResults.length);
         const newSelectedLocalResult = filteredResults[randomIndex];

         // Don't set state here, return the result
         return newSelectedLocalResult;
    };

   // ... handleShake, handlePreferenceChange, handleFeedback ...

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-white">
      {/* ... Toaster, ShakeEvent ... */}

      {/* Top Bar */}
      {/* ... */}

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
                 // Important: Add unoptimized={true} if you encounter issues with external URLs
                 // or configure the hostname in next.config.ts
                 // unoptimized={true}
                 data-ai-hint="meal food plate restaurant dish logo" // Update hint
                 key={imageUrl} // Add key to force re-render when URL changes
              />
          </CardHeader>
         <CardContent className="flex flex-col items-start">
             {/* ... display selectedResult details and feedback buttons ... */}
         </CardContent>
       </Card>

      {/* Meal Picker Card */}
      {/* ... */}

       {/* Roll the Dice Button */}
       {/* ... */}
     </div>
   );
 }

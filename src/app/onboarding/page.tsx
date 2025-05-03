
"use client";

import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { auth, db } from '@/lib/firebaseClient'; // Use client-side firebase
import { doc, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { currentRestaurantList } from '@/lib/data'; // Import local data
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import type { UserPreferences } from '@/lib/interfaces';
import Image from 'next/image';


// Define Zod schema for form validation
const onboardingSchema = z.object({
  country: z.enum(['Jamaica', 'Trinidad'], { required_error: 'Please select your country.' }),
  favoriteMeals: z.array(z.string()).min(1, 'Select at least one favorite meal.'),
  favoriteRestaurants: z.array(z.string()).min(1, 'Select at least one favorite restaurant.'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const OnboardingPage: FC = () => {
  const [user, loadingAuth, errorAuth] = auth ? useAuthState(auth) : [null, true, null];
  const router = useRouter();
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = useState<'Jamaica' | 'Trinidad' | ''>('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      country: undefined,
      favoriteMeals: [],
      favoriteRestaurants: [],
    },
  });

  const country = watch('country');

  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push('/login'); // Redirect if not logged in
    }
  }, [user, loadingAuth, router]);

  // Memoize options based on country
  const mealOptions = useMemo(() => {
    if (!country) return [];
    const allMeals = new Set<string>();
     Object.values(currentRestaurantList[country].homemade).flat().forEach(meal => allMeals.add(meal));
     currentRestaurantList[country].restaurants.forEach(r =>
        Object.values(r.menu).flat().forEach(mealItem => allMeals.add(mealItem.name))
     );
    return Array.from(allMeals).sort();
  }, [country]);

  const restaurantOptions = useMemo(() => {
    if (!country) return [];
    return currentRestaurantList[country].restaurants.map(r => r.name).sort();
  }, [country]);

  // Reset selections when country changes
  useEffect(() => {
    setValue('favoriteMeals', []);
    setValue('favoriteRestaurants', []);
  }, [country, setValue]);


  const onSubmit = async (data: OnboardingFormData) => {
    if (!user || !db) {
      toast({ title: "Error", description: "User not authenticated or database unavailable.", variant: "destructive" });
      return;
    }
    setLoadingSubmit(true);

    const preferencesToSave: Partial<UserPreferences> = {
      country: data.country,
      favoriteMeals: data.favoriteMeals,
      favoriteRestaurants: data.favoriteRestaurants,
       // Set default slider values if needed, or load existing ones
      mood_level: 50,
      hunger_level: 50,
      dine_preference: 50,
      budget_level: 50,
      spicy_level: 50,
    };

    try {
      const userPrefsRef = doc(db, 'user_preferences', user.uid);
      await setDoc(userPrefsRef, preferencesToSave, { merge: true }); // Merge with existing prefs if any

      toast({ title: "Success", description: "Preferences saved!" });
      router.push('/home'); // Redirect to home page
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({ title: "Error", description: "Could not save preferences.", variant: "destructive" });
    } finally {
        setLoadingSubmit(false);
    }
  };

  if (loadingAuth) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>; // Or a spinner component
  }

  if (errorAuth) {
     return <div className="flex items-center justify-center min-h-screen">Error loading user data. Please try refreshing.</div>;
  }


  return (
     <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
        <Toaster />
         <Image
            src="https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2FNumnum-logo.png?alt=media"
            alt="NumNum Logo"
            width={200}
            height={100}
            className="rounded-md mb-4"
        />
        <Card className="w-full max-w-lg shadow-md rounded-lg">
            <CardHeader>
            <CardTitle className="text-xl font-semibold">Welcome to NumNum!</CardTitle>
            <CardDescription>Let's personalize your experience.</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Country Selection */}
                <div className="space-y-2">
                <Label htmlFor="country">Which country are you usually in?</Label>
                <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                    <Select
                        onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedCountry(value as 'Jamaica' | 'Trinidad');
                         }}
                        value={field.value}
                    >
                        <SelectTrigger id="country" className="w-full">
                        <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="Jamaica">Jamaica 🇯🇲</SelectItem>
                        <SelectItem value="Trinidad">Trinidad 🇹🇹</SelectItem>
                        </SelectContent>
                    </Select>
                    )}
                />
                {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
                </div>

                 {/* Favorite Meals Selection (conditional) */}
                {country && mealOptions.length > 0 && (
                    <div className="space-y-2">
                    <Label>What are some of your favorite meals?</Label>
                    <ScrollArea className="h-40 w-full rounded-md border p-4">
                        <Controller
                        name="favoriteMeals"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-2">
                            {mealOptions.map((meal) => (
                                <div key={meal} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`meal-${meal}`}
                                    checked={field.value?.includes(meal)}
                                    onCheckedChange={(checked) => {
                                    return checked
                                        ? field.onChange([...(field.value || []), meal])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== meal)
                                        );
                                    }}
                                />
                                <label
                                    htmlFor={`meal-${meal}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {meal}
                                </label>
                                </div>
                            ))}
                            </div>
                        )}
                        />
                    </ScrollArea>
                    {errors.favoriteMeals && <p className="text-sm text-destructive">{errors.favoriteMeals.message}</p>}
                    </div>
                )}

                 {/* Favorite Restaurants Selection (conditional) */}
                {country && restaurantOptions.length > 0 && (
                <div className="space-y-2">
                    <Label>Which restaurants do you like?</Label>
                    <ScrollArea className="h-40 w-full rounded-md border p-4">
                        <Controller
                        name="favoriteRestaurants"
                        control={control}
                        render={({ field }) => (
                        <div className="space-y-2">
                            {restaurantOptions.map((restaurant) => (
                            <div key={restaurant} className="flex items-center space-x-2">
                                <Checkbox
                                id={`restaurant-${restaurant}`}
                                checked={field.value?.includes(restaurant)}
                                onCheckedChange={(checked) => {
                                    return checked
                                    ? field.onChange([...(field.value || []), restaurant])
                                    : field.onChange(
                                        field.value?.filter((value) => value !== restaurant)
                                    );
                                }}
                                />
                                <label
                                htmlFor={`restaurant-${restaurant}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                {restaurant}
                                </label>
                            </div>
                            ))}
                        </div>
                        )}
                        />
                    </ScrollArea>
                    {errors.favoriteRestaurants && <p className="text-sm text-destructive">{errors.favoriteRestaurants.message}</p>}
                    </div>
                )}


                <Button type="submit" className="w-full rounded-full" style={{ backgroundColor: "#55D519", color: "white" }} disabled={loadingSubmit}>
                 {loadingSubmit ? "Saving..." : "Let's Go!"}
                </Button>
            </form>
            </CardContent>
        </Card>
     </div>
  );
};

export default OnboardingPage;

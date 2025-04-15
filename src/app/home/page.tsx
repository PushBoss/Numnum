'use client';

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
import { Bagel_Fat_One } from "next/font/google";

const bagel = Bagel_Fat_One({ subsets: ["latin"], weight: "400" });

interface Meal {
  meal: string;
  restaurant?: string;
}

const defaultMeals = {
  Jamaica: [
    { meal: "Beef Patty", restaurant: "Juici Patties" },
    { meal: "Curry Chicken", restaurant: "Juici Patties" },
    { meal: "Coco Bread", restaurant: "Juici Patties" },
    { meal: "Jerk Chicken", restaurant: "Scotchies" },
    { meal: "Festival", restaurant: "Scotchies" },
    { meal: "Roast Yam", restaurant: "Scotchies" },
    { meal: "BBQ Chicken", restaurant: "Island Grill" },
    { meal: "Rice & Peas", restaurant: "Island Grill" },
    { meal: "Callaloo Wrap", restaurant: "Island Grill" },
  ],
  Trinidad: [
    { meal: "Fried Chicken", restaurant: "Royal Castle" },
    { meal: "Fries", restaurant: "Royal Castle" },
    { meal: "Spicy Wings", restaurant: "Royal Castle" },
    { meal: "Doubles", restaurant: "Doubles King" },
    { meal: "Aloo Pie", restaurant: "Doubles King" },
    { meal: "Chickpea Wrap", restaurant: "Doubles King" },
    { meal: "Chicken Roti", restaurant: "Roti Cafe" },
    { meal: "Goat Roti", restaurant: "Roti Cafe" },
    { meal: "Dhalpourie", restaurant: "Roti Cafe" },
  ],
};

export default function Home() {
  const [location, setLocation] = useState<"Jamaica" | "Trinidad">("Jamaica");
    const [category, setCategory] = useState<"Restaurants" | "Meals" | "Desserts">("Restaurants");

  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [customMeals, setCustomMeals] = useState<Meal[]>([]);
  const [newMeal, setNewMeal] = useState<string>("");
  const [newRestaurant, setNewRestaurant] = useState<string>("");
  const [isShaking, setIsShaking] = useState(false); // State for shaking animation
  const { toast } = useToast();

  useEffect(() => {
    const storedMeals = localStorage.getItem(`${location}-customMeals`);
    if (storedMeals) {
      setCustomMeals(JSON.parse(storedMeals));
    }
  }, [location]);

  useEffect(() => {
    localStorage.setItem(`${location}-customMeals`, JSON.stringify(customMeals));
  }, [customMeals, location]);

  const decideMeal = () => {
    setIsShaking(true); // Start shaking animation

    setTimeout(() => {
      setIsShaking(false); // End shaking animation

      const locationMeals = [...defaultMeals[location], ...customMeals];
      if (locationMeals.length === 0) {
        toast({
          title: "No meals available!",
          description:
            "Add some meals to your custom list or select a different location.",
        });
        return;
      }
      const randomIndex = Math.floor(Math.random() * locationMeals.length);
      setSelectedMeal(locationMeals[randomIndex]);
    }, 2000); // Simulate rolling time
  };

  const handleShake = () => {
    decideMeal();
  };

  const addCustomMeal = () => {
    if (!newMeal) {
      toast({
        title: "Error",
        description: "Meal name is required.",
        variant: "destructive",
      });
      return;
    }

    const newCustomMeal = { meal: newMeal, restaurant: newRestaurant || undefined };
    setCustomMeals([...customMeals, newCustomMeal]);
    setNewMeal("");
    setNewRestaurant("");

    toast({
      title: "Success",
      description: "Meal added successfully!",
    });
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-white">
      <Toaster />
      <ShakeEvent onShake={handleShake} />

      {/* Top Bar with Logo */}
      <div className="w-full flex justify-start items-center p-4">
        <h1 className={`${bagel.className} text-3xl`} style={{ color: '#55D519' }}>
          NumNum!
        </h1>
      </div>

      {/* Today's Pick Card */}
      <Card className="w-full max-w-md mb-4 shadow-md rounded-lg" style={{ backgroundColor: 'white', borderColor: '#C1C1C1' }}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Today's Pick</CardTitle>
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
            <p className="text-muted-foreground">No meal selected yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Meal Picker Card */}
      <Card className="w-full max-w-md mb-4 shadow-md rounded-lg" style={{ backgroundColor: 'white', borderColor: '#C1C1C1' }}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Meal Picker</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="grid gap-4">
            <Select value={category} onValueChange={(value) => setCategory(value as "Restaurants" | "Meals" | "Desserts")}>
              <SelectTrigger className="w-full shadow-sm">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Restaurants">Restaurants</SelectItem>
                <SelectItem value="Meals">Meals</SelectItem>
                <SelectItem value="Desserts">Desserts</SelectItem>
              </SelectContent>
            </Select>
             <div style={{ marginBottom: '20px' }} />
            <Select value={location} onValueChange={(value) => setLocation(value as "Jamaica" | "Trinidad")}>
              <SelectTrigger className="w-full shadow-sm">
                <SelectValue placeholder="Choose your location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Jamaica">Jamaica 🇯🇲</SelectItem>
                <SelectItem value="Trinidad">Trinidad 🇹🇹</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Roll the Dice Button */}
      {isShaking ? (
        <div className="flex flex-col items-center">
          <Progress value={50} className="w-full max-w-md mb-2" />
          <p className="text-sm text-muted-foreground">Shaking up your meal...</p>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full max-w-md mb-4 shadow-sm"
          onClick={decideMeal}
        >
          Roll the Dice 🎲
        </Button>
      )}
      <Button variant="link" onClick={decideMeal}>
        Don't have motion? Tap here to roll
      </Button>
      <Separator className="w-full max-w-md my-4" />
    </div>
  );
}

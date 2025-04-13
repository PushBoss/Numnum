"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ShakeEvent } from "@/components/shake-event";

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
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [customMeals, setCustomMeals] = useState<Meal[]>([]);
  const [newMeal, setNewMeal] = useState<string>("");
  const [newRestaurant, setNewRestaurant] = useState<string>("");
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
    const locationMeals = [...defaultMeals[location], ...customMeals];
    if (locationMeals.length === 0) {
      toast({
        title: "No meals available!",
        description: "Add some meals to your custom list or select a different location.",
      });
      return;
    }
    const randomIndex = Math.floor(Math.random() * locationMeals.length);
    setSelectedMeal(locationMeals[randomIndex]);
  };

  const handleShake = () => {
    decideMeal();
    // Add rolling animation and sound effect here
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
    <>
      <Toaster />
      <ShakeEvent onShake={handleShake} />
      
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={location} onValueChange={(value) => setLocation(value as "Jamaica" | "Trinidad")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Jamaica">Jamaica</SelectItem>
                <SelectItem value="Trinidad">Trinidad</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Shake to Decide!</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Button onClick={decideMeal}>Roll the Dice</Button>
            {selectedMeal && (
              
                {selectedMeal.restaurant ? (
                  <>
                    You're eating at <strong>{selectedMeal.restaurant}</strong>:
                  </>
                ) : (
                  <>You're eating:</>
                )}
                <strong>{selectedMeal.meal}</strong>
              
            )}
          </CardContent>
        </Card>

        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Add Custom Meal</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="meal">Meal Name</Label>
              <Input id="meal" value={newMeal} onChange={(e) => setNewMeal(e.target.value)} />
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="restaurant">Restaurant (Optional)</Label>
              <Input id="restaurant" value={newRestaurant} onChange={(e) => setNewRestaurant(e.target.value)} />
            </div>
            <Button onClick={addCustomMeal}>Add Meal</Button>
          </CardContent>
        </Card>
      
    </>
  );
}

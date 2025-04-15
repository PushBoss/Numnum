"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { List, ListItem, ListHeader, ListEmpty, ListAction } from "@/components/ui/list";
import { Edit, Trash } from "lucide-react";

interface Meal {
  meal: string;
  restaurant?: string;
}

export default function AccountPage() {
  const [customMeals, setCustomMeals] = useState<Meal[]>([]);
  const [newMeal, setNewMeal] = useState<string>("");
  const [newRestaurant, setNewRestaurant] = useState<string>("");
  const [editingMealIndex, setEditingMealIndex] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedMeals = localStorage.getItem('customMeals');
    if (storedMeals) {
      setCustomMeals(JSON.parse(storedMeals));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('customMeals', JSON.stringify(customMeals));
  }, [customMeals]);

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

  const startEditMeal = (index: number) => {
    setEditingMealIndex(index);
    setNewMeal(customMeals[index].meal);
    setNewRestaurant(customMeals[index].restaurant || "");
  };

  const saveEditedMeal = () => {
    if (editingMealIndex === null) return;

    if (!newMeal) {
      toast({
        title: "Error",
        description: "Meal name is required.",
        variant: "destructive",
      });
      return;
    }

    const updatedMeals = [...customMeals];
    updatedMeals[editingMealIndex] = { meal: newMeal, restaurant: newRestaurant || undefined };
    setCustomMeals(updatedMeals);
    setEditingMealIndex(null);
    setNewMeal("");
    setNewRestaurant("");

    toast({
      title: "Success",
      description: "Meal edited successfully!",
    });
  };

  const deleteMeal = (index: number) => {
    const updatedMeals = [...customMeals];
    updatedMeals.splice(index, 1);
    setCustomMeals(updatedMeals);

    toast({
      title: "Success",
      description: "Meal deleted successfully!",
    });
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-muted">
      <Toaster />

      <Avatar className="mb-4">
        <AvatarImage src="https://picsum.photos/50/50" alt="Profile" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>

      <Card className="w-full max-w-md mb-4 shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Custom Meals</CardTitle>
        </CardHeader>
        <CardContent>
          <List>
            {customMeals.length > 0 ? (
              customMeals.map((meal, index) => (
                <ListItem key={index}>
                  <div>
                    <div className="font-semibold">{meal.meal}</div>
                    {meal.restaurant && <div className="text-sm text-muted-foreground">{meal.restaurant}</div>}
                  </div>
                  <div className="ml-auto flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => startEditMeal(index)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMeal(index)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </ListItem>
              ))
            ) : (
              <ListEmpty>No custom meals added yet.</ListEmpty>
            )}
          </List>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {editingMealIndex !== null ? "Edit Meal" : "Add Custom Meal"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="meal">Meal Name</Label>
            <Input
              id="meal"
              placeholder="Enter meal name"
              value={newMeal}
              onChange={(e) => setNewMeal(e.target.value)}
            />
          </div>
          <div className="grid w-full gap-2">
            <Label htmlFor="restaurant">Restaurant (Optional)</Label>
            <Input
              id="restaurant"
              placeholder="Enter restaurant name"
              value={newRestaurant}
              onChange={(e) => setNewRestaurant(e.target.value)}
            />
          </div>
          {editingMealIndex !== null ? (
            <Button className="shadow-sm" onClick={saveEditedMeal} style={{ backgroundColor: '#55D519', color: 'white' }}>
              Save Meal
            </Button>
          ) : (
            <Button className="shadow-sm" onClick={addCustomMeal} style={{ backgroundColor: '#55D519', color: 'white' }}>
              Add Meal
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

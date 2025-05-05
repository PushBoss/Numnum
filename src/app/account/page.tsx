
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient"; // Use client-side firebase
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp, // Import Timestamp
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { List, ListItem, ListEmpty } from "@/components/ui/list";
import { Edit, Trash, LogOut } from "lucide-react";

// Interface for Firestore meal document
interface FirestoreMeal {
  id?: string; // Firestore document ID, optional for adding
  meal: string;
  restaurant?: string;
  userId: string; // To associate with the user
  createdAt: Timestamp; // Firestore timestamp
}

export default function AccountPage() {
  const [user, loadingAuth, errorAuth] = auth ? useAuthState(auth) : [null, true, null];
  const [customMeals, setCustomMeals] = useState<FirestoreMeal[]>([]); // State now holds FirestoreMeal[]
  const [newMeal, setNewMeal] = useState<string>("");
  const [newRestaurant, setNewRestaurant] = useState<string>("");
  const [editingMealId, setEditingMealId] = useState<string | null>(null); // Track Firestore doc ID being edited
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false); // Loading state for add/edit
  const { toast } = useToast();
  const router = useRouter();

  // Fetch custom meals from Firestore
  useEffect(() => {
    const fetchMeals = async () => {
      if (!user || !db) return;
      setLoadingMeals(true);
      try {
        const mealsColRef = collection(db, "users", user.uid, "custom_meals");
        const q = query(mealsColRef); // Add ordering if needed: orderBy("createdAt", "desc")
        const querySnapshot = await getDocs(q);
        const fetchedMeals: FirestoreMeal[] = [];
        querySnapshot.forEach((doc) => {
          fetchedMeals.push({ id: doc.id, ...doc.data() } as FirestoreMeal);
        });
        setCustomMeals(fetchedMeals);
      } catch (error) {
        console.error("Error fetching custom meals:", error);
        toast({ title: "Error", description: "Could not fetch custom meals.", variant: "destructive" });
      } finally {
        setLoadingMeals(false);
      }
    };

    if (user) {
      fetchMeals();
    } else if (!loadingAuth) {
      setLoadingMeals(false); // Stop loading if no user
      setCustomMeals([]); // Clear meals if user logs out
    }
  }, [user, loadingAuth, toast]);

  // Add custom meal to Firestore
  const addCustomMeal = async () => {
    if (!user || !db) {
        toast({ title: "Error", description: "User not authenticated or database not available.", variant: "destructive" });
        return;
    }
    if (!newMeal) {
      toast({ title: "Error", description: "Meal name is required.", variant: "destructive" });
      return;
    }

    setLoadingSubmit(true);
    try {
      const mealsColRef = collection(db, "users", user.uid, "custom_meals");
      // Ensure we have the correct type for Firestore addDoc
      const newMealData: {
        meal: string;
        restaurant?: string;
        userId: string;
        createdAt: Timestamp;
      } = {
        meal: newMeal,
        restaurant: newRestaurant || undefined,
        userId: user.uid,
        createdAt: serverTimestamp() as Timestamp, // Use server timestamp
      };
      const docRef = await addDoc(mealsColRef, newMealData);

      // Optimistically update UI or refetch
      // Add the new meal with the generated ID and a client-side approximate timestamp for immediate display
      setCustomMeals([...customMeals, { ...newMealData, id: docRef.id, createdAt: Timestamp.now() }]);


      setNewMeal("");
      setNewRestaurant("");
      toast({ title: "Success", description: "Meal added successfully!" });
    } catch (error: any) {
      console.error("Error adding custom meal to Firestore:", error);
      // Provide more specific error feedback if possible
      let description = "Failed to add meal.";
      if (error.code === 'permission-denied') {
        description = "Permission denied. Please check your Firestore rules.";
      } else if (error.message) {
        description = `Failed to add meal: ${error.message}`;
      }
      toast({ title: "Error", description, variant: "destructive" });
    } finally {
        setLoadingSubmit(false);
    }
  };

  // Start editing a meal
  const startEditMeal = (meal: FirestoreMeal) => {
     if (!meal.id) return;
    setEditingMealId(meal.id);
    setNewMeal(meal.meal);
    setNewRestaurant(meal.restaurant || "");
  };

   // Cancel editing
  const cancelEdit = () => {
    setEditingMealId(null);
    setNewMeal("");
    setNewRestaurant("");
  };


  // Save edited meal to Firestore
  const saveEditedMeal = async () => {
     if (!user || !db || editingMealId === null) return;
    if (!newMeal) {
      toast({ title: "Error", description: "Meal name is required.", variant: "destructive" });
      return;
    }

    setLoadingSubmit(true);
    try {
      const mealDocRef = doc(db, "users", user.uid, "custom_meals", editingMealId);
      const updatedData = {
        meal: newMeal,
        restaurant: newRestaurant || undefined, // Store as undefined if empty
      };
      await updateDoc(mealDocRef, updatedData);

      // Optimistically update UI or refetch
      setCustomMeals(customMeals.map(m => m.id === editingMealId ? { ...m, ...updatedData } : m));

      setEditingMealId(null);
      setNewMeal("");
      setNewRestaurant("");
      toast({ title: "Success", description: "Meal updated successfully!" });
    } catch (error: any) {
      console.error("Error updating custom meal:", error);
       let description = "Failed to update meal.";
       if (error.code === 'permission-denied') {
         description = "Permission denied. Please check your Firestore rules.";
       } else if (error.message) {
         description = `Failed to update meal: ${error.message}`;
       }
      toast({ title: "Error", description, variant: "destructive" });
    } finally {
        setLoadingSubmit(false);
    }
  };

  // Delete meal from Firestore
  const deleteMeal = async (mealId: string) => {
    if (!user || !db) return;
    if (!confirm("Are you sure you want to delete this meal?")) return; // Confirmation

    try {
      const mealDocRef = doc(db, "users", user.uid, "custom_meals", mealId);
      await deleteDoc(mealDocRef);

      // Optimistically update UI or refetch
      setCustomMeals(customMeals.filter(m => m.id !== mealId));

      toast({ title: "Success", description: "Meal deleted successfully!" });
    } catch (error: any) {
      console.error("Error deleting custom meal:", error);
       let description = "Failed to delete meal.";
       if (error.code === 'permission-denied') {
         description = "Permission denied. Please check your Firestore rules.";
       } else if (error.message) {
         description = `Failed to delete meal: ${error.message}`;
       }
      toast({ title: "Error", description, variant: "destructive" });
    }
  };

  // Logout function
  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
       if (!auth) {
        throw new Error("Firebase Auth not initialized");
      }
      await signOut(auth);
      toast({ title: "Success", description: "Logged out successfully!" });
      router.push('/login'); // Redirect to login page after logout
    } catch (error: any) {
      console.error("Logout Error:", error);
      toast({ title: "Error", description: "Failed to log out.", variant: "destructive" });
    } finally {
      setLoadingLogout(false);
    }
  };

  if (loadingAuth) {
     return <div className="flex items-center justify-center min-h-screen">Loading user...</div>; // Or a spinner
  }

  if (!user && !loadingAuth) { // Only redirect or show message if loading is finished and there's no user
     // Redirect to login page if not logged in and not loading
     // Check if window is defined to ensure this runs only on the client
     if (typeof window !== 'undefined') {
        router.push('/login');
        return <div className="flex items-center justify-center min-h-screen">Redirecting to login...</div>; // Optional loading message
     }
     return null; // Avoid rendering anything on the server if no user
   }

   if (!user) { // Fallback case if user is still null for some reason after loading
     return <div className="flex items-center justify-center min-h-screen">Please log in to view your account.</div>;
   }


  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-white">
      <Toaster />

      {/* Profile Card */}
      <Card className="w-full max-w-md mb-4 shadow-md rounded-lg" style={{backgroundColor: 'white'}}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Profile</CardTitle>
        </CardHeader>
        <CardContent>
             <div className="flex items-center space-x-4">
                 <Avatar>
                 {/* Use user?.photoURL if available, otherwise fallback */}
                 <AvatarImage src={user?.photoURL || "https://picsum.photos/50/50"} alt="Profile" />
                 <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                 </Avatar>
                 <div>
                     <p className="text-sm font-medium">{user?.displayName || "User"}</p>
                     <p className="text-sm text-muted-foreground">{user?.email}</p>
                 </div>
             </div>
             <Button
                 variant="destructive"
                 className="w-full mt-6 shadow-sm rounded-full"
                 onClick={handleLogout}
                 disabled={loadingLogout}
             >
                 <LogOut className="mr-2 h-4 w-4" />
                 {loadingLogout ? "Logging out..." : "Logout"}
             </Button>
         </CardContent>
      </Card>


      {/* Custom Meals List Card */}
      <Card className="w-full max-w-md mb-4 shadow-md rounded-lg" style={{backgroundColor: 'white'}}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Custom Meals</CardTitle>
        </CardHeader>
        <CardContent>
            {loadingMeals ? (
                <p>Loading meals...</p>
            ) : (
             <List>
                {customMeals.length > 0 ? (
                customMeals.map((meal) => meal.id ? ( // Ensure meal.id exists
                    <ListItem key={meal.id}>
                    <div>
                        <div className="font-semibold">{meal.meal}</div>
                        {meal.restaurant && <div className="text-sm text-muted-foreground">{meal.restaurant}</div>}
                    </div>
                    <div className="ml-auto flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => startEditMeal(meal)} disabled={loadingSubmit || !!editingMealId}>
                        <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMeal(meal.id!)} disabled={loadingSubmit || !!editingMealId}>
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                    </ListItem>
                ) : null ) // Handle potential null ID case gracefully
                ) : (
                <ListEmpty>No custom meals added yet.</ListEmpty>
                )}
            </List>
            )}
        </CardContent>
      </Card>

      {/* Add/Edit Meal Card */}
      <Card className="w-full max-w-md mb-4 shadow-md rounded-lg" style={{backgroundColor: 'white'}}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {editingMealId !== null ? "Edit Meal" : "Add Custom Meal"}
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
              className="shadow-sm"
              style={{ backgroundColor: '#F7F7F7' }}
              disabled={loadingSubmit}
            />
          </div>
          <div className="grid w-full gap-2">
            <Label htmlFor="restaurant">Restaurant (Optional)</Label>
            <Input
              id="restaurant"
              placeholder="Enter restaurant name"
              value={newRestaurant}
              onChange={(e) => setNewRestaurant(e.target.value)}
              className="shadow-sm"
              style={{ backgroundColor: '#F7F7F7' }}
              disabled={loadingSubmit}
            />
          </div>
          {editingMealId !== null ? (
             <div className="flex space-x-2">
                 <Button className="flex-1 shadow-sm rounded-full" onClick={saveEditedMeal} variant="default" style={{ backgroundColor: '#55D519', color: 'white' }} disabled={loadingSubmit}>
                    {loadingSubmit ? "Saving..." : "Save Changes"}
                </Button>
                <Button className="flex-1" variant="outline" onClick={cancelEdit} disabled={loadingSubmit}>
                    Cancel
                </Button>
             </div>
          ) : (
            <Button className="shadow-sm rounded-full" onClick={addCustomMeal} variant="default" style={{ backgroundColor: '#55D519', color: 'white' }} disabled={loadingSubmit}>
               {loadingSubmit ? "Adding..." : "Add Meal"}
            </Button>
          )}
        </CardContent>
      </Card>

    </div>
  );
}


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential, // Import UserCredential
} from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient"; // Use client-side firebase
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // Import firestore functions
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import Image from "next/image";
import Link from "next/link";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Function to save user data to Firestore
  const saveUserToFirestore = async (userCredential: UserCredential) => {
    // Add check for db instance
    if (!db || !userCredential.user) {
        console.error("Cannot save user to Firestore: DB not initialized or user credential invalid.");
        return;
    }
    const userRef = doc(db, "users", userCredential.user.uid);
    try {
      await setDoc(userRef, {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        createdAt: serverTimestamp(), // Record creation time
        // Add any other initial profile data you want to store
      }, { merge: true }); // Use merge: true to avoid overwriting existing data if logging in via Google after email signup
      console.log("User data saved to Firestore for:", userCredential.user.uid);
    } catch (error) {
      console.error("Error saving user data to Firestore:", error);
      // Decide if you want to show an error to the user here
    }
  };

  const signUpWithEmailPassword = async () => {
    // --- Validation ---
    if (!validateEmail(email)) {
      toast({ title: "Error", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters long.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    // --- End Validation ---

    setLoading(true);
    try {
      if (!auth) {
        throw new Error("Firebase Auth not initialized");
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserToFirestore(userCredential); // Save user data

      toast({ title: "Success", description: "Account created successfully!" });
      router.push("/onboarding"); // Redirect to onboarding page
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'The password is too weak.';
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const signUpWithGoogle = async () => {
    setLoading(true);
    try {
      if (!auth) {
        throw new Error("Firebase Auth not initialized");
      }
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await saveUserToFirestore(userCredential); // Save user data

      // Check if it's a new user (optional, might require Firestore read)
      // const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      // if (!userDoc.exists() || userDoc.data()?.isNew) { router.push("/onboarding"); } else { router.push("/home"); }

      router.push("/onboarding"); // Always go to onboarding for now after Google sign-up/in via this button
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white"
    style={{
      backgroundImage: `url('/images/numnum-background.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat' }} >
      <Toaster />
      <Image
            src="/images/Numnum-logo.png"
            alt="NumNum Logo"
            width={200}
            height={100}
            className="rounded-md mb-4 md:h-auto"
            data-ai-hint="logo brand company"
            style={{ height: 'auto' }}
        />
      <Card className="w-full max-w-md shadow-md rounded-lg bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Sign Up</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow-sm"
              style={{ backgroundColor: "#F7F7F7" }}
            />
          </div>
          <div className="grid w-full gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow-sm"
              style={{ backgroundColor: "#F7F7F7" }}
            />
          </div>
          <div className="grid w-full gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="shadow-sm"
              style={{ backgroundColor: "#F7F7F7" }}
            />
          </div>
          <Button
            className="shadow-sm rounded-full"
            onClick={signUpWithEmailPassword}
            disabled={loading}
            style={{ backgroundColor: "#55D519", color: "white" }}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
          <Button
            variant="outline"
            className="shadow-sm rounded-full hover:bg-[#55D519]"
            onClick={signUpWithGoogle}
            disabled={loading}
            style={{ borderColor: '#1E1E1E' }}
          >
            Sign up with Google
          </Button>
        </CardContent>
      </Card>
       <Link href="/login" className="text-sm text-muted-foreground mt-4">
            Already have an account? Login
        </Link>
    </div>
  );
}

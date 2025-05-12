"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
 import { initializeApp, getApps } from "firebase/app";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getAuth
} from "firebase/auth";
import { auth } from "@/lib/firebaseClient"; // Import auth from client file
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const signInWithEmailPassword = async () => {
    setLoading(true);

    if (!validateEmail(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      if (!auth) {
        throw new Error("Firebase Auth not initialized");
      }
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      router.push("/home"); // Redirect to main app screen
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
         errorMessage = 'Incorrect email or password.';
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
       if (!auth) {
        throw new Error("Firebase Auth not initialized");
      }
      const provider = new GoogleAuthProvider();
      console.log('Data: ', auth);
      await signInWithPopup(auth, provider);
      router.push("/home"); // Redirect to main app screen
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
      <Toaster />
        <Image
            src="https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2FNumnum-logo.png?alt=media"
            alt="NumNum Logo"
            className="rounded-md mb-4"
        />
      <Card className="w-full max-w-md shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Login</CardTitle>
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
          <Button
            className="shadow-sm rounded-full"
            onClick={signInWithEmailPassword}
            disabled={loading}
            style={{ backgroundColor: "#55D519", color: "white" }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
          <Button
            variant="outline"
            className="shadow-sm rounded-full hover:bg-[#55D519]"
            onClick={signInWithGoogle}
            disabled={loading}
              style={{ borderColor: '#1E1E1E' }}
          >
            Sign in with Google
          </Button>
          <Link href="/reset-password" className="text-sm text-muted-foreground">
            Forgot password?
          </Link>
        </CardContent>
      </Card>
        <Link href="/signup" className="text-sm text-muted-foreground mt-4">
            Don't have an account? Sign up
        </Link>
    </div>
  );
}

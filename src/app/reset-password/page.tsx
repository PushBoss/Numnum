"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebaseClient"; // Import auth from client file
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const sendResetLink = async () => {
    setLoading(true);
    try {
       if (!auth) {
        throw new Error("Firebase Auth not initialized");
      }
      await sendPasswordResetEmail(auth, email);
      setConfirmationMessage(
        "Password reset link sent to your email. Please check your inbox."
      );
      toast({
        title: "Success",
        description:
          "Password reset link sent to your email. Please check your inbox.",
      });
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

  const handleBackClick = () => {
    router.push('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white"   style={{
      backgroundImage: `url('/images/numnum-background.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat' }}>
      <Toaster />
      <Image
            src="/images/Numnum-logo.png"
            alt="NumNum Logo"
            width={200}
            height={100}
            className="rounded-md mb-4"
            style={{ height: 'auto' }}
        />
      <Card className="w-full max-w-md shadow-md rounded-lg bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Reset Password</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          {confirmationMessage ? (
            <p className="text-sm text-muted-foreground">{confirmationMessage}</p>
          ) : (
            <>
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
              <Button
                className="shadow-sm"
                onClick={sendResetLink}
                disabled={loading}
                style={{ backgroundColor: "#55D519", color: "white" }}
              >
                {loading ? "Sending link..." : "Send reset link"}
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            className="shadow-sm"
            onClick={handleBackClick}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

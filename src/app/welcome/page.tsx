"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted">
      <Card className="w-full max-w-md shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Island Bites</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <span className="text-7xl">🍽️</span>
          <p className="text-lg">Feeling hungry?</p>
          <Button onClick={() => router.push('/home')} className="w-full shadow-sm">
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

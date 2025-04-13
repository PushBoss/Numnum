"use client";

import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">
        Island Bites 🍽️
      </h1>
      <p className="text-lg mb-8">
        Welcome! Let's get started.
      </p>
      <Button variant="primary" size="lg">
        Explore
      </Button>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">
        Island Bites 🍽️
      </h1>
      <p className="text-lg mb-8">
        Welcome! Let's get started.
      </p>
      <Button variant="primary" size="lg" onClick={() => router.push('/home')}>
        Explore
      </Button>
    </div>
  );
}

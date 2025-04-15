"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const LandingImage = "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2Fburger%201.png?alt=media";

export default function Page() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
       <Image
        src="https://picsum.photos/200/100"
        alt="Another Welcome Image"
        width={200}
        height={100}
        className="rounded-md mb-4"
      />
      <Image
        src={LandingImage}
        alt="Welcome Image"
        width={200}
        height={100}
        className="rounded-md mb-4"
      />
        <h1 className="text-4xl font-bold mb-4">
        Island Bites 🍽️
      </h1>
      <p className="text-lg mb-8">
        Welcome! Let's get started.
      </p>
      <Button variant="primary" size="lg" onClick={() => router.push('/home')} style={{ backgroundColor: '#55D519', color: 'white' }}>
        Get Started
      </Button>
    </div>
  );
}



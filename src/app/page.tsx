"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const LandingImage = "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2FNumnum-icon.png?alt=media";
const LogoImage = "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2FNumnum-logo.png?alt=media";

export default function Page() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
       <Image
        src={LandingImage}
        alt="Another Welcome Image"
        width={200}
        height={100}
        className="rounded-md mb-4"
      />
       <Image
        src={LogoImage}
        alt="Welcome Image"
        width={200}
        height={100}
        className="rounded-md mb-4"
      />
        <h1 className="text-2xl font-bold mb-4 text-left">
        Hunger no more
      </h1>
      <Button variant="primary" size="lg" onClick={() => router.push('/home')} className="mt-4" style={{ backgroundColor: '#55D519', color: 'white', borderRadius: '2rem' }}>
        Get Started
      </Button>
    </div>
  );
}



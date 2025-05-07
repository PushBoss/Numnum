"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from "next/link";
import { MapPin, Heart, BrainCircuit, MessageSquare, Lightbulb, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Poppins } from "next/font/google";
// Bagel_Fat_One is already imported in layout.tsx and applied via tailwind.config.ts or globals.css for `font-bagel`

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });

// Placeholder URLs - Replace with actual links later
const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2FNumnum-logo.png?alt=media";
const HERO_BACKGROUND_IMAGE_URL = "/images/BannerMockup.png"; // Updated hero background
const FEATURE_ICON_LOCATION = "https://picsum.photos/seed/location/50/50"; 
const FEATURE_ICON_MOOD = "https://picsum.photos/seed/mood/50/50"; 
const FEATURE_ICON_SMART = "https://picsum.photos/seed/smart/50/50"; 

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]"> {/* Main background color */}

      {/* Header */}
      <header className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Image src={LOGO_URL} alt="NumNum Logo" width={120} height={30} data-ai-hint="logo brand company" />
        <nav className="hidden md:flex space-x-6 items-center">
          <Link href="/" className="text-gray-700 hover:text-primary">Home</Link>
          <Link href="#how-it-works" className="text-gray-700 hover:text-primary">How It Works</Link>
          <Link href="#forum" className="text-gray-700 hover:text-primary">Forum</Link>
        </nav>
        <div className="flex space-x-2">
            <Button variant="primary" style={{ backgroundColor: '#55D519', color: 'white', borderRadius: '9999px' }} onClick={() => router.push('/login')}>Login</Button>
            <Button variant="outline" style={{ borderRadius: '9999px' }} onClick={() => router.push('/signup')}>Sign Up</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">

        {/* Hero Section */}
        <section 
          className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_BACKGROUND_IMAGE_URL})` }}
        >
          <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0 bg-white/80 backdrop-blur-sm p-8 rounded-lg"> {/* Added semi-transparent background for text readability */}
            <h1 className="font-bagel text-[150px] md:text-[150px] font-bold text-[#55D519]">Cravin'</h1>
            <h1 className="font-bagel text-5xl md:text-6xl font-bold text-[#1E1E1E] mb-4">
             Something New?
            </h1>
            <p className={`text-lg text-gray-700 mb-8 ${poppins.className}`}>
              Your personalized food discovery app – powered by your cravings, community, and location.
            </p>
            <Button size="lg" variant="primary" style={{ backgroundColor: '#55D519', color: 'white', borderRadius: '50px' }} onClick={() => router.push('/home')}>
              Get Started
            </Button>
          </div>
          <div className="md:w-1/2 relative flex justify-center">
            {/* Optional: If you still want a foreground image on top of the background */}
            {/* <Image
              src={HERO_IMAGE_URL} // This was the brain illustration before
              alt="Food discovery illustration"
              width={800}
              height={1100}
              className="rounded-lg object-contain"
            /> */}
          </div>
        </section>

        {/* Featured Submissions Banner */}
        <section className="bg-[#55D519] text-white py-3">
            <div className="container mx-auto px-4 text-sm flex justify-around items-center">
                <p><span>📸</span> image submitted by @username now featured</p>
                <p><span>🎨</span> submitted design for @tuna melti</p>
                <p><span>🍽️</span> Ackee and salt fish!</p>
            </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1E1E1E]">How it works</h2>
          <p className={`text-lg text-gray-600 max-w-3xl mx-auto mb-12 ${poppins.className}`}>
            NumNum helps you find the best meals around based on your mood, hunger, and spice level – all personalized using your location and preferences. Built with real community input, we're redefining how you discover food.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-left shadow-md border border-gray-200">
              <CardHeader>
                <MapPin className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-[#1E1E1E]">Location-Aware Picks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-gray-600 ${poppins.className}`}>"Find the best bites near you." NumNum uses your real-time location to surface restaurants and meals within walking or driving distance—so you're always one tap away from your next craving.</p>
              </CardContent>
            </Card>
            <Card className="text-left shadow-md border border-gray-200">
              <CardHeader>
                <Heart className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-[#1E1E1E]">Mood-Based Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-gray-600 ${poppins.className}`}>"We get how you're feeling—and feed it right." Whether you're sad, celebrating, or feeling adventurous, NumNum recommends meals that match your mood. It's more than food—it's how you feel.</p>
              </CardContent>
            </Card>
            <Card className="text-left shadow-md border border-gray-200">
              <CardHeader>
                <BrainCircuit className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-[#1E1E1E]">Smart Meal Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-gray-600 ${poppins.className}`}>"The more you swipe, the smarter it gets." NumNum learns what you love. Using AI, it fine-tunes your recommendations based on past picks, spice level, budget, and even hunger level.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Restaurant Logos Banner */}
         <section className="bg-[#55D519] py-6">
            <div className="container mx-auto px-4 flex justify-around items-center grayscale opacity-70">
                <Image src="/images/Fridays.png" alt="Fridays Logo" width={100} height={40} data-ai-hint="fridays logo"/>
                <Image src="/images/islandgrill.png" alt="Island Grill Logo" width={100} height={40} data-ai-hint="island grill logo"/>
                <Image src="/images/tastee.png" alt="Tastee Logo" width={100} height={40} data-ai-hint="tastee logo"/>
                <Image src="/images/nirvanna.png" alt="Nirvana Logo" width={100} height={40} data-ai-hint="nirvana logo"/>
            </div>
        </section>

        {/* Community Section */}
        <section id="forum" className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1E1E1E]">NUMNUM Community</h2>
          <p className={`text-lg text-gray-600 max-w-3xl mx-auto mb-12 ${poppins.className}`}>
            Our users help shape the future of NumNum. Share your favorite meals, drop suggestions, and get featured for your contributions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="flex items-center p-4 space-x-3 shadow-sm border border-gray-200">
              <MessageSquare className="w-6 h-6 text-primary" />
              <p className={`font-medium ${poppins.className}`}>Meal Submissions</p>
            </Card>
            <Card className="flex items-center p-4 space-x-3 shadow-sm border border-gray-200">
               <MessageSquare className="w-6 h-6 text-primary" />
              <p className={`font-medium ${poppins.className}`}>Restaurant Talk</p>
            </Card>
            <Card className="flex items-center p-4 space-x-3 shadow-sm border border-gray-200">
              <Lightbulb className="w-6 h-6 text-primary" />
              <p className={`font-medium ${poppins.className}`}>Feature Requests</p>
            </Card>
          </div>
          <Button size="lg" variant="primary" style={{ backgroundColor: '#55D519', color: 'white', borderRadius: '9999px' }}>
            Join our Discord
          </Button>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#FDFBF7] border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className={`flex items-center mb-4 md:mb-0 ${poppins.className}`}>
            <Image src={LOGO_URL} alt="NumNum Logo" width={100} height={25} className="mr-4" data-ai-hint="logo brand company"/>
            <span>Made in Jamaica 🇯🇲 with love ❤️</span>
          </div>
          <div className={`mb-4 md:mb-0 ${poppins.className}`}>
            Built by food lovers. Curated by you. © 2025 NumNum.
          </div>
          <div className="flex space-x-4">
            <Link href="#" aria-label="Google"><Facebook className="w-5 h-5 hover:text-primary" /></Link>
            <Link href="#" aria-label="Facebook"><Facebook className="w-5 h-5 hover:text-primary" /></Link>
            <Link href="#" aria-label="Twitter"><Twitter className="w-5 h-5 hover:text-primary" /></Link>
            <Link href="#" aria-label="Instagram"><Instagram className="w-5 h-5 hover:text-primary" /></Link>
            <Link href="#" aria-label="YouTube"><Youtube className="w-5 h-5 hover:text-primary" /></Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
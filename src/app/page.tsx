
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from "next/link";
import { MapPin, Heart, BrainCircuit, MessageSquare, Lightbulb, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'; // Placeholder icons
import { Poppins, Bagel_Fat_One } from "next/font/google"; // Import Bagel_Fat_One

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });
const bagel = Bagel_Fat_One({ subsets: ["latin"], weight: "400" }); // Instantiate Bagel_Fat_One

// Placeholder URLs - Replace with actual links later
const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/pushtech01.appspot.com/o/NumNum%2FNumnum-logo.png?alt=media";
const HERO_IMAGE_URL = "https://picsum.photos/seed/hero/600/400"; // Placeholder
const FEATURE_ICON_LOCATION = "https://picsum.photos/seed/location/50/50"; // Placeholder
const FEATURE_ICON_MOOD = "https://picsum.photos/seed/mood/50/50"; // Placeholder
const FEATURE_ICON_SMART = "https://picsum.photos/seed/smart/50/50"; // Placeholder

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
            <Button variant="primary" style={{ backgroundColor: '#55D519', color: 'white' }} onClick={() => router.push('/login')}>Login</Button>
            <Button variant="outline" onClick={() => router.push('/signup')}>Sign Up</Button>
        </div>
        {/* Add Mobile Menu Trigger here if needed */}
      </header>

      {/* Main Content */}
      <main className="flex-grow">

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
            {/* Apply Bagel_Fat_One font class here */}
            <h1 className={`${bagel.className} text-5xl md:text-6xl font-bold text-[#55D519] mb-4`}>
              Cravin' <br /> Something New?
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your personalized food discovery app – powered by your cravings, community, and location.
            </p>
            <Button size="lg" variant="primary" style={{ backgroundColor: '#55D519', color: 'white', borderRadius: '50px' }} onClick={() => router.push('/home')}>
              Get Started
            </Button>
          </div>
          <div className="md:w-1/2 relative flex justify-center">
             {/* Replace with the actual Brain/Food illustration */}
            <Image
              src={HERO_IMAGE_URL}
              alt="Food discovery illustration"
              width={500}
              height={400}
              className="rounded-lg object-contain"
              data-ai-hint="brain food variety meal craving illustration"
            />
            {/* Add speech bubbles as absolutely positioned elements if needed */}
             <div className="absolute top-1/4 left-10 bg-white p-3 rounded-lg shadow-md -rotate-6">
               <p className="font-semibold">Best bites near me</p>
             </div>
             <div className="absolute top-1/2 right-10 bg-white p-3 rounded-lg shadow-md rotate-6">
               <p className="font-semibold">What's for lunch?</p>
             </div>
          </div>
        </section>

        {/* Featured Submissions Banner (Placeholder) */}
        <section className="bg-[#55D519] text-white py-3">
            <div className="container mx-auto px-4 text-sm flex justify-around items-center">
                <p><span>📸</span> image submitted by @username now featured</p>
                <p><span>🎨</span> submitted design for @tuna melti</p>
                <p><span>🍽️</span> Ackee and salt fish!</p>
            </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
            NumNum helps you find the best meals around based on your mood, hunger, and spice level – all personalized using your location and preferences. Built with real community input, we're redefining how you discover food.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <Card className="text-left shadow-md border border-gray-200">
              <CardHeader>
                <MapPin className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Location-Aware Picks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">"Find the best bites near you." NumNum uses your real-time location to surface restaurants and meals within walking or driving distance—so you're always one tap away from your next craving.</p>
              </CardContent>
            </Card>
            {/* Feature Card 2 */}
            <Card className="text-left shadow-md border border-gray-200">
              <CardHeader>
                <Heart className="w-8 h-8 text-primary mb-2" /> {/* Using Heart for mood */}
                <CardTitle>Mood-Based Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">"We get how you're feeling—and feed it right." Whether you're sad, celebrating, or feeling adventurous, NumNum recommends meals that match your mood. It's more than food—it's how you feel.</p>
              </CardContent>
            </Card>
            {/* Feature Card 3 */}
            <Card className="text-left shadow-md border border-gray-200">
              <CardHeader>
                <BrainCircuit className="w-8 h-8 text-primary mb-2" /> {/* Using BrainCircuit for smart matching */}
                <CardTitle>Smart Meal Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">"The more you swipe, the smarter it gets." NumNum learns what you love. Using AI, it fine-tunes your recommendations based on past picks, spice level, budget, and even hunger level.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Restaurant Logos Banner (Placeholder) */}
         <section className="bg-[#55D519] py-6">
            <div className="container mx-auto px-4 flex justify-around items-center grayscale opacity-70">
                {/* Replace with actual logos */}
                <Image src="https://picsum.photos/seed/logo1/100/40?grayscale" alt="Restaurant Logo 1" width={100} height={40} data-ai-hint="restaurant logo"/>
                <Image src="https://picsum.photos/seed/logo2/100/40?grayscale" alt="Restaurant Logo 2" width={100} height={40} data-ai-hint="restaurant logo"/>
                <Image src="https://picsum.photos/seed/logo3/100/40?grayscale" alt="Restaurant Logo 3" width={100} height={40} data-ai-hint="restaurant logo"/>
                <Image src="https://picsum.photos/seed/logo4/100/40?grayscale" alt="Restaurant Logo 4" width={100} height={40} data-ai-hint="restaurant logo"/>
                <Image src="https://picsum.photos/seed/logo5/100/40?grayscale" alt="Restaurant Logo 5" width={100} height={40} data-ai-hint="restaurant logo"/>
                <Image src="https://picsum.photos/seed/logo6/100/40?grayscale" alt="Restaurant Logo 6" width={100} height={40} data-ai-hint="restaurant logo"/>
            </div>
        </section>

        {/* Community Section */}
        <section id="forum" className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">NUMNUM Community</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
            Our users help shape the future of NumNum. Share your favorite meals, drop suggestions, and get featured for your contributions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Community Card 1 */}
            <Card className="flex items-center p-4 space-x-3 shadow-sm border border-gray-200">
              <MessageSquare className="w-6 h-6 text-primary" />
              <p className="font-medium">Meal Submissions</p>
            </Card>
            {/* Community Card 2 */}
            <Card className="flex items-center p-4 space-x-3 shadow-sm border border-gray-200">
               <MessageSquare className="w-6 h-6 text-primary" /> {/* Replace with Restaurant icon */}
              <p className="font-medium">Restaurant Talk</p>
            </Card>
            {/* Community Card 3 */}
            <Card className="flex items-center p-4 space-x-3 shadow-sm border border-gray-200">
              <Lightbulb className="w-6 h-6 text-primary" />
              <p className="font-medium">Feature Requests</p>
            </Card>
          </div>
          <Button size="lg" variant="primary" style={{ backgroundColor: '#55D519', color: 'white' }}>
            Join our Discord
          </Button>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#FDFBF7] border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="flex items-center mb-4 md:mb-0">
            <Image src={LOGO_URL} alt="NumNum Logo" width={100} height={25} className="mr-4" data-ai-hint="logo brand company"/>
            <span>Made in Jamaica 🇯🇲 with love ❤️</span>
          </div>
          <div className="mb-4 md:mb-0">
            Built by food lovers. Curated by you. © 2025 NumNum.
          </div>
          <div className="flex space-x-4">
            {/* Replace with actual social links */}
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

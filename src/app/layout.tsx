import type {Metadata, Viewport} from 'next';
import {Geist, Geist_Mono} from 'next/font/google'; // Assuming Geist is your primary sans-serif
import './globals.css';
import {Providers} from "./providers";
import { Bagel_Fat_One } from "next/font/google"; 

const geistSans = Geist({
  variable: '--font-geist-sans', // Good for Tailwind integration if needed elsewhere
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono', // Good for Tailwind integration
  subsets: ['latin'],
});

const bagel = Bagel_Fat_One({ 
  subsets: ["latin"], 
  weight: "400",
  variable: '--font-bagel' // Optional: if you want to use it as a Tailwind utility via CSS variable
});

export const metadata: Metadata = {
  title: 'NumNum',
  description: 'Your personalized food discovery app.',
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NumNum",
    startupImage: ['/apple-touch-icon.png'], // Using the touch icon as startup image
  },
};

export const viewport: Viewport = {
  themeColor: "#55D519",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${bagel.className} antialiased`} suppressHydrationWarning>
      <Providers>
        {children}
      </Providers>
      </body>
    </html>
  );
}
      
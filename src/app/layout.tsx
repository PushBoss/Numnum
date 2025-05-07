import type {Metadata} from 'next';
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
  title: 'Island Bites',
  description: 'Feeling indecisive? Let Island Bites decide!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Applying bagel.className makes Bagel_Fat_One the default font for the body,
          Geist variables are available if you want to switch to them via Tailwind utilities.
          Consider if Bagel_Fat_One should be the default or applied selectively.
          If Geist is the default, apply its variable class here too.
      */}
      <body className={`${geistSans.variable} ${geistMono.variable} ${bagel.className} antialiased`} suppressHydrationWarning>
      <Providers>
        {children}
      </Providers>
      </body>
    </html>
  );
}
      
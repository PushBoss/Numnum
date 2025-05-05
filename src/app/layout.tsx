
import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import {Providers} from "./providers";
// Removed Bagel_Fat_One import from here
import { Poppins } from "next/font/google"; // Import Poppins

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Initialize Poppins if needed globally or import in specific components
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });


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
      {/* Removed bagel.className from body */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <Providers>
        {children}
      </Providers>
      </body>
    </html>
  );
}
      
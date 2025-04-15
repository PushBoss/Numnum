import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import {Providers} from "./providers";
import { Bagel_Fat_One } from "next/font/google";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const bagel = Bagel_Fat_One({ subsets: ["latin"], weight: "400" });

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
      <body className={`${geistSans.variable} ${geistMono.variable} ${bagel.className} antialiased`}>
      <Providers>
        {children}
      </Providers>
      </body>
    </html>
  );
}



"use client";

import BottomNavigation from "@/components/bottom-navigation";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* flex-grow allows this main section to take up available vertical space */}
      {/* pb-20 is to prevent content from being obscured by the fixed BottomNavigation */}
      <main className="flex-grow pb-20">
        {children}
      </main>
      <BottomNavigation />
    </>
  );
}

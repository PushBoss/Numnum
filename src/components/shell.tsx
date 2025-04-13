"use client";

import BottomNavigation from "@/components/bottom-navigation";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="pb-20">{children}</main>
      <BottomNavigation />
    </>
  );
}

"use client";

import { Home, User, List as ListIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-background border-t border-border z-50">
      <div className="max-w-md mx-auto flex justify-around items-center py-2">
        <Link href="/home" className={`flex flex-col items-center ${pathname === '/home' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/account" className={`flex flex-col items-center ${pathname === '/account' ? 'text-primary' : 'text-muted-foreground'}`}>
          <User className="h-5 w-5" />
          <span className="text-xs">Account</span>
        </Link>
      </div>
    </nav>
  );
}

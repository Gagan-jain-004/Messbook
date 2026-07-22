"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/analytics", label: "Analytics" },
    { href: "/dashboard/feedback", label: "Feedback" },
    { href: "/dashboard/settings", label: "Settings" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex flex-col md:flex-row max-w-5xl items-stretch md:items-center justify-between px-6">
        <div className="flex h-16 items-center justify-between md:justify-start gap-8">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-white">
            DietTrack
          </Link>

          {/* Mobile User Button - displayed next to branding on small screens */}
          <div className="flex md:hidden items-center gap-4">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-full border border-border",
                },
              }}
            />
          </div>
        </div>

        {/* Navigation Links - Horizontally scrollable on mobile */}
        <div className="flex overflow-x-auto scrollbar-none gap-6 border-t border-border/40 md:border-t-0 -mx-6 px-6 md:mx-0 md:px-0">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex h-12 md:h-16 items-center border-b-2 text-xs md:text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? "border-white text-white"
                    : "border-transparent text-muted-foreground hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop User Button - hidden on mobile, displayed on larger screens */}
        <div className="hidden md:flex items-center gap-4">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 rounded-full border border-border",
              },
            }}
          />
        </div>
      </nav>
    </header>
  );
}

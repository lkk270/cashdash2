"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Poppins } from "next/font/google";
import { Ban } from "lucide-react";

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { MobileSidebar } from "@/components/mobile-sidebar";

const font = Poppins({
  weight: "600",
  subsets: ["latin"],
});

export const Navbar = () => {
  return (
    <div className="fixed z-50 flex items-center justify-between w-full h-16 px-4 py-2 border-b border-primary/10 bg-secondary">
      <div className="flex items-center">
        <MobileSidebar />
        <Link href="/dashboard">
          {/* <h1
            className={cn(
              "px-3 text-xl font-bold sm:text-3xl text-primary",
              font.className
            )}
          >
            CashDash
          </h1> */}
          <div className="px-3">
            <Logo />
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-x-3">
        <div className="flex items-center sm:flex gap-x-3">
          <Button variant="premium" size="sm">
            <Ban className="w-4 h-4 mr-2 mr-3 text-white" />
            Ads
          </Button>
          <ModeToggle />
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

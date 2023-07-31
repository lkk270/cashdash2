"use client";

import Link from "next/link";
import { Menu, Sparkles } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Poppins } from "next/font/google";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

const font = Poppins({
  weight: "600",
  subsets: ["latin"],
});

const Navbar = () => {
  return (
    <div className="fixed z-50 flex items-center justify-between w-full px-4 py-2 border-b border-primary/10 bg-secondary">
      <div className="flex items-center">
        <Menu className="block md:hidden" />
        <Link href="/">
          <h1
            className={cn(
              "hidden text-xl font-bold md:block md:text-3xl text-primary",
              font.className
            )}
          >
            CashDash
          </h1>
        </Link>
      </div>
      <div className="flex items-center gap-x-3">
        <Button size="sm">
          Upgrade
          <Sparkles className="w-4 h-4 ml-2 text-white fill-white" />
        </Button>
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default Navbar;

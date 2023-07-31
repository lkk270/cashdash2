"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";

export const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger className="pr-4 md:hidden">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-32 p-0 pt-10 bg-secondary">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};

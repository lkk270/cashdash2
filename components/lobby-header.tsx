"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export const LobbyHeader = () => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between w-full px-10 pb-4">
      <div className="flex items-center gap-x-2">
        <Button
          onClick={() => router.push("/dashboard")}
          size="icon"
          variant="ghost"
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>
      </div>
      <h1 className="items-center">Choose a tier</h1>
      <div className="flex items-center gap-x-2"></div>
    </div>
  );
};

"use client";

import { UserButton } from "@clerk/nextjs";
import { Lobby, Score } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
interface LobbyHeaderProps {
  lobby: Lobby & {
    scores: Score[];
    _count: {
      scores: number;
    };
  };
}

export const LobbyHeader = ({ lobby }: LobbyHeaderProps) => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between w-full pb-4 border-b border-primary/10">
      <div className="flex items-center gap-x-2">
        <Button
          onClick={() => router.push("/dashboard")}
          size="icon"
          variant="ghost"
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>
        <Logo />
      </div>
      <div className="flex items-center gap-x-3">
        <div className="flex items-center sm:flex gap-x-3">
          <ModeToggle />
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

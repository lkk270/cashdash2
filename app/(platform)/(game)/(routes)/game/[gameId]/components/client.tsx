"use client";

import { Game, Score } from "@prisma/client";

import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

interface GameClientProps {
  game: Game & {
    scores: Score[];
    _count: {
      scores: number;
    };
  };
}

export const GameClient = ({ game }: GameClientProps) => {
  return <div className="h-full"></div>;
};

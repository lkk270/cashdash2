"use client";

import { Lobby, Score } from "@prisma/client";

import { LobbyHeader } from "@/components/lobby-header";

interface LobbyClientProps {
  lobby: Lobby & {
    scores: Score[];
    _count: {
      scores: number;
    };
  };
}

export const LobbyClient = ({ lobby }: LobbyClientProps) => {
  return (
    <div className="flex flex-col h-full p-4 space-y-2">
      <LobbyHeader lobby={lobby} />
    </div>
  );
};

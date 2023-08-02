"use client";

import { Lobby, Score } from "@prisma/client";

import { GameLobbyHeader } from "@/components/game-lobby-header";

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
      <GameLobbyHeader lobby={lobby} />
    </div>
  );
};

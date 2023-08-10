'use client';

import { Lobby, Score } from '@prisma/client';
import { GameNavbar } from '@/components/game-navbar';
import { ScoresTable } from '@/components/scores-table';
import { LobbyHeader } from '@/components/lobby-header';
import { Navbar } from '@/components/navbar';

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
    <div className="h-full">
      <GameNavbar lobby={lobby} />
      <div className="fixed inset-y-0 flex-col hidden w-64 mt-16 xl:flex">
        <ScoresTable />
      </div>
      <main className="h-full">
        <div className="h-full p-4 space-y-2 ">
          <div className="flex justify-center">GAME</div>
        </div>
      </main>
    </div>
  );
};
//       <div className="fixed inset-y-0 flex-col hidden mt-16 ml-8 w-30 xl:flex">

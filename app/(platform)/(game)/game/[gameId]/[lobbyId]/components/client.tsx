'use client';

import { Lobby, Score } from '@prisma/client';
import { GameNavbar } from '@/components/game-navbar';
import { ScoresTable } from '@/components/scores-table';
import { LobbyHeader } from '@/components/lobby-header';

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
    <div>
      <GameNavbar lobby={lobby} />
      <div className="fixed inset-y-0 flex-col hidden mt-16 ml-8 w-30 xl:flex">
        <ScoresTable />
      </div>
      <div className="pt-16 md:pl-20">
        <div className="space-y-2 ">
          <div className="flex justify-center w-full p-1 pb-5">GAME</div>
          {/* <Lobbies data={data} /> */}
        </div>
      </div>
    </div>
  );
};

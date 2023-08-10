'use client';

import { Game, Lobby, GameAverageScore } from '@prisma/client';

import { cn } from '@/lib/utils';
import { Lobbies } from '@/components/lobbies';
import { LobbyHeader } from '@/components/lobby-header';

// interface GameClientPageProps {
//   data: Lobby[];
// }

// interface GameClientPageProps {
//   data: (Lobby & {
//     averageScores: GameAverageScore[];
//   })[];
// }

interface GameClientPageProps {
  data: Game & {
    lobbies: Lobby[];
    averageScores: GameAverageScore[];
  };
}

export const GameClient = async ({ data }: GameClientPageProps) => {
  return (
    <div className="h-full p-4 space-y-2">
      <div className="flex justify-center w-full p-1 pb-5">
        <LobbyHeader />
      </div>
      <Lobbies data={data} />
    </div>
  );
};

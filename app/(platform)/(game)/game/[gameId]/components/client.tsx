'use client';

import { Game, Lobby, GameAverageScore, LobbySession, GameSession } from '@prisma/client';

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
    lobbies: (Lobby & {
      sessions: (LobbySession & {
        gameSession: {
          id: string;
        }[];
      })[];
    })[];
    averageScores: GameAverageScore[];
  };
}

export const GameClient = ({ data }: GameClientPageProps) => {
  return (
    <div className="h-full p-4 space-y-2">
      <div className="flex justify-center w-full p-1 pb-5">
        <LobbyHeader />
      </div>
      <Lobbies data={data} />
    </div>
  );
};

'use client';

import { Game, Lobby, GameAverageScore, LobbySession, GameSession } from '@prisma/client';

import { Lobbies } from '@/components/lobbies';
import { LobbyHeader } from '@/components/headers/lobby-header';

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
        scores: {
          id: string;
        }[];
      })[];
    })[];
    averageScores: GameAverageScore[];
  };
}

export const GameClient = ({ data }: GameClientPageProps) => {
  return (
    <div className="h-full p-4 space-y-2 md:pl-20">
      <div className="flex justify-center w-full p-1 pb-2">
        <LobbyHeader gameName={data.name} />
      </div>
      <Lobbies data={data} />
    </div>
  );
};

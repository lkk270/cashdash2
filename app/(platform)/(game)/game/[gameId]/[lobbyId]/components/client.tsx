'use client';

import { Lobby, Game, LobbySession } from '@prisma/client';
import { GameNavbar } from '@/components/game-navbar';
import { ScoresTable } from '@/components/scores-table';
import { Minesweeper } from '@/components/minesweeper/minesweeper';

interface LobbyClientProps {
  lobby: Lobby & {
    sessions: LobbySession[];
  };
  game: Game;
}

export const LobbyClient = ({ lobby, game }: LobbyClientProps) => {
  const ids = {
    gameId: game.id,
    lobbySessionId: lobby.sessions[0].id,
  };
  return (
    // <TimerProvider>
    <div className="h-full">
      <GameNavbar game={game} lobby={lobby} />
      <div className="fixed inset-y-0 flex-col hidden mt-20 w-60 xl:flex">
        <ScoresTable lobby={lobby} />
      </div>
      <main className="">
        <div className="h-full p-4 space-y-2 ">
          <div className="flex justify-center">
            {<Minesweeper ids={ids} size={12} numMines={3} />}
          </div>
        </div>
      </main>
    </div>
    // </TimerProvider>
  );
};
//       <div className="fixed inset-y-0 flex-col hidden mt-16 ml-8 w-30 xl:flex">

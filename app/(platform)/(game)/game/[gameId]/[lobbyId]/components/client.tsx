'use client';

import { ModifiedScoreType } from '@/app/types';
import { Lobby, Game, LobbySession } from '@prisma/client';
import { GameNavbar } from '@/components/game-navbar';
import { ScoresTable } from '@/components/scores-table';
import { Minesweeper } from '@/components/minesweeper/minesweeper';
import { useState } from 'react';

interface LobbyClientProps {
  lobby: Lobby & {
    sessions: LobbySession[];
  };
  game: Game;
  scoresParam: ModifiedScoreType[];
  userBestScore: ModifiedScoreType | null;
}

export const LobbyClient = ({ lobby, game, scoresParam, userBestScore }: LobbyClientProps) => {
  const [scores, setScores] = useState<ModifiedScoreType[]>(scoresParam);
  const [triggerAnimation, setTriggerAnimationBase] = useState<boolean>(true);
  const gameName = game.name.toLowerCase();
  const ids = {
    gameId: game.id,
    lobbySessionId: lobby.sessions[0].id,
  };
  return (
    // <TimerProvider>
    <div className="h-full">
      <GameNavbar scores={scores} game={game} lobby={lobby} />
      <div className="fixed inset-y-0 flex-col hidden mt-20 w-72 xl:flex">
        <ScoresTable
          setTriggerAnimation={setTriggerAnimationBase}
          triggerAnimation={triggerAnimation}
          scoreType={game.scoreType}
          scores={scores}
          lobby={lobby}
        />
      </div>
      <main className="">
        <div className="h-full p-4 space-y-2 ">
          <div className="flex justify-center">
            {gameName === 'minesweeper 12x12' ? (
              <Minesweeper
                setTriggerAnimation={setTriggerAnimationBase}
                userBestScoreParam={userBestScore}
                setScores={setScores}
                ids={ids}
                rows={12}
                cols={12}
                numMines={13}
              />
            ) : gameName === 'minesweeper 16x16' ? (
              <Minesweeper
                setTriggerAnimation={setTriggerAnimationBase}
                userBestScoreParam={userBestScore}
                setScores={setScores}
                ids={ids}
                rows={16}
                cols={16}
                numMines={40}
              />
            ) : gameName === 'minesweeper 16x30' ? (
              <Minesweeper
                setTriggerAnimation={setTriggerAnimationBase}
                userBestScoreParam={userBestScore}
                setScores={setScores}
                ids={ids}
                rows={16}
                cols={30}
                numMines={20}
              />
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </main>
    </div>
    // </TimerProvider>
  );
};
//       <div className="fixed inset-y-0 flex-col hidden mt-16 ml-8 w-30 xl:flex">

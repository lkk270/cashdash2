'use client';

import { ModifiedScoreType } from '@/app/types';
import { Lobby, Game, LobbySession } from '@prisma/client';
import { GameNavbar } from '@/components/headers/game-navbar';
import { ScoresTable } from '@/components/scores-table';
import { Minesweeper } from '@/components/minesweeper/minesweeper';
import { FlappyBirb } from '@/components/flappy-birb/flappy-birb';
import { Blackjack } from '@/components/blackjack/blackjack';
import { EmptyState } from '@/components/empty-state';

import { useState } from 'react';

interface LobbyClientProps {
  lobby: Lobby & {
    sessions: LobbySession[];
  };
  game: Game;
  scoresParam: ModifiedScoreType[];
  userBestScore: ModifiedScoreType | null;
}

type CommonPropsType = {
  setTriggerAnimation: (value: boolean) => void;
  top100Scores: ModifiedScoreType[];
  userBestScoreParam: ModifiedScoreType | null;
  setScores: (scores: ModifiedScoreType[]) => void;
  ids: {
    gameId: string;
    lobbySessionId: string;
  };
};

interface BlackjackProps {
  setTriggerAnimation: (value: boolean) => void;
  top100Scores: ModifiedScoreType[];
  userBestScoreParam: ModifiedScoreType;
  setScores: (scores: ModifiedScoreType[]) => void;
  ids: {
    gameId: string;
    lobbySessionId: string;
  };
}

const renderGameComponent = (
  gameName: string,
  commonProps: CommonPropsType | null,
  commonPropsBlackjack: BlackjackProps | null
) => {
  if (commonProps) {
    console.log('IN HERE');
    switch (gameName) {
      case 'minesweeper 12x12':
        return <Minesweeper {...commonProps} rows={12} cols={12} numMines={13} min3bv={15} />;
      case 'minesweeper 16x16':
        return <Minesweeper {...commonProps} rows={16} cols={16} numMines={40} min3bv={35} />;
      case 'minesweeper 16x30':
        return <Minesweeper {...commonProps} rows={16} cols={30} numMines={99} min3bv={135} />;
      case 'flappy birb':
        return <FlappyBirb props={{ ...commonProps }} />;
      default:
        return <EmptyState title="Uh Oh" subtitle="Something went wrong!" />;
    }
  } else if (commonPropsBlackjack) {
    return <Blackjack props={{ ...commonPropsBlackjack }} />;
  } else {
    return <EmptyState title="Uh Oh" subtitle="Something went wrong!" />;
  }
};

export const LobbyClient = ({ lobby, game, scoresParam, userBestScore }: LobbyClientProps) => {
  const [scores, setScores] = useState<ModifiedScoreType[]>(scoresParam);
  const [triggerAnimation, setTriggerAnimationBase] = useState<boolean>(true);
  const gameName = game.name.toLowerCase();
  const ids = {
    gameId: game.id,
    lobbySessionId: lobby.sessions[0].id,
  };
  let commonProps: CommonPropsType | null = null;
  let commonPropsBlackjack: BlackjackProps | null = null;

  if (gameName === 'blackjack' && userBestScore) {
    commonPropsBlackjack = {
      userBestScoreParam: userBestScore,
      top100Scores: scoresParam,
      setTriggerAnimation: setTriggerAnimationBase,
      setScores: setScores,
      ids: ids,
    };
  } else {
    commonProps = {
      userBestScoreParam: userBestScore,
      top100Scores: scoresParam,
      setTriggerAnimation: setTriggerAnimationBase,
      setScores: setScores,
      ids: ids,
    };
  }

  return (
    // <TimerProvider>
    <div className="flex flex-col">
      <GameNavbar scores={scores} game={game} lobby={lobby} />
      <div className="fixed inset-y-0 flex-col hidden mt-32 w-72 xl:flex">
        <ScoresTable
          setTriggerAnimation={setTriggerAnimationBase}
          triggerAnimation={triggerAnimation}
          scoreType={game.scoreType}
          scores={scores}
          lobby={lobby}
        />
      </div>
      <main className="flex-grow">
        <div className="h-full">
          <div className="flex justify-center h-full">
            {renderGameComponent(gameName, commonProps, commonPropsBlackjack)}
          </div>
        </div>
      </main>
    </div>
  );
};

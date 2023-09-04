import { redirect } from 'next/navigation';
import { auth, redirectToSignIn } from '@clerk/nextjs';

import { ModifiedScoreType } from '@/app/types';
import { ScoreType } from '@prisma/client';
import prismadb from '@/lib/prismadb';
import { LobbyClient } from './components/client';
import { DashboardLayout } from '@/components/dashboard-layout';
import { isValidLobbyAccess } from '@/lib/utils';
import { EmptyState } from '@/components/empty-state';

interface LobbyIdPageProps {
  params: {
    gameId: string;
    lobbyId: string;
  };
}

const userHasScore = async (
  userId: string,
  gameId: string,
  lobbySessionId: string
): Promise<boolean> => {
  const userScore = await prismadb.gameSession.findFirst({
    where: {
      userId: userId,
      gameId: gameId,
      lobbySessionId: lobbySessionId,
    },
    select: {
      userId: true,
    },
  });

  return !!userScore; // Converts the value to a boolean: true if there's a score, false otherwise
};

const LobbyIdPage = async ({ params }: LobbyIdPageProps) => {
  const { userId } = auth();
  let game = null;
  let allScores: ModifiedScoreType[] = [];
  let bestScoresArray: ModifiedScoreType[] = [];
  const gameId = params.gameId;
  let accessResult = {
    isValid: false,
    message: '',
  };

  if (!userId) {
    return redirectToSignIn;
  }

  game = await prismadb.game.findUnique({
    where: {
      id: gameId,
    },
    include: {
      averageScores: {
        where: {
          userId: userId,
        },
      },
    },
  });

  if (!game) {
    redirect('/dashboard');
  }

  const orderDirection = game?.scoreType === ScoreType.time ? 'asc' : 'desc';

  const lobby = await prismadb.lobby.findUnique({
    where: {
      id: params.lobbyId,
    },
    include: {
      sessions: {
        where: {
          isActive: true,
        },
        include: {
          scores: {
            select: {
              userId: true,
              username: true,
              score: true,
            },
            orderBy: [
              {
                score: orderDirection,
              },
              {
                createdAt: 'asc',
              },
            ],
            take: 100,
          },
        },
      },
    },
  });

  if (!lobby || gameId !== lobby.gameId) {
    redirect(`/game/${gameId}`);
  }

  if (lobby && lobby.sessions && lobby.sessions[0]) {
    if (game) {
      allScores = lobby.sessions[0].scores;
      let userPlayedInSession = allScores.some((score) => score.userId === userId);

      if (!userPlayedInSession) {
        userPlayedInSession = await userHasScore(userId, gameId, lobby.sessions[0].id);
      }

      accessResult = isValidLobbyAccess({
        userPlayedInSession: userPlayedInSession,
        scoreType: game.scoreType,
        averageScore: game.averageScores[0]?.averageScore || null, // Handling possible undefined averageScores array
        scoreRestriction: lobby.scoreRestriction,
        expiredDateTime: lobby.sessions[0].expiredDateTime,
        startDateTime: lobby.sessions[0].startDateTime,
      });

      const bestScoresByUser: Record<string, ModifiedScoreType> = {};

      allScores.forEach((score: ModifiedScoreType) => {
        // Check if scoreType is 'time' and then compare accordingly
        if (orderDirection === 'asc') {
          if (
            !bestScoresByUser[score.userId] ||
            score.score < bestScoresByUser[score.userId].score
          ) {
            bestScoresByUser[score.userId] = score;
          }
        } else {
          // 'desc'
          if (
            !bestScoresByUser[score.userId] ||
            score.score > bestScoresByUser[score.userId].score
          ) {
            bestScoresByUser[score.userId] = score;
          }
        }
      });

      // Convert the object to an array and sort by the orderDirection and then take top 100 scores
      bestScoresArray = Object.values(bestScoresByUser)
        .sort((a, b) => (orderDirection === 'asc' ? a.score - b.score : b.score - a.score))
        .slice(0, 100);
    }
  }

  if (accessResult.isValid === false) {
    return (
      <DashboardLayout
        userValues={{ isPro: undefined, userCash: undefined }}
        children={
          <EmptyState
            withBackButton={true}
            title="👾 Invalid Access 👾"
            subtitle={accessResult.message}
          />
        }
      />
    );
  }
  return <LobbyClient scores={bestScoresArray} game={game!} lobby={lobby} />;
};

export default LobbyIdPage;

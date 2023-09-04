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
  let scores: ModifiedScoreType[] = [];
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
            orderBy: {
              score: orderDirection,
            },
            take: 100,
          },
        },
      },
    },
  });

  if (!lobby || gameId !== lobby.gameId) {
    redirect(`/game/${gameId}`);
  }

  if (lobby) {
    if (game) {
      scores = lobby.sessions[0].scores;
      let userPlayedInSession = scores.some((score) => score.userId === userId);

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
  return <LobbyClient scores={scores} game={game!} lobby={lobby} />;
};

export default LobbyIdPage;

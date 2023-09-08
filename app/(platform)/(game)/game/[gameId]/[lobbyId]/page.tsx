import { redirect } from 'next/navigation';
import { auth, redirectToSignIn } from '@clerk/nextjs';

import { ModifiedScoreType } from '@/app/types';
import { ScoreType } from '@prisma/client';
import prismadb from '@/lib/prismadb';
import { LobbyClient } from './components/client';
import { DashboardLayout } from '@/components/dashboard-layout';
import { isValidLobbyAccess } from '@/lib/utils';
import { EmptyState } from '@/components/empty-state';
import { processBestScores, prepareScoresForDisplay } from '@/lib/scores';

interface LobbyIdPageProps {
  params: {
    gameId: string;
    lobbyId: string;
  };
}

const LobbyIdPage = async ({ params }: LobbyIdPageProps) => {
  const { userId } = auth();
  let userPlayedInSession = null;
  let game = null;
  let allScores: ModifiedScoreType[] = [];
  let bestScoresArray: ModifiedScoreType[] = [];
  let displayScores: ModifiedScoreType[] = [];
  const gameId = params.gameId;
  let accessResult = {
    isValid: false,
    message: '',
  };

  if (!userId) {
    return redirectToSignIn;
  }

  const userHasScore = async (lobbySessionId: string): Promise<boolean> => {
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

  // game = await prismadb.game.findUnique({
  //   where: {
  //     id: gameId,
  //   },
  //   include: {
  //     averageScores: {
  //       where: {
  //         userId: userId,
  //       },
  //     },
  //   },
  // });

  game = await prismadb.game.findUnique({
    where: {
      id: params.gameId,
    },
    include: {
      lobbies: {
        select: {
          id: true,
          name: true,
          sessions: {
            where: {
              isActive: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              gameSession: {
                where: {
                  userId: userId,
                },
                take: 1,
                select: {
                  id: true, // Only select the ID
                },
              },
            },
          },
        },
        orderBy: {
          difficulty: 'asc',
        },
      },
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
      userPlayedInSession = allScores.some((score) => score.userId === userId);

      if (!userPlayedInSession) {
        userPlayedInSession = await userHasScore(lobby.sessions[0].id);
      }

      const lobbyWithGameSession = game.lobbies.find(
        (lobby) =>
          lobby.sessions &&
          lobby.sessions.some((session) => session.gameSession && session.gameSession.length > 0)
      );

      accessResult = isValidLobbyAccess({
        lobbyId: lobby.id,
        lobbyNameWithGameSession: lobbyWithGameSession?.name,
        lobbyIdWithGameSession: lobbyWithGameSession?.id,
        userPlayedInSession: userPlayedInSession,
        scoreType: game.scoreType,
        averageScore: game.averageScores[0]?.averageScore || null, // Handling possible undefined averageScores array
        scoreRestriction: lobby.scoreRestriction,
        expiredDateTime: lobby.sessions[0].expiredDateTime,
        startDateTime: lobby.sessions[0].startDateTime,
      });

      bestScoresArray = processBestScores({
        allScores,
        orderDirection,
      });

      displayScores = prepareScoresForDisplay(bestScoresArray, userId);
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
  return (
    <LobbyClient
      userBestScore={userPlayedInSession && userPlayedInSession !== null ? displayScores[0] : null}
      scoresParam={displayScores}
      game={game!}
      lobby={lobby}
    />
  );
};

export default LobbyIdPage;

import { redirect } from 'next/navigation';
import { auth, currentUser, redirectToSignIn } from '@clerk/nextjs';

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
  const user = await currentUser();
  let userHasScore = true;
  let userHasGameSessionScore = true;
  let userPlayedInSession = true;
  let balanceGame = false;
  let game = null;
  let allScores: ModifiedScoreType[] = [];
  let bestScoresArray: ModifiedScoreType[] = [];
  let displayScores: ModifiedScoreType[] = [];
  const gameId = params.gameId;
  let accessResult = {
    isValid: false,
    message: '',
  };

  if (!userId || !user) {
    return redirectToSignIn;
  }

  const checkUserHasGameSessionScore = async (lobbySessionId: string): Promise<boolean> => {
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
              scores: {
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
      userHasScore = allScores.some((score) => score.userId === userId); //can be an initiated balance with no actual play too

      if (game.scoreType === ScoreType.balance) {
        //add a "score" really a balance for this lobbySession. For now we will
        //default to be 1000.
        userHasGameSessionScore = await checkUserHasGameSessionScore(lobby.sessions[0].id);
        if (!userHasScore && !userHasGameSessionScore) {
          const score: ModifiedScoreType = {
            userId: userId,
            username: user.username || '',
            score: 1000,
            betTotalHand1: 0,
            betTotalHand2: 0,
          };
          allScores.push(score);
          await prismadb.score.create({
            data: {
              ...score,
              gameId: gameId,
              lobbySessionId: lobby.sessions[0].id,
            },
          });
          balanceGame = true;
        }
      }
      if (!userHasScore) {
        userHasGameSessionScore = await checkUserHasGameSessionScore(lobby.sessions[0].id);
      }
      userPlayedInSession = userHasScore || userHasGameSessionScore;
      const lobbyWithScores = game.lobbies.find(
        (lobby) =>
          lobby.sessions &&
          lobby.sessions.some((session) => session.scores && session.scores.length > 0)
      );

      accessResult = isValidLobbyAccess({
        lobbyId: lobby.id,
        lobbyWithScoresName: lobbyWithScores?.name,
        lobbyWithScoresId: lobbyWithScores?.id,
        userPlayedInSession: userPlayedInSession,
        scoreType: game.scoreType,
        weightedAverageScore: game.averageScores[0]?.weightedAverageScore || undefined, // Handling possible undefined averageScores array
        timesPlayed: game.averageScores[0]?.timesPlayed || 0, // Handling possible undefined averageScores array
        numScoresToAccess: lobby.numScoresToAccess,
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
            subtitle={'Reasons:'}
            reasons={accessResult.message.split('&')}
          />
        }
      />
    );
  }
  return (
    <LobbyClient
      userBestScore={
        (userPlayedInSession && userPlayedInSession !== null) || balanceGame
          ? displayScores[0]
          : null
      }
      scoresParam={displayScores}
      game={game!}
      lobby={lobby}
    />
  );
};

export default LobbyIdPage;

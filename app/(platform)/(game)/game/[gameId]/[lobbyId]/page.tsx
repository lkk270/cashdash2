import { redirect } from 'next/navigation';
import { auth, redirectToSignIn } from '@clerk/nextjs';

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

const LobbyIdPage = async ({ params }: LobbyIdPageProps) => {
  const { userId } = auth();
  let game = null;
  const gameId = params.gameId;
  let accessResult = {
    isValid: false,
    message: '',
  };

  if (!userId) {
    return redirectToSignIn;
  }

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
            where: {
              userId: userId,
            },
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (lobby) {
    const scoreCount = lobby.sessions[0].scores.length;
    game = await prismadb.game.findUnique({
      where: {
        id: lobby.gameId,
      },
      include: {
        averageScores: {
          where: {
            userId: userId,
          },
        },
      },
    });
    if (game) {
      accessResult = isValidLobbyAccess({
        scoreCount: scoreCount,
        scoreType: game.scoreType,
        averageScore: game.averageScores[0]?.averageScore || null, // Handling possible undefined averageScores array
        scoreRestriction: lobby.scoreRestriction,
        expiredDateTime: lobby.sessions[0].expiredDateTime,
        startDateTime: lobby.sessions[0].startDateTime,
      });
    }
  }

  if (!lobby) {
    redirect(`/game/${gameId}`);
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
  return <LobbyClient game={game!} lobby={lobby} />;
};

export default LobbyIdPage;

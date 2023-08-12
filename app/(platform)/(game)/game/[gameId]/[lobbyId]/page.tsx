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
  let isValidAccess = false;

  if (!userId) {
    return redirectToSignIn;
  }

  const lobby = await prismadb.lobby.findUnique({
    where: {
      id: params.lobbyId,
    },
    include: {
      scores: {
        orderBy: {
          createdAt: 'asc',
        },
        where: {
          userId,
        },
      },
      game: {},
      _count: {
        select: {
          scores: true,
        },
      },
    },
  });

  if (lobby) {
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
      isValidAccess = isValidLobbyAccess({
        scoreType: game.scoreType,
        averageScore: game.averageScores[0].averageScore,
        scoreRestriction: lobby.scoreRestriction,
      });
    }
  }
  if (!lobby) {
    redirect(`/game/${gameId}`);
  }
  if (isValidAccess === false) {
    return (
      <DashboardLayout
        isPro={true}
        children={
          <EmptyState
            withBackButton={true}
            title="👾 Invalid Access 👾"
            subtitle="You're too good of a player to access this tier! 👾"
          />
        }
      />
    );
  }
  return <LobbyClient game={game!} lobby={lobby} />;
};

export default LobbyIdPage;

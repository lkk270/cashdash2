import { auth, redirectToSignIn } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';
import { redirect } from 'next/navigation';

import { checkSubscription } from '@/lib/subscription';
import { GameClient } from './components/client';
import { DashboardLayout } from '@/components/dashboard-layout';

interface GameIdPageProps {
  params: {
    gameId: string;
  };
}

const GameIdPage = async ({ params }: GameIdPageProps) => {
  const { userId } = auth();
  const isPro = await checkSubscription();

  if (!userId) {
    return redirectToSignIn;
  }

  const game = await prismadb.game.findUnique({
    where: {
      id: params.gameId,
    },
    include: {
      lobbies: {
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
    return redirect('/dashboard');
  }
  if (game.averageScores.length === 0) {
    throw new Error('Invalid game');
  }

  return <DashboardLayout isPro={isPro} children={<GameClient data={game} />} />;
};

export default GameIdPage;

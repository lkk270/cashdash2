import { auth, redirectToSignIn } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';
import { redirect } from 'next/navigation';

import { checkSubscription } from '@/lib/subscription';
import { getUserCash } from '@/lib/userCash';
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
  const userCash = await getUserCash();
  const userValues = { isPro: isPro, userCash: userCash };

  if (!userId) {
    return redirectToSignIn;
  }

  const game = await prismadb.game.findUnique({
    where: {
      id: params.gameId,
    },
    include: {
      lobbies: {
        include: {
          sessions: {
            where: {
              isActive: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 3,
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
    return redirect('/dashboard');
  }
  // if (game.averageScores.length === 0) {
  //   return <DashboardLayout userValues={userValues} children={<div></div>} />;
  // }

  // console.log(game.lobbies[1].sessions);

  return <DashboardLayout userValues={userValues} children={<GameClient data={game} />} />;
};

export default GameIdPage;

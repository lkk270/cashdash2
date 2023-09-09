import { auth, redirectToSignIn } from '@clerk/nextjs';
import { calculateWeightedAverageScore, calculateRegularAverageScore } from '@/lib/average-score';
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
    return redirect('/dashboard');
  }

  // if (Date.now() < 1694283005594) {
  //   const weightedAverageObj = await calculateWeightedAverageScore(
  //     'b1798d4e-91e1-4115-8790-92d94319635a',
  //     'user_2TKskwGmolB1V1OQ7FvEZvjkzh2'
  //   );

  //   console.log('averageObjaverageObjaverageObjaverageObjaverageObjaverageObj');
  //   console.log(weightedAverageObj);

  //   const regularAverageObj = await calculateRegularAverageScore(
  //     'b1798d4e-91e1-4115-8790-92d94319635a',
  //     'user_2TKskwGmolB1V1OQ7FvEZvjkzh2'
  //   );
  //   console.log(
  //     'regularAverageObjregularAverageObjregularAverageObjregularAverageObjregularAverageObj'
  //   );
  //   console.log(regularAverageObj);
  // }
  // console.log(game);

  // if (game) {
  //   console.log(game.lobbies[0].sessions[1].gameSessions);
  // }

  // if (game.averageScores.length === 0) {
  //   return <DashboardLayout userValues={userValues} children={<div></div>} />;
  // }

  // console.log(game.lobbies[1].sessions);

  return <DashboardLayout userValues={userValues} children={<GameClient data={game} />} />;
};

export default GameIdPage;

import { auth, redirectToSignIn } from '@clerk/nextjs';
import prismadb from '@/lib/prismadb';
import { redirect } from 'next/navigation';
import { GameClient } from './components/client';

interface GameIdPageProps {
  params: {
    gameId: string;
  };
}

const GameIdPage = async ({ params }: GameIdPageProps) => {
  const { userId } = auth();

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
          difficulty: 'desc',
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

  return <GameClient data={game} />;
};

export default GameIdPage;

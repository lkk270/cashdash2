import { ScoreChart } from '@/components/score-chart';
import prismadb from '@/lib/prismadb';
import { auth, redirectToSignIn } from '@clerk/nextjs';

interface StatsPageProps {
  searchParams: {
    categoryId: string;
  };
}

const StatsPage = async ({ searchParams }: StatsPageProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirectToSignIn;
  }

  const scores = await prismadb.score.findMany({
    where: {
      userId: userId,
    },
    include: {
      lobbySession: {
        include: {
          lobby: {
            include: {
              game: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  if (scores.length === 0) {
    return <div>empty</div>;
  }

  return (
    <div className="flex flex-col items-center h-full">
      <ScoreChart scores={scores} />
    </div>
  );
};

export default StatsPage;

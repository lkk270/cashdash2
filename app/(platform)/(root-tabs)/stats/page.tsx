import prismadb from '@/lib/prismadb';
import { ScoreChart } from '@/components/score-chart';
import { Reward, Score, LobbySession, Lobby, Game } from '@prisma/client';
import { auth, redirectToSignIn } from '@clerk/nextjs';

interface StatsPageProps {
  searchParams: {
    categoryId: string;
  };
}

type ScoreWithRelations = Score & {
  reward: Reward | null;
  lobbySession: LobbySession & {
    lobby: Lobby & {
      game: Game;
    };
  };
};

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
      reward: true,
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

  // Group by lobbySession
  const initial: Record<string, ScoreWithRelations[]> = {};

  const groupedBySession: Record<string, ScoreWithRelations[]> = scores.reduce((acc, score) => {
    const sessionId = score.lobbySession.id;
    if (!acc[sessionId]) {
      acc[sessionId] = [];
    }
    acc[sessionId].push(score);
    return acc;
  }, initial);

  const bestScores: ScoreWithRelations[] = Object.values(groupedBySession)
    .map((scoresForSession: ScoreWithRelations[]) => {
      const scoreType = scoresForSession[0].lobbySession.lobby.game.scoreType;

      if (scoreType === 'time') {
        return scoresForSession.sort((a, b) => a.score - b.score)[0];
      } else if (scoreType === 'points') {
        return scoresForSession.sort((a, b) => b.score - a.score)[0];
      }
      return null;
    })
    .filter((score) => score !== null) as ScoreWithRelations[]; // Filter out potential null values

  // Sort the best scores by createdAt
  bestScores.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());


  if (bestScores.length === 0) {
    return <div>empty</div>;
  }

  return (
    <div className="flex flex-col items-center h-full">
      <ScoreChart scores={bestScores} />
    </div>
  );
};

export default StatsPage;

import prismadb from '@/lib/prismadb';
import { ScoreChart } from '@/components/score-chart';
import { ScoreType } from '@prisma/client';
import { ScoreRelationsType } from '@/app/types';
import { auth, redirectToSignIn } from '@clerk/nextjs';
import { EmptyState } from '@/components/empty-state';

const StatsPage = async () => {
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
        select: {
          lobby: {
            select: {
              game: {
                select: {
                  id: true,
                  name: true,
                  scoreType: true, // Only selecting the game name
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const userGameAverageScores = await prismadb.gameAverageScore.findMany({
    where: {
      userId: userId,
    },
  });
  // Group by lobbySession
  const initial: Record<string, ScoreRelationsType[]> = {};

  const groupedBySession: Record<string, ScoreRelationsType[]> = scores.reduce((acc, score) => {
    const sessionId = score.lobbySessionId;
    if (!acc[sessionId]) {
      acc[sessionId] = [];
    }
    acc[sessionId].push(score);
    return acc;
  }, initial);

  let bestScores: ScoreRelationsType[] = Object.values(groupedBySession)
    .map((scoresForSession: ScoreRelationsType[]) => {
      const scoreType = scoresForSession[0].lobbySession.lobby.game.scoreType;

      if (scoreType === ScoreType.time) {
        return scoresForSession.sort((a, b) => a.score - b.score)[0];
      } else if (scoreType === ScoreType.points || scoreType === ScoreType.balance) {
        return scoresForSession.sort((a, b) => b.score - a.score)[0];
      }
      return null;
    })
    .filter((score) => score !== null) as ScoreRelationsType[];

  bestScores.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  if (bestScores.length === 0) {
    return (
      <EmptyState
        title="No Stats Available!"
        subtitle="You need to first play a game before stats are populated"
      />
    );
  }

  return (
    <div className="flex flex-col items-center h-full">
      <ScoreChart userGameAverageScores={userGameAverageScores} scores={bestScores} />
    </div>
  );
};

export default StatsPage;

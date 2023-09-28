import { GameSession, Score, Prisma } from '@prisma/client';
import { ModifiedScoreType, ModifiedGameType2 } from '@/app/types';
import prismadb from '@/lib/prismadb';

export const createGameSession = async (
  userId: string,
  gameId: string,
  lobbySessionId: string
): Promise<string> => {
  const currentDate = new Date();

  const expiresAt = currentDate;
  expiresAt.setSeconds(expiresAt.getSeconds() + 3599); // 59 minutes 59 seconds from now

  const gameSession = await prismadb.gameSession.create({
    data: {
      userId: userId,
      gameId: gameId,
      lobbySessionId: lobbySessionId,
      isValid: true,
      expiresAt: expiresAt,
      startedAt: Date.now(),
    },
  });
  return gameSession.id;
};

export const findScore = async (
  userId: string,
  gameId: string,
  lobbySessionId: string
): Promise<{ id: string; score: number } | null> => {
  const currentScore = await prismadb.score.findFirst({
    where: {
      userId: userId,
      gameId: gameId,
      lobbySessionId: lobbySessionId,
    },
  });
  if (!currentScore) {
    return null;
  }
  return { id: currentScore.id, score: currentScore.score };
};

export const getAllScores = async (
  lobbySessionId: string,
  orderDirection: Prisma.SortOrder
): Promise<ModifiedScoreType[]> => {
  const allScores = await prismadb.score.findMany({
    where: {
      lobbySessionId: lobbySessionId,
    },
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
  });

  return allScores;
};

export const getTop100Scores = async (
  lobbySessionId: string,
  orderDirection: Prisma.SortOrder
): Promise<ModifiedScoreType[]> => {
  const topScores = await prismadb.score.findMany({
    where: {
      lobbySessionId: lobbySessionId,
    },
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
    take: 100,
  });

  return topScores;
};

export const getUserScoreWithRank = async (
  lobbySessionId: string,
  userId: string,
  orderDirection: Prisma.SortOrder
) => {
  const sortOrder = orderDirection === 'asc' ? 'ASC' : 'DESC';

  const result = await prismadb.$queryRaw`SELECT userId, username, score, 
           RANK() OVER (ORDER BY score ${sortOrder}) as rank
    FROM score
    WHERE lobbySessionId = ${lobbySessionId} AND userId = ${userId}`;

  return (result as any)[0];
};

export const getTop100UniqueUserScores = async (
  lobbySessionId: string,
  orderDirection: Prisma.SortOrder
) => {
  const sortOrder = orderDirection === 'asc' ? 'ASC' : 'DESC';

  const top100UniqueUserScores = await prismadb.$queryRaw`
  SELECT userId, username, MAX(score) as score 
  FROM score
  WHERE lobbySessionId = ${lobbySessionId}
  GROUP BY userId
  (ORDER BY score ${sortOrder})
  LIMIT 100
`;
  return top100UniqueUserScores as any;
};

export const getGameSession = async (
  gameSessionId: string,
  currentDate: Date
): Promise<(GameSession & { lobbySession?: { id: string } }) | null> => {
  const gameSession: (GameSession & { lobbySession?: { id: string } }) | null =
    await prismadb.gameSession.findFirst({
      where: {
        id: gameSessionId,
        isValid: true,
        expiresAt: {
          gt: currentDate,
        },
        lobbySession: {
          isActive: true,
          expiredDateTime: {
            gt: currentDate,
          },
          startDateTime: {
            lt: currentDate,
          },
        },
      },
      include: {
        // Include only the id from the lobbySession, to check if it exists
        lobbySession: {
          select: {
            id: true,
          },
        },
      },
    });

  return gameSession;
};

export const getGame = async (
  userId: string,
  gameId: string
): Promise<ModifiedGameType2 | null> => {
  const game = await prismadb.game.findUnique({
    where: {
      id: gameId,
    },
    select: {
      scoreType: true,
      cheatScore: true,
      tierBoundaries: true,
      // lobbies: {
      //   select: {
      //     id: true,
      //     name: true,
      //     scoreRestriction: true,
      //     numScoresToAccess: true,
      //     sessions: {
      //       where: {
      //         isActive: true,
      //       },
      //       select: {
      //         id: true,
      //         expiredDateTime: true,
      //         startDateTime: true,
      //         scores: {
      //           where: {
      //             userId: userId,
      //           },
      //           take: 1,
      //           select: {
      //             id: true, // Only select the ID
      //           },
      //         },
      //       },
      //     },
      //   },
      // },
    },
  });
  return game;
};

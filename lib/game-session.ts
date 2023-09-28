import { TierBoundary, Score, Prisma } from '@prisma/client';
import { ModifiedScoreType } from '@/app/types';
import prismadb from '@/lib/prismadb';
import { all } from 'axios';

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

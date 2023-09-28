import { NextApiRequest } from 'next';

import { NextApiResponseServerIo } from '@/types';
import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs';

import { calculateSingleWeightedScore } from '@/lib/average-score';
import { isValidLobbyAccess } from '@/lib/utils';
import { createGameSession, findScore, getAllScores } from '@/lib/game-session';
import { processBestScores, prepareScoresForDisplay } from '@/lib/scores';
import { generateChallengeHash, generateResponseHash } from '@/lib/hash';
import prismadb from '@/lib/prismadb';
import { ScoreType, GameSession } from '@prisma/client';

const acceptedTypesObj: { [key: string]: number } = {
  '05b': 4,
  '1ub': 4,
  '2eb': 5,
};

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIo) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    const allValuesDefined = Object.values(body).every(
      (value) => value !== undefined && value !== null
    );

    const bodyLength = Object.keys(body).length;

    const receivedType: string = body.at;
    const validType = acceptedTypesObj[receivedType];
    const { userId } = getAuth(req);
    const user = userId ? await clerkClient.users.getUser(userId) : null;

    if (!userId || !user || !allValuesDefined) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (
      bodyLength === 0 ||
      bodyLength > 7 ||
      !validType ||
      acceptedTypesObj[receivedType] != bodyLength
    ) {
      return res.status(401).json({ error: 'Invalid body' });
    }

    if (receivedType === '05b') {
      const gameSessionId = await createGameSession(userId, body.gameId, body.lobbySessionId);
      //for balance games like blackjack need to update the balance (score)
      const currentScore = await findScore(userId, body.gameId, body.lobbySessionId);
      if (currentScore) {
        const newScore = currentScore.score + body.balanceChange;

        await prismadb.score.update({
          where: {
            id: currentScore.id,
          },
          data: {
            score: newScore,
          },
        });
        return res.status(200).json({ gameSessionId: gameSessionId });
      } else {
        return res.status(401).json({ error: 'No balance found' });
      }
    } else if (receivedType === '1ub') {
      const balanceChange = body.balanceChange;

      if (balanceChange > -1) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const currentScore = await findScore(userId, body.gameId, body.lobbySessionId);

      if (currentScore) {
        const newScore = currentScore.score + balanceChange;
        await prismadb.score.update({
          where: {
            id: currentScore.id,
          },
          data: {
            score: newScore,
          },
        });
        return res.status(200);
      } else {
        return res.status(401).json({ error: 'No balance found' });
      }
    } else if (receivedType === '2eb') {
      let displayScores = null;
      const balanceChange = body.balanceChange;
      // if (balanceChange > Math.ceil(lastBet * 2.5)) {
      //   return new NextResponse('Unauthorized', { status: 401 });
      // }
      const currentScore = await findScore(userId, body.gameId, body.lobbySessionId);

      if (currentScore) {
        const newScore = currentScore.score + balanceChange;
        if (balanceChange !== 0) {
          await prismadb.score.update({
            where: {
              id: currentScore.id,
            },
            data: {
              score: newScore,
            },
          });
        }

        if (body.lastHand) {
          const orderDirection = 'desc';
          //a better score was created so send a new best scores array to be use in the score-table
          const allScores = await getAllScores(body.lobbySessionId, orderDirection);
          const bestScoresArray = processBestScores({
            allScores,
            orderDirection,
          });
          displayScores = prepareScoresForDisplay(bestScoresArray, userId);
          if (displayScores[0].userId !== userId || displayScores[0].score !== newScore) {
            return res.status(401).json({ error: 'No balance found' });
          }

          return res.status(200).json({ displayScores: displayScores });
        } else {
          return res.status(200);
        }
      } else {
        return res.status(401).json({ error: 'No balance found' });
      }
    }
  } catch (error) {
    console.log('[MESSAGES_POST]', error);
    return res.status(500).json({ message: 'Internal Error' });
  }
}

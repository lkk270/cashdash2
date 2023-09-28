import { auth, currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const bodyLength = Object.keys(body).length;

    const allValuesDefined = Object.values(body).every(
      (value) => value !== undefined && value !== null
    );

    const receivedType: string = body.at;
    const validType = acceptedTypesObj[receivedType];
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user || !allValuesDefined) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (
      bodyLength === 0 ||
      bodyLength > 7 ||
      !validType ||
      acceptedTypesObj[receivedType] != bodyLength
    ) {
      return new NextResponse('Invalid body', { status: 400 });
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
        return new NextResponse(JSON.stringify({ gameSessionId: gameSessionId }));
      } else {
        return new NextResponse('No balance found', { status: 401 });
      }
    } else if (receivedType === '1ub') {
      const balanceChange = body.balanceChange;

      if (balanceChange > -1) {
        return new NextResponse('Unauthorized', { status: 401 });
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
        return new NextResponse('', { status: 200 });
      } else {
        return new NextResponse('No balance found', { status: 401 });
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
            return new NextResponse('No balance found', { status: 401 });
          }

          return new NextResponse(JSON.stringify({ displayScores: displayScores }));
        } else {
          return new NextResponse('', { status: 200 });
        }
      } else {
        return new NextResponse('No balance found', { status: 401 });
      }
    }
  } catch (error) {
    console.log('[MESSAGES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

import { auth, currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

// import { calculateSingleWeightedScore } from '@/lib/average-score';
// import { isValidLobbyAccess } from '@/lib/utils';
import { createGameSession, findScore, getAllScores, getGameSession } from '@/lib/game-session';
import { processBestScores, prepareScoresForDisplay } from '@/lib/scores';
// import { generateChallengeHash, generateResponseHash } from '@/lib/hash';
import prismadb from '@/lib/prismadb';
// import { ScoreType, GameSession } from '@prisma/client';

const acceptedTypesObj: { [key: string]: number } = {
  '05b': 5,
  '1ub': 7,
  '2eb': 10,
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
      bodyLength > 10 ||
      !validType ||
      acceptedTypesObj[receivedType] != bodyLength
    ) {
      return new NextResponse('Invalid body', { status: 400 });
    }
    const currentScore = await findScore(userId, body.gameId, body.lobbySessionId);
    const currentBalance = body.currentBalance; //startBalance - chip amount
    const balanceChange = body.balanceChange; //a negative value

    if (!currentScore) {
      return new NextResponse('Internal Server Error, no balance found', { status: 500 });
    }
    const currentScoreScore = currentScore.score;
    const newScore = currentScoreScore + balanceChange;

    if (
      currentBalance - balanceChange !== currentScoreScore &&
      (receivedType === '05b' || receivedType === '1ub')
    ) {
      return new NextResponse('State out of sync, attempting refresh', {
        status: 302,
      });
    }

    if (
      (balanceChange >= 0 || newScore < 0) &&
      (receivedType === '05b' || receivedType === '1ub')
    ) {
      return new NextResponse('Not enough balance!', { status: 401 });
    }

    if (receivedType === '05b') {
      const gameSessionId = await createGameSession(userId, body.gameId, body.lobbySessionId, 150);
      //for balance games like blackjack need to update the balance (score)

      await prismadb.score.update({
        where: {
          id: currentScore.id,
        },
        data: {
          score: newScore,
          betTotalHand1: Math.abs(balanceChange),
        },
      });
      return new NextResponse(JSON.stringify({ gameSessionId: gameSessionId }));
    }

    if (receivedType === '1ub' || receivedType === '2eb') {
      const handNum = body.handNum;

      if (handNum !== 0 && handNum !== 1) {
        return new NextResponse('Invalid body', { status: 400 });
      }
      if (!currentScore.betTotalHand1 || !currentScore.betTotalHand2) {
        //even if there isn't a second hand, it should have still been initialized as 0
        return new NextResponse('Internal server error 97', { status: 500 });
      }
      const currentDate = new Date();

      const gameSession = await getGameSession(body.gameSessionId, currentDate);

      if (!gameSession || !gameSession.lobbySession) {
        return new NextResponse('Session timed out! Attempting refresh', {
          status: 302,
        });
      }
      if (receivedType === '1ub') {
        const changeType = body.changeType;
        let newData: { score: typeof newScore; betTotalHand1?: number; betTotalHand2?: number } = {
          score: newScore,
        };
        if (changeType === 'd') {
          if (handNum === 0) {
            newData.betTotalHand1 = currentScore.betTotalHand1 - balanceChange;
          } else if (handNum === 1) {
            newData.betTotalHand2 = currentScore.betTotalHand2 - balanceChange;
          }
        } else if (changeType === 's') {
          //for split
          //Set the betTotalHand2 of the now create second hand
          //since balanceChange is a negative number currentScore.betTotalHand2 - balanceChange
          //will add positive balanceChange currentScore.betTotalHand2 (which is already > 0)
          newData.betTotalHand2 = currentScore.betTotalHand2 - balanceChange;
        } else {
          return new NextResponse('Internal server error 127', { status: 500 });
        }
        await prismadb.score.update({
          where: {
            id: currentScore.id,
          },
          data: newData,
        });
        return new NextResponse('', { status: 200 });
      } else if (receivedType === '2eb') {
        let payoutMultiplier = body.pm;
        let displayScores = null;
        let betTotal;

        if (handNum === 0) {
          betTotal = currentScore.betTotalHand1;
        } else {
          //not really an else as we have an above check that makes sure that
          //handNum is either 0 or 1
          betTotal = currentScore.betTotalHand2;
        }

        if (balanceChange > Math.ceil(betTotal * payoutMultiplier)) {
          return new NextResponse('Unauthorized', { status: 401 });
        }

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
      }
    }
  } catch (error) {
    console.log('[MESSAGES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

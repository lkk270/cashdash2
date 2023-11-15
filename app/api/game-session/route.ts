import { auth, currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { calculateSingleWeightedScore } from '@/lib/average-score';
// import { isValidLobbyAccess } from '@/lib/utils';
import {
  createGameSession,
  getGameSession,
  getAllScores,
  getGame,
  findScore,
  createFlaggedScore,
} from '@/lib/game-session';
import { processBestScores, prepareScoresForDisplay } from '@/lib/scores';
import { generateChallengeHash, generateResponseHash } from '@/lib/hash';
import prismadb from '@/lib/prismadb';
import { ScoreType } from '@prisma/client';

const acceptedTypesObj: { [key: string]: number } = {
  '05': 3,
  '2': 2,
  '3': 7,
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

    if (receivedType === '05') {
      const gameSessionId = await createGameSession(userId, body.gameId, body.lobbySessionId);
      return new NextResponse(JSON.stringify({ gameSessionId: gameSessionId }));
    }

    // else if (receivedType === '0') {
    //   const expiresAt = currentDate;
    //   expiresAt.setSeconds(expiresAt.getSeconds() + 3599); // 59 minutes 59 seconds from now

    //   const gameSession = await prismadb.gameSession.create({
    //     data: {
    //       userId: userId,
    //       gameId: body.gameId,
    //       lobbySessionId: body.lobbySessionId,
    //       isValid: true,
    //       expiresAt: expiresAt,
    //     },
    //   });

    //   return new NextResponse(JSON.stringify({ gameSessionId: gameSession.id }));
    // } else if (receivedType === '1') {
    //   await prismadb.gameSession.update({
    //     where: {
    //       id: body.gameSessionId,
    //       isValid: true,
    //       expiresAt: {
    //         gt: currentDate,
    //       },
    //     },
    //     data: { startedAt: Date.now() },
    //   });
    //   return new NextResponse();
    // }
    else if (receivedType === '2' || receivedType === '3') {
      const currentDate = new Date();

      const gameSession = await getGameSession(body.gameSessionId, currentDate);

      if (!gameSession) {
        console.log('IN 87');

        return new NextResponse('!gameSession Attempting refresh', {
          status: 302,
        });
      }
      if (!gameSession.lobbySession) {
        console.log('IN 92');
        return new NextResponse('!!gameSession.lobbySession Attempting refresh', {
          status: 302,
        });
      }

      if (receivedType === '2') {
        const challengedHash = generateChallengeHash(
          gameSession.id,
          process.env.GAME_SESSION_SECRET
        );
        return new NextResponse(JSON.stringify({ hash: challengedHash }));
      } else if (receivedType === '3') {
        let displayScores = null;
        let newAverageScore;
        let newWeightedAverageScore;
        const responseHashToCompare = generateResponseHash(body.cHash, body.score);
        if (responseHashToCompare !== body.rHash) {
          return new NextResponse('Unauthorized', { status: 401 });
        }
        const currentMilliseconds = currentDate.getTime();
        const game = await getGame(userId, gameSession.gameId);

        if (!game) {
          return new NextResponse('No game?', { status: 401 });
        }
        if (game.scoreType === ScoreType.time && body.score < game.cheatScore) {
          await createFlaggedScore(
            userId,
            gameSession.lobbySessionId,
            body.score,
            game.cheatScore,
            'CHEATING'
          );
          return new NextResponse('Unauthorized', { status: 401 });
        }
        if (
          (game.scoreType === ScoreType.points || game.scoreType === ScoreType.balance) &&
          body.score > game.cheatScore
        ) {
          await createFlaggedScore(
            userId,
            gameSession.lobbySessionId,
            body.score,
            game.cheatScore,
            'CHEATING'
          );
          return new NextResponse('Unauthorized', { status: 401 });
        }
        if (
          !gameSession.startedAt ||
          (game.scoreType === ScoreType.time &&
            currentMilliseconds - Number(gameSession.startedAt) > body.score + 5000)
        ) {
          await createFlaggedScore(
            userId,
            gameSession.lobbySessionId,
            body.score,
            currentMilliseconds - Number(gameSession.startedAt),
            'CHEATING_ELAPSED_TIME'
          );
          return new NextResponse('Suspected of cheating', { status: 401 });
        }

        // const lobbyWithScores = game.lobbies.find(
        //   (lobby) =>
        //     lobby.sessions &&
        //     lobby.sessions.some((session) => session.scores && session.scores.length > 0)
        // );

        // const currentLobby = game.lobbies.find(
        //   (lobby) =>
        //     lobby.sessions && lobby.sessions.some((session) => session.id === body.lobbySessionId)
        // );

        // if (!currentLobby) {
        //   return new NextResponse('Lobby not found', { status: 404 });
        // }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const currentGameAverageScore = await prismadb.gameAverageScore.findFirst({
          where: {
            userId: userId,
            gameId: gameSession.gameId,
          },
        });

        if (!currentGameAverageScore) {
          return new NextResponse('Internal Error, try refreshing the page.', { status: 500 });
        }

        // const userPlayedInSession = currentLobby.sessions[0].scores?.length > 0 ? true : false;
        // let accessResult = isValidLobbyAccess({
        //   lobbyId: currentLobby.id,
        //   lobbyWithScoresName: lobbyWithScores?.name,
        //   lobbyWithScoresId: lobbyWithScores?.id,
        //   userPlayedInSession: userPlayedInSession,
        //   scoreType: game.scoreType,
        //   weightedAverageScore: currentGameAverageScore?.averageScore,
        //   timesPlayed: currentGameAverageScore?.timesPlayed || 0,
        //   numScoresToAccess: currentLobby.numScoresToAccess,
        //   scoreRestriction: currentLobby.scoreRestriction,
        //   expiredDateTime: currentLobby.sessions[0].expiredDateTime,
        //   startDateTime: currentLobby.sessions[0].startDateTime,
        // });
        // if (!accessResult.isValid) {
        //   return new NextResponse('INVALID! ' + accessResult.message, { status: 302 });
        // }

        const weightedScoreObj = await calculateSingleWeightedScore(
          { score: body.score, createdAt: new Date() },
          game.tierBoundaries
        );

        //If the incoming score gets a weight of <= 0 then automatically create a flaggedScore
        if (weightedScoreObj.weight <= 0) {
          const entryWithZeroWeight = game.tierBoundaries.find((tier) => tier.weight === 0);

          const lowerBoundOfZeroWeight = entryWithZeroWeight ? entryWithZeroWeight.lowerBound : -1;
          await createFlaggedScore(
            userId,
            gameSession.lobbySessionId,
            body.score,
            lowerBoundOfZeroWeight,
            'BAD'
          );
        }
        let transaction; //make use of transaction - all updates/creates have to succeed for them to all succeed

        //if there is a currentGameAverageScore then there must be an existing score.
        //but if there is an existing score it doesn't mean there is a currentGameAverageScore
        let currentAverageScore =
          currentGameAverageScore.averageScore === -1 ? 1 : currentGameAverageScore.averageScore;
        let currentWeightedAverageScore =
          currentGameAverageScore.weightedAverageScore === -1
            ? 1
            : currentGameAverageScore.weightedAverageScore;

        const newTimesPlayed = currentGameAverageScore.timesPlayed + 1;
        const newWeightedTimesPlayed =
          currentGameAverageScore.weightedTimesPlayed + weightedScoreObj.weight;

        //since the timesPlayed and the weightedTimesPlayed are initialized to 0
        //if it's the first update of the gameAverageScore since its initialization,
        //newAverageScore = 1 * 0 + currentScore/1 = currentScore
        //newWeightedAverageScore = (1 * 0 + weightedScoreObj.weightedScore)/1 = weightedScoreObj.weightedScore

        newAverageScore =
          (currentAverageScore * currentGameAverageScore.timesPlayed + body.score) / newTimesPlayed;

        newWeightedAverageScore =
          (currentWeightedAverageScore * currentGameAverageScore.weightedTimesPlayed +
            weightedScoreObj.weightedScore) /
          newWeightedTimesPlayed;

        const currentScore = await findScore(
          userId,
          gameSession.gameId,
          gameSession.lobbySessionId
        );

        // game.scoreType === ScoreType.time && body.score < body.userBestScore.score;

        //if there is no score create a score and update the average
        if (!currentScore) {
          if (weightedScoreObj.weight > 0) {
            transaction = prismadb.$transaction([
              prismadb.gameAverageScore.updateMany({
                where: {
                  userId: userId,
                  gameId: gameSession.gameId,
                },
                data: {
                  timesPlayed: newTimesPlayed,
                  averageScore: newAverageScore,
                  weightedTimesPlayed: newWeightedTimesPlayed,
                  weightedAverageScore: newWeightedAverageScore,
                },
              }),
              prismadb.score.create({
                data: {
                  userId: userId,
                  gameId: gameSession.gameId,
                  username: user.username || '',
                  lobbySessionId: gameSession.lobbySessionId,
                  score: body.score,
                },
              }),
            ]);
            await transaction;
          } else {
            await prismadb.score.create({
              data: {
                userId: userId,
                gameId: gameSession.gameId,
                username: user.username || '',
                lobbySessionId: gameSession.lobbySessionId,
                score: body.score,
              },
            });
          }
        }
        //If the incoming score is better than the current score update the score
        else if (
          (game.scoreType === ScoreType.time && body.score < currentScore.score) ||
          (game.scoreType === ScoreType.points && body.score > currentScore.score)
        ) {
          //there will always be a found score (because if there is a currentGameAverageScore then there must be a current score as well),
          // but if something goes wrong and it doesn't find one we have this check
          //the second part is if the weight is greater than 0 then in addition to replacing the current score with
          //the incoming one, we should also modify the gameAverageScore
          if (currentScore && weightedScoreObj.weight > 0) {
            transaction = prismadb.$transaction([
              prismadb.gameAverageScore.updateMany({
                where: {
                  userId: userId,
                  gameId: gameSession.gameId,
                },
                data: {
                  timesPlayed: newTimesPlayed,
                  averageScore: newAverageScore,
                  weightedTimesPlayed: newWeightedTimesPlayed,
                  weightedAverageScore: newWeightedAverageScore,
                },
              }),
              prismadb.score.update({
                where: {
                  id: currentScore.id,
                },
                data: {
                  score: body.score,
                },
              }),
            ]);
            await transaction;
          }
          // if the weight is = 0, but since this else if is under the block that the incoming score
          //is better than the current score, we just update the current score.
          else if (currentScore && weightedScoreObj.weight === 0) {
            await prismadb.score.update({
              where: {
                id: currentScore.id,
              },
              data: {
                score: body.score,
              },
            });
          }
        }
        //If incoming score isn't better than the current score
        //but it's weight > 0, we only update the GameAverageScore
        else if (weightedScoreObj.weight > 0) {
          await prismadb.gameAverageScore.updateMany({
            where: {
              userId: userId,
              gameId: gameSession.gameId,
            },
            data: {
              timesPlayed: newTimesPlayed,
              averageScore: newAverageScore,
              weightedTimesPlayed: newWeightedTimesPlayed,
              weightedAverageScore: newWeightedAverageScore,
            },
          });
        }
        /////////////////////////////////////////////////////////////////////////////////////////////////////////

        if (
          !body.userBestScore.score ||
          (game.scoreType === ScoreType.points && body.score > body.userBestScore.score) ||
          (game.scoreType === ScoreType.time && body.score < body.userBestScore.score)
        ) {
          const orderDirection = game.scoreType === ScoreType.time ? 'asc' : 'desc';

          const allScores = await getAllScores(gameSession.lobbySessionId, orderDirection);

          //a better score was created so send a new best scores array to be use in the score-table
          const bestScoresArray = processBestScores({
            allScores,
            orderDirection,
          });

          displayScores = prepareScoresForDisplay(bestScoresArray, userId);
        }
        const message = 'New personal best score (for this session)!';
        if (displayScores) {
          return new NextResponse(
            JSON.stringify({ message: message, displayScores: displayScores })
          );
        } else {
          return NextResponse.json({
            status: 400,
          });
        }
      } else {
        return new NextResponse('Internal Error', { status: 500 });
      }
    }
  } catch (error: any) {
    console.log(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

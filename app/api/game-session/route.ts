import { auth, currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { calculateSingleWeightedScore } from '@/lib/average-score';
import { isValidLobbyAccess } from '@/lib/utils';
import { createGameSession, getGameSession, getAllScores, getGame } from '@/lib/game-session';
import { processBestScores, prepareScoresForDisplay } from '@/lib/scores';
import { generateChallengeHash, generateResponseHash } from '@/lib/hash';
import prismadb from '@/lib/prismadb';
import { ScoreType, GameSession } from '@prisma/client';

const acceptedTypesObj: { [key: string]: number } = {
  '05': 3,
  '2': 2,
  '3': 7,
};
//oldTypes: { [key: string]: number } = { '0': 3, '1': 2};
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

      if (!gameSession || !gameSession.lobbySession) {
        return new NextResponse('Attempting refresh', {
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
          return new NextResponse('Unauthorized1', { status: 401 });
        } else {
          const currentMilliseconds = currentDate.getTime();
          const game = await getGame(userId, gameSession.gameId);

          if (!game) {
            return new NextResponse('No game?', { status: 401 });
          }
          if (game.scoreType === ScoreType.time && body.score < game.cheatScore) {
            return new NextResponse('Unauthorized2', { status: 401 });
          }
          if (
            (game.scoreType === ScoreType.points || game.scoreType === ScoreType.balance) &&
            body.score > game.cheatScore
          ) {
            return new NextResponse('Unauthorized3', { status: 401 });
          }
          if (
            !gameSession.startedAt ||
            (game.scoreType === ScoreType.time &&
              currentMilliseconds - Number(gameSession.startedAt) > body.score + 5000)
          ) {
            return new NextResponse('Suspected of cheating', { status: 401 });
          }

          const lobbyWithScores = game.lobbies.find(
            (lobby) =>
              lobby.sessions &&
              lobby.sessions.some((session) => session.scores && session.scores.length > 0)
          );

          const currentLobby = game.lobbies.find(
            (lobby) =>
              lobby.sessions && lobby.sessions.some((session) => session.id === body.lobbySessionId)
          );

          if (!currentLobby) {
            return new NextResponse('Lobby not found', { status: 404 });
          }

          const currentGameAverageScore = await prismadb.gameAverageScore.findFirst({
            where: {
              userId: userId,
              gameId: gameSession.gameId,
            },
          });

          const userPlayedInSession = currentLobby.sessions[0].scores?.length > 0 ? true : false;
          let accessResult = isValidLobbyAccess({
            lobbyId: currentLobby.id,
            lobbyWithScoresName: lobbyWithScores?.name,
            lobbyWithScoresId: lobbyWithScores?.id,
            userPlayedInSession: userPlayedInSession,
            scoreType: game.scoreType,
            weightedAverageScore: currentGameAverageScore?.averageScore,
            timesPlayed: currentGameAverageScore?.timesPlayed || 0,
            numScoresToAccess: currentLobby.numScoresToAccess,
            scoreRestriction: currentLobby.scoreRestriction,
            expiredDateTime: currentLobby.sessions[0].expiredDateTime,
            startDateTime: currentLobby.sessions[0].startDateTime,
          });
          if (!accessResult.isValid) {
            return new NextResponse('INVALID! ' + accessResult.message, { status: 302 });
          }

          const weightedScoreObj = await calculateSingleWeightedScore(
            { score: body.score, createdAt: new Date() },
            game.tierBoundaries
          );

          let transaction; //make use of transaction - all updates/creates have to succeed for them to all succeed

          if (currentGameAverageScore) {
            const newTimesPlayed = currentGameAverageScore.timesPlayed + 1;
            newAverageScore =
              (currentGameAverageScore.averageScore * currentGameAverageScore.timesPlayed +
                body.score) /
              newTimesPlayed;

            const newWeightedTimesPlayed =
              currentGameAverageScore.weightedTimesPlayed + weightedScoreObj.weight;
            newWeightedAverageScore =
              (currentGameAverageScore.weightedAverageScore *
                currentGameAverageScore.weightedTimesPlayed +
                weightedScoreObj.weightedScore) /
              newWeightedTimesPlayed;

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
          } else {
            transaction = prismadb.$transaction([
              prismadb.gameAverageScore.create({
                data: {
                  userId: userId,
                  gameId: gameSession.gameId,
                  timesPlayed: 1,
                  averageScore: body.score,
                  weightedAverageScore: weightedScoreObj.weightedScore,
                  weightedTimesPlayed: weightedScoreObj.weight,
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
          }
          await transaction;

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
          const message =
            displayScores !== null ? 'New personal best score (for this session)!' : 'Score saved!';
          return new NextResponse(
            JSON.stringify({ message: message, displayScores: displayScores })
          );
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

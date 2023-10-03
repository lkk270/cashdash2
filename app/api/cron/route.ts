import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { calculateSingleWeightedScore } from '@/lib/average-score';
import { sortScores } from '@/lib/scores';
import prismadb from '@/lib/prismadb';
import { ScoreType, TierBoundary } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reqHeaders = headers();
    const secret = reqHeaders.get('cron_secret');
    const bodyLength = Object.keys(body).length;

    //Modify average score for balance games
    //first get the lobbySessions that are balance based

    const gameObjs = await prismadb.game.findMany({
      where: {
        scoreType: ScoreType.balance,
      },
      select: {
        id: true,
        tierBoundaries: true,
        lobbies: {
          select: {
            sessions: {
              where: {
                isActive: true,
              },
              select: {
                scores: {
                  select: {
                    userId: true,
                    score: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    //get currentGameAverageScores for all balance games and all userIds from the corresponding scores of the sessions
    // Extract gameIds and userIds from gameObjs
    let scoresMap;
    const gameIds = gameObjs.map((game) => game.id);
    const userIds = gameObjs.flatMap((game) =>
      game.lobbies.flatMap((lobby) =>
        lobby.sessions.flatMap((session) => session.scores.map((score) => score.userId))
      )
    );
    const tierBoundaryMap = gameObjs.reduce((acc, { id, tierBoundaries }) => {
      acc[id] = tierBoundaries;
      return acc;
    }, {} as Record<string, TierBoundary[]>);

    for (let gameObj of gameObjs) {
      for (let lobby of gameObj.lobbies) {
        if (lobby.sessions.length === 0) continue;
        scoresMap = lobby.sessions[0].scores.reduce((acc, { userId, score }) => {
          acc[userId] = score;
          return acc;
        }, {} as Record<string, number>);
      }
    }

    // get currentGameAverageScores
    const gameAverageScores = await prismadb.gameAverageScore.findMany({
      where: {
        userId: {
          in: Array.from(new Set(userIds)), // Ensuring unique userIds
        },
        gameId: {
          in: gameIds,
        },
      },
    });
    if (!scoresMap) {
      return new NextResponse('No scores', { status: 200 });
    }
    for (let gameAverageScore of gameAverageScores) {
      const currentScore = scoresMap[gameAverageScore.userId];
      const weightedScoreObj = await calculateSingleWeightedScore(
        { score: currentScore, createdAt: new Date() },
        tierBoundaryMap[gameAverageScore.gameId]
      );
      let currentAverageScore =
        gameAverageScore.averageScore === -1 ? 1 : gameAverageScore.averageScore;
      let currentWeightedAverageScore =
        gameAverageScore.weightedAverageScore === -1 ? 1 : gameAverageScore.weightedAverageScore;

      const newTimesPlayed = gameAverageScore.timesPlayed + 1;
      const newWeightedTimesPlayed = gameAverageScore.weightedTimesPlayed + weightedScoreObj.weight;

      const newAverageScore =
        (currentAverageScore * gameAverageScore.timesPlayed + currentScore) / newTimesPlayed;

      let newWeightedAverageScore =
        (currentWeightedAverageScore * gameAverageScore.weightedTimesPlayed +
          weightedScoreObj.weightedScore) /
        newWeightedTimesPlayed;

      //means score is better and the current score should be updated
      //there will always be a found score, but if something goes wrong and it doesn't find one we have this check
      await prismadb.gameAverageScore.updateMany({
        where: {
          userId: gameAverageScore.userId,
          gameId: gameAverageScore.gameId,
        },
        data: {
          timesPlayed: newTimesPlayed,
          averageScore: newAverageScore,
          weightedTimesPlayed: newWeightedTimesPlayed,
          weightedAverageScore: newWeightedAverageScore,
        },
      });
    }

    /////////////////////////////////////////////////////////////
    //parse scores and give rewards to the score and notifications no matter the score
    //get active lobbySessions
    const allGames = await prismadb.game.findMany({
      select: {
        id: true,
        scoreType: true,
        name: true,
      },
    });

    const allGamesMap = allGames.reduce((acc, gameObject) => {
      acc[gameObject.id] = { scoreType: gameObject.scoreType, name: gameObject.name };
      return acc;
    }, {} as Record<string, { scoreType: string; name: string }>);

    const lobbySessions = await prismadb.lobbySession.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        scores: {
          select: {
            id: true,
            userId: true,
            score: true,
            createdAt: true,
          },
        },
        lobby: {
          select: {
            gameId: true,
            numRewards: true,
            firstPlacePrize: true,
            secondPlacePrize: true,
            thirdPlacePrize: true,
            unspecifiedPlacePrize: true,
          },
        },
      },
    });

    for (let lobbySession of lobbySessions) {
      let notificationText;
      let rankText;
      const lobby = lobbySession.lobby;
      const gameObj = allGamesMap[lobby.gameId];
      const orderDirection = gameObj.scoreType === ScoreType.time ? 'asc' : 'desc';
      let sortedScores = sortScores(lobbySession.scores, orderDirection);
      const sortedScoresLength = sortedScores.length;
      for (let i = 0; i < sortedScoresLength; i++) {
        const iPlusOne = i + 1;
        let score = sortedScores[i];
        let prize = 0;
        if (i === 0) {
          rankText = '1st';
          prize = lobby.firstPlacePrize;
        } else if (i === 1) {
          rankText = '2nd';
          prize = lobby.secondPlacePrize;
        } else if (i === 2) {
          rankText = '3rd';
          prize = lobby.thirdPlacePrize;
        } else if (iPlusOne <= lobby.numRewards && lobby.unspecifiedPlacePrize) {
          rankText = `${iPlusOne.toString()}th`;
          prize = lobby.unspecifiedPlacePrize;
        }
        if (iPlusOne <= lobby.numRewards || iPlusOne <= 3) {
          const data = {
            userId: score.userId,
            scoreId: score.id,
            value: prize,
            place: iPlusOne,
          };
          notificationText = `${gameObj.name} session ended. Your final score was ${score.score}, which was good enough for ${rankText} place - out of ${sortedScoresLength} scores! The cash prize for ${rankText} is $${prize}, and it has been delivered.`;
          await prismadb.reward.create({
            data: {
              userId: score.userId,
              scoreId: score.id,
              value: prize,
              place: iPlusOne,
            },
          });
          let currentUserCash;
          currentUserCash = await prismadb.userCash.findUnique({
            where: {
              userId: score.userId,
            },
            select: {
              cash: true,
            },
          });
          if (!currentUserCash) {
            await prismadb.userCash.create({
              data: {
                userId: score.userId,
                cash: prize,
              },
            });
          } else {
            const newCurrentUserCash = currentUserCash.cash + prize;
            prismadb.userCash.update({
              where: {
                userId: score.userId,
              },
              data: {
                cash: newCurrentUserCash,
              },
            });
          }
        } else {
          notificationText = `${gameObj.name} session ended. Your final score was ${score.score}. Your score ranked #${iPlusOne} out of ${sortedScoresLength} scores.`;
        }

        await prismadb.notification.create({
          data: {
            userId: score.userId,
            text: notificationText,
          },
        });
      }
    }

    /////////////////////////////////////////////////////////////
    //Set current lobby sessions isActive to false and create a new lobby session to take its place

    if (secret !== process.env.CRON_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (bodyLength > 0) {
      return new NextResponse('Invalid body', { status: 400 });
    }

    return new NextResponse(JSON.stringify(tierBoundaryMap), { status: 200 });
  } catch (error: any) {
    console.log(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

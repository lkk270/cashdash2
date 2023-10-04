import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { getStartAndExpiredDate, convertMillisecondsToMinSec } from '@/lib/utils';
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
    const { currentDate, startDateTime, expiredDateTime } = getStartAndExpiredDate();
    const thirtyMinutesFromNow = new Date(currentDate.getTime() + 30 * 60 * 1000);

    //query all things now that use isActive = true, because we will set it false first

    //get the lobbySessions that are balance based
    const gameObjs = await prismadb.game.findMany({
      where: {
        scoreType: ScoreType.balance,
        name: 'Blackjack',
      },
      select: {
        id: true,
        tierBoundaries: true,
        lobbies: {
          select: {
            sessions: {
              where: {
                isActive: true,
                expiredDateTime: {
                  lt: thirtyMinutesFromNow,
                },
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

    //query isActive = true lobbySessions
    const lobbySessions = await prismadb.lobbySession.findMany({
      where: {
        isActive: true,
        expiredDateTime: {
          lt: thirtyMinutesFromNow,
        },
        // lobbyId: '6ac5594a-794a-4352-b051-4ae2f31d3340',
      },
      select: {
        id: true,
        lobbyId: true,
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

    /////////////////////////////////////////////////////////////
    //Set current lobby sessions isActive to false and create a new lobby session to take its place
    //unfortunately we have to loop through lobbySessions now and later, but because the other code
    //can take some time to execute, it's important to first toggle the lobby sessions

    let newLobbySessions = [];
    let lobbySessionIds = [];
    for (let lobbySession of lobbySessions) {
      newLobbySessions.push({
        lobbyId: lobbySession.lobbyId,
        startDateTime: startDateTime,
        expiredDateTime: expiredDateTime,
        isActive: true,
      });
      lobbySessionIds.push(lobbySession.id);
    }

    console.log(newLobbySessions);

    //update all in question lobby sessions' inActive to false
    await prismadb.lobbySession.createMany({
      data: newLobbySessions,
    });

    await prismadb.lobbySession.updateMany({
      where: {
        id: {
          in: lobbySessionIds,
        },
      },
      data: {
        isActive: false,
      },
    });

    //Modify average score for balance games
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

    for (let lobbySession of lobbySessions) {
      let notificationText;
      let rankText;
      const lobby = lobbySession.lobby;
      if (!lobby) {
        continue;
      }
      const gameObj = allGamesMap[lobby.gameId];
      const orderDirection = gameObj.scoreType === ScoreType.time ? 'asc' : 'desc';
      let sortedScores = sortScores(lobbySession.scores, orderDirection);
      const sortedScoresLength = sortedScores.length;
      for (let i = 0; i < sortedScoresLength; i++) {
        const iPlusOne = i + 1;
        let score = sortedScores[i];
        const formattedScore =
          gameObj.scoreType === ScoreType.time
            ? convertMillisecondsToMinSec(score.score)
            : score.score;
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
          notificationText = `${gameObj.name} session ended. Your final score was ${formattedScore}, which was good enough for ${rankText} place - out of ${sortedScoresLength} scores! The cash prize for ${rankText} place is $${prize}, and it has been delivered.`;
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
            await prismadb.userCash.update({
              where: {
                userId: score.userId,
              },
              data: {
                cash: newCurrentUserCash,
              },
            });
          }
        } else {
          notificationText = `${gameObj.name} session ended. Your final score was ${formattedScore}. Your score ranked #${iPlusOne} out of ${sortedScoresLength} scores.`;
        }

        await prismadb.notification.create({
          data: {
            userId: score.userId,
            text: notificationText,
          },
        });
      }
    }

    if (secret !== process.env.CRON_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (bodyLength > 0) {
      return new NextResponse('Invalid body', { status: 400 });
    }

    return new NextResponse(JSON.stringify(lobbySessionIds), { status: 200 });
  } catch (error: any) {
    console.log(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

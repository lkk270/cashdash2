import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { calculateSingleWeightedScore } from '@/lib/average-score';
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
        scoreType: 'balance',
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
      console.log('IN 60');
      for (let lobby of gameObj.lobbies) {
        console.log('IN 61');
        console.log(gameObj.id);
        console.log(lobby.sessions.length);
        if (lobby.sessions.length === 0) continue;
        console.log(lobby.sessions[0].scores);
        scoresMap = lobby.sessions[0].scores.reduce((acc, { userId, score }) => {
          console.log('score', score);
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

    /////////////////////////////////////////////////////////////
    //Set current isValid lobby sessions to false and create a new lobby session to take its place

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

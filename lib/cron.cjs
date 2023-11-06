const {
  getStartAndExpiredDate,
  convertMillisecondsToMinSec,
  calculateSingleWeightedScore,
  sortScores,
  prismadb,
} = require('/Users/leekorff-korn/Code/cashdash2/lib/index.ts');

async function main2() {
  try {
    const { startDateTime, expiredDateTime } = getStartAndExpiredDate();
    const currentDate = new Date();
    const thirtyMinutesFromNow = new Date(currentDate.getTime() + 30 * 60 * 1000);

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

    const lobbySessions = await prismadb.lobbySession.findMany({
      where: {
        isActive: true,
        expiredDateTime: {
          lt: thirtyMinutesFromNow,
        },
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
    }, {});

    for (let gameObj of gameObjs) {
      for (let lobby of gameObj.lobbies) {
        if (lobby.sessions.length === 0) continue;
        scoresMap = lobby.sessions[0].scores.reduce((acc, { userId, score }) => {
          acc[userId] = score;
          return acc;
        }, {});
      }
    }

    const gameAverageScores = await prismadb.gameAverageScore.findMany({
      where: {
        userId: {
          in: Array.from(new Set(userIds)),
        },
        gameId: {
          in: gameIds,
        },
      },
    });
    if (!scoresMap) {
      console.log('NO SCORES');
      return;
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

      const newWeightedAverageScore =
        (currentWeightedAverageScore * gameAverageScore.weightedTimesPlayed +
          weightedScoreObj.weightedScore) /
        newWeightedTimesPlayed;

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
    }, {});

    for (let lobbySession of lobbySessions) {
      let notificationText;
      let rankText;
      const lobby = lobbySession.lobby;
      if (!lobby) {
        continue;
      }
      const gameObj = allGamesMap[lobby.gameId];
      const orderDirection = gameObj.scoreType === 'time' ? 'asc' : 'desc';
      let sortedScores = sortScores(lobbySession.scores, orderDirection);
      const sortedScoresLength = sortedScores.length;
      for (let i = 0; i < sortedScoresLength; i++) {
        const iPlusOne = i + 1;
        let score = sortedScores[i];
        const formattedScore =
          gameObj.scoreType === 'time' ? convertMillisecondsToMinSec(score.score) : score.score;
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
          notificationText = `${gameObj.name} session ended. Your final score was ${formattedScore}, which was good enough for ${rankText} place - out of ${sortedScoresLength} scores!`;
          // Once I am giving out rewards, I will switch the notificationText to this one
          // notificationText = `${gameObj.name} session ended. Your final score was ${formattedScore}, which was good enough for ${rankText} place - out of ${sortedScoresLength} scores! The cash prize for ${rankText} place is $${prize}, and it has been delivered.`;
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
  } catch (error) {
    console.error('Error in main2:', error);
  }
}

main2();

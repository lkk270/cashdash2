import { TierBoundary } from '@prisma/client';
import { ModifiedScoreType2 } from '@/app/types';
import prismadb from '@/lib/prismadb';

class WeightedScoreCalculator {
  private tierBoundaries: TierBoundary[];

  constructor(tierBoundaries: TierBoundary[]) {
    this.tierBoundaries = tierBoundaries;
  }

  private getRecencyFactor(scoreDate: Date): number {
    const currentDate = new Date();
    const differenceInDays = (currentDate.getTime() - scoreDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.exp(-0.05 * differenceInDays);
  }

  private getScoreFactor(score: number): number {
    for (let tier of this.tierBoundaries) {
      if (score >= tier.lowerBound && score <= tier.upperBound) {
        return tier.weight;
      }
    }
    // Default weight if no tier matches
    return 1;
  }

  private calculateWeightedScore(score: number, R: number, S: number) {
    return score * R * S;
  }

  public getWeightedScoreWithDetails(scoreObj: ModifiedScoreType2): {
    weightedScore: number;
    weight: number;
  } {
    const R = this.getRecencyFactor(scoreObj.createdAt);
    const S = this.getScoreFactor(scoreObj.score);
    const weightedScore = this.calculateWeightedScore(scoreObj.score, R, S);
    return { weightedScore, weight: R * S };
  }

  public getWeightedAverage(scores: ModifiedScoreType2[]): {
    weightedAverage: number;
    weightedTimesPlayed: number;
  } {
    let sumWeightedScores = 0;
    let sumWeights = 0;

    for (const scoreObj of scores) {
      const R = this.getRecencyFactor(scoreObj.createdAt);
      const S = this.getScoreFactor(scoreObj.score);
      const combinedWeight = R * S;

      sumWeightedScores += this.calculateWeightedScore(scoreObj.score, R, S);
      sumWeights += combinedWeight;
    }
    const weightedAverage = sumWeightedScores / sumWeights;

    return { weightedAverage: weightedAverage, weightedTimesPlayed: sumWeights };
  }
}

export const calculateWeightedAverageScore = async (
  gameId: string,
  userId: string
): Promise<{ weightedAverage: number; weightedTimesPlayed: number }> => {
  // Fetch the tiers from your database and pass them into the class constructor.
  const tiersFromDatabase: TierBoundary[] = await prismadb.tierBoundary.findMany({
    where: {
      gameId: gameId,
    },
  });

  const scores: ModifiedScoreType2[] = await prismadb.score.findMany({
    where: {
      gameId: gameId,
      userId: userId,
    },
    select: {
      score: true,
      createdAt: true,
    },
  });

  const calculator = new WeightedScoreCalculator(tiersFromDatabase);
  const average = calculator.getWeightedAverage(scores); // 'scores' is your array of Score objects
  return average;
};

export const calculateRegularAverageScore = async (
  gameId: string,
  userId: string
): Promise<{ average: number; timesPlayed: number }> => {
  const scores: ModifiedScoreType2[] = await prismadb.score.findMany({
    where: {
      gameId: gameId,
      userId: userId,
    },
    select: {
      score: true,
      createdAt: true,
    },
  });
  let sumOfScores = 0;
  for (const scoreObj of scores) {
    sumOfScores += scoreObj.score;
  }
  const average = sumOfScores / scores.length;
  return { average: average, timesPlayed: scores.length };
};

export const calculateSingleWeightedScore = async (
  scoreObj: ModifiedScoreType2,
  tiersFromDatabaseParam?: TierBoundary[],
  gameId?: string
): Promise<{ weightedScore: number; weight: number }> => {
  const tiersFromDatabase = tiersFromDatabaseParam
    ? tiersFromDatabaseParam
    : await prismadb.tierBoundary.findMany({
        where: {
          gameId: gameId,
        },
      });

  const calculator = new WeightedScoreCalculator(tiersFromDatabase);
  return calculator.getWeightedScoreWithDetails(scoreObj);
};

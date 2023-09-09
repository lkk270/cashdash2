import { Score, TierBoundary } from '@prisma/client';
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

  private getWeightedScore(scoreObj: Score): number {
    const R = this.getRecencyFactor(scoreObj.createdAt);
    const S = this.getScoreFactor(scoreObj.score);
    return scoreObj.score * R * S;
  }

  public getWeightedAverage(scores: Score[]): number {
    let sumWeightedScores = 0;
    let sumR = 0;
    let sumS = 0;

    for (const scoreObj of scores) {
      const weightedScore = this.getWeightedScore(scoreObj);
      const R = this.getRecencyFactor(scoreObj.createdAt);
      const S = this.getScoreFactor(scoreObj.score);

      sumWeightedScores += weightedScore;
      sumR += R;
      sumS += S;
    }

    return sumWeightedScores / (sumR * sumS);
  }
}

// Usage:

export const calculateWeightedAverageScore = async (gameId: string, userId: string) => {
  // Fetch the tiers from your database and pass them into the class constructor.
  const tiersFromDatabase: TierBoundary[] = await prismadb.tierBoundary.findMany({
    where: {
      gameId: gameId,
    },
  });

  const scores: Score[] = await prismadb.score.findMany({
    where: {
      gameId: gameId,
      userId: userId,
    },
  });

  const calculator = new WeightedScoreCalculator(tiersFromDatabase);
  const average = calculator.getWeightedAverage(scores); // 'scores' is your array of Score objects
};

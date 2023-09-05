import { ModifiedScoreType } from '@/app/types';

type ScoreProcessingParams = {
  allScores: ModifiedScoreType[];
  orderDirection: 'asc' | 'desc';
};

export const processBestScores = ({
  allScores,
  orderDirection,
}: ScoreProcessingParams): ModifiedScoreType[] => {
  const bestScoresByUser: Record<string, ModifiedScoreType> = {};

  allScores.forEach((score) => {
    if (orderDirection === 'asc') {
      if (!bestScoresByUser[score.userId] || score.score < bestScoresByUser[score.userId].score) {
        bestScoresByUser[score.userId] = score;
      }
    } else {
      if (!bestScoresByUser[score.userId] || score.score > bestScoresByUser[score.userId].score) {
        bestScoresByUser[score.userId] = score;
      }
    }
  });

  let bestScoresArray = Object.values(bestScoresByUser).sort((a, b) =>
    orderDirection === 'asc' ? a.score - b.score : b.score - a.score
  );

  // Assign ranks to all scores in the array
  bestScoresArray = bestScoresArray.map((score, index) => ({
    ...score,
    rank: index + 1,
  }));

  return bestScoresArray;
};

export const prepareScoresForDisplay = (
  scores: ModifiedScoreType[],
  userId: string
): ModifiedScoreType[] => {
  let otherScores: ModifiedScoreType[] = scores
    .filter((score) => score.userId !== userId)
    .slice(0, 100);
  const userScore = scores.find((score) => score.userId === userId);
  if (!userScore) {
    return scores.slice(0, 100); // return top 100 scores if no user score is found
  }
  if (userScore.rank && userScore.rank <= 100) {
    otherScores = scores.filter((score) => score.userId !== userId).slice(0, 99);
  }

  return [userScore, ...otherScores];
};

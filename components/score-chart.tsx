'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Brush,
  ResponsiveContainer,
} from 'recharts';
import { ScoreRelationsType } from '@/app/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScoreType, GameAverageScore } from '@prisma/client';
import { cn, convertMillisecondsToMinSec } from '@/lib/utils';

interface ScoreChartProps {
  scores: ScoreRelationsType[];
  userGameAverageScores: GameAverageScore[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  scoreType?: string;
}

export const ScoreChart = ({ scores, userGameAverageScores }: ScoreChartProps) => {
  const [activeTab, setActiveTab] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const games = scores.reduce((acc, score) => {
    const gameName = score.lobbySession.lobby.game.name;
    if (!acc[gameName]) {
      acc[gameName] = [];
    }
    acc[gameName].push(score);
    return acc;
  }, {} as Record<string, ScoreRelationsType[]>);

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, scoreType }) => {
    if (active && payload && payload.length) {
      const score = payload[0].payload.score; // Extract score from payload
      const reward = payload[0].payload.reward; // Extract reward from payload
      const formattedScore =
        scoreType === ScoreType.time ? convertMillisecondsToMinSec(score) : score;

      return (
        <div className="border rounded shadow bg-primary/20">
          <p className="label">{`Date: ${label}`}</p>
          <p>{`Score: ${formattedScore}`}</p>
          {reward && <p>{`Reward: $${reward.value}`}</p>}
          {reward && <p>{`Place: ${reward.place}`}</p>}
        </div>
      );
    }

    return null;
  };

  const CustomDot: React.FC<any> = ({ cx, cy, payload }) => {
    if (payload.reward) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#f1c454"
          stroke="none"
          style={{
            animation: 'pulse 1.5s infinite',
          }}
        />
      );
    }
    return <circle cx={cx} cy={cy} r={4} fill="#429add" stroke="none" />;
  };

  const gameNames = Object.keys(games);
  if (gameNames.length > 0 && !activeTab) {
    setActiveTab(gameNames[0]);
  }

  const getAverageScoreForGame = (gameId: string) => {
    const gameAverage = userGameAverageScores.find((gameScore) => gameScore.gameId === gameId);
    return gameAverage?.averageScore || 0;
  };

  const getWeightedAverageScoreForGame = (gameId: string) => {
    const gameAverage = userGameAverageScores.find((gameScore) => gameScore.gameId === gameId);
    return gameAverage?.weightedAverageScore || 0;
  };

  const getTimesPlayedForGame = (gameId: string) => {
    const gameAverage = userGameAverageScores.find((gameScore) => gameScore.gameId === gameId);
    return gameAverage?.timesPlayed || 0;
  };

  const getTotalWinningsForGame = (gameScores: ScoreRelationsType[]) => {
    return gameScores.reduce((acc, score) => {
      if (score.reward) {
        acc += score.reward.value || 0;
      }
      return acc;
    }, 0);
  };

  const tabsClassName = gameNames.length <= 10 ? 'justify-center' : '';

  return (
    <div className="flex flex-col items-center justify-center w-full pt-5 space-y-5 font-sans text-primary">
      <div className="text-sm text-center text-primary/50">
        <h1 className="items-center text-4xl font-bold">Player Stats</h1>
        <p className="mt-4">The graph shows the your best score per session entered.</p>
      </div>
      <Tabs defaultValue={activeTab} className="w-full rounded-sm ">
        <TabsList className={`${tabsClassName} flex min-w-0 overflow-x-scroll  scrollbar-hide`}>
          {gameNames.map((gameName) => (
            <TabsTrigger
              key={gameName}
              value={gameName}
              className="flex-none min-w-0 px-4 transition duration-200 transform border-b-2 border-transparent hover:border-blue-500"
            >
              {gameName}
            </TabsTrigger>
          ))}
        </TabsList>

        {gameNames.map((gameName) => {
          const currentScoreType = games[gameName][0].lobbySession.lobby.game.scoreType;
          const dataForChart = games[gameName].map((score) => ({
            date: new Date(score.createdAt).toLocaleDateString(),
            score: score.score,
          }));

          const endIndex = dataForChart.length - 1; // last index of the array
          const startIndex = endIndex - 30 > 0 ? endIndex - 30 : 0; // 10th from last, but not less than 0
          const activeGameId = games[gameName]?.[0]?.lobbySession?.lobby?.game?.id;

          const averageScore = getAverageScoreForGame(activeGameId);
          const weightedAverageScore = getWeightedAverageScoreForGame(activeGameId);
          const timesPlayed = getTimesPlayedForGame(activeGameId);
          const totalWinnings = getTotalWinningsForGame(games[gameName]);
          const formattedAverageScore =
            currentScoreType === ScoreType.time
              ? convertMillisecondsToMinSec(averageScore)
              : averageScore.toFixed(2);
          const formattedWeightedAverageScore =
            currentScoreType === ScoreType.time
              ? convertMillisecondsToMinSec(weightedAverageScore)
              : weightedAverageScore.toFixed(2);
          return (
            <TabsContent
              key={gameName}
              value={gameName}
              className="flex flex-col mt-0 space-y-2 justify-left"
            >
              {averageScore > 0 && (
                <div className="justify-center pl-10 mb-3 text-sm text-gray-600 ">
                  <p>Average Score: {formattedAverageScore}</p>
                  <p>Weighted Average Score: {formattedWeightedAverageScore}</p>
                  <p>Times played i.e. recorded a score: {timesPlayed}</p>
                  <p>Total Winnings: ${totalWinnings}</p>
                </div>
              )}
              <div className="relative pr-5 h-96">
                <ResponsiveContainer>
                  <LineChart
                    className="w-full min-w-full"
                    width={700}
                    height={500}
                    data={games[gameName].map((score) => ({
                      date: new Date(score.createdAt).toLocaleDateString(),
                      score: score.score,
                      reward: score.reward, // Include reward information
                    }))}
                  >
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fontFamily: 'Inter' }}
                      stroke="#4A4A4A"
                      padding={{ left: 10, right: 10 }} // add this line
                    />

                    <YAxis
                      tick={{ fontSize: 12, fontFamily: 'Inter' }}
                      stroke="#4A4A4A"
                      padding={{ top: 10 }} // add this line
                      tickFormatter={(value) =>
                        currentScoreType === ScoreType.time
                          ? convertMillisecondsToMinSec(value)
                          : value
                      }
                    />

                    <Tooltip content={<CustomTooltip scoreType={currentScoreType} />} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#429add"
                      dot={<CustomDot />}
                      yAxisId={0}
                      strokeWidth={1}
                    />
                    <Brush
                      dataKey="date"
                      height={30}
                      fill="#6a6a6a"
                      stroke="#8884d8"
                      startIndex={startIndex}
                      endIndex={endIndex}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

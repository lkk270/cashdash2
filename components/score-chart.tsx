'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Brush } from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Score, LobbySession, Lobby, Game } from '@prisma/client';
import { convertMillisecondsToMinSec } from '@/lib/utils';

interface ScoreChartProps {
  scores: (Score & {
    lobbySession: LobbySession & {
      lobby: Lobby & {
        game: Game;
      };
    };
  })[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  scoreType?: string;
}

export const ScoreChart = ({ scores }: ScoreChartProps) => {
  const [activeTab, setActiveTab] = useState('');

  // Organizing scores by games
  const games = scores.reduce(
    (acc, score) => {
      const gameName = score.lobbySession.lobby.game.name;
      if (!acc[gameName]) {
        acc[gameName] = [];
      }
      acc[gameName].push(score);
      return acc;
    },
    {} as Record<
      string,
      (Score & {
        lobbySession: LobbySession & {
          lobby: Lobby & {
            game: Game;
          };
        };
      })[]
    >
  );

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, scoreType }) => {
    if (active && payload && payload.length) {
      const score = payload[0].value;
      const formattedScore = scoreType === 'time' ? convertMillisecondsToMinSec(score) : score;

      return (
        <div className="p-2 border rounded shadow bg-primary/20">
          <p className="label">{`Date: ${label}`}</p>
          <p>{`${scoreType}: ${formattedScore}`}</p>
        </div>
      );
    }

    return null;
  };

  const gameNames = Object.keys(games);
  if (gameNames.length > 0 && !activeTab) {
    setActiveTab(gameNames[0]);
  }

  return (
    <div className="flex flex-col items-center justify-center w-full pt-5 pl-5 font-sans text-primary">
      {/* <h1 className="mb-4 text-xl font-bold font-inter">User Scores</h1> */}

      <Tabs defaultValue={activeTab} className="w-full rounded-sm ">
        <div className="max-w-xl rounded-sm bg-primary/40">
          {/* Added this container for inactive tabs */}
          <TabsList className="grid w-full max-w-xl grid-cols-2 bg-secondary/20">
            {gameNames.map((gameName) => (
              <TabsTrigger key={gameName} value={gameName}>
                {gameName}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {gameNames.map((gameName) => {
          const currentScoreType = games[gameName][0].lobbySession.lobby.game.scoreType;
          const dataForChart = games[gameName].map((score) => ({
            date: new Date(score.createdAt).toLocaleDateString(),
            score: score.score,
          }));

          const endIndex = dataForChart.length - 1; // last index of the array
          const startIndex = endIndex - 9 > 0 ? endIndex - 9 : 0; // 10th from last, but not less than 0

          return (
            <TabsContent
              key={gameName}
              value={gameName}
              className="flex justify-center pt-5 space-y-2"
            >
              <LineChart
                className="w-full min-w-full"
                width={700}
                height={500}
                data={games[gameName].map((score) => ({
                  date: new Date(score.createdAt).toLocaleDateString(),
                  score: score.score,
                }))}
              >
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fontFamily: 'Inter' }}
                  stroke="#4A4A4A"
                />
                <YAxis
                  tick={{ fontSize: 12, fontFamily: 'Inter' }}
                  stroke="#4A4A4A"
                  tickFormatter={(value) =>
                    currentScoreType === 'time' ? convertMillisecondsToMinSec(value) : value
                  }
                />
                <Tooltip content={<CustomTooltip scoreType={currentScoreType} />} />{' '}
                {/* <CartesianGrid stroke="#EAEAEA" /> */}
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#429add"
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
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

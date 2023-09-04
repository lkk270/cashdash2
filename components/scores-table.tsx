import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Lobby, LobbySession, ScoreType } from '@prisma/client';

import { CountdownTimer } from '@/components/countdown-timer';
import { Button } from '@/components/ui/button';
import { convertMillisecondsToMinSec } from '@/lib/utils';
import { ModifiedScoreType } from '@/app/types';

interface ScoresTableProps {
  lobby: Lobby & {
    sessions: LobbySession[];
  };
  scores: ModifiedScoreType[];
  showSessionTimer?: boolean;
  scoreType: ScoreType;
}

export const ScoresTable = ({ lobby, scoreType, scores, showSessionTimer }: ScoresTableProps) => {
  let countdownData;
  if (showSessionTimer) {
    countdownData = {
      textSize: 'text-sm',
      expiredDateTime: lobby.sessions[0].expiredDateTime,
      startDateTime: lobby.sessions[0].startDateTime,
    };
  }

  return (
    <div className="flex flex-col h-full space-y-3 overflow-y-scroll text-primary bg-secondary">
      {countdownData && (
        <div className="flex items-center justify-center">
          <CountdownTimer data={countdownData} />
        </div>
      )}
      <div className="flex items-center justify-center">
        <h1 className="text-xl font-bold">Top 100 Scores</h1>
      </div>
      {
        <Table>
          <TableHeader>
            <TableRow className="border-b border-primary/10">
              <TableHead>Username</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.map((score, i) => {
              const adjustedScore =
                scoreType === ScoreType.time
                  ? convertMillisecondsToMinSec(score.score)
                  : score.score;
              let tableValueColor =
                i === 0
                  ? '#FFD700'
                  : i === 1
                  ? '#C0C0C0'
                  : i === 2
                  ? '#CD7F32'
                  : i < lobby.numRewards
                  ? '#429ADD'
                  : '';

              return (
                <TableRow
                  style={{ color: tableValueColor }}
                  key={score.username + i.toString()}
                  className={`border-b border-primary/10 ${
                    i < lobby.numRewards ? 'font-extrabold' : ''
                  }`}
                >
                  <TableCell
                    style={{ width: '160px', wordBreak: 'break-all' }}
                    className="flex items-start space-x-2 "
                  >
                    {/* <span className="flex font-bold">
                    <Star />
                    <span className="whitespace-nowrap">{i + 100}.</span>
                  </span> */}
                    <span className="whitespace-nowrap">{i + 1}.</span>
                    <span className="flex-grow">{score.username}</span>
                  </TableCell>
                  <TableCell>{adjustedScore}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      }
    </div>
  );
};

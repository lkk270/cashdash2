import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Lobby, LobbySession, ScoreType } from '@prisma/client';
import { useUser } from '@clerk/nextjs';
import { CountdownTimer } from '@/components/countdown-timer';
import { CompletePopover } from '@/components/complete-popover';
import { convertMillisecondsToMinExactSec } from '@/lib/utils';
import { ModifiedScoreType } from '@/app/types';

interface ScoresTableProps {
  lobby: Lobby & {
    sessions: LobbySession[];
  };
  scores: ModifiedScoreType[];
  showSessionTimer?: boolean;
  scoreType: ScoreType;
  setTriggerAnimation?: (animate: boolean) => void;
  triggerAnimation?: boolean;
}

export const ScoresTable = ({
  lobby,
  scoreType,
  scores,
  showSessionTimer,
  setTriggerAnimation,
  triggerAnimation,
}: ScoresTableProps) => {
  const [animate, setAnimate] = useState(false);
  const { user } = useUser();
  const userId = user?.id;
  let countdownData;
  if (showSessionTimer) {
    countdownData = {
      textSize: 'text-sm',
      expiredDateTime: lobby.sessions[0].expiredDateTime,
      startDateTime: lobby.sessions[0].startDateTime,
    };
  }

  useEffect(() => {
    if (triggerAnimation === true && setTriggerAnimation) {
      setAnimate(true);
      const timeout = setTimeout(() => {
        setAnimate(false);
        setTriggerAnimation(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  });

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
        // <div
        //   className={`flex flex-col h-full space-y-3 overflow-y-scroll text-primary bg-secondary ${
        //     animate ? 'fade-in' : ''
        //   }`}
        // >
        <Table>
          <TableHeader>
            <TableRow className="border-b border-primary/10">
              <TableHead>Username</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.map((score, i) => {
              const rank = score.rank || i + 1;
              const exactSeconds = scoreType === ScoreType.time ? score.score / 1000 : 0;
              const adjustedScore =
                scoreType === ScoreType.time
                  ? convertMillisecondsToMinExactSec(exactSeconds)
                  : score.score;
              let tableValueColor =
                rank === 1
                  ? '#FFD700'
                  : rank === 2
                  ? '#C0C0C0'
                  : rank === 3
                  ? '#CD7F32'
                  : rank <= lobby.numRewards
                  ? '#429ADD'
                  : '';

              const isCurrentUser = userId === score.userId;

              return (
                <TableRow
                  style={{
                    color: tableValueColor,
                    animation: animate && isCurrentUser ? 'pulse 2s 2' : '',
                  }}
                  key={score.username + i.toString()}
                  className={`border-b border-primary/10 
                    ${rank <= lobby.numRewards ? 'font-extrabold' : ''} 
                    ${
                      isCurrentUser
                        ? 'border-2 border-indigo-500 rounded-lg shadow-lg bg-indigo-400'
                        : ''
                    }
                   `}
                >
                  <TableCell className="flex items-start w-40 space-x-2 break-all">
                    <span className="whitespace-nowrap">{rank}.</span>{' '}
                    <span className="flex-grow">{score.username}</span>
                    {isCurrentUser && <Badge variant={'gradient1'}>You</Badge>}
                  </TableCell>
                  <TableCell className="relative pr-8">
                    <span className="text-sm">{adjustedScore}</span>
                    {scoreType === ScoreType.time && (
                      <CompletePopover
                        title={'Exact Time'}
                        content={[
                          { title: 'Milliseconds', content: score.score.toString() },
                          { title: 'Seconds', content: exactSeconds.toString() },
                        ]}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        // </div>
      }
    </div>
  );
};

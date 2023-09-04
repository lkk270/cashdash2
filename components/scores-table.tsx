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
import { ModifiedScoreType } from '@/app/types';

interface ScoresTableProps {
  lobby: Lobby & {
    sessions: LobbySession[];
  };
  scores: ModifiedScoreType[];
  showSessionTimer?: boolean;
  scoreType: ScoreType;
}

const invoices = [
  {
    invoice: 'protein',
    paymentStatus: '2:56',
  },
  {
    invoice: 'dkd892',
    paymentStatus: '3:01',
  },
  {
    invoice: 'confound12',
    paymentStatus: '3:21',
  },
  {
    invoice: 'xaxi2',
    paymentStatus: '3:40',
  },
  {
    invoice: 'dantheman',
    paymentStatus: '3:59',
  },
  {
    invoice: 'leetheeel',
    paymentStatus: '4:12',
  },
  {
    invoice: 'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
    paymentStatus: '5:23',
  },
  {
    invoice: 'xaxi2',
    paymentStatus: '3:40',
  },
  {
    invoice: 'dantheman',
    paymentStatus: '3:59',
  },
  {
    invoice: 'leetheeel',
    paymentStatus: '4:12',
  },
  {
    invoice: 'xaxi2',
    paymentStatus: '3:40',
  },
  {
    invoice: 'dantheman',
    paymentStatus: '3:59',
  },
  {
    invoice: 'leetheeel',
    paymentStatus: '4:12',
  },
];

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
    <div className="flex flex-col justify-center h-full space-y-3 overflow-y-scroll text-primary bg-secondary">
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
            {invoices.map((invoice, i) => {
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
                  key={invoice.invoice + i.toString()}
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
                    <span className="flex-grow">{invoice.invoice}</span>
                  </TableCell>
                  <TableCell>{invoice.paymentStatus}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      }
    </div>
  );
};

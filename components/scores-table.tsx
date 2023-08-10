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
import { Star } from 'lucide-react';

import { Button } from '@/components/ui/button';

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
export function ScoresTable() {
  const [isVisible, setIsVisible] = useState(true);
  const toggleTable = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="flex flex-col justify-center h-full space-y-3 overflow-y-scroll text-primary bg-secondary">
      <div className="flex justify-center">
        <h1 className="text-xl font-bold">Top 100 Scores</h1>
      </div>
      {isVisible && (
        <Table>
          <TableHeader>
            <TableRow className="border-b border-primary/10">
              <TableHead>Username</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice, i) => (
              <TableRow key={invoice.invoice} className="border-b border-primary/10">
                <TableCell
                  style={{ width: '160px', wordBreak: 'break-all' }}
                  className="flex items-start space-x-2"
                >
                  {/* <span className="flex font-bold">
                    <Star />
                    <span className="whitespace-nowrap">{i + 100}.</span>
                  </span> */}
                  <span
                    className="font-bold whitespace-nowrap"
                    style={{
                      color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '',
                    }}
                  >
                    {i + 1}.
                  </span>
                  <span className="flex-grow">{invoice.invoice}</span>
                </TableCell>
                <TableCell>{invoice.paymentStatus}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

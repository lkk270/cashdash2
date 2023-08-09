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
];
export function ScoresTable() {
  // 1. Set up the state variable
  const [isVisible, setIsVisible] = useState(true);

  // 2. Create the event handler function
  const toggleTable = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="flex flex-col h-full space-y-4 overflow-y-scroll text-primary bg-secondary">
      {/* 3. Attach the event handler to the button and display the text based on the isVisible value */}
      <Button variant="default" onClick={toggleTable}>
        {isVisible ? 'Hide' : 'Show'}
      </Button>

      {/* 4. Adjust the rendered output based on the isVisible value */}
      {isVisible && (
        <Table>
          {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
          <TableHeader>
            <TableRow className="border-b border-primary/10">
              <TableHead>Username</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.invoice} className="border-b border-primary/10">
                <TableCell
                  style={{ width: '150px', wordBreak: 'break-all' }}
                  className="font-medium"
                >
                  {invoice.invoice}
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

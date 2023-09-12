'use client';

import React, { useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ModifiedPaymentType } from '@/app/types';
import { CardSkeleton } from '@/components/skeletons/card-skeleton';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface PayoutHistoryTableProps {
  payoutsParam: ModifiedPaymentType[];
  numOfPayouts: number;
  setParentsPayouts: (payouts: ModifiedPaymentType[]) => void;
}

export const PayoutHistoryTable = ({
  payoutsParam,
  numOfPayouts,
  setParentsPayouts,
}: PayoutHistoryTableProps) => {
  const [loading, setLoading] = useState(false);
  const [loadedEntries, setLoadedEntries] = useState(payoutsParam.length);
  const [payouts, setPayouts] = useState<ModifiedPaymentType[]>(payoutsParam);
  const { toast } = useToast();
  const onLoadMore = () => {
    setLoading(true);
    // Call the necessary API endpoint to get userCash and userStripeAccount here
    axios
      .post('/api/info', { getFunc: 'guph', loadedEntries: loadedEntries, needCount: false })
      .then((response) => {
        const newPayouts = payouts.concat(response.data.userPayouts);
        setPayouts(newPayouts);
        setParentsPayouts(newPayouts);
        setLoadedEntries(newPayouts.length);
      })
      .catch((error) => {
        toast({
          description: error.response ? error.response.data : 'Network Error',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="w-full">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-primary/10">
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <div className="text-lg font-bold text-center">No payouts</div>
                  <img
                    draggable={false}
                    height={600}
                    width={600}
                    src="/images/empty.png"
                    alt="Empty"
                  />
                </TableCell>
              </TableRow>
            ) : (
              payouts.map((payout, i) => {
                return (
                  <TableRow key={payout.id}>
                    <TableCell>{payout.createdAt.split('T')[0]}</TableCell>
                    <TableCell>${payout.amount.toString()}</TableCell>
                    <TableCell>{payout.status}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4 space-x-2">
        <div className="text-sm text-muted-foreground">
          Showing {payouts.length.toString()}/{numOfPayouts.toString()} rows
        </div>
        {payouts.length < numOfPayouts && (
          <Button disabled={loading} variant="outline" size="sm" onClick={onLoadMore}>
            Load more
          </Button>
        )}
      </div>
    </div>
  );
};

'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

import { ModifiedPaymentType } from '@/app/types';
import { TableSkeleton } from '@/components/skeletons/table-skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePayoutHistoryModal } from '@/hooks/use-payout-history-modal';
import { PayoutHistoryTable } from '@/components/payout-history-table';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

export const UserPayoutHistoryModal = () => {
  const usePayoutHistory = usePayoutHistoryModal();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [payouts, setPayouts] = useState<ModifiedPaymentType[]>([]);
  const [totalNumOfPayouts, setTotalNumOfPayouts] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (usePayoutHistory.isOpen && !dataFetched) {
      setLoading(true);
      // Call the necessary API endpoint to get userCash and userStripeAccount here
      axios
        .post('/api/info', { getFunc: 'guph', loadedEntries: 0, needCount: true })
        .then((response) => {
          setPayouts(response.data.userPayouts);
          setTotalNumOfPayouts(response.data.totalNumOfPayouts);
          setDataFetched(true); // Set dataFetched to true after fetching
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
    }
  }, [usePayoutHistory.isOpen, dataFetched]);

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={usePayoutHistory.isOpen} onOpenChange={usePayoutHistory.onClose}>
      <DialogContent className="overflow-x-scroll overflow-y-auto max-h-[80vh]">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center">Payout History</DialogTitle>
          {/* <DialogDescription className="space-y-2 text-center">
            <span className="mx-1 font-medium text-sky-500">Good job!</span>
          </DialogDescription> */}
          {!dataFetched && usePayoutHistory.isOpen ? (
            <TableSkeleton />
          ) : (
            <PayoutHistoryTable setParentsPayouts={setPayouts} numOfPayouts={totalNumOfPayouts} payoutsParam={payouts} />
          )}
        </DialogHeader>
        <Separator />
      </DialogContent>
    </Dialog>
  );
};

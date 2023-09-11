'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePayoutHistoryModal } from '@/hooks/use-payout-history-modal';
import { PayoutHistoryTable } from '@/components/payout-history-table';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

export const UserPayoutHistoryModal = () => {
  const usePayoutHistory = usePayoutHistoryModal();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
          <PayoutHistoryTable payouts={[]} />
        </DialogHeader>
        <Separator />
      </DialogContent>
    </Dialog>
  );
};

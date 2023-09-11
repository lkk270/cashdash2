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
import { useUserCashModal } from '@/hooks/use-user-cash-modal';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';

export const UserCashModal = () => {
  const userCashModal = useUserCashModal();
  const userCashFloat = parseFloat(userCashModal.userCash);
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
    <Dialog open={userCashModal.isOpen} onOpenChange={userCashModal.onClose}>
      <DialogContent>
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center">Payout History</DialogTitle>
          {/* <DialogDescription className="space-y-2 text-center">
            <span className="mx-1 font-medium text-sky-500">Good job!</span>
          </DialogDescription> */}
        </DialogHeader>
        <Separator />
      </DialogContent>
    </Dialog>
  );
};

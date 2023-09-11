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
import { UserStripeAccount } from '@prisma/client';

export const UserCashModal = () => {
  const userCashModal = useUserCashModal();
  const userCashFloat = parseFloat(userCashModal.userCash);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [userStripeAccount, setUserStripeAccount] = useState<UserStripeAccount | undefined>(
    undefined
  );
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (userCashModal.isOpen && !dataFetched) {
      setLoading(true);
      // Call the necessary API endpoint to get userCash and userStripeAccount here
      axios
        .post('/api/info', { getFunc: 'gusa' })
        .then((response) => {
          setUserStripeAccount(response.data.userStripeAccount);
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
  }, [userCashModal.isOpen, dataFetched]);

  const onWithdraw = () => {
    if (!userStripeAccount) {
      toast({
        duration: 6000,
        description:
          'Please first link your bank account by clicking the Link Bank Account button found in money settings',
        variant: 'warning',
        action: (
          <ToastAction
            onClick={() => (window.location.href = '/money-settings')}
            altText="Money Settings"
          >
            Money Settings
          </ToastAction>
        ),
      });
      return;
    }
    if (userCashFloat < 20) {
      toast({
        duration: 6000,
        description: 'You can only cash out a balance of at least $20',
        variant: 'warning',
      });
      return;
    } else {
      setLoading(true);
      axios
        .post('/api/stripe-payout', { withdrawalAmount: userCashFloat })
        .then((response) => {
          toast({
            description: 'Withdrawal initiated successfully!',
          });
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
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={userCashModal.isOpen} onOpenChange={userCashModal.onClose}>
      <DialogContent>
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center">Withdraw your winnings</DialogTitle>
          {/* <DialogDescription className="space-y-2 text-center">
            <span className="mx-1 font-medium text-sky-500">Good job!</span>
          </DialogDescription> */}
        </DialogHeader>
        <Separator />
        <div className="flex justify-between">
          <p className="text-2xl font-medium">Total: ${userCashModal.userCash}</p>
          <Button onClick={onWithdraw} disabled={loading} variant="gradient2">
            Cash out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

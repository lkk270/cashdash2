'use client';

import axios, { AxiosError } from 'axios';
import { UserStripeAccount } from '@prisma/client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface CashOutButtonProps {
  userCash: string;
  userStripeAccount?: UserStripeAccount;
}

export const CashOutButton = ({ userCash, userStripeAccount }: CashOutButtonProps) => {
  const fallbackErrorMessage = 'An unexpected error occurred.';
  const [isLoading, setLoading] = useState(false);
  const { toast } = useToast();

  const onClick = async () => {
    try {
      setLoading(true);

      if (!userStripeAccount) {
        toast({
          duration: 6000,
          description:
            'Please first link your bank account by clicking the Link Bank Account button',
          variant: 'warning',
        });
        return;
      }
      if (parseFloat(userCash) < 20) {
        toast({
          duration: 6000,
          description: 'You can only cash out a balance of at least $20',
          variant: 'warning',
        });
        return;
      }

      const response = await axios.post('/api/stripe-payout', { amount: userCash });

      if (response.status === 200) {
        toast({
          description: 'Withdrawal initiated successfully!',
        });
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast({
          duration: 6000,
          description: error.response?.data || fallbackErrorMessage,
          variant: 'destructive',
        });
      } else {
        toast({
          description: fallbackErrorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" variant="gradient2" disabled={isLoading} onClick={onClick}>
      Cash Out ${userCash}
    </Button>
  );
};

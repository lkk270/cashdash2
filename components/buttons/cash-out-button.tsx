'use client';

import axios from 'axios';
import { UserStripeAccount } from '@prisma/client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface CashOutButtonProps {
  userCash: string;
  userStripeAccount?: UserStripeAccount;
}

export const CashOutButton = ({ userCash, userStripeAccount }: CashOutButtonProps) => {
  const userCashFloat = parseFloat(userCash);
  const [isLoading, setLoading] = useState(false);
  const { toast } = useToast();

  const onClick = () => {
    if (!userStripeAccount) {
      toast({
        duration: 6000,
        description: 'Please first link your bank account by clicking the Link Bank Account button',
        variant: 'warning',
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

  return (
    <Button
      className="mb-3 mr-3"
      size="sm"
      variant="gradient2"
      disabled={isLoading}
      onClick={onClick}
    >
      Cash Out ${userCash}
    </Button>
  );
};
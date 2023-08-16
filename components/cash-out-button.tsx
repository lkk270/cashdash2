'use client';

import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface CashOutButtonProps {
  userCash: string;
}

export const CashOutButton = ({ userCash }: CashOutButtonProps) => {
  const fallbackErrorMessage = 'An unexpected error occurred.';
  const [isLoading, setLoading] = useState(false);
  const { toast } = useToast();

  const onClick = async () => {
    try {
      setLoading(true);

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

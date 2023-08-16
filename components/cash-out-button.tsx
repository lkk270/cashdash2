'use client';

import axios from 'axios';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface CashOutButtonProps {
  userCash: string;
}

export const CashOutButton = ({ userCash }: CashOutButtonProps) => {
  const [isLoading, setLoading] = useState(false);
  const { toast } = useToast();

  const onClick = async () => {
    try {
      setLoading(true);

      const response = await axios.post('/api/stripe-withdrawal', { amount: userCash });

      if (response.status === 200) {
        toast({
          description: 'Withdrawal initiated successfully!',
        });
      }
    } catch (error) {
      toast({
        description: 'Something went wrong during withdrawal',
        variant: 'destructive',
      });
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

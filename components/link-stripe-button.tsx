'use client';

import axios from 'axios';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface LinkStripeButtonProps {
  hasStripeAccount: boolean;
}

export const LinkStripeButton = ({ hasStripeAccount }: LinkStripeButtonProps) => {
  const [isLoading, setLoading] = useState(false);
  const { toast } = useToast();

  const onClick = async () => {
    try {
      setLoading(true);

      const response = await axios.post('/api/stripe-connect', { amount: 'userCash' });

      window.location.href = response.data.url;
    } catch (error) {
      toast({
        description: 'Something went wrong while linking to Stripe',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" variant="gradient1" disabled={isLoading} onClick={onClick}>
      {hasStripeAccount ? 'Manage Bank Details' : 'Link Bank Account'}
    </Button>
  );
};

'use client';

import axios from 'axios';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useToast } from '@/components/ui/use-toast';
import { useIsPro } from '@/components/providers/is-pro-provider';

export const SubscriptionButton = () => {
  const [isLoading, setLoading] = useState(false);
  const { isPro, setIsPro } = useIsPro();
  const { toast } = useToast();

  const onClick = () => {
    setLoading(true);

    axios
      .get('/api/stripe-subscription')
      .then((response) => {
        window.location.href = response.data.url;
      })
      .catch((error) => {
        toast({
          description: 'Something went wrong',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Button
      size="sm"
      variant={isPro ? 'default' : 'premium'}
      disabled={isLoading}
      onClick={onClick}
    >
      {isPro ? 'Manage Subscription' : 'Upgrade'}
      {!isPro && <Sparkles className="w-4 h-4 ml-2 fill-white" />}
    </Button>
  );
};

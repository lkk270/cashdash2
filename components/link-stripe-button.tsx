'use client';

import { UserStripeAccount } from '@prisma/client';
import axios from 'axios';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLinkStripeAboutModal } from '@/hooks/use-link-stripe-about-modal';

interface LinkStripeButtonProps {
  userStripeAccount?: UserStripeAccount;
}

export const LinkStripeButton = ({ userStripeAccount }: LinkStripeButtonProps) => {
  const [isLoading, setLoading] = useState(false);
  const { toast } = useToast();
  const LinkStripeAboutModal = useLinkStripeAboutModal();

  const onClick = () => {
    setLoading(true);

    axios
      .get('/api/stripe-connect')
      .then((response) => {
        window.location.href = response.data.url;
      })

      .catch((error) => {
        toast({
          description: 'Something went wrong while linking to Stripe',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return userStripeAccount ? (
    <Button size="sm" variant="gradient1" disabled={isLoading} onClick={onClick}>
      {isLoading ? 'Loading...' : 'Manage Bank Details'}
    </Button>
  ) : (
    <Button
      onClick={() => LinkStripeAboutModal.onOpen({ test: 'a' })}
      variant="gradient1"
      size="sm"
      className="hidden xs:flex"
    >
      Link Bank Account
    </Button>
  );
};

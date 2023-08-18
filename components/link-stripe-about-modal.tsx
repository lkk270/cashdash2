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
import { useLinkStripeAboutModal } from '@/hooks/use-link-stripe-about-modal';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

export const LinkStripeAboutModal = () => {
  const useAboutModal = useLinkStripeAboutModal();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onClick = async () => {
    try {
      setLoading(true);

      const response = await axios.post('/api/stripe-connect');

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

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={useAboutModal.isOpen} onOpenChange={useAboutModal.onClose}>
      <DialogContent>
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center">Link your bank account through Stripe</DialogTitle>
        </DialogHeader>
        <Separator />

        {/* Points the user should be aware of */}
        <div className="p-4 space-y-3">
          <p className="text-sm text-zinc-500">
            Upon linking your bank account with Stripe you will be asked a few questions.
          </p>
          <p className="text-sm text-zinc-500">Use the below answers:</p>
          <ul className="list-disc list-inside">
            <li className="text-sm">{'For "industry" choose software--> game'}</li>
            <li className="text-sm">For "website" put "cashdash.me/your_username"</li>
            <li className="text-sm ">For "description" put "-"</li>
          </ul>
        </div>

        <Separator />

        <div className="flex justify-between">
          <Button onClick={onClick} disabled={loading} variant="gradient1">
            Link Bank Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

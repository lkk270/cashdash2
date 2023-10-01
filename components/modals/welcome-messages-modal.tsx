'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useWelcomeMessagesModal } from '@/hooks/use-welcome-messages-modal';
import { areDatesWithinXMinutes } from '@/lib/utils';
import Terms from '../legal/terms';

export const WelcomeMessagesModal = () => {
  const infoModal = useWelcomeMessagesModal();
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useUser();

  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  const handleAcceptTerms = () => {
    setIsTermsAccepted(true);
    localStorage.setItem(`welcomed-${user?.id}`, 'true');
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user && user?.createdAt) {
      const userCreatedAt = user.createdAt;
      if (
        areDatesWithinXMinutes(userCreatedAt, new Date(), 5) &&
        !localStorage.getItem(`welcomed-${user.id}`)
      ) {
        infoModal.onOpen();
      }
    }
  }, [user]);

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog
      open={infoModal.isOpen}
      onOpenChange={isTermsAccepted ? infoModal.onClose : undefined} // Allow closing only if terms are accepted
    >
      {!isTermsAccepted ? (
        <DialogContent className="overflow-y-scroll h-3/4">
          <div>
            <DialogTitle className="text-center text-sky-500">Terms & Conditions</DialogTitle>

            <Button className="absolute z-100 right-4 top-4" onClick={handleAcceptTerms}>
              Accept
            </Button>
            <ScrollArea className="p-4 mt-6 rounded-md h-[500px]">
              <Terms />
            </ScrollArea>
          </div>
        </DialogContent>
      ) : (
        <DialogContent className="overflow-y-scroll h-4/7">
          <div className="text-left text-md text-primary/50 gap-y-3">
            <DialogTitle className="text-center text-sky-500">Some News</DialogTitle>
            <div className="justify-center mt-6">
              <p>
                CashDash is currently in beta! We're excited about the future and have plans to
                offer enticing cash prizes. We cannot offer prizes until a critical mass of users is
                reached. So once we hit our initial target of 10,000 users, the top 3 scores of
                every game's session will share a total prize pool of $500. And here's the thrilling
                part: as our user base grows, so will the rewards! The more players we have, the
                bigger the cash rewards. We truly appreciate you being a part of CashDash.
              </p>
              <br />
              <p>
                Your feedback is invaluable to us. If you'd like to provide feedback on anything you
                can do so anonymously by clicking the feedback button located on the side menu.
              </p>
              <br />
              <p>Thank you! Welcome to CashDash 👾</p>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

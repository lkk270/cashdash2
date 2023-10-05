'use client';

import { useEffect, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGamePlaygroundInfoModal } from '@/hooks/use-game-playground-info-modal';
import { Separator } from '@/components/ui/separator';

export const GamePlaygroundInfoModal = () => {
  const infoModal = useGamePlaygroundInfoModal();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={infoModal.isOpen} onOpenChange={infoModal.onClose}>
      <DialogContent>
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center text-sky-500">Info</DialogTitle>
          {/* <DialogDescription className="space-y-2 text-center">
            <span className="mx-1 font-medium text-sky-500">Remove All Ads!</span>
          </DialogDescription> */}
        </DialogHeader>
        <Separator />
        <div className="text-left text-md text-primary/50">
          <p className="justify-center gap-x-1">
            If you have run out of your balance and still would like to play blackjack, you can do
            so here. However, since playing here doesn&apos;t count for anything, your balance will
            not be saved and once a new blackjack session starts, you will want to play there
            instead.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

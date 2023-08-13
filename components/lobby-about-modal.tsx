// LobbyAboutModal.tsx

'use client';

import { useEffect, useState } from 'react';
import { Orbitron } from 'next/font/google';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLobbyAboutModal } from '@/hooks/use-lobby-about-modal';
import { Separator } from '@/components/ui/separator';

const orbitronFont = Orbitron({ subsets: ['latin'] });

export const LobbyAboutModal = () => {
  const lobbyAboutModal = useLobbyAboutModal();
  const [isMounted, setIsMounted] = useState(false);

  // Placeholder Data (same as before)
  const prizes = { first: '$500', second: '$300', third: '$100' };
  const userPlays = 10;
  const totalPlays = 1000;
  const topScores = [100, 90, 85, 80, 75];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={lobbyAboutModal.isOpen} onOpenChange={lobbyAboutModal.onClose}>
      <DialogContent className="overflow-y-auto max-h-[80vh]">
        <DialogHeader className="space-y-4">
          <DialogTitle
            className={`${orbitronFont.className} font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent text-center`}
          >
            {lobbyAboutModal.data?.gameName} {lobbyAboutModal.data?.lobby.name}
          </DialogTitle>
          <DialogDescription className="space-y-2 text-center">
            {/* <span className="mx-1 font-medium text-sky-500">Remove All Ads!</span> */}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        {/* Prizes Section */}
        <div className="p-4 space-y-4">
          <h2 className="text-xl font-bold">Prizes</h2>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>1st Place</span>
              <span className="text-sky-500">{prizes.first}</span>
            </li>
            <li className="flex justify-between">
              <span>2nd Place</span>
              <span className="text-sky-500">{prizes.second}</span>
            </li>
            <li className="flex justify-between">
              <span>3rd Place</span>
              <span className="text-sky-500">{prizes.third}</span>
            </li>
          </ul>
        </div>
        <Separator />
        {/* Play Counts Section */}
        <div className="p-4 space-y-4">
          <h2 className="text-xl font-bold">Play Counts</h2>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>Your Plays</span>
              <span>{userPlays}</span>
            </li>
            <li className="flex justify-between">
              <span>Total Plays</span>
              <span>{totalPlays}</span>
            </li>
          </ul>
        </div>
        <Separator />
        {/* Top 5 Scores */}
        <div className="p-4 space-y-4">
          <h2 className="text-xl font-bold">Top 5 Scores</h2>
          <ul className="space-y-2">
            {topScores.map((score, index) => (
              <li key={index} className="flex justify-between">
                <span>{index + 1}</span>
                <span>{score}</span>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

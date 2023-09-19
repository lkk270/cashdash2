'use client';

import dynamic from 'next/dynamic';

import React from 'react';
import { ModifiedScoreType } from '@/app/types';
import Loader from '@/components/loader';

interface BlackjackProps {
  props: {
    userBestScoreParam: ModifiedScoreType | null;
    setScores: (scores: ModifiedScoreType[]) => void;
    setTriggerAnimation: (animate: boolean) => void;
    ids: {
      gameId: string;
      lobbySessionId: string;
    };
  };
}

const PhaserGame = dynamic(() => import('@/components/blackjack/phaser/phaser-game'), {
  ssr: false, // This will disable server-side rendering for this component
  loading: () => (
    <div className="flex items-center justify-center h-[75vh] w-[50vw]">
      <Loader />
    </div>
  ),
});

export const Blackjack = ({ props }: BlackjackProps) => {
  return (
    <div className="game-container">
      {/* <GameLoader /> */}
      <PhaserGame props={props} />
    </div>
  );
};
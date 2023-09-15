'use client';

import dynamic from 'next/dynamic';

import React, { useState, useEffect } from 'react';
import { ModifiedScoreType } from '@/app/types';

interface FlappyBirbProps {
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

const PhaserGame = dynamic(() => import('@/components/flappy-birb/phaser/phaser-game'), {
  ssr: false, // This will disable server-side rendering for this component
  loading: () => <p>Loading...</p>, // Optional: Display a loading message/component
});

export const FlappyBirb = ({ props }: FlappyBirbProps) => {
  return (
    <div className="game-container">
      <PhaserGame props={props} />
    </div>
  );
};

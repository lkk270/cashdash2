'use client';

import dynamic from 'next/dynamic';

import React, { useState, useEffect } from 'react';

const PhaserGame = dynamic(() => import('@/components/flappy-birb/phaser/phaser-game'), {
  ssr: false, // This will disable server-side rendering for this component
  loading: () => <p>Loading...</p>, // Optional: Display a loading message/component
});
export const FlappyBirb = () => {
  return (
    <div className="game-container">
      <PhaserGame />
    </div>
  );
};

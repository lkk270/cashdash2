'use client';

import React, { useEffect } from 'react';
import Phaser from 'phaser';

import { BlackjackScene } from './phaser-scene';

const PhaserGame = () => {
  useEffect(() => {
    // onGameLoad();
    let gameWidth = 900;
    let gameHeight = 700;
    let rescale = false;
    // if (window.innerHeight / window.innerWidth > 1.5) {
    //   gameWidth = 600;
    //   gameHeight = 800;
    //   rescale = true;
    // }
    //  scene: [
    //     new HomeScene({ key: 'HomeScene' }, onGameStart),
    //     new BlackjackScene({ key: 'BlackjackScene' }, onGameStart, onGameEnd),
    //   ],
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: gameWidth,
      height: gameHeight,
      autoFocus: true,
      antialias: true,
      render: {
        antialias: true,
      },
      scene: [new BlackjackScene({ key: 'BlackjackScene' }, null, null, null, null, 1000)],
      parent: 'phaser-game',
      backgroundColor: '#5fa6f9',
      scale: {
        mode: Phaser.Scale.FIT,
        // mode: Phaser.Scale.MAX_ZOOM,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: gameWidth, // The base width of your game
        height: gameHeight, // The base height of your game
      },
    };

    const game = new Phaser.Game(config);
    // gameRef.current = game;

    return () => {
      game.destroy(true); // Clean up on component unmount
    };
  }, []);

  return <div id="phaser-game" className="max-w-[100vw]"></div>;
};

export default PhaserGame;

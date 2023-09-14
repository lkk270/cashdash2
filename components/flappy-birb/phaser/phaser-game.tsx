'use client';

import React, { useEffect } from 'react';
import Phaser from 'phaser';
import FlappyBirdScene from './phaser-scene';

const PhaserGame: React.FC = () => {
  useEffect(() => {
    let gameWidth = 800;
    let gameHeight = 600;
    if (window.innerHeight / window.innerWidth > 1.5) {
      gameWidth = 600;
      gameHeight = 800;
    }
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: gameWidth,
      height: gameHeight,
      scene: FlappyBirdScene,
      parent: 'phaser-game',
      backgroundColor: '#5fa6f9',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: gameWidth, // The base width of your game
        height: gameHeight, // The base height of your game
      },
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true); // Clean up on component unmount
    };
  }, []);

  return <div id="phaser-game" className="max-w-[100vw]"></div>;
};

export default PhaserGame;

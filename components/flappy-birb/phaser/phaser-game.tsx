'use client';

import React, { useEffect, useState, useRef } from 'react';
import Phaser from 'phaser';
import axios from 'axios';

import { ModifiedScoreType } from '@/app/types';
import FlappyBirdScene from './phaser-scene';
import { useToast } from '@/components/ui/use-toast';

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

const PhaserGame = ({ props }: FlappyBirbProps) => {
  const [loading, setLoading] = useState(false);
  const [gameSessionId, setGameSessionId] = useState(null);
  const [initiatedGameEndSuccess, setInitiatedGameEndSuccess] = useState(false);
  const { toast } = useToast();
  const gameSessionIdRef = useRef();

  const onGameStart = () => {
    setInitiatedGameEndSuccess(false);
    const updatedIds = { ...props.ids, at: '05' };
    axios
      .post('/api/game-session', updatedIds)
      .then((response) => {
        setGameSessionId(response.data.gameSessionId);
        gameSessionIdRef.current = response.data.gameSessionId;
      })
      .catch((error) => {
        toast({
          description: error.response.data,
          variant: 'destructive',
        });
      });
  };

  useEffect(() => {
    // onGameLoad();
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
      autoFocus: true,
      antialias: true,
      scene: new FlappyBirdScene({ key: 'FlappyBirdScene' }, onGameStart),
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

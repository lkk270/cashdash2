'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Phaser from 'phaser';
import axios from 'axios';

import { generateResponseHash } from '@/lib/hash';
import { ModifiedScoreType } from '@/app/types';
import FlappyBirdScene from './phaser-scene';
import gameEvents from './event-emitter';
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
  const [userBestScore, setUserBestScore] = useState<ModifiedScoreType | null>(
    props.userBestScoreParam
  );
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const gameSessionIdRef = useRef();
  const gameRef = useRef<Phaser.Game | null>(null);

  const setPulsing = (shouldPulse: boolean) => {
    const gameElement = document.getElementById('phaser-game');
    if (gameElement) {
      if (shouldPulse) {
        gameElement.classList.add('pulsing');
      } else {
        gameElement.classList.remove('pulsing');

        // Notify the scene that the pulsing is done.
        if (gameRef.current) {
          const scene = gameRef.current.scene.getScene('FlappyBirdScene');
          if (scene && scene instanceof FlappyBirdScene) {
            scene.pulseCompleted();
          }
        }
      }
    }
  };

  const onGameStart = () => {
    const updatedIds = { ...props.ids, at: '05' };
    axios
      .post('/api/game-session', updatedIds)
      .then((response) => {
        gameSessionIdRef.current = response.data.gameSessionId;
      })
      .catch((error) => {
        toast({
          description: error.response.data,
          variant: 'destructive',
        });
      });
  };

  const onGameEnd = (score: number) => {
    setPulsing(true);
    axios
      .post('/api/game-session', { gameSessionId: gameSessionIdRef.current, at: '2' })
      .then((response) => {
        const hash = response.data.hash;
        // Send another POST request with response.data.hash and at: '3'
        return axios.post('/api/game-session', {
          lobbySessionId: props.ids.lobbySessionId,
          userBestScore: userBestScore ? userBestScore : false,
          gameSessionId: gameSessionIdRef.current,
          score: score,
          cHash: hash,
          rHash: generateResponseHash(hash, score),
          at: '3',
        });
      })
      .then((response) => {
        const displayScore = response.data.displayScores;
        if (displayScore) {
          props.setScores(displayScore);
          setUserBestScore(displayScore[0]);
          props.setTriggerAnimation(true);
        }
        // Handle the response of the second POST request
        toast({
          description: response.data.message,
        });
      })
      .catch((error) => {
        const backPath = pathname.split('/').slice(0, -1).join('/');
        if (error.response.data && error.response.status === 302) {
          router.push(backPath);
          toast({
            description: error.response.data,
            variant: 'warning',
            duration: 7500,
          });
        }

        toast({
          description: error.response ? error.response.data : 'Network Error',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setPulsing(false);
        gameEvents.emit('gameEnded'); // Emit the gameEnded event
      });
  };

  useEffect(() => {
    // onGameLoad();
    let gameWidth = 800;
    let gameHeight = 600;
    let rescale = false;
    if (window.innerHeight / window.innerWidth > 1.5) {
      gameWidth = 600;
      gameHeight = 800;
      rescale = true;
    }
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: gameWidth,
      height: gameHeight,
      autoFocus: true,
      antialias: true,
      scene: new FlappyBirdScene({ key: 'FlappyBirdScene' }, onGameStart, onGameEnd),
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
        mode: rescale ? Phaser.Scale.FIT : Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: gameWidth, // The base width of your game
        height: gameHeight, // The base height of your game
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    return () => {
      game.destroy(true); // Clean up on component unmount
    };
  }, []);

  return <div id="phaser-game" className="max-w-[100vw]"></div>;
};

export default PhaserGame;

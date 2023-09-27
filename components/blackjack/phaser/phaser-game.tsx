'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Phaser from 'phaser';
import axios from 'axios';

import { generateResponseHash } from '@/lib/hash';
import { ModifiedScoreType } from '@/app/types';
//import { BlackjackScene, HomeScene } from './phaser-scene';
import { BlackjackScene } from './phaser-scene';
import gameEvents from './event-emitter';
import { useToast } from '@/components/ui/use-toast';

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

const PhaserGame = ({ props }: BlackjackProps) => {
  const [userBestScore, setUserBestScore] = useState<ModifiedScoreType | null>(
    props.userBestScoreParam
  );
  const queriedBalance = userBestScore ? userBestScore.score : 1000; //used as a safeguard in case server side fails
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
        // if (gameRef.current) {
        //   const scene = gameRef.current.scene.getScene('BlackjackScene');
        //   if (scene && scene instanceof BlackjackScene) {
        //     scene.pulseCompleted();
        //   }
        // }
      }
    }
  };

  const onBalanceChange = (balanceChange: number) => {
    //used for doubles, initiating a split, and the first split's hand being resolved
    //value is the value by which the balance should be changed. It can be negative or positve.

    const updatedIds = {
      ...props.ids,
      at: '1ub',
      balanceChange: balanceChange,
    };
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

  const onGameStart = (balanceChange: number) => {
    const updatedIds = { ...props.ids, at: '05b', balanceChange: balanceChange };
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

  const onGameEnd = (balanceChange: number) => {
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
          score: balanceChange,
          cHash: hash,
          rHash: generateResponseHash(hash, balanceChange),
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
          // router.push(backPath);
          router.refresh();
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
    let gameWidth = 900;
    let gameHeight = 750;
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
      scene: [
        new BlackjackScene(
          { key: 'BlackjackScene' },
          onGameStart,
          onBalanceChange,
          onGameEnd,
          queriedBalance
        ),
      ],
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
    gameRef.current = game;

    return () => {
      game.destroy(true); // Clean up on component unmount
    };
  }, []);

  return <div id="phaser-game" className="max-w-[100vw]"></div>;
};

export default PhaserGame;

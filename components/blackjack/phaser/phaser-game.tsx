'use client';

import React, { useEffect, useState, useRef } from 'react';
import Phaser from 'phaser';
import axios from 'axios';

import { generateResponseHash } from '@/lib/hash';
import { processBestScores, prepareScoresForDisplay } from '@/lib/scores';
import { ModifiedScoreType } from '@/app/types';
//import { BlackjackScene, HomeScene } from './phaser-scene';
import { BlackjackScene } from './phaser-scene';
import gameEvents from './event-emitter';
import { useToast } from '@/components/ui/use-toast';

interface BlackjackProps {
  props: {
    top100Scores: ModifiedScoreType[]; //Will always contain the user's score (even if it's not  top 100 it's included (like all games) and for balance games, if it's the first time the user is playing for the session, the score is initialized already )
    userBestScoreParam: ModifiedScoreType;
    setScores: (scores: ModifiedScoreType[]) => void;
    setTriggerAnimation: (animate: boolean) => void;
    ids: {
      gameId: string;
      lobbySessionId: string;
    };
  };
}

const PhaserGame = ({ props }: BlackjackProps) => {
  const [userBestScore, setUserBestScore] = useState<ModifiedScoreType>(props.userBestScoreParam);
  const queriedBalance = userBestScore ? userBestScore.score : 1000; //used as a safeguard in case server side fails
  const { toast } = useToast();
  const gameSessionIdRef = useRef();
  // const gameRef = useRef<Phaser.Game | null>(null);

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

  const onGameStart = (currentBalance: number, balanceChange: number) => {
    return new Promise<void>((resolve, reject) => {
      const updatedIds = {
        ...props.ids,
        at: '05b',
        balanceChange: balanceChange,
        currentBalance: currentBalance,
      };

      axios
        .post('/api/game-sessionb', updatedIds)
        .then((response) => {
          gameSessionIdRef.current = response.data.gameSessionId;
          resolve(); // Promise is resolved here.
        })
        .catch((error) => {
          // Handle the error...
          reject(error); // Promise is rejected here.
        });
    });
  };

  const onBalanceChange = (
    currentBalance: number,
    balanceChange: number,
    changeType: 'd' | 's',
    handNum: 0 | 1
  ) => {
    //used for doubles, initiating a split, and the first split's hand being resolved
    //value is the value by which the balance should be changed. It can be negative or positive.

    const updatedIds = {
      ...props.ids,
      at: '1ub',
      gameSessionId: gameSessionIdRef.current,
      currentBalance: currentBalance,
      balanceChange: balanceChange,
      changeType: changeType,
      handNum: handNum,
    };
    axios.post('/api/game-sessionb', updatedIds).catch((error) => {
      if (error.response.data && error.response.status === 302) {
        toast({
          description: error.response.data,
          variant: 'warning',
          duration: 7500,
        });
        window.location.reload();
      } else {
        toast({
          description: error.response ? error.response.data : 'Network Error',
          variant: 'destructive',
        });
      }
    });
  };

  const onHandEnd = (
    currentBalance: number,
    balanceChange: number,
    betValue: number,
    lastHand: boolean,
    handNum: 0 | 1,
    pm: number
  ): void => {
    if (lastHand) {
      setPulsing(true);
    }
    const updatedIds = {
      ...props.ids,
      at: '2eb',
      gameSessionId: gameSessionIdRef.current,
      currentBalance: currentBalance,
      balanceChange: balanceChange,
      betValue: betValue,
      lastHand: lastHand,
      handNum: handNum,
      pm: pm,
    };
    axios
      .post('/api/game-sessionb', updatedIds)
      .then((response) => {
        const displayScores = response.data.displayScores;
        if (displayScores && lastHand) {
          props.setScores(displayScores);
          setUserBestScore(displayScores[0]);
          props.setTriggerAnimation(true);
        }
      })
      .catch((error) => {
        if (error.response.data && error.response.status === 302) {
          toast({
            description: error.response.data,
            variant: 'warning',
            duration: 7500,
          });
          window.location.reload();
        } else {
          toast({
            description: error.response ? error.response.data : 'Network Error',
            variant: 'destructive',
          });
        }
      })
      .finally(() => {
        if (lastHand) {
          setPulsing(false);
          gameEvents.emit('gameEnded'); // Emit the gameEnded event
        }
      });
  };

  const setUserBestScoreNoApi = (newBalance: number) => {
    const top100ScoresTemp = props.top100Scores;
    const userBestScoreTemp = userBestScore;
    userBestScoreTemp.score = newBalance;
    top100ScoresTemp[0] = userBestScoreTemp;
    setUserBestScore(userBestScoreTemp);
    const bestScoresArray = processBestScores({
      allScores: props.top100Scores,
      orderDirection: 'desc',
    });
    const displayScores = prepareScoresForDisplay(bestScoresArray, userBestScoreTemp.userId);
    props.setScores(displayScores);
    props.setTriggerAnimation(true);
  };

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
      scene: [
        new BlackjackScene(
          { key: 'BlackjackScene' },
          onGameStart,
          onBalanceChange,
          onHandEnd,
          setUserBestScoreNoApi,
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
    // gameRef.current = game;

    return () => {
      game.destroy(true); // Clean up on component unmount
    };
  }, []);

  return <div id="phaser-game" className="max-w-[100vw]"></div>;
};

export default PhaserGame;

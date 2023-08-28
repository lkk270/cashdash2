import React, { useState, useEffect } from 'react';
import { FaceLoss, FaceRegular, FaceWon, Flag } from './image-components/index';

interface HeaderProps {
  flagsLeft: number;
  gameStatus: 'won' | 'lost' | 'regular';
  gameStarted: boolean;
  onTimeExceeded: () => void; // New prop
  // timeElapsed: number;
  // setTimeElapsed: React.Dispatch<React.SetStateAction<number>>;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  flagsLeft,
  gameStatus,
  gameStarted,
  onTimeExceeded,
  // timeElapsed,
  // setTimeElapsed,
  onReset,
}) => {
  const [timeElapsed, setTimeElapsed] = useState<number>(0);

  useEffect(() => {
    if (!gameStarted) {
      setTimeElapsed(0);
      return;
    }
    if (gameStatus === 'lost' || gameStatus === 'won') return;

    const timer = setInterval(() => {
      setTimeElapsed((prevTime: number) => {
        if (prevTime >= 3599) {
          // Check if timer exceeded 59:59
          onTimeExceeded(); // End the game
          clearInterval(timer); // Stop the timer
          return prevTime;
        }
        return prevTime + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameStatus, setTimeElapsed]);

  let StatusIcon;
  switch (gameStatus) {
    case 'won':
      StatusIcon = <FaceWon />;
      break;
    case 'lost':
      StatusIcon = <FaceLoss />;
      break;
    default:
      StatusIcon = <FaceRegular />;
  }

  const minutes = Math.floor(timeElapsed / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (timeElapsed % 60).toString().padStart(2, '0');
  const restartGame = () => {
    onReset();
    // Reset the timer
    setTimeElapsed(0);
  };
  return (
    <div className="flex items-center justify-between pb-4">
      <div className="flex items-center p-1 font-mono text-2xl bg-black rounded shadow-md gap-x-4">
        <span className="transform scale-x-[-1]">🚩</span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-500">
          {flagsLeft}
        </span>
      </div>

      <button onClick={restartGame}>{StatusIcon}</button>

      <div className="p-1 font-mono text-2xl bg-black rounded shadow-md">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-500">
          {minutes}:{seconds}
        </span>
      </div>
    </div>
  );
};

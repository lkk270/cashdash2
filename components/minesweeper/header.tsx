import React, { useState, useEffect } from 'react';
import { FaceLoss, FaceRegular, FaceWon } from './image-components/index';

interface HeaderProps {
  flagsLeft: number;
  gameStatus: 'won' | 'lost' | 'regular';
  // timeElapsed: number;
  // setTimeElapsed: React.Dispatch<React.SetStateAction<number>>;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  flagsLeft,
  gameStatus,
  // timeElapsed,
  // setTimeElapsed,
  onReset,
}) => {
  const [timeElapsed, setTimeElapsed] = useState<number>(0);

  useEffect(() => {
    if (gameStatus === 'lost' || gameStatus === 'won') return;
    const timer = setInterval(() => {
      setTimeElapsed((prevTime: number) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus, setTimeElapsed]);
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
    <div className="flex items-center justify-between p-4">
      <div>Flags left: {flagsLeft}</div>
      <button onClick={restartGame}>{StatusIcon}</button>
      <div>
        {minutes}:{seconds}
      </div>
    </div>
  );
};

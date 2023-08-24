import React from 'react';
import { FaceLoss, FaceRegular, FaceWon } from './image-components/index';

interface HeaderProps {
  flagsLeft: number;
  gameStatus: 'won' | 'lost' | 'regular';
  timeElapsed: number; // time in seconds
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  flagsLeft,
  gameStatus,
  timeElapsed,
  onReset,
}) => {
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

  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;

  return (
    <div className="flex items-center justify-between p-4">
      <div>Flags left: {flagsLeft}</div>
      <button onClick={onReset}>{StatusIcon}</button>
      <div>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>
    </div>
  );
};

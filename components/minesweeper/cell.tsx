'use client';

import { CellType } from '@/app/types';
import React from 'react';
import {
  Closed,
  Flag,
  FlagWrong,
  MineBlank,
  MineRed,
  Type0,
  Type1,
  Type2,
  Type3,
} from './image-components/index';

interface CellProps {
  cell: CellType;
  onReveal: () => void;
  onFlag: (e: React.MouseEvent) => void;
  gameOver: boolean; // To denote whether the game is over
  row: number; // Add this line
  col: number; // Add this line
  explodedRow?: number; // Add this line
  explodedCol?: number; // Add this line
}

export const Cell = ({
  row,
  col,
  cell,
  onReveal,
  onFlag,
  gameOver,
  explodedRow,
  explodedCol,
}: CellProps) => {
  const baseStyle = 'w-8 h-8 flex items-center justify-center text-center';
  // const revealedStyle = cell.isRevealed
  //   ? 'bg-c6c6c6 border border-gray-500'
  //   : 'bg-c6c6c6 border-l border-t border-white border-r border-b border-808080';

  let cellContent;
  console.log('Is the game over?', gameOver && cell.isFlagged, 'mine?', !cell.isMine);

  if (gameOver && cell.isFlagged && !cell.isMine) {
    console.log('Showing wrong flag for cell: ', row, col);
    cellContent = <FlagWrong />;
  } else if (cell.isRevealed) {
    if (cell.isMine) {
      if (cell.isMine && gameOver && row === explodedRow && col === explodedCol) {
        cellContent = <MineRed />;
      } else if (cell.isMine && gameOver) {
        cellContent = <MineBlank />;
      }
    } else if (cell.neighboringMines > 0) {
      switch (cell.neighboringMines) {
        case 1:
          cellContent = <Type1 />;
          break;
        case 2:
          cellContent = <Type2 />;
          break;
        case 3:
          cellContent = <Type3 />;
          break;
        default:
          cellContent = <Type0 />;
      }
    } else {
      cellContent = <Type0 />;
    }
  } else if (cell.isFlagged) {
    cellContent = <Flag />;
  } else {
    cellContent = <Closed />;
  }

  return (
    <div onClick={onReveal} onContextMenu={onFlag} className={`${baseStyle}`}>
      {cellContent}
    </div>
  );
};

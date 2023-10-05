'use client';

import { CellType } from '@/app/types';
import React, { useState, useEffect } from 'react';
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
  Type4,
  Type5,
  Type6,
  Type7,
  Type8,
} from './image-components';

interface CellProps {
  cell: CellType;
  onReveal: (e: React.MouseEvent) => void;
  onFlag: (e: React.MouseEvent) => void;
  pressedCell: { row: number; col: number } | null;
  setPressedCell: React.Dispatch<React.SetStateAction<{ row: number; col: number } | null>>;
  gameOver: boolean; // To denote whether the game is over
  row: number;
  col: number;
  cols: number;
  explodedRow?: number;
  explodedCol?: number;
  loading: boolean;
}

export const Cell = ({
  row,
  col,
  cols,
  cell,
  pressedCell,
  setPressedCell,
  onReveal,
  onFlag,
  gameOver,
  explodedRow,
  explodedCol,
  loading,
}: CellProps) => {
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [longPressDetected, setLongPressDetected] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      // Clear any existing timeouts
      clearTimeout(touchStartTime);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mouse down event to set the isPressed state
  const handleMouseDown = (e: React.MouseEvent) => {
    if (cell.isRevealed || gameOver || cell.isFlagged || loading) {
      return;
    }
    // Check if left button is pressed
    if (e.button === 0) {
      setPressedCell({ row, col });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button === 2 || loading) {
      return; // if right-click or loading, do nothing
    }
    setPressedCell(null);
    if (!gameOver) onReveal(e);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (cell.isRevealed || gameOver || cell.isFlagged || loading) {
      return;
    }
    if (e.buttons === 1) {
      // Check if left button is pressed
      setPressedCell({ row, col });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (loading) {
      return;
    }
    setPressedCell(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (cell.isRevealed || gameOver || cell.isFlagged || loading) {
      return;
    }
    e.preventDefault(); // prevent the default behavior here
    setTouchStartTime(Date.now());
    setLongPressDetected(false);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const duration = Date.now() - touchStartTime;

    if (duration > 500) {
      // consider it a long press if it lasts for more than 500ms
      setLongPressDetected(true);
      e.preventDefault();
      if (!gameOver && !loading && !cell.isRevealed) onFlag(e as any); // you might need to adapt the type here
    } else {
      if (!gameOver && !loading && !cell.isRevealed) onReveal(e as any);
    }
  };

  const sizeClassNameObj: { [key: number]: string } = { 30: 'w-6 h-6' };
  const sizeClassName = sizeClassNameObj[cols] || 'w-8 h-8';

  const baseStyle = `${sizeClassName} flex items-center justify-center text-center`;

  let cellContent;

  if (pressedCell && pressedCell.row === row && pressedCell.col === col) {
    cellContent = <Type0 />;
  } else if (gameOver && cell.isFlagged && !cell.isMine) {
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
        case 4:
          cellContent = <Type4 />;
          break;
        case 5:
          cellContent = <Type5 />;
          break;
        case 6:
          cellContent = <Type6 />;
          break;
        case 7:
          cellContent = <Type7 />;
          break;
        case 8:
          cellContent = <Type8 />;
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
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        if (!gameOver && !loading && !cell.isRevealed) onReveal(e);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        if (!gameOver && !loading && !cell.isRevealed) onFlag(e);
      }}
      className={`${baseStyle}`}
    >
      {cellContent}
    </div>
  );
};

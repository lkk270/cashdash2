// components/Board.tsx
import React, { useState } from 'react';
import { Cell } from './cell';
import { CellType } from '@/app/types';

interface BoardProps {
  loading: boolean;
  grid: CellType[][];
  onRevealCell: (row: number, col: number) => void;
  onToggleFlag: (e: React.MouseEvent, row: number, col: number) => void;
  explodedCell: { row: number; col: number } | null;
  gameOver: boolean; // Add this line
}
export const Board = ({
  loading,
  grid,
  gameOver,
  onRevealCell,
  onToggleFlag,
  explodedCell,
}: BoardProps) => {
  const [pressedCell, setPressedCell] = useState<{ row: number; col: number } | null>(null);

  return (
    //     <div className={`grid grid-cols-${grid.length.toString()}`}>
    //gris-cols-12 should be dynamic but ran into some issues with it
    <div
      className={`grid grid-cols-12 select-none`}
      style={{ animation: loading ? 'pulse 1.5s infinite' : '' }}
    >
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            // key={rowIndex.toString() + '-' + colIndex.toString()}
            cell={cell}
            row={rowIndex}
            col={colIndex}
            gameOver={gameOver}
            pressedCell={pressedCell}
            setPressedCell={setPressedCell}
            onReveal={() => onRevealCell(rowIndex, colIndex)}
            onFlag={(e) => onToggleFlag(e, rowIndex, colIndex)}
            explodedRow={explodedCell?.row}
            explodedCol={explodedCell?.col}
            loading={loading}
          />
        ))
      )}
    </div>
  );
};

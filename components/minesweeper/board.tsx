// components/Board.tsx
import React, { useState } from 'react';
import { Cell } from './cell';
import { CellType } from '@/app/types';

interface BoardProps {
  loading: boolean;
  cols: number;
  grid: CellType[][];
  onRevealCell: (row: number, col: number) => void;
  onToggleFlag: (e: React.MouseEvent, row: number, col: number) => void;
  explodedCell: { row: number; col: number } | null;
  gameOver: boolean; // Add this line
}
export const Board = ({
  loading,
  cols,
  grid,
  gameOver,
  onRevealCell,
  onToggleFlag,
  explodedCell,
}: BoardProps) => {
  const [pressedCell, setPressedCell] = useState<{ row: number; col: number } | null>(null);
  return (
    grid && (
      //     <div className={`grid grid-cols-${grid.length.toString()}`}>
      //gris-cols-12 should be dynamic but ran into some issues with it
      <div
        className={`select-none grid grid-cols-${cols.toString()}`}
        // className={`grid grid-cols-16 select-none`}
        style={{ animation: loading ? 'pulse 1.5s infinite' : '' }}
      >
        {grid.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.map((cell, colIndex) => (
              <Cell
                key={rowIndex.toString() + colIndex.toString()}
                cell={cell}
                row={rowIndex}
                col={colIndex}
                cols={cols}
                gameOver={gameOver}
                pressedCell={pressedCell}
                setPressedCell={setPressedCell}
                onReveal={() => onRevealCell(rowIndex, colIndex)}
                onFlag={(e) => onToggleFlag(e, rowIndex, colIndex)}
                explodedRow={explodedCell?.row}
                explodedCol={explodedCell?.col}
                loading={loading}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    )
  );
};

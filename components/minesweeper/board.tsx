// components/Board.tsx
import React from 'react';
import Cell from './cell';
import { CellType } from '@/app/types';

interface BoardProps {
  grid: CellType[][];
  onRevealCell: (row: number, col: number) => void;
  onToggleFlag: (e: React.MouseEvent, row: number, col: number) => void;
  explodedCell: { row: number; col: number } | null;
  gameOver: boolean; // Add this line
}
export const Board = ({ grid, gameOver, onRevealCell, onToggleFlag, explodedCell }: BoardProps) => {
  return (
    <div className="grid grid-cols-10">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={rowIndex.toString() + '-' + colIndex.toString()}
            cell={cell}
            row={rowIndex}
            col={colIndex}
            gameOver={gameOver}
            onReveal={() => onRevealCell(rowIndex, colIndex)}
            onFlag={(e) => onToggleFlag(e, rowIndex, colIndex)}
            explodedRow={explodedCell?.row}
            explodedCol={explodedCell?.col}
          />
        ))
      )}
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';

import { Board } from '@/components/minesweeper/board';
import { initializeGrid } from '@/lib/minesweeper-utils';
import { CellType } from '@/app/types';

interface MinesweeperProps {
  size: number;
  numMines: number;
}

export const Minesweeper = ({ size, numMines }: MinesweeperProps) => {
  // const [grid, setGrid] = useState<CellType[][]>([
  //   [{ isMine: false, isRevealed: false, isFlagged: false, neighboringMines: 0 }],
  // ]);
  // const newGrid = initializeGrid(10, 10, 20);
  const [grid, setGrid] = useState<CellType[][]>([]);
  const [explodedCell, setExplodedCell] = useState<{ row: number; col: number } | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);

  useEffect(() => {
    const newGrid = initializeGrid(size, size, numMines); // For example: 10x10 grid with 20 mines
    setGrid(newGrid);
  }, []); // This useEffect will run once when the component mounts

  function revealCell(grid: CellType[][], row: number, col: number): CellType[][] {
    // Check boundaries first
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
      return grid; // Out of grid bounds
    }

    const cell = grid[row][col];

    if (cell.isRevealed || cell.isFlagged) {
      return grid; // Already revealed or flagged
    }

    // Copy the grid for immutability
    let newGrid = grid.map((row) => row.slice());

    if (cell.isMine) {
      // If the clicked cell is a mine, reveal all mines and set the exploded cell.
      setExplodedCell({ row, col });
      setGameOver(true);
      // If the clicked cell is a mine, reveal all mines.
      for (let i = 0; i < newGrid.length; i++) {
        for (let j = 0; j < newGrid[i].length; j++) {
          if (newGrid[i][j].isMine) {
            newGrid[i][j].isRevealed = true;
          }
        }
      }
      return newGrid;
    }

    // Rest of the logic remains the same
    newGrid[row][col].isRevealed = true;

    if (cell.neighboringMines > 0) {
      return newGrid; // Stop if it's a number
    }

    // If it's a blank cell, recursively reveal neighbors
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        if (x !== 0 || y !== 0) {
          // To exclude the current cell
          newGrid = revealCell(newGrid, row + x, col + y);
        }
      }
    }

    return newGrid;
  }

  const toggleFlag = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault(); // This prevents the default context menu from appearing
    const newGrid = [...grid];
    newGrid[row][col].isFlagged = !newGrid[row][col].isFlagged;
    setGrid(newGrid);
  };

  const handleReveal = (row: number, col: number) => {
    const updatedGrid = revealCell(grid, row, col);
    setGrid(updatedGrid);
  };

  return (
    <Board
      grid={grid}
      gameOver={gameOver}
      explodedCell={explodedCell}
      onRevealCell={handleReveal}
      onToggleFlag={toggleFlag}
    />
  );
};

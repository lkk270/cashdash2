'use client';

import React, { useState, useEffect } from 'react';

import { Board } from '@/components/minesweeper/board';
import { Header } from '@/components/minesweeper/header';
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
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const newGrid = initializeGrid(size, size, numMines); // For example: 10x10 grid with 20 mines
    setGrid(newGrid);
  }, []); // This useEffect will run once when the component mounts

  // Increment timeElapsed every second if the game is not over.
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeElapsed((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver]);

  let gameStatus: 'won' | 'lost' | 'regular' = 'regular';
  if (gameOver) {
    gameStatus = explodedCell ? 'lost' : 'won';
  }

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

  const restartGame = () => {
    // Generate a fresh grid
    const newGrid = initializeGrid(size, size, numMines);
    setGrid(newGrid);

    // Reset the exploded cell
    setExplodedCell(null);

    // Reset the gameOver flag
    setGameOver(false);

    // Reset the timer
    setTimeElapsed(0);
  };

  // Calculate the number of flags used
  const flagsUsed = grid.reduce((count, row) => {
    return count + row.filter((cell) => cell.isFlagged).length;
  }, 0);

  // Calculate the number of flags left
  const flagsLeft = numMines - flagsUsed;

  return (
    <div>
      <Header
        flagsLeft={flagsLeft}
        gameStatus={gameStatus}
        timeElapsed={timeElapsed}
        onReset={restartGame}
      />
      <Board
        grid={grid}
        gameOver={gameOver}
        explodedCell={explodedCell}
        onRevealCell={handleReveal}
        onToggleFlag={toggleFlag}
      />
    </div>
  );
};

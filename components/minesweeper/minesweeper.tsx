'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import { Board } from './board';
import { Header } from './header';

import { useToast } from '@/components/ui/use-toast';
import { initializeGrid } from '@/lib/minesweeper-utils';
import { generateResponseHash } from '@/lib/hash';
import { CellType } from '@/app/types';

interface MinesweeperProps {
  size: number;
  numMines: number;
  ids: {
    gameId: string;
    lobbySessionId: string;
  };
}

export const Minesweeper = ({ size, numMines, ids }: MinesweeperProps) => {
  const [grid, setGrid] = useState<CellType[][]>([]);
  const [explodedCell, setExplodedCell] = useState<{ row: number; col: number } | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [createGameSessionSuccess, setCreateGameSessionSuccess] = useState<boolean>(false);
  const [initiatedGameEndSuccess, setInitiatedGameEndSuccess] = useState<boolean>(false);
  const [gameSessionId, setGameSessionId] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(0);
  const router = useRouter();

  const { toast } = useToast();
  let gameStatus: 'won' | 'lost' | 'regular' = 'regular';

  // Calculate the number of flags used
  const flagsUsed = grid.reduce((count, row) => {
    return count + row.filter((cell) => cell.isFlagged).length;
  }, 0);

  // Calculate the number of flags left
  const flagsLeft = numMines - flagsUsed;

  if (gameOver) {
    gameStatus = explodedCell ? 'lost' : 'won';

    if (gameStatus === 'won' && !initiatedGameEndSuccess) {
      const timeElapsed = Date.now() - startTime;
      setLoading(true);
      setInitiatedGameEndSuccess(true);
      axios
        .post('/api/game-session', { gameSessionId: gameSessionId, at: '2' })
        .then((response) => {
          const hash = response.data.hash;
          // Send another POST request with response.data.hash and at: '3'
          return axios.post('/api/game-session', {
            gameSessionId: gameSessionId,
            score: timeElapsed,
            cHash: hash,
            rHash: generateResponseHash(hash, timeElapsed),
            at: '3',
          });
        })
        .then((response) => {
          // Handle the response of the second POST request
          toast({
            description: response.data,
          });
        })
        .catch((error) => {
          // if (error.response.data && error.response.status === 302) {
          //   router.refresh();
          //   toast({
          //     description:
          //       'You can still see your top score for this tier session by visiting the stats page.',
          //     variant: 'warning',
          //   });
          // }

          toast({
            description: error.response ? error.response.data : 'Network Error',
            variant: 'destructive',
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }

  useEffect(() => {
    onGameLoad();
    const newGrid = initializeGrid(size, size, numMines);
    setGrid(newGrid);
  }, []);

  const onGameLoad = () => {
    setLoading(true);
    setCreateGameSessionSuccess(false);
    setInitiatedGameEndSuccess(false);
    const updatedIds = { ...ids, at: '0' };
    axios
      .post('/api/game-session', updatedIds)
      .then((response) => {
        toast({
          description: 'Game session created',
        });
        setGameSessionId(response.data.gameSessionId);
        setCreateGameSessionSuccess(true);
      })
      .catch((error) => {
        toast({
          description: error.response.data,
          variant: 'destructive',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const revealCell = (grid: CellType[][], row: number, col: number): CellType[][] => {
    if (!createGameSessionSuccess) return grid;
    // Check boundaries first
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(Date.now());
    }
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
          if (newGrid[i][j].isMine && !newGrid[i][j].isFlagged) {
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
  };

  const toggleFlag = (e: React.MouseEvent, row: number, col: number) => {
    if (!createGameSessionSuccess) return;
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(Date.now());
    }
    e.preventDefault(); // This prevents the default context menu from appearing
    const newGrid = [...grid];
    newGrid[row][col].isFlagged = !newGrid[row][col].isFlagged;
    setGrid(newGrid);
  };

  const handleReveal = (row: number, col: number) => {
    const updatedGrid = revealCell(grid, row, col);
    setGrid(updatedGrid);

    if (checkWin()) {
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[0].length; c++) {
          if (grid[r][c].isMine) {
            updatedGrid[r][c].isFlagged = true;
          }
        }
      }
      setGrid(updatedGrid);
      setGameOver(true);
    }
  };

  const restartGame = () => {
    setGameStarted(false);
    onGameLoad();
    // Generate a fresh grid
    const newGrid = initializeGrid(size, size, numMines);
    setGrid(newGrid);

    // Reset the exploded cell
    setExplodedCell(null);

    // Reset the gameOver flag
    setGameOver(false);
  };

  const handleTimeExceeded = () => {
    setGameOver(true);
  };

  const checkWin = (): boolean => {
    for (let row of grid) {
      for (let cell of row) {
        if (!cell.isMine && !cell.isRevealed) {
          return false; // Not all non-mine cells are revealed yet
        }
      }
    }
    return true; // All non-mine cells are revealed
  };

  return (
    <div>
      <Header
        gameStarted={gameStarted}
        flagsLeft={flagsLeft}
        gameStatus={gameStatus}
        onTimeExceeded={handleTimeExceeded}
        onReset={restartGame}
        loading={loading}
      />
      <Board
        grid={grid}
        gameOver={gameOver}
        explodedCell={explodedCell}
        onRevealCell={handleReveal}
        onToggleFlag={toggleFlag}
        loading={loading}
      />
    </div>
  );
};

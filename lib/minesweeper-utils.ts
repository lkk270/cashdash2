import { CellType } from '@/app/types';

// This function calculates the 3BV for a grid
const calculate3BV = (grid: CellType[][]): number => {
  let bv = 0;
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));

  const dfs = (i: number, j: number) => {
    if (
      i < 0 ||
      i >= rows ||
      j < 0 ||
      j >= cols ||
      visited[i][j] ||
      grid[i][j].isMine ||
      grid[i][j].neighboringMines !== 0
    ) {
      return;
    }

    visited[i][j] = true;

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        dfs(i + x, j + y);
      }
    }
  };

  // Mark all open squares
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (!visited[i][j] && grid[i][j].neighboringMines === 0 && !grid[i][j].isMine) {
        dfs(i, j);
        bv++;
      }
    }
  }

  // Increment 3BV for each numbered square not adjacent to an open square
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (!grid[i][j].isMine && grid[i][j].neighboringMines !== 0) {
        let adjacentToOpenSquare = false;
        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            if (
              i + x >= 0 &&
              i + x < rows &&
              j + y >= 0 &&
              j + y < cols &&
              grid[i + x][j + y].neighboringMines === 0
            ) {
              adjacentToOpenSquare = true;
              break;
            }
          }
          if (adjacentToOpenSquare) break;
        }
        if (!adjacentToOpenSquare) bv++;
      }
    }
  }
  return bv;
};

const generateGrid = (rows: number, cols: number, mines: number): CellType[][] => {
  // Create a blank grid
  let grid: CellType[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighboringMines: 0,
    }))
  );

  // Generate a list of all cell indices
  let allCells = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      allCells.push({ row: i, col: j });
    }
  }

  // Randomly place the mines
  for (let i = 0; i < mines; i++) {
    let randomIndex = Math.floor(Math.random() * allCells.length);
    let { row, col } = allCells[randomIndex];
    grid[row][col].isMine = true;
    allCells.splice(randomIndex, 1); // Remove the chosen cell from the list
  }

  // Calculate neighboring mines for each cell
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let count = 0;
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          if (
            i + x >= 0 &&
            i + x < rows &&
            j + y >= 0 &&
            j + y < cols &&
            grid[i + x][j + y].isMine
          ) {
            count++;
          }
        }
      }
      grid[i][j].neighboringMines = count;
    }
  }
  return grid;
};

export const initializeGrid = (
  rows: number,
  cols: number,
  mines: number,
  min3BV: number
): CellType[][] => {
  let grid: CellType[][];

  do {
    grid = generateGrid(rows, cols, mines);
  } while (calculate3BV(grid) < min3BV);

  return grid;
};

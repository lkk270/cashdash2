import { CellType } from '@/app/types';

export const initializeGrid = (rows: number, cols: number, mines: number): CellType[][] => {
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

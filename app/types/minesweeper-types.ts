export type CellType = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighboringMines: number;
};

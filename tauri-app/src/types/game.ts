export interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export type GameState = 'playing' | 'won' | 'lost';

export type GameStatus = 'initial' | 'playing' | 'won' | 'lost';

export interface Difficulty {
  name: string;
  rows: number;
  cols: number;
  mines: number;
}

export interface CustomDifficulty {
  rows: number;
  cols: number;
  mines: number;
}

export interface GameData {
  board: Cell[][];
  status: GameStatus;
  timer: number;
  flags: number;
  firstClick: boolean;
}

import { ref } from 'vue';
import type { Cell, GameStatus, Difficulty, GameData } from '../types/game';

export function useGameState() {
  const difficulty = ref<Difficulty | null>(null);

  const gameState = ref<GameData>({
    board: [],
    status: '' as GameStatus,
    timer: 0,
    flags: 0,
    firstClick: true,
  });

  const newGame = (newDifficulty: Difficulty): void => {
    difficulty.value = newDifficulty;

    gameState.value.board = createBoard(newDifficulty.rows, newDifficulty.cols);
    gameState.value.status = 'initial';
    gameState.value.timer = 0;
    gameState.value.flags = 0;
    gameState.value.firstClick = true;
  };

  const startGame = (): void => {
    if (gameState.value.status !== 'playing') {
      gameState.value.status = 'playing';
    }
  };

  const endGame = (result: 'won' | 'lost'): void => {
    gameState.value.status = result;
  };

  const updateTimer = (): void => {
    gameState.value.timer += 1;
  };

  const revealCell = (row: number, col: number): void => {
    if (!isValidCell(row, col)) {
      return;
    }

    const cell = gameState.value.board[row][col];

    if (cell.isRevealed || cell.isFlagged || gameState.value.status !== 'playing') {
      return;
    }

    cell.isRevealed = true;

    if (cell.neighborMines === 0 && !cell.isMine) {
      revealNeighbors(row, col);
    }
  };

  const flagCell = (row: number, col: number): void => {
    if (!isValidCell(row, col)) {
      return;
    }

    const cell = gameState.value.board[row][col];

    if (cell.isRevealed) {
      return;
    }

    cell.isFlagged = !cell.isFlagged;
    gameState.value.flags += cell.isFlagged ? 1 : -1;
  };

  const createBoard = (rows: number, cols: number): Cell[][] => {
    const board: Cell[][] = [];

    for (let row = 0; row < rows; row++) {
      board[row] = [];
      for (let col = 0; col < cols; col++) {
        board[row][col] = {
          row,
          col,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        };
      }
    }

    return board;
  };

  const isValidCell = (row: number, col: number): boolean => {
    if (!difficulty.value) {
      return false;
    }

    return row >= 0 && row < difficulty.value.rows && col >= 0 && col < difficulty.value.cols;
  };

  const revealNeighbors = (row: number, col: number): void => {
    const neighbors = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],          [0, 1],
      [1, -1], [1, 0], [1, 1],
    ];

    for (const [dr, dc] of neighbors) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (isValidCell(newRow, newCol)) {
        const neighborCell = gameState.value.board[newRow][newCol];
        if (!neighborCell.isRevealed && !neighborCell.isFlagged) {
          revealCell(newRow, newCol);
        }
      }
    }
  };

  return {
    gameState,
    difficulty,
    newGame,
    startGame,
    endGame,
    updateTimer,
    revealCell,
    flagCell,
  };
}

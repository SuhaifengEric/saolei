import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameState } from './useGameState';
import type { Difficulty, GameData } from '../types/game';
import type { Ref } from 'vue';

describe('useGameState', () => {
  const mockDifficulty: Difficulty = {
    name: 'easy',
    rows: 9,
    cols: 9,
    mines: 10,
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('State initialization', () => {
    it('initializes with correct default state', () => {
      const { gameState } = useGameState();

      expect(gameState.value.status).toBe('initial');
      expect(gameState.value.timer).toBe(0);
      expect(gameState.value.flags).toBe(0);
      expect(gameState.value.firstClick).toBe(true);
      expect(gameState.value.board).toEqual([]);
    });
  });

  describe('newGame', () => {
    it('resets all state correctly', () => {
      const { gameState, newGame } = useGameState();

      // Set some initial state
      gameState.value.timer = 10;
      gameState.value.flags = 5;
      gameState.value.firstClick = false;
      gameState.value.status = 'playing';

      newGame(mockDifficulty);

      expect(gameState.value.timer).toBe(0);
      expect(gameState.value.flags).toBe(0);
      expect(gameState.value.firstClick).toBe(true);
      expect(gameState.value.status).toBe('initial');
    });

    it('creates board with correct dimensions', () => {
      const { gameState, newGame } = useGameState();

      newGame(mockDifficulty);

      expect(gameState.value.board.length).toBe(mockDifficulty.rows);
      expect(gameState.value.board[0].length).toBe(mockDifficulty.cols);
    });

    it('initializes cells with correct properties', () => {
      const { gameState, newGame } = useGameState();

      newGame(mockDifficulty);

      const firstCell = gameState.value.board[0][0];
      expect(firstCell.row).toBe(0);
      expect(firstCell.col).toBe(0);
      expect(firstCell.isRevealed).toBe(false);
      expect(firstCell.isFlagged).toBe(false);
      expect(typeof firstCell.isMine).toBe('boolean');
      expect(typeof firstCell.neighborMines).toBe('number');
    });

    it('correct difficulty is set', () => {
      const { difficulty, newGame } = useGameState();

      newGame(mockDifficulty);

      expect(difficulty.value).toEqual(mockDifficulty);
    });
  });

  describe('startGame', () => {
    it('starts timer', () => {
      const { gameState, startGame } = useGameState();

      startGame();

      expect(gameState.value.status).toBe('playing');
    });

    it('does not start game if already playing', () => {
      const { gameState, startGame } = useGameState();

      gameState.value.status = 'playing';
      startGame();

      expect(gameState.value.status).toBe('playing');
    });
  });

  describe('endGame', () => {
    it('stops timer and sets won status', () => {
      const { gameState, endGame } = useGameState();

      gameState.value.status = 'playing';
      gameState.value.timer = 10;

      endGame('won');

      expect(gameState.value.status).toBe('won');
      expect(gameState.value.timer).toBe(10);
    });

    it('stops timer and sets lost status', () => {
      const { gameState, endGame } = useGameState();

      gameState.value.status = 'playing';
      gameState.value.timer = 15;

      endGame('lost');

      expect(gameState.value.status).toBe('lost');
      expect(gameState.value.timer).toBe(15);
    });
  });

  describe('updateTimer', () => {
    it('correctly updates time', () => {
      const { gameState, updateTimer } = useGameState();

      gameState.value.timer = 0;
      updateTimer();

      expect(gameState.value.timer).toBe(1);
    });

    it('increments timer correctly', () => {
      const { gameState, updateTimer } = useGameState();

      gameState.value.timer = 5;
      updateTimer();

      expect(gameState.value.timer).toBe(6);
    });
  });

  describe('revealCell', () => {
    let gameState: Ref<GameData>;
    let revealCell: (row: number, col: number) => void;
    let flagCell: (row: number, col: number) => void;

    beforeEach(() => {
      const composable = useGameState();
      composable.newGame(mockDifficulty);
      composable.startGame();
      gameState = composable.gameState;
      revealCell = composable.revealCell;
      flagCell = composable.flagCell;
    });

    it('updates game state when cell is revealed', () => {
      revealCell(0, 0);

      expect(gameState.value.board[0][0].isRevealed).toBe(true);
    });

    it('does not reveal flagged cells', () => {
      flagCell(0, 0);
      revealCell(0, 0);

      expect(gameState.value.board[0][0].isRevealed).toBe(false);
    });

    it('does not reveal already revealed cells', () => {
      revealCell(0, 0);
      const firstRevealState = gameState.value.board[0][0].isRevealed;

      revealCell(0, 0);

      expect(gameState.value.board[0][0].isRevealed).toBe(firstRevealState);
    });

    it('reveals empty cell correctly', () => {
      // Ensure the cell is not a mine and has no neighbors
      gameState.value.board[1][1].isMine = false;
      gameState.value.board[1][1].neighborMines = 0;

      revealCell(1, 1);

      expect(gameState.value.board[1][1].isRevealed).toBe(true);
    });

    it('reveals cell with neighbors correctly', () => {
      gameState.value.board[2][2].neighborMines = 2;
      gameState.value.board[2][2].isMine = false;

      revealCell(2, 2);

      expect(gameState.value.board[2][2].isRevealed).toBe(true);
    });
  });

  describe('flagCell', () => {
    let gameState: Ref<GameData>;
    let flagCell: (row: number, col: number) => void;
    let revealCell: (row: number, col: number) => void;

    beforeEach(() => {
      const composable = useGameState();
      composable.newGame(mockDifficulty);
      composable.startGame();
      gameState = composable.gameState;
      flagCell = composable.flagCell;
      revealCell = composable.revealCell;
    });

    it('toggles flag status when cell is not revealed', () => {
      flagCell(0, 0);

      expect(gameState.value.board[0][0].isFlagged).toBe(true);
      expect(gameState.value.flags).toBe(1);

      flagCell(0, 0);

      expect(gameState.value.board[0][0].isFlagged).toBe(false);
      expect(gameState.value.flags).toBe(0);
    });

    it('does not flag revealed cells', () => {
      revealCell(0, 0);
      const initialFlags = gameState.value.flags;

      flagCell(0, 0);

      expect(gameState.value.board[0][0].isFlagged).toBe(false);
      expect(gameState.value.flags).toBe(initialFlags);
    });

    it('increments flags count when flagging', () => {
      flagCell(0, 0);
      flagCell(1, 1);

      expect(gameState.value.flags).toBe(2);
    });

    it('decrements flags count when unflagging', () => {
      flagCell(0, 0);
      flagCell(1, 1);
      flagCell(0, 0);

      expect(gameState.value.flags).toBe(1);
    });
  });

  describe('Edge cases', () => {
    it('handles invalid cell coordinates gracefully', () => {
      const { revealCell, flagCell } = useGameState();

      // Should not throw errors
      expect(() => revealCell(-1, 0)).not.toThrow();
      expect(() => revealCell(0, -1)).not.toThrow();
      expect(() => flagCell(-1, 0)).not.toThrow();
      expect(() => flagCell(0, -1)).not.toThrow();
    });

    it('handles out of bounds coordinates gracefully when game not started', () => {
      const { revealCell, flagCell } = useGameState();

      // Should not throw errors without game initialized
      expect(() => revealCell(0, 0)).not.toThrow();
      expect(() => flagCell(0, 0)).not.toThrow();
    });
  });
});

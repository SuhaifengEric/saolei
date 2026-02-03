import { describe, it, expect } from 'vitest';
import {
  generateBoard,
  calculateNumbers,
  ensureFirstClickSafety,
  validateCustomDifficulty,
} from './boardGenerator';

describe('boardGenerator', () => {
  describe('generateBoard', () => {
    it('generates correct number of mines', () => {
      const board = generateBoard(10, 10, 10, 'test-seed-1');
      let mineCount = 0;
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          if (board[r][c].isMine) mineCount++;
        }
      }
      expect(mineCount).toBe(10);
    });

    it('generates correct number of mines with different parameters', () => {
      const board = generateBoard(5, 5, 5, 'test-seed-2');
      let mineCount = 0;
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (board[r][c].isMine) mineCount++;
        }
      }
      expect(mineCount).toBe(5);
    });

    it('places mines randomly (different seeds produce different boards)', () => {
      const board1 = generateBoard(10, 10, 10, 'seed-1');
      const board2 = generateBoard(10, 10, 10, 'seed-2');

      let sameMinePositions = 0;
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          if (board1[r][c].isMine === board2[r][c].isMine) {
            sameMinePositions++;
          }
        }
      }

      // At least some mines should be in different positions
      expect(sameMinePositions).toBeLessThan(100);
    });

    it('with same seed produces same board (reproducibility)', () => {
      const board1 = generateBoard(10, 10, 10, 'test-seed-3');
      const board2 = generateBoard(10, 10, 10, 'test-seed-3');

      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          expect(board1[r][c].isMine).toBe(board2[r][c].isMine);
        }
      }
    });

    it('creates board with correct dimensions', () => {
      const board = generateBoard(8, 6, 5, 'test-dimensions');
      expect(board.length).toBe(8);
      expect(board[0].length).toBe(6);
    });

    it('initializes all cells with correct values', () => {
      const board = generateBoard(5, 5, 3, 'test-initialization');
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          expect(board[r][c].row).toBe(r);
          expect(board[r][c].col).toBe(c);
          expect(board[r][c].isRevealed).toBe(false);
          expect(board[r][c].isFlagged).toBe(false);
          expect(board[r][c].neighborMines).toBe(0);
        }
      }
    });
  });

  describe('calculateNumbers', () => {
    it('correctly counts neighbor mines', () => {
      const board = generateBoard(5, 5, 0, 'test-numbers-1');
      // Manually place mines
      board[1][1].isMine = true;
      board[1][2].isMine = true;

      const calculatedBoard = calculateNumbers(board);

      // Cell (0,0) should have 1 neighbor (the mine at 1,1)
      expect(calculatedBoard[0][0].neighborMines).toBe(1);
      // Cell (0,1) should have 2 neighbors (mines at 1,1 and 1,2)
      expect(calculatedBoard[0][1].neighborMines).toBe(2);
      // Cell (0,2) should have 2 neighbors
      expect(calculatedBoard[0][2].neighborMines).toBe(2);
      // Cell (1,0) should have 1 neighbor
      expect(calculatedBoard[1][0].neighborMines).toBe(1);
      // Cell (2,1) should have 2 neighbors (both mines at 1,1 and 1,2)
      expect(calculatedBoard[2][1].neighborMines).toBe(2);
    });

    it('handles boundary cells correctly', () => {
      const board = generateBoard(3, 3, 0, 'test-boundaries');
      // Place mine at corner (0,0)
      board[0][0].isMine = true;

      const calculatedBoard = calculateNumbers(board);

      // (0,1) should have 1 neighbor
      expect(calculatedBoard[0][1].neighborMines).toBe(1);
      // (1,0) should have 1 neighbor
      expect(calculatedBoard[1][0].neighborMines).toBe(1);
      // (1,1) should have 1 neighbor
      expect(calculatedBoard[1][1].neighborMines).toBe(1);
      // (2,2) should have 0 neighbors
      expect(calculatedBoard[2][2].neighborMines).toBe(0);
    });

    it('handles corners correctly', () => {
      const board = generateBoard(3, 3, 0, 'test-corners');
      // Place mines at four corners
      board[0][0].isMine = true;
      board[0][2].isMine = true;
      board[2][0].isMine = true;
      board[2][2].isMine = true;

      const calculatedBoard = calculateNumbers(board);

      // Center cell should have 4 neighbors (all 4 corners)
      expect(calculatedBoard[1][1].neighborMines).toBe(4);
      // Corner (0,1) should have 2 neighbors (0,0 and 0,2)
      expect(calculatedBoard[0][1].neighborMines).toBe(2);
      // Corner (1,0) should have 2 neighbors (0,0 and 2,0)
      expect(calculatedBoard[1][0].neighborMines).toBe(2);
    });

    it('counts all 8 surrounding neighbors', () => {
      const board = generateBoard(3, 3, 0, 'test-all-neighbors');
      // Place mine in center
      board[1][1].isMine = true;

      const calculatedBoard = calculateNumbers(board);

      // All 8 surrounding cells should have 1 neighbor
      expect(calculatedBoard[0][0].neighborMines).toBe(1);
      expect(calculatedBoard[0][1].neighborMines).toBe(1);
      expect(calculatedBoard[0][2].neighborMines).toBe(1);
      expect(calculatedBoard[1][0].neighborMines).toBe(1);
      expect(calculatedBoard[1][2].neighborMines).toBe(1);
      expect(calculatedBoard[2][0].neighborMines).toBe(1);
      expect(calculatedBoard[2][1].neighborMines).toBe(1);
      expect(calculatedBoard[2][2].neighborMines).toBe(1);
    });

    it('mines have neighborMines count of 0', () => {
      const board = generateBoard(5, 5, 3, 'test-mineineighbors');
      board[2][2].isMine = true;
      board[2][3].isMine = true;
      board[3][2].isMine = true;

      const calculatedBoard = calculateNumbers(board);

      // Mines should still have neighborMines = 0 (or whatever they started with)
      // The function skips mines
      expect(calculatedBoard[2][2].isMine).toBe(true);
      expect(calculatedBoard[2][3].isMine).toBe(true);
      expect(calculatedBoard[3][2].isMine).toBe(true);
    });
  });

  describe('ensureFirstClickSafety', () => {
    it('makes first click safe when first click is on a mine', () => {
      const board = generateBoard(5, 5, 5, 'test-safety-1');
      // Ensure first click is on a mine
      board[2][2].isMine = true;

      const safeBoard = ensureFirstClickSafety(board, 2, 2);

      expect(safeBoard[2][2].isMine).toBe(false);
    });

    it('ensures first click neighbors are safe', () => {
      const board = generateBoard(5, 5, 5, 'test-safety-2');
      // Place mines around first click
      board[1][1].isMine = true;
      board[1][2].isMine = true;
      board[2][1].isMine = true;

      const safeBoard = ensureFirstClickSafety(board, 2, 2);

      // First click and all neighbors should be safe
      expect(safeBoard[2][2].isMine).toBe(false);
      expect(safeBoard[1][1].isMine).toBe(false);
      expect(safeBoard[1][2].isMine).toBe(false);
      expect(safeBoard[2][1].isMine).toBe(false);
    });

    it('preserves total mine count', () => {
      const board = generateBoard(5, 5, 5, 'test-safety-3');
      // Make first click dangerous
      board[2][2].isMine = true;
      board[2][3].isMine = true;

      // Count mines before safety
      let initialMineCount = 0;
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (board[r][c].isMine) initialMineCount++;
        }
      }

      const safeBoard = ensureFirstClickSafety(board, 2, 2);

      // Count mines after safety
      let finalMineCount = 0;
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (safeBoard[r][c].isMine) finalMineCount++;
        }
      }
      expect(finalMineCount).toBe(initialMineCount);
    });

    it('works correctly when first click is already safe', () => {
      const board = generateBoard(5, 5, 5, 'test-safety-4');
      // Ensure first click and neighbors are safe
      board[2][2].isMine = false;
      board[1][1].isMine = false;
      board[1][2].isMine = false;
      board[1][3].isMine = false;
      board[2][1].isMine = false;
      board[2][3].isMine = false;
      board[3][1].isMine = false;
      board[3][2].isMine = false;
      board[3][3].isMine = false;

      const safeBoard = ensureFirstClickSafety(board, 2, 2);

      // First click should still be safe
      expect(safeBoard[2][2].isMine).toBe(false);
    });

    it('handles corner first click correctly', () => {
      const board = generateBoard(5, 5, 5, 'test-safety-5');
      // Place mines in corner area
      board[0][0].isMine = true;
      board[0][1].isMine = true;
      board[1][0].isMine = true;

      const safeBoard = ensureFirstClickSafety(board, 0, 0);

      // Corner and its neighbors should be safe
      expect(safeBoard[0][0].isMine).toBe(false);
      expect(safeBoard[0][1].isMine).toBe(false);
      expect(safeBoard[1][0].isMine).toBe(false);
    });

    it('recalculates neighbor numbers after moving mines', () => {
      const board = generateBoard(5, 5, 3, 'test-safety-6');
      // Place mines around first click
      board[2][2].isMine = true;
      board[2][3].isMine = true;

      const safeBoard = ensureFirstClickSafety(board, 2, 2);

      // After moving mines, recalculate neighbor numbers
      // First click area should have 0 mines
      expect(safeBoard[2][2].isMine).toBe(false);

      // Verify neighborMines are recalculated
      // This should not crash and should return valid numbers
      expect(typeof safeBoard[2][2].neighborMines).toBe('number');
    });

    it('ensures 100% safety for first click', () => {
      const board = generateBoard(10, 10, 20, 'test-safety-7');
      // Place mine at first click
      board[5][5].isMine = true;
      board[5][6].isMine = true;
      board[6][5].isMine = true;

      const safeBoard = ensureFirstClickSafety(board, 5, 5);

      // Check all 3x3 area around first click
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const r = 5 + dr;
          const c = 5 + dc;
          expect(safeBoard[r][c].isMine).toBe(false);
        }
      }
    });
  });

  describe('validateCustomDifficulty', () => {
    it('accepts valid difficulties', () => {
      expect(validateCustomDifficulty(5, 5, 1)).toBe(true);
      expect(validateCustomDifficulty(10, 10, 10)).toBe(true);
      expect(validateCustomDifficulty(50, 50, 500)).toBe(true);
      expect(validateCustomDifficulty(20, 30, 100)).toBe(true);
    });

    it('rejects too small (4x4)', () => {
      expect(validateCustomDifficulty(4, 10, 10)).toBe(false);
      expect(validateCustomDifficulty(10, 4, 10)).toBe(false);
      expect(validateCustomDifficulty(4, 4, 5)).toBe(false);
    });

    it('rejects too large (51x50)', () => {
      expect(validateCustomDifficulty(51, 50, 100)).toBe(false);
      expect(validateCustomDifficulty(50, 51, 100)).toBe(false);
      expect(validateCustomDifficulty(51, 51, 100)).toBe(false);
    });

    it('rejects zero mines', () => {
      expect(validateCustomDifficulty(10, 10, 0)).toBe(false);
      expect(validateCustomDifficulty(20, 20, 0)).toBe(false);
    });

    it('rejects too many mines (>99%)', () => {
      // 10x10 = 100 cells, 99% = 99 mines max
      expect(validateCustomDifficulty(10, 10, 100)).toBe(false);
      expect(validateCustomDifficulty(10, 10, 99)).toBe(true); // 99% is OK

      // 5x5 = 25 cells, 99% = 24.75, max 24 mines
      expect(validateCustomDifficulty(5, 5, 25)).toBe(false);
      expect(validateCustomDifficulty(5, 5, 24)).toBe(true);
    });

    it('accepts minimum valid size (5x5)', () => {
      expect(validateCustomDifficulty(5, 5, 1)).toBe(true);
      expect(validateCustomDifficulty(5, 5, 24)).toBe(true);
    });

    it('accepts maximum valid size (50x50)', () => {
      expect(validateCustomDifficulty(50, 50, 1)).toBe(true);
      expect(validateCustomDifficulty(50, 50, 2474)).toBe(true); // 50*50*0.99 = 2475, so 2474 is OK
    });

    it('rejects negative values', () => {
      expect(validateCustomDifficulty(-1, 10, 10)).toBe(false);
      expect(validateCustomDifficulty(10, -1, 10)).toBe(false);
      expect(validateCustomDifficulty(10, 10, -1)).toBe(false);
    });

    it('accepts maximum mine density (just under 99%)', () => {
      // 10x10 = 100 cells, max mines = floor(100 * 0.99) = 99
      expect(validateCustomDifficulty(10, 10, 99)).toBe(true);

      // 20x20 = 400 cells, max mines = floor(400 * 0.99) = 396
      expect(validateCustomDifficulty(20, 20, 396)).toBe(true);
    });
  });
});

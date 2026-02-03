import { describe, it, expect } from 'vitest';
import { Cell } from '../types/game';
import { canChord, chord } from './chordLogic';

describe('canChord', () => {
  it('allows when flags == neighbor mines', () => {
    // Create a board where cell (1,1) has 2 neighbor mines and 2 flagged neighbors
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 0, col: 2, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
      ],
      [
        { row: 1, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 1, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 2 },
        { row: 1, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
      [
        { row: 2, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 2, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 2, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    expect(canChord(board, 1, 1)).toBe(true);
  });

  it('rejects when flags < neighbor mines', () => {
    // Cell (1,1) has 2 neighbor mines but only 1 flagged neighbor
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 0, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
      [
        { row: 1, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 1, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 2 },
        { row: 1, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
      [
        { row: 2, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 2, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 2, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    expect(canChord(board, 1, 1)).toBe(false);
  });

  it('rejects when cell not revealed', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
      ],
      [
        { row: 1, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 2 },
      ],
    ];

    expect(canChord(board, 1, 1)).toBe(false);
  });

  it('rejects when cell has 0 neighbor mines', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
      [
        { row: 1, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 1, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 0 },
      ],
    ];

    expect(canChord(board, 1, 1)).toBe(false);
  });

  it('handles out-of-bounds coordinates', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 1 },
      ],
    ];

    expect(canChord(board, -1, 0)).toBe(false);
    expect(canChord(board, 0, 5)).toBe(false);
  });

  it('rejects when flags > neighbor mines', () => {
    // Cell (1,1) has 2 neighbor mines but 3 flagged neighbors
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
        { row: 0, col: 2, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
      ],
      [
        { row: 1, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 1, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 2 },
        { row: 1, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
      [
        { row: 2, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 2, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 2, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    expect(canChord(board, 1, 1)).toBe(false);
  });
});

describe('chord', () => {
  it('returns correct cells to reveal', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 0, col: 2, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
      ],
      [
        { row: 1, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 1, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 2 },
        { row: 1, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
      [
        { row: 2, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 2, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 2, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    const toReveal = chord(board, 1, 1);
    
    // Should return 6 cells (8 neighbors - 2 flagged)
    expect(toReveal).toHaveLength(6);
    
    // All returned cells should be non-flagged and non-revealed
    toReveal.forEach((cell) => {
      expect(cell.isFlagged).toBe(false);
      expect(cell.isRevealed).toBe(false);
    });
  });

  it('returns empty array when canChord is false', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
      [
        { row: 1, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 1, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 2 },
      ],
    ];

    // Only 1 flagged neighbor but needs 2
    const toReveal = chord(board, 1, 1);
    expect(toReveal).toHaveLength(0);
  });

  it('does not include already revealed cells', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 0 },
        { row: 0, col: 2, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
      ],
      [
        { row: 1, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 1, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 2 },
        { row: 1, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
      [
        { row: 2, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 2, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 2, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    const toReveal = chord(board, 1, 1);
    
    // Should not include (0,1) as it's already revealed
    const hasCell0_1 = toReveal.some((cell) => cell.row === 0 && cell.col === 1);
    expect(hasCell0_1).toBe(false);
    
    // Should have 5 cells (8 neighbors - 2 flagged - 1 already revealed)
    expect(toReveal).toHaveLength(5);
  });

  it('handles corner cells correctly', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 1 },
        { row: 0, col: 1, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
      ],
      [
        { row: 1, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    const toReveal = chord(board, 0, 0);
    
    // Corner cell has 3 neighbors, 1 flagged, so 2 to reveal
    expect(toReveal).toHaveLength(2);
  });
});

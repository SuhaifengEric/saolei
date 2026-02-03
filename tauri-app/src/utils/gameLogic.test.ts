import { describe, it, expect } from 'vitest';
import { Cell } from '../types/game';
import {
  getNeighbors,
  revealCell,
  checkWin,
  checkLoss,
  getChordCells,
} from './gameLogic';

describe('getNeighbors', () => {
  it('returns correct 8 neighbors for interior cells', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 0, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
      [
        { row: 1, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
      [
        { row: 2, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 2, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 2, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    const neighbors = getNeighbors(board, 1, 1);
    expect(neighbors).toHaveLength(8);
    
    // Check that all neighbor positions are correct
    const positions = neighbors.map((n) => `${n.row},${n.col}`).sort();
    expect(positions).toEqual([
      '0,0', '0,1', '0,2',
      '1,0',        '1,2',
      '2,0', '2,1', '2,2',
    ]);
  });

  it('handles corner cells (3 neighbors)', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
      [
        { row: 1, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    const neighbors = getNeighbors(board, 0, 0);
    expect(neighbors).toHaveLength(3);
    
    const positions = neighbors.map((n) => `${n.row},${n.col}`).sort();
    expect(positions).toEqual(['0,1', '1,0', '1,1']);
  });

  it('handles edge cells (5 neighbors)', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 0, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
      [
        { row: 1, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    const neighbors = getNeighbors(board, 0, 1);
    expect(neighbors).toHaveLength(5);
    
    const positions = neighbors.map((n) => `${n.row},${n.col}`).sort();
    expect(positions).toEqual(['0,0', '0,2', '1,0', '1,1', '1,2']);
  });
});

describe('revealCell', () => {
  it('correctly reveals single cell', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 1 },
        { row: 0, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    const result = revealCell(board, 0, 0);
    expect(result[0][0].isRevealed).toBe(true);
    expect(result[0][1].isRevealed).toBe(false); // Not revealed (not a neighbor)
  });

  it('recursively reveals empty region', () => {
    // Create a 3x3 board with one mine at (2,2)
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 0, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
      [
        { row: 1, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 1 },
        { row: 1, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 1 },
      ],
      [
        { row: 2, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 2, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 1 },
        { row: 2, col: 2, isMine: true, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    const result = revealCell(board, 0, 0);
    
    // All empty cells (neighborMines === 0) should be revealed
    expect(result[0][0].isRevealed).toBe(true);
    expect(result[0][1].isRevealed).toBe(true);
    expect(result[0][2].isRevealed).toBe(true);
    expect(result[1][0].isRevealed).toBe(true);
    expect(result[2][0].isRevealed).toBe(true);
    
    // Numbered cells (neighborMines > 0) adjacent to empty region should also be revealed
    expect(result[1][1].isRevealed).toBe(true);
    expect(result[1][2].isRevealed).toBe(true); // Adjacent to (0,2) and (2,0)
    expect(result[2][1].isRevealed).toBe(true);
    
    // Mine should NOT be revealed
    expect(result[2][2].isRevealed).toBe(false);
  });

  it('does not reveal flagged cells', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    const result = revealCell(board, 0, 0);
    expect(result[0][0].isRevealed).toBe(false); // Flagged, so not revealed
  });

  it('does not reveal already revealed cells', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 0 },
      ],
    ];

    const result = revealCell(board, 0, 0);
    expect(result[0][0].isRevealed).toBe(true); // Already revealed, stays revealed
  });

  it('handles boundary cells correctly', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
      [
        { row: 1, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    // Test revealing a corner cell
    const result = revealCell(board, 0, 0);
    expect(result[0][0].isRevealed).toBe(true);
    expect(result[0][1].isRevealed).toBe(true);
    expect(result[1][0].isRevealed).toBe(true);
    expect(result[1][1].isRevealed).toBe(true);
  });

  it('reveals mine cell when clicked', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: true, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    const result = revealCell(board, 0, 0);
    expect(result[0][0].isRevealed).toBe(true);
    expect(result[0][0].isMine).toBe(true);
  });

  it('handles out-of-bounds coordinates', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    const result = revealCell(board, -1, 0);
    expect(result[0][0].isRevealed).toBe(false); // No change

    const result2 = revealCell(board, 0, 5);
    expect(result2[0][0].isRevealed).toBe(false); // No change
  });
});

describe('checkWin', () => {
  it('correctly identifies victory (all non-mine cells revealed)', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 0 },
      ],
      [
        { row: 1, col: 0, isMine: true, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 1, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 0 },
      ],
    ];

    // 4 cells total, 1 mine = 3 non-mine cells to reveal
    expect(checkWin(board, 1)).toBe(true);
  });

  it('returns false when game not won', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
      [
        { row: 1, col: 0, isMine: true, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 1, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 0 },
      ],
    ];

    // 4 cells total, 1 mine = 3 non-mine cells, but only 2 revealed
    expect(checkWin(board, 1)).toBe(false);
  });

  it('returns false when no cells revealed', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    expect(checkWin(board, 0)).toBe(false);
  });
});

describe('checkLoss', () => {
  it('correctly identifies mine reveal', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: true, isRevealed: true, isFlagged: false, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    expect(checkLoss(board)).toBe(true);
  });

  it('returns false when no mine revealed', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: true, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: true, isFlagged: false, neighborMines: 0 },
      ],
    ];

    expect(checkLoss(board)).toBe(false);
  });

  it('returns false on fresh board', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    expect(checkLoss(board)).toBe(false);
  });
});

describe('getChordCells', () => {
  it('returns correct flagged neighbors', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 0, col: 2, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
      ],
      [
        { row: 1, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 2, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
      ],
      [
        { row: 2, col: 0, isMine: false, isRevealed: false, isFlagged: true, neighborMines: 0 },
        { row: 2, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 2, col: 2, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    const flagged = getChordCells(board, 1, 1);
    expect(flagged).toHaveLength(4);
    
    const positions = flagged.map((f) => `${f.row},${f.col}`).sort();
    expect(positions).toEqual(['0,0', '0,2', '1,2', '2,0']);
  });

  it('returns empty array when no flagged neighbors', () => {
    const board: Cell[][] = [
      [
        { row: 0, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 0, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
      [
        { row: 1, col: 0, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
        { row: 1, col: 1, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 },
      ],
    ];

    const flagged = getChordCells(board, 1, 1);
    expect(flagged).toHaveLength(0);
  });
});

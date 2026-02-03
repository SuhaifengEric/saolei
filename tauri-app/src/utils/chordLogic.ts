import { Cell } from '../types/game';
import { getNeighbors } from './gameLogic';

/**
 * Check if a chord (quick-reveal) operation can be performed on a cell
 * Chord is possible when:
 * - Cell is revealed
 * - Cell has neighbor mines > 0
 * - Number of flagged neighbors equals the number of neighbor mines
 * @param board - The game board
 * @param row - Row index
 * @param col - Column index
 * @returns true if chord can be performed, false otherwise
 */
export function canChord(board: Cell[][], row: number, col: number): boolean {
  const rows = board.length;
  const cols = board[0].length;

  // Check boundaries
  if (row < 0 || row >= rows || col < 0 || col >= cols) {
    return false;
  }

  const cell = board[row][col];

  // Cell must be revealed
  if (!cell.isRevealed) {
    return false;
  }

  // Cell must have neighbor mines
  if (cell.neighborMines === 0) {
    return false;
  }

  // Count surrounding flags
  const neighbors = getNeighbors(board, row, col);
  const flaggedCount = neighbors.filter((neighbor) => neighbor.isFlagged).length;

  // Chord is possible if flags count == neighbor mines count
  return flaggedCount === cell.neighborMines;
}

/**
 * Perform a chord (quick-reveal) operation on a cell
 * Returns cells that should be revealed (non-flagged neighbors)
 * @param board - The game board
 * @param row - Row index
 * @param col - Column index
 * @returns Array of cells to reveal (empty array if cannot chord)
 */
export function chord(board: Cell[][], row: number, col: number): Cell[] {
  // Check if chord is possible
  if (!canChord(board, row, col)) {
    return [];
  }

  // Get all neighbors
  const neighbors = getNeighbors(board, row, col);

  // Return only non-flagged, non-revealed neighbors
  return neighbors.filter((neighbor) => !neighbor.isFlagged && !neighbor.isRevealed);
}

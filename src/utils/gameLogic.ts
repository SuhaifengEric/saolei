import { Cell } from '../types/game';

/**
 * Get all valid neighbor cells for a given position
 * @param board - The game board
 * @param row - Row index
 * @param col - Column index
 * @returns Array of neighboring cells (up to 8 for interior cells)
 */
export function getNeighbors(board: Cell[][], row: number, col: number): Cell[] {
  const rows = board.length;
  const cols = board[0].length;
  const neighbors: Cell[] = [];

  // Check all 8 directions
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) {
        continue; // Skip the cell itself
      }

      const newRow = row + dr;
      const newCol = col + dc;

      // Check boundaries
      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        neighbors.push(board[newRow][newCol]);
      }
    }
  }

  return neighbors;
}

/**
 * Reveal a cell on the board
 * If the cell has no neighbor mines, recursively reveal all neighbors
 * @param board - The game board
 * @param row - Row index of cell to reveal
 * @param col - Column index of cell to reveal
 * @returns Modified board with cells revealed
 */
export function revealCell(board: Cell[][], row: number, col: number): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;

  // Check boundaries
  if (row < 0 || row >= rows || col < 0 || col >= cols) {
    return board;
  }

  const cell = board[row][col];

  // Don't reveal flagged or already revealed cells
  if (cell.isFlagged || cell.isRevealed) {
    return board;
  }

  // Reveal the cell
  cell.isRevealed = true;

  // If cell is a mine, we're done (game over)
  if (cell.isMine) {
    return board;
  }

  // If cell has neighbor mines, reveal only this cell
  if (cell.neighborMines > 0) {
    return board;
  }

  // Cell is empty (neighborMines == 0), recursively reveal all neighbors
  const neighbors = getNeighbors(board, row, col);
  for (const neighbor of neighbors) {
    // Only reveal unrevealed, non-flagged cells
    if (!neighbor.isRevealed && !neighbor.isFlagged) {
      revealCell(board, neighbor.row, neighbor.col);
    }
  }

  return board;
}

/**
 * Check if the game has been won
 * Win condition: All non-mine cells are revealed
 * @param board - The game board
 * @param totalMines - Total number of mines on the board
 * @returns true if game is won, false otherwise
 */
export function checkWin(board: Cell[][], totalMines: number): boolean {
  const rows = board.length;
  const cols = board[0].length;
  const totalCells = rows * cols;
  const nonMineCells = totalCells - totalMines;

  let revealedCount = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isRevealed) {
        revealedCount++;
      }
    }
  }

  // Win if all non-mine cells are revealed
  return revealedCount === nonMineCells;
}

/**
 * Check if the game has been lost
 * Loss condition: Any mine cell has been revealed
 * @param board - The game board
 * @returns true if game is lost, false otherwise
 */
export function checkLoss(board: Cell[][]): boolean {
  const rows = board.length;
  const cols = board[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine && board[r][c].isRevealed) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get flagged neighbor cells for a given position
 * Used in chord operations to determine which cells to auto-reveal
 * @param board - The game board
 * @param row - Row index
 * @param col - Column index
 * @returns Array of flagged neighbor cells
 */
export function getChordCells(board: Cell[][], row: number, col: number): Cell[] {
  const neighbors = getNeighbors(board, row, col);
  
  // Filter to only flagged neighbors
  return neighbors.filter((neighbor) => neighbor.isFlagged);
}

/**
 * Reveal all mines on the board (used in replay mode)
 * @param board - The game board
 * @returns Modified board with all mines revealed
 */
export function revealAllMines(board: Cell[][]): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine) {
        board[r][c].isRevealed = true;
      }
    }
  }

  return board;
}

/**
 * Mark incorrectly flagged cells (used in replay mode)
 * @param board - The game board
 * @returns Array of incorrectly flagged cell positions
 */
export function getWrongFlags(board: Cell[][]): { row: number; col: number }[] {
  const rows = board.length;
  const cols = board[0].length;
  const wrongFlags: { row: number; col: number }[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isFlagged && !board[r][c].isMine) {
        wrongFlags.push({ row: r, col: c });
      }
    }
  }

  return wrongFlags;
}

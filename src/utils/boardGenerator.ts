import { Cell } from '../types/game';

/**
 * Simple seeded random number generator (Mulberry32 algorithm)
 * Browser-compatible, no external dependencies
 * @param seed - Base seed for the sequence
 * @returns Function that returns random numbers in [0, 1)
 */
function createSeededGenerator(seed: string): () => number {
  // Convert string seed to a numeric seed
  let state = 0;
  for (let i = 0; i < seed.length; i++) {
    state = (state * 31 + seed.charCodeAt(i)) >>> 0;
  }

  // Mulberry32 algorithm
  return () => {
    state += 0x6D2B79F5;
    let t = Math.imul(state ^ state >>> 15, state | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Generate a board with randomly placed mines using seeded random
 * @param rows - Number of rows in the board
 * @param cols - Number of columns in the board
 * @param mines - Number of mines to place
 * @param seed - Seed for reproducible random generation
 * @returns Board with mines placed
 */
export function generateBoard(
  rows: number,
  cols: number,
  mines: number,
  seed: string
): Cell[][] {
  // Initialize random number generator with seed
  const rng = createSeededGenerator(seed);

  // Create empty board
  const board: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
      board[r][c] = {
        row: r,
        col: c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      };
    }
  }

  // Place mines randomly
  let minesPlaced = 0;
  while (minesPlaced < mines) {
    const row = Math.floor(rng() * rows);
    const col = Math.floor(rng() * cols);

    // Don't place mine if there's already one
    if (!board[row][col].isMine) {
      board[row][col].isMine = true;
      minesPlaced++;
    }
  }

  return board;
}

/**
 * Calculate neighbor mines for each cell on the board
 * @param board - The game board
 * @returns Board with neighborMines calculated for each cell
 */
export function calculateNumbers(board: Cell[][]): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine) {
        continue; // Skip mines
      }

      let neighborCount = 0;

      // Check all 8 surrounding cells
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) {
            continue; // Skip the cell itself
          }

          const newRow = r + dr;
          const newCol = c + dc;

          // Check bounds
          if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            if (board[newRow][newCol].isMine) {
              neighborCount++;
            }
          }
        }
      }

      board[r][c].neighborMines = neighborCount;
    }
  }

  return board;
}

/**
 * Ensure first click is safe by moving mines if necessary
 * @param board - The game board
 * @param firstClickRow - Row of first click
 * @param firstClickCol - Column of first click
 * @returns Safe board with first click guaranteed to be safe
 */
export function ensureFirstClickSafety(
  board: Cell[][],
  firstClickRow: number,
  firstClickCol: number
): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;

  // Check if first click is already safe (no mine and no mines around)
  let isSafe = !board[firstClickRow][firstClickCol].isMine;

  if (isSafe) {
    // Check if any neighbors are mines
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const newRow = firstClickRow + dr;
        const newCol = firstClickCol + dc;

        if (
          newRow >= 0 &&
          newRow < rows &&
          newCol >= 0 &&
          newCol < cols &&
          board[newRow][newCol].isMine
        ) {
          isSafe = false;
          break;
        }
      }
      if (!isSafe) break;
    }
  }

  // If already safe, return the board as is
  if (isSafe) {
    return board;
  }

  // Find a safe location to move mines from
  // A safe location is any cell that is:
  // - Not the first click
  // - Not a neighbor of the first click
  // - Not already a mine (we want to move a mine there)

  // First, collect all unsafe cells (first click and its neighbors)
  const unsafeCells = new Set<string>();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const newRow = firstClickRow + dr;
      const newCol = firstClickCol + dc;

      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols
      ) {
        unsafeCells.add(`${newRow},${newCol}`);
      }
    }
  }

  // Find mines in unsafe area and safe cells without mines
  const minesInUnsafeArea: { row: number; col: number }[] = [];
  const safeCellsWithoutMines: { row: number; col: number }[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellKey = `${r},${c}`;

      if (board[r][c].isMine && unsafeCells.has(cellKey)) {
        // This is a mine in the unsafe area - we need to move it
        minesInUnsafeArea.push({ row: r, col: c });
      } else if (!board[r][c].isMine && !unsafeCells.has(cellKey)) {
        // This is a safe cell without a mine - we can place a mine here
        safeCellsWithoutMines.push({ row: r, col: c });
      }
    }
  }

  // Move mines from unsafe area to safe cells
  const movesToMake = Math.min(minesInUnsafeArea.length, safeCellsWithoutMines.length);

  for (let i = 0; i < movesToMake; i++) {
    const fromMine = minesInUnsafeArea[i];
    const toCell = safeCellsWithoutMines[i];

    // Move the mine
    board[fromMine.row][fromMine.col].isMine = false;
    board[toCell.row][toCell.col].isMine = true;
  }

  // Recalculate neighbor numbers
  return calculateNumbers(board);
}

/**
 * Validate custom difficulty settings
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param mines - Number of mines
 * @returns true if valid, false if invalid
 */
export function validateCustomDifficulty(
  rows: number,
  cols: number,
  mines: number
): boolean {
  const minSize = 5;
  const maxSize = 50;

  // Check board size limits
  if (rows < minSize || rows > maxSize) {
    return false;
  }

  if (cols < minSize || cols > maxSize) {
    return false;
  }

  // Check mine count (must be at least 1)
  if (mines < 1) {
    return false;
  }

  // Check mine density (must be less than 99%)
  const totalCells = rows * cols;
  const maxMines = Math.floor(totalCells * 0.99);

  if (mines > maxMines) {
    return false;
  }

  return true;
}

import { Cell } from '../types/game';

/**
 * 获取给定位置的所有有效邻居单元格
 * @param board - 游戏板
 * @param row - 行索引
 * @param col - 列索引
 * @returns 邻居单元格数组（内部单元格最多8个）
 */
export function getNeighbors(board: Cell[][], row: number, col: number): Cell[] {
  const rows = board.length;
  const cols = board[0].length;
  const neighbors: Cell[] = [];

  // 检查所有8个方向
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) {
        continue; // 跳过单元格本身
      }

      const newRow = row + dr;
      const newCol = col + dc;

      // 检查边界
      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        neighbors.push(board[newRow][newCol]);
      }
    }
  }

  return neighbors;
}

/**
 * 揭开游戏板上的一个单元格
 * 如果单元格周围没有地雷，递归揭开所有邻居
 * @param board - 游戏板
 * @param row - 要揭开的单元格的行索引
 * @param col - 要揭开的单元格的列索引
 * @returns 已修改的游戏板，包含已揭开的单元格
 */
export function revealCell(board: Cell[][], row: number, col: number): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;

  // 检查边界
  if (row < 0 || row >= rows || col < 0 || col >= cols) {
    return board;
  }

  const cell = board[row][col];

  // 不揭开已标记或已揭开的单元格
  if (cell.isFlagged || cell.isRevealed) {
    return board;
  }

  // 揭开单元格
  cell.isRevealed = true;

  // 如果单元格是地雷，游戏结束
  if (cell.isMine) {
    return board;
  }

  // 如果单元格周围有地雷，只揭开这个单元格
  if (cell.neighborMines > 0) {
    return board;
  }

  // 单元格是空的（周围没有地雷），递归揭开所有邻居
  const neighbors = getNeighbors(board, row, col);
  for (const neighbor of neighbors) {
    // 只揭开未揭开、未标记的单元格
    if (!neighbor.isRevealed && !neighbor.isFlagged) {
      revealCell(board, neighbor.row, neighbor.col);
    }
  }

  return board;
}

/**
 * 检查游戏是否获胜
 * 获胜条件：所有非地雷单元格都已揭开
 * @param board - 游戏板
 * @param totalMines - 游戏板上的地雷总数
 * @returns 如果游戏获胜返回true，否则返回false
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

  // 如果所有非地雷单元格都已揭开，游戏获胜
  return revealedCount === nonMineCells;
}

/**
 * 检查游戏是否失败
 * 失败条件：任何地雷单元格被揭开
 * @param board - 游戏板
 * @returns 如果游戏失败返回true，否则返回false
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
 * 获取给定位置的已标记邻居单元格
 * 用于和弦操作，确定哪些单元格需要自动揭开
 * @param board - 游戏板
 * @param row - 行索引
 * @param col - 列索引
 * @returns 已标记的邻居单元格数组
 */
export function getChordCells(board: Cell[][], row: number, col: number): Cell[] {
  const neighbors = getNeighbors(board, row, col);
  
  // 过滤出已标记的邻居
  return neighbors.filter((neighbor) => neighbor.isFlagged);
}

/**
 * 揭开游戏板上的所有地雷（用于回放模式）
 * @param board - 游戏板
 * @returns 已修改的游戏板，包含所有已揭开的地雷
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
 * 标记错误标记的单元格（用于回放模式）
 * @param board - 游戏板
 * @returns 错误标记的单元格位置数组
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

import { Cell } from '../types/game';
import { getNeighbors } from './gameLogic';

/**
 * 检查是否可以对单元格执行和弦（快速揭开）操作
 * 和弦操作可行的条件：
 * - 单元格已揭开
 * - 单元格周围有地雷（neighborMines > 0）
 * - 周围标记的数量等于周围地雷的数量
 * @param board - 游戏板
 * @param row - 行索引
 * @param col - 列索引
 * @returns 如果可以执行和弦操作返回true，否则返回false
 */
export function canChord(board: Cell[][], row: number, col: number): boolean {
  const rows = board.length;
  const cols = board[0].length;

  // 检查边界
  if (row < 0 || row >= rows || col < 0 || col >= cols) {
    return false;
  }

  const cell = board[row][col];

  // 单元格必须已揭开
  if (!cell.isRevealed) {
    return false;
  }

  // 单元格周围必须有地雷
  if (cell.neighborMines === 0) {
    return false;
  }

  // 计算周围标记的数量
  const neighbors = getNeighbors(board, row, col);
  const flaggedCount = neighbors.filter((neighbor) => neighbor.isFlagged).length;

  // 如果标记数量等于周围地雷数量，就可以执行和弦操作
  return flaggedCount === cell.neighborMines;
}

/**
 * 对单元格执行和弦（快速揭开）操作
 * 返回应该被揭开的单元格（未标记的邻居）
 * @param board - 游戏板
 * @param row - 行索引
 * @param col - 列索引
 * @returns 要揭开的单元格数组（如果不能执行和弦操作则返回空数组）
 */
export function chord(board: Cell[][], row: number, col: number): Cell[] {
  // 检查是否可以执行和弦操作
  if (!canChord(board, row, col)) {
    return [];
  }

  // 获取所有邻居
  const neighbors = getNeighbors(board, row, col);

  // 只返回未标记、未揭开的邻居
  return neighbors.filter((neighbor) => !neighbor.isFlagged && !neighbor.isRevealed);
}

/**
 * 游戏状态管理组合式函数
 * 提供游戏状态的管理和操作方法
 */
import { ref } from 'vue';
import type { Cell, GameStatus, Difficulty, GameData } from '../types/game';

export function useGameState() {
  // 当前游戏难度
  const difficulty = ref<Difficulty | null>(null);

  // 游戏状态数据
  const gameState = ref<GameData>({
    board: [], // 游戏板
    status: '' as GameStatus, // 游戏状态：initial, playing, won, lost
    timer: 0, // 游戏计时（秒）
    flags: 0, // 标记数量
    firstClick: true, // 是否是第一次点击
  });

  /**
   * 开始新游戏
   * @param newDifficulty - 新的游戏难度设置
   */
  const newGame = (newDifficulty: Difficulty): void => {
    difficulty.value = newDifficulty;

    // 创建新的游戏板
    gameState.value.board = createBoard(newDifficulty.rows, newDifficulty.cols);
    gameState.value.status = 'initial'; // 初始状态
    gameState.value.timer = 0; // 重置计时器
    gameState.value.flags = 0; // 重置标记数
    gameState.value.firstClick = true; // 重置第一次点击标志
  };

  /**
   * 开始游戏
   * 将游戏状态设置为正在进行
   */
  const startGame = (): void => {
    if (gameState.value.status !== 'playing') {
      gameState.value.status = 'playing';
    }
  };

  /**
   * 结束游戏
   * @param result - 游戏结果：won（获胜）或 lost（失败）
   */
  const endGame = (result: 'won' | 'lost'): void => {
    gameState.value.status = result;
  };

  /**
   * 更新计时器
   * 每秒调用一次，增加游戏时间
   */
  const updateTimer = (): void => {
    gameState.value.timer += 1;
  };

  /**
   * 揭开单元格
   * @param row - 单元格行索引
   * @param col - 单元格列索引
   */
  const revealCell = (row: number, col: number): void => {
    // 检查单元格是否有效
    if (!isValidCell(row, col)) {
      return;
    }

    const cell = gameState.value.board[row][col];

    // 如果单元格已揭开、已标记，或者游戏不在进行中，则不操作
    if (cell.isRevealed || cell.isFlagged || gameState.value.status !== 'playing') {
      return;
    }

    // 揭开单元格
    cell.isRevealed = true;

    // 如果是空白单元格（周围没有地雷），递归揭开邻居
    if (cell.neighborMines === 0 && !cell.isMine) {
      revealNeighbors(row, col);
    }
  };

  /**
   * 标记/取消标记单元格
   * @param row - 单元格行索引
   * @param col - 单元格列索引
   */
  const flagCell = (row: number, col: number): void => {
    // 检查单元格是否有效
    if (!isValidCell(row, col)) {
      return;
    }

    const cell = gameState.value.board[row][col];

    // 如果单元格已揭开，则不能标记
    if (cell.isRevealed) {
      return;
    }

    // 切换标记状态
    cell.isFlagged = !cell.isFlagged;
    // 更新标记数量
    gameState.value.flags += cell.isFlagged ? 1 : -1;
  };

  /**
   * 创建游戏板
   * @param rows - 行数
   * @param cols - 列数
   * @returns 创建好的游戏板
   */
  const createBoard = (rows: number, cols: number): Cell[][] => {
    const board: Cell[][] = [];

    // 初始化空游戏板
    for (let row = 0; row < rows; row++) {
      board[row] = [];
      for (let col = 0; col < cols; col++) {
        board[row][col] = {
          row,
          col,
          isMine: false, // 是否是地雷
          isRevealed: false, // 是否已揭开
          isFlagged: false, // 是否已标记
          neighborMines: 0, // 周围地雷数量
        };
      }
    }

    return board;
  };

  /**
   * 检查单元格是否有效
   * @param row - 行索引
   * @param col - 列索引
   * @returns 如果单元格有效返回true，否则返回false
   */
  const isValidCell = (row: number, col: number): boolean => {
    if (!difficulty.value) {
      return false;
    }

    // 检查行列是否在有效范围内
    return row >= 0 && row < difficulty.value.rows && col >= 0 && col < difficulty.value.cols;
  };

  /**
   * 揭开邻居单元格
   * @param row - 中心单元格行索引
   * @param col - 中心单元格列索引
   */
  const revealNeighbors = (row: number, col: number): void => {
    // 8个方向的邻居偏移量
    const neighbors = [
      [-1, -1], [-1, 0], [-1, 1], // 上方
      [0, -1],          [0, 1],   // 左右
      [1, -1], [1, 0], [1, 1],    // 下方
    ];

    // 遍历所有邻居
    for (const [dr, dc] of neighbors) {
      const newRow = row + dr;
      const newCol = col + dc;

      // 如果邻居单元格有效
      if (isValidCell(newRow, newCol)) {
        const neighborCell = gameState.value.board[newRow][newCol];
        // 如果邻居未揭开且未标记，则揭开它
        if (!neighborCell.isRevealed && !neighborCell.isFlagged) {
          revealCell(newRow, newCol);
        }
      }
    }
  };

  // 返回游戏状态和操作方法
  return {
    gameState, // 游戏状态
    difficulty, // 当前难度
    newGame, // 开始新游戏
    startGame, // 开始游戏
    endGame, // 结束游戏
    updateTimer, // 更新计时器
    revealCell, // 揭开单元格
    flagCell, // 标记单元格
  };
}

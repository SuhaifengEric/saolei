import { Cell } from '../types/game';

/**
 * 简单的种子随机数生成器（Mulberry32算法）
 * 兼容浏览器，无外部依赖
 * @param seed - 序列的基础种子
 * @returns 返回一个函数，该函数返回[0, 1)范围内的随机数
 */
function createSeededGenerator(seed: string): () => number {
  // 将字符串种子转换为数字种子
  let state = 0;
  for (let i = 0; i < seed.length; i++) {
    state = (state * 31 + seed.charCodeAt(i)) >>> 0;
  }

  // Mulberry32算法实现
  return () => {
    state += 0x6D2B79F5;
    let t = Math.imul(state ^ state >>> 15, state | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * 使用种子随机生成器创建带有随机放置地雷的游戏板
 * @param rows - 游戏板的行数
 * @param cols - 游戏板的列数
 * @param mines - 要放置的地雷数量
 * @param seed - 用于可重复随机生成的种子
 * @returns 已放置地雷的游戏板
 */
export function generateBoard(
  rows: number,
  cols: number,
  mines: number,
  seed: string
): Cell[][] {
  // 使用种子初始化随机数生成器
  const rng = createSeededGenerator(seed);

  // 创建空游戏板
  const board: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
      board[r][c] = {
        row: r,
        col: c,
        isMine: false, // 是否是地雷
        isRevealed: false, // 是否已揭开
        isFlagged: false, // 是否已标记
        neighborMines: 0, // 周围地雷数量
      };
    }
  }

  // 随机放置地雷
  let minesPlaced = 0;
  while (minesPlaced < mines) {
    const row = Math.floor(rng() * rows);
    const col = Math.floor(rng() * cols);

    // 如果已经有地雷，就不再放置
    if (!board[row][col].isMine) {
      board[row][col].isMine = true;
      minesPlaced++;
    }
  }

  return board;
}

/**
 * 计算游戏板上每个单元格周围的地雷数量
 * @param board - 游戏板
 * @returns 已计算每个单元格周围地雷数量的游戏板
 */
export function calculateNumbers(board: Cell[][]): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine) {
        continue; // 跳过地雷
      }

      let neighborCount = 0;

      // 检查周围8个单元格
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) {
            continue; // 跳过单元格本身
          }

          const newRow = r + dr;
          const newCol = c + dc;

          // 检查边界
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
 * 确保第一次点击是安全的，必要时移动地雷
 * @param board - 游戏板
 * @param firstClickRow - 第一次点击的行
 * @param firstClickCol - 第一次点击的列
 * @returns 保证第一次点击安全的游戏板
 */
export function ensureFirstClickSafety(
  board: Cell[][],
  firstClickRow: number,
  firstClickCol: number
): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;

  // 检查第一次点击是否已经安全（不是地雷且周围没有地雷）
  let isSafe = !board[firstClickRow][firstClickCol].isMine;

  if (isSafe) {
    // 检查是否有邻居是地雷
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

  // 如果已经安全，直接返回游戏板
  if (isSafe) {
    return board;
  }

  // 找到安全的位置来移动地雷
  // 安全位置是指：
  // - 不是第一次点击的位置
  // - 不是第一次点击的邻居
  // - 还不是地雷（我们要把地雷移到这里）

  // 首先，收集所有不安全的单元格（第一次点击及其邻居）
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

  // 找到不安全区域中的地雷和没有地雷的安全单元格
  const minesInUnsafeArea: { row: number; col: number }[] = [];
  const safeCellsWithoutMines: { row: number; col: number }[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellKey = `${r},${c}`;

      if (board[r][c].isMine && unsafeCells.has(cellKey)) {
        // 这是不安全区域中的地雷 - 我们需要移动它
        minesInUnsafeArea.push({ row: r, col: c });
      } else if (!board[r][c].isMine && !unsafeCells.has(cellKey)) {
        // 这是没有地雷的安全单元格 - 我们可以在这里放置地雷
        safeCellsWithoutMines.push({ row: r, col: c });
      }
    }
  }

  // 将地雷从不安全区域移动到安全单元格
  const movesToMake = Math.min(minesInUnsafeArea.length, safeCellsWithoutMines.length);

  for (let i = 0; i < movesToMake; i++) {
    const fromMine = minesInUnsafeArea[i];
    const toCell = safeCellsWithoutMines[i];

    // 移动地雷
    board[fromMine.row][fromMine.col].isMine = false;
    board[toCell.row][toCell.col].isMine = true;
  }

  // 重新计算邻居数字
  return calculateNumbers(board);
}

/**
 * 验证自定义难度设置
 * @param rows - 行数
 * @param cols - 列数
 * @param mines - 地雷数量
 * @returns 如果有效返回true，否则返回false
 */
export function validateCustomDifficulty(
  rows: number,
  cols: number,
  mines: number
): boolean {
  const minSize = 5; // 最小尺寸
  const maxSize = 50; // 最大尺寸

  // 检查游戏板大小限制
  if (rows < minSize || rows > maxSize) {
    return false;
  }

  if (cols < minSize || cols > maxSize) {
    return false;
  }

  // 检查地雷数量（至少为1）
  if (mines < 1) {
    return false;
  }

  // 检查地雷密度（必须小于99%）
  const totalCells = rows * cols;
  const maxMines = Math.floor(totalCells * 0.99);

  if (mines > maxMines) {
    return false;
  }

  return true;
}

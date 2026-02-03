<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import '../assets/styles/main.css';
import { useI18n } from '../composables/useI18n';
import type { Cell, Difficulty } from '../types/game';
import { getWrongFlags } from '../utils/gameLogic';
import { canChord } from '../utils/chordLogic';
import { playSound } from '../utils/audioManager';

const { language } = useI18n();

interface Props {
  board: Cell[][];
  gameState: string;
  difficulty: Difficulty | null;
}

const emit = defineEmits<{
  'cell-revealed': [row: number, col: number];
  'cell-flagged': [row: number, col: number];
  'chord-triggered': [row: number, col: number];
  'game-won': [];
  'game-lost': [];
}>();

const props = withDefaults(defineProps<Props>(), {
  board: () => [],
  gameState: 'initial',
  difficulty: null,
});

const focusedCell = ref<{ row: number; col: number } | null>(null);
const isReplayMode = ref(false);
const wrongFlags = ref<{ row: number; col: number }[]>([]);

// Check if game is in replay mode
watch(() => props.gameState, (newState) => {
  if (newState === 'lost') {
    isReplayMode.value = true;
    wrongFlags.value = getWrongFlags(props.board);
  } else {
    isReplayMode.value = false;
    wrongFlags.value = [];
  }
}, { immediate: true });



// Generate grid style for the board
const gridStyle = computed(() => {
  if (!props.board.length) return {};
  const cols = props.board[0].length;
  return {
    gridTemplateColumns: `repeat(${cols}, 32px)`,
  };
});

// Get cell class based on state
const getCellClass = (cell: Cell): string => {
  const classes = ['cell'];
  
  if (!cell.isRevealed) {
    if (cell.isFlagged) {
      classes.push('cell-flagged');
    } else {
      classes.push('cell-unrevealed');
    }
  } else {
    classes.push('cell-revealed');
    
    if (cell.isMine) {
      classes.push('cell-mine');
    } else if (cell.neighborMines > 0) {
      classes.push(`cell-${cell.neighborMines}`);
    }
  }
  
  // Check if this is a wrong flag
  if (isReplayMode.value && cell.isFlagged && !cell.isMine) {
    classes.push('cell-wrong-flag');
  }
  
  // Add reveal animation class
  if (cell.isRevealed) {
    classes.push('animate-reveal');
  }
  
  return classes.join(' ');
};

// Get cell content
const getCellContent = (cell: Cell): string => {
  // In replay mode, show X on wrong flags
  if (isReplayMode.value && cell.isFlagged && !cell.isMine) {
    return '❌';
  }
  
  if (cell.isFlagged) {
    return '🚩';
  }
  
  if (!cell.isRevealed) {
    return '';
  }
  
  if (cell.isMine) {
    return '💣';
  }
  
  if (cell.neighborMines > 0) {
    return cell.neighborMines.toString();
  }
  
  return '';
};

// Handle left click - reveal cell
const handleCellClick = (row: number, col: number) => {
  // Allow click in both 'initial' and 'playing' states
  if (props.gameState !== 'playing' && props.gameState !== 'initial') return;

  const cell = props.board[row][col];

  if (cell.isRevealed || cell.isFlagged) return;

  playSound('click');
  emit('cell-revealed', row, col);
};

// Handle right click - flag cell
const handleCellRightClick = (event: MouseEvent, row: number, col: number) => {
  event.preventDefault();

  // Allow flag in both 'initial' and 'playing' states
  if (props.gameState !== 'playing' && props.gameState !== 'initial') return;

  const cell = props.board[row][col];

  if (cell.isRevealed) return;

  playSound('flag');
  emit('cell-flagged', row, col);
};

// Handle double click - chord
const handleCellDoubleClick = (row: number, col: number) => {
  if (props.gameState !== 'playing') return;
  
  const cell = props.board[row][col];
  
  if (!cell.isRevealed) return;
  
  if (canChord(props.board, row, col)) {
    playSound('chord');
    emit('chord-triggered', row, col);
  }
};

// Handle keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (!focusedCell.value) return;
  
  const { row, col } = focusedCell.value;
  const rows = props.board.length;
  const cols = props.board[0].length;
  
  let newRow = row;
  let newCol = col;
  
  switch (event.key) {
    case 'ArrowUp':
      newRow = Math.max(0, row - 1);
      break;
    case 'ArrowDown':
      newRow = Math.min(rows - 1, row + 1);
      break;
    case 'ArrowLeft':
      newCol = Math.max(0, col - 1);
      break;
    case 'ArrowRight':
      newCol = Math.min(cols - 1, col + 1);
      break;
    case ' ':
    case 'Enter':
      event.preventDefault();
      handleCellClick(row, col);
      return;
    case 'f':
    case 'F':
      event.preventDefault();
      const mockMouseEvent = new MouseEvent('contextmenu');
      Object.defineProperty(mockMouseEvent, 'preventDefault', { value: () => {} });
      handleCellRightClick(mockMouseEvent, row, col);
      return;
    default:
      return;
  }
  
  if (newRow !== row || newCol !== col) {
    event.preventDefault();
    focusedCell.value = { row: newRow, col: newCol };
  }
};

// Handle cell focus
const handleCellFocus = (row: number, col: number) => {
  focusedCell.value = { row, col };
};

// Handle cell blur
const handleCellBlur = () => {
  focusedCell.value = null;
};

// Set up keyboard navigation
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="game-board-container">
    <div
      v-if="board.length === 0"
      class="empty-board"
    >
      <p class="text-muted">{{ language === 'zh' ? '开始新游戏！' : 'Start a new game to begin!' }}</p>
    </div>

    <div
      v-else
      class="game-board-wrapper"
      :class="{ 'replay-mode': isReplayMode }"
    >
      <div
        class="game-board"
        :style="gridStyle"
        role="grid"
        tabindex="0"
        @keydown="handleKeydown"
      >
        <div
          v-for="(row, rowIndex) in board"
          :key="rowIndex"
          style="display: contents"
        >
          <div
            v-for="(cell, colIndex) in row"
            :key="`${rowIndex}-${colIndex}`"
            :class="getCellClass(cell)"
            :tabindex="0"
            :aria-label="cell.isRevealed ? (cell.isMine ? 'Mine' : `${cell.neighborMines} mines nearby`) : 'Hidden cell'"
            :aria-hidden="cell.isFlagged ? 'false' : undefined"
            :data-focused="focusedCell?.row === rowIndex && focusedCell?.col === colIndex"
            :style="{ animationDelay: `${(rowIndex + colIndex) * 20}ms` }"
            role="gridcell"
            @click="handleCellClick(rowIndex, colIndex)"
            @contextmenu="(e) => handleCellRightClick(e, rowIndex, colIndex)"
            @dblclick="handleCellDoubleClick(rowIndex, colIndex)"
            @focus="handleCellFocus(rowIndex, colIndex)"
            @blur="handleCellBlur"
          >
            {{ getCellContent(cell) }}
          </div>
        </div>
      </div>

      <!-- Replay Mode Overlay -->
      <div
        v-if="isReplayMode"
        class="replay-overlay"
      >
        <div class="replay-content">
          <div class="replay-icon">💥</div>
          <h3 class="replay-title">{{ language === 'zh' ? '游戏结束' : 'Game Over' }}</h3>
          <p class="replay-message">{{ language === 'zh' ? '查看错误并重试！' : 'Review your mistakes and try again!' }}</p>
          <div class="replay-legend">
            <div class="legend-item">
              <span class="legend-emoji">💣</span>
              <span class="legend-text">{{ language === 'zh' ? '显示的地雷' : 'Mines revealed' }}</span>
            </div>
            <div class="legend-item">
              <span class="legend-emoji">❌</span>
              <span class="legend-text">{{ language === 'zh' ? '错误的标记' : 'Wrong flags' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-board-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-2);
}

.empty-board {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: var(--space-4);
  background-color: var(--bg-secondary);
  border-radius: 12px;
  border: 2px dashed var(--border-color);
}

.game-board-wrapper {
  position: relative;
  display: inline-block;
}

.game-board {
  display: grid;
  gap: 2px;
  padding: var(--space-2);
  background-color: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
}

.game-board-wrapper.replay-mode .game-board {
  opacity: 0.6;
  filter: blur(0.5px);
  pointer-events: none;
}

.audio-toggle {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-base);
  z-index: 10;
}

.audio-toggle:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--accent-primary);
  transform: scale(1.1);
}

.cell {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  border-radius: 4px;
  transition: all var(--transition-base);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  outline: none;
}

.cell:focus {
  outline: 2px solid var(--accent-primary);
  outline-offset: -2px;
  z-index: 1;
}

.cell[data-focused='true'] {
  outline: 2px solid var(--accent-primary);
  outline-offset: -2px;
  z-index: 1;
}

.cell-unrevealed {
  background-color: var(--cell-unrevealed);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.cell-unrevealed:hover {
  background-color: var(--cell-hover);
  transform: scale(1.05);
}

.cell-unrevealed:active {
  transform: scale(0.95);
}

.cell-revealed {
  background-color: var(--cell-revealed);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  cursor: default;
}

.cell-flagged {
  background-color: var(--cell-unrevealed);
  color: var(--flag-color);
  border: 1px solid var(--border-color);
}

.cell-flagged:hover {
  background-color: var(--cell-hover);
  transform: scale(1.05);
}

.cell-wrong-flag {
  background-color: rgba(239, 68, 68, 0.3) !important;
  border: 2px solid #ef4444 !important;
  animation: pulse-wrong 0.5s ease-in-out 3;
}

.cell-mine {
  background-color: var(--mine-color);
  color: white;
  border: 1px solid var(--mine-color);
  animation: shake 0.5s ease-in-out;
}

.cell-mine:hover {
  transform: scale(1.1);
}

/* Number colors for revealed cells */
.cell-1 { color: #3b82f6; }
.cell-2 { color: #10b981; }
.cell-3 { color: #ef4444; }
.cell-4 { color: #8b5cf6; }
.cell-5 { color: #f59e0b; }
.cell-6 { color: #06b6d4; }
.cell-7 { color: #64748b; }
.cell-8 { color: #1a1a2a; }

/* Animations */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

@keyframes pulse-wrong {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes reveal {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-reveal {
  animation: reveal 0.3s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

/* Replay Overlay */
.replay-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-in-out;
  z-index: 5;
}

.replay-content {
  text-align: center;
  color: white;
  padding: var(--space-4);
}

.replay-icon {
  font-size: 3rem;
  margin-bottom: var(--space-2);
  animation: shake 0.5s ease-in-out;
}

.replay-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-1);
}

.replay-message {
  font-size: var(--font-size-base);
  opacity: 0.9;
  margin-bottom: var(--space-3);
}

.replay-legend {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-sm);
}

.legend-emoji {
  font-size: 1.2rem;
}

.legend-text {
  opacity: 0.9;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .cell {
    width: 28px;
    height: 28px;
    font-size: var(--font-size-sm);
  }
  
  .game-board-container {
    padding: var(--space-1);
  }
  
  .audio-toggle {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .cell {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
  }
  
  .game-board {
    padding: var(--space-1);
    gap: 1px;
  }
  
  .replay-icon {
    font-size: 2rem;
  }
  
  .replay-title {
    font-size: var(--font-size-lg);
  }
  
  .replay-legend {
    flex-direction: column;
    gap: var(--space-1);
  }
}

/* Light mode number colors */
[data-theme='light'] .cell-1 { color: #2563eb; }
[data-theme='light'] .cell-2 { color: #059669; }
[data-theme='light'] .cell-3 { color: #dc2626; }
[data-theme='light'] .cell-4 { color: #7c3aed; }
[data-theme='light'] .cell-5 { color: #d97706; }
[data-theme='light'] .cell-6 { color: #0891b2; }
[data-theme='light'] .cell-7 { color: #475569; }
[data-theme='light'] .cell-8 { color: #0f172a; }
</style>

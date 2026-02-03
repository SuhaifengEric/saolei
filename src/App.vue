<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import './assets/styles/main.css';
import { useGameState } from './composables/useGameState';
import { useI18n } from './composables/useI18n';
import { revealCell as revealCellLogic, checkWin, checkLoss, revealAllMines } from './utils/gameLogic';
import { chord as chordLogic } from './utils/chordLogic';
import { generateBoard, calculateNumbers, ensureFirstClickSafety } from './utils/boardGenerator';
import { playSound } from './utils/audioManager';
import GameBoard from './components/GameBoard.vue';
import GameControls from './components/GameControls.vue';
import Timer from './components/Timer.vue';
import StatsPanel from './components/StatsPanel.vue';
import type { Difficulty } from './types/game';

// Use i18n composable
const { t, toggleLanguage, initializeLanguage, language } = useI18n();

// Use game state composable
const {
  gameState,
  difficulty,
  newGame,
  startGame,
  endGame,
  flagCell,
} = useGameState();

// Theme state
const isDarkTheme = ref(true);

// Stats panel ref
const statsPanelRef = ref<InstanceType<typeof StatsPanel> | null>(null);

// Keyboard focus state
const keyboardNavActive = ref(false);

// Timer interval
let timerInterval: number | null = null;

// Performance-based timer
let timerStartTime: number = 0;
let elapsedTime: number = 0;

// Toggle theme
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
  if (isDarkTheme.value) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
};

// Initialize theme
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('minesweeper_theme');
  if (savedTheme === 'light') {
    isDarkTheme.value = false;
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    isDarkTheme.value = true;
    document.documentElement.setAttribute('data-theme', 'dark');
  }
};

// Start the timer
const startTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  timerStartTime = performance.now();
  elapsedTime = 0;
  
  timerInterval = window.setInterval(() => {
    elapsedTime = Math.floor((performance.now() - timerStartTime) / 1000);
    gameState.value.timer = elapsedTime;
  }, 100);
};

// Stop the timer
const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

// Initialize board with mines (on first click)
const initializeBoard = (firstRow: number, firstCol: number) => {
  if (!difficulty.value) return;
  
  const seed = `${Date.now()}-${Math.random()}`;
  
  // Generate board with mines
  let board = generateBoard(
    difficulty.value.rows,
    difficulty.value.cols,
    difficulty.value.mines,
    seed
  );
  
  // Calculate neighbor numbers
  board = calculateNumbers(board);
  
  // Ensure first click is safe
  board = ensureFirstClickSafety(board, firstRow, firstCol);
  
  // Update game state
  gameState.value.board = board;
  gameState.value.firstClick = false;
};

// Handle new game from GameControls
const handleNewGame = (newDifficulty: Difficulty) => {
  stopTimer();
  newGame(newDifficulty);
};

// Handle cell reveal
const handleCellRevealed = (row: number, col: number) => {
  // Handle first click - place mines
  if (gameState.value.firstClick) {
    initializeBoard(row, col);
  }
  
  // Start timer if not running
  if (gameState.value.status !== 'playing') {
    startGame();
    startTimer();
  }
  
  // Reveal cell
  revealCellLogic(gameState.value.board, row, col);
  
  // Check game state
  if (checkLoss(gameState.value.board)) {
    // Reveal all mines
    revealAllMines(gameState.value.board);
    endGame('lost');
    stopTimer();
    playSound('mine');
    
    // Record game loss in stats
    if (statsPanelRef.value) {
      statsPanelRef.value.addGameRecord(difficulty.value!.name, 'lost', gameState.value.timer);
    }
  } else if (checkWin(gameState.value.board, difficulty.value!.mines)) {
    endGame('won');
    stopTimer();
    playSound('victory');
    
    // Record game win in stats
    if (statsPanelRef.value) {
      statsPanelRef.value.addGameRecord(difficulty.value!.name, 'won', gameState.value.timer);
    }
  }
};

// Handle cell flag
const handleCellFlagged = (row: number, col: number) => {
  flagCell(row, col);
};

// Handle chord operation
const handleChord = (row: number, col: number) => {
  const cellsToReveal = chordLogic(gameState.value.board, row, col);
  
  for (const cell of cellsToReveal) {
    handleCellRevealed(cell.row, cell.col);
  }
};

// Keyboard shortcuts
const handleGlobalKeydown = (event: KeyboardEvent) => {
  // F2 - New game
  if (event.key === 'F2') {
    event.preventDefault();
    if (difficulty.value) {
      handleNewGame(difficulty.value);
    }
  }
  
  // Enable keyboard navigation with arrow keys (detect keyboard usage)
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(event.key)) {
    keyboardNavActive.value = true;
  }
};

// Game status text
const gameStatusText = computed(() => {
  switch (gameState.value.status) {
    case 'initial':
      return t('status.initial');
    case 'playing':
      return keyboardNavActive.value ? t('status.playing.keyboard') : t('status.playing');
    case 'won':
      return t('status.won');
    case 'lost':
      return t('status.lost');
    default:
      return '';
  }
});

// Game status class
const gameStatusClass = computed(() => {
  switch (gameState.value.status) {
    case 'won':
      return 'text-success';
    case 'lost':
      return 'text-mine';
    default:
      return 'text-secondary';
  }
});

// Initialize on mount
onMounted(() => {
  initializeTheme();
  initializeLanguage();
  window.addEventListener('keydown', handleGlobalKeydown);
  
  // Set initial difficulty (Beginner)
  handleNewGame({
    name: language.value === 'zh' ? '初级' : 'Beginner',
    rows: 9,
    cols: 9,
    mines: 10,
  });
});

// Cleanup on unmount
onUnmounted(() => {
  stopTimer();
  window.removeEventListener('keydown', handleGlobalKeydown);
});

// Watch theme changes and save to localStorage
watch(isDarkTheme, (newValue) => {
  localStorage.setItem('minesweeper_theme', newValue ? 'dark' : 'light');
});
</script>

<template>
  <div class="app-container">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">
          <span class="title-icon">💣</span>
          {{ t('app.title') }}
        </h1>
        
        <div class="header-controls">
          <!-- Language Toggle -->
          <button
            class="lang-toggle"
            @click="toggleLanguage"
            :title="t('language.title')"
          >
            {{ language === 'zh' ? 'EN' : '中' }}
          </button>
          
          <!-- Theme Toggle -->
          <button 
            class="toggle-btn" 
            :data-active="isDarkTheme"
            @click="toggleTheme"
            :aria-label="isDarkTheme ? t('app.theme.light') : t('app.theme.dark')"
            :title="isDarkTheme ? t('app.theme.light') : t('app.theme.dark')"
          />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="app-main">
      <div class="main-layout">
        <!-- Left Sidebar - Controls -->
        <aside class="sidebar-left">
          <GameControls @new-game="handleNewGame" />
          
          <div class="timer-section card">
            <Timer 
              :seconds="gameState.timer" 
              :label="t('timer.label')"
              :show-label="true"
            />
          </div>
        </aside>

        <!-- Center - Game Board -->
        <section class="game-section">
          <!-- Game Status -->
          <div class="game-status card">
            <span :class="gameStatusClass" class="status-text">
              {{ gameStatusText }}
            </span>
          </div>

          <!-- Game Board -->
          <GameBoard
            :board="gameState.board"
            :game-state="gameState.status"
            :difficulty="difficulty"
            @cell-revealed="handleCellRevealed"
            @cell-flagged="handleCellFlagged"
            @chord-triggered="handleChord"
          />
        </section>

        <!-- Right Sidebar - Stats -->
        <aside class="sidebar-right">
          <StatsPanel ref="statsPanelRef" />
        </aside>
      </div>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-info">
          <span class="info-item">{{ t('footer.leftClick') }}</span>
          <span class="info-item">{{ t('footer.rightClick') }}</span>
          <span class="info-item">{{ t('footer.doubleClick') }}</span>
        </div>
        <div class="footer-shortcuts">
          <span class="shortcut">{{ t('footer.f2') }}</span>
          <span class="shortcut">{{ t('footer.arrows') }}</span>
          <span class="shortcut">{{ t('footer.enter') }}</span>
          <span class="shortcut">{{ t('footer.space') }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color var(--transition-smooth), color var(--transition-smooth);
}

/* Header */
.app-header {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: var(--space-3) var(--space-4);
  box-shadow: var(--shadow-sm);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1600px;
  margin: 0 auto;
}

.app-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
}

.title-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.header-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.lang-toggle {
  padding: 6px 12px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.lang-toggle:hover {
  background-color: var(--bg-elevated);
  border-color: var(--accent-primary);
}

/* Main Content */
.app-main {
  flex: 1;
  padding: var(--space-4);
  overflow: hidden;
}

.main-layout {
  display: grid;
  grid-template-columns: 300px 1fr 320px;
  gap: var(--space-4);
  max-width: 1600px;
  margin: 0 auto;
  height: calc(100vh - 200px);
}

/* Sidebar */
.sidebar-left,
.sidebar-right {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  overflow-y: auto;
}

.timer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3);
}

/* Game Section */
.game-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  overflow: auto;
  align-items: center;
  justify-content: flex-start;
}

.game-status {
  width: 100%;
  text-align: center;
  padding: var(--space-2) var(--space-3);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.status-text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
}

/* Footer */
.app-footer {
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: var(--space-2) var(--space-4);
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1600px;
  margin: 0 auto;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.footer-info,
.footer-shortcuts {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.info-item,
.shortcut {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: var(--font-weight-medium);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 280px 1fr;
  }

  .sidebar-right {
    display: none;
  }
}

@media (max-width: 992px) {
  .main-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
    height: auto;
    min-height: calc(100vh - 200px);
  }

  .sidebar-left {
    overflow: visible;
  }

  .game-section {
    order: -1;
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: var(--space-2) var(--space-3);
  }

  .app-title {
    font-size: var(--font-size-xl);
  }

  .title-icon {
    font-size: 2rem;
  }

  .app-main {
    padding: var(--space-2);
  }

  .main-layout {
    gap: var(--space-2);
  }

  .footer-info,
  .footer-shortcuts {
    font-size: 0.75rem;
    gap: var(--space-2);
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: var(--space-1) var(--space-2);
  }

  .app-title {
    font-size: var(--font-size-lg);
  }

  .title-icon {
    font-size: 1.5rem;
  }

  .footer-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .footer-info,
  .footer-shortcuts {
    flex-direction: column;
    gap: var(--space-1);
    align-items: flex-start;
    font-size: 0.75rem;
  }
}

/* Scrollbar for sidebars */
.sidebar-left::-webkit-scrollbar,
.sidebar-right::-webkit-scrollbar {
  width: 6px;
}

.sidebar-left::-webkit-scrollbar-track,
.sidebar-right::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
}

.sidebar-left::-webkit-scrollbar-thumb,
.sidebar-right::-webkit-scrollbar-thumb {
  background: var(--bg-elevated);
  border-radius: 3px;
}

.sidebar-left::-webkit-scrollbar-thumb:hover,
.sidebar-right::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>

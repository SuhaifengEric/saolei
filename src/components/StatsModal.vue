<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import '../assets/styles/main.css';
import { useI18n } from '../composables/useI18n';

const { t, language } = useI18n();

interface GameRecord {
  id: string;
  difficulty: string;
  result: 'won' | 'lost';
  time: number;
  timestamp: number;
}

interface Stats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  bestTime: number;
  bestTimeDifficulty: string;
}

const STATS_KEY = 'minesweeper_stats';
const LEADERBOARD_KEY = 'minesweeper_leaderboard';

const emit = defineEmits<{
  close: [];
}>();

const stats = ref<Stats>({
  totalGames: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
  bestTime: Infinity,
  bestTimeDifficulty: 'N/A',
});

const leaderboard = ref<GameRecord[]>([]);

// Load stats and leaderboard from localStorage
const loadStats = () => {
  try {
    const savedStats = localStorage.getItem(STATS_KEY);
    if (savedStats) {
      stats.value = JSON.parse(savedStats);
    }

    const savedLeaderboard = localStorage.getItem(LEADERBOARD_KEY);
    if (savedLeaderboard) {
      leaderboard.value = JSON.parse(savedLeaderboard);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
};

// Save stats to localStorage
const saveStats = () => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats.value));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
};

// Save leaderboard to localStorage
const saveLeaderboard = () => {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard.value));
  } catch (error) {
    console.error('Error saving leaderboard:', error);
  }
};

// Clear all stats
const clearStats = () => {
  if (confirm(language.value === 'zh' ? '确定要清除所有统计数据吗？' : 'Are you sure you want to clear all statistics?')) {
    stats.value = {
      totalGames: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      bestTime: Infinity,
      bestTimeDifficulty: 'N/A',
    };
    leaderboard.value = [];
    saveStats();
    saveLeaderboard();
  }
};

// Format time for display
const formatTime = (seconds: number): string => {
  if (seconds === Infinity) return '--';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

// Format date for display
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const locale = language.value === 'zh' ? 'zh-CN' : 'en-US';
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Computed property for formatted win rate
const formattedWinRate = computed(() => {
  return stats.value.winRate.toFixed(1);
});

// Computed property for sorted leaderboard
const sortedLeaderboard = computed(() => {
  return [...leaderboard.value].sort((a, b) => b.timestamp - a.timestamp);
});

// Load stats on mount
onMounted(() => {
  loadStats();
});
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">📊 {{ language === 'zh' ? '游戏统计' : 'Game Statistics' }}</h2>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- Stats Summary -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalGames }}</div>
            <div class="stat-label">{{ t('stats.totalGames') }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-value text-success">{{ stats.wins }}</div>
            <div class="stat-label">{{ t('stats.wins') }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-value text-mine">{{ stats.losses }}</div>
            <div class="stat-label">{{ t('stats.losses') }}</div>
          </div>

          <div class="stat-card">
            <div
              class="stat-value"
              :class="{ 'text-success': stats.winRate >= 50, 'text-mine': stats.winRate < 50 && stats.totalGames > 0 }"
            >
              {{ formattedWinRate }}%
            </div>
            <div class="stat-label">{{ t('stats.winRate') }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-value text-accent">
              {{ formatTime(stats.bestTime) }}
            </div>
            <div class="stat-label">{{ t('stats.bestTime') }}</div>
          </div>

          <div v-if="stats.bestTime !== Infinity" class="stat-card">
            <div class="stat-value">{{ stats.bestTimeDifficulty }}</div>
            <div class="stat-label">{{ language === 'zh' ? '最佳难度' : 'Best Difficulty' }}</div>
          </div>
        </div>

        <!-- Leaderboard -->
        <div class="leaderboard-section">
          <div class="leaderboard-header">
            <h3 class="leaderboard-title">{{ language === 'zh' ? '最近游戏' : 'Recent Games' }}</h3>
            <button
              class="clear-btn"
              @click="clearStats"
              :disabled="leaderboard.length === 0"
            >
              {{ language === 'zh' ? '清除全部' : 'Clear All' }}
            </button>
          </div>

          <div v-if="sortedLeaderboard.length === 0" class="empty-state">
            {{ t('stats.noRecords') }}
          </div>

          <div v-else class="leaderboard-list">
            <div
              v-for="(record, index) in sortedLeaderboard.slice(0, 20)"
              :key="record.id"
              class="leaderboard-item"
              :class="{
                'won': record.result === 'won',
                'lost': record.result === 'lost'
              }"
            >
              <div class="game-info">
                <span class="game-index">#{{ index + 1 }}</span>
                <span class="game-difficulty">{{ record.difficulty }}</span>
              </div>
              <div class="game-result">
                <span
                  class="result-badge"
                  :class="record.result === 'won' ? 'result-won' : 'result-lost'"
                >
                  {{ record.result === 'won' ? (language === 'zh' ? '胜利' : 'Win') : (language === 'zh' ? '失败' : 'Loss') }}
                </span>
                <span class="game-time">{{ formatTime(record.time) }}</span>
              </div>
              <div class="game-date">
                {{ formatDate(record.timestamp) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.modal-content {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.modal-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-primary);
  transition: all var(--transition-base);
}

.close-btn:hover {
  background-color: var(--mine-color);
  border-color: var(--mine-color);
  color: white;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.stat-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: var(--space-3);
  text-align: center;
  transition: all var(--transition-base);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Leaderboard Section */
.leaderboard-section {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: var(--space-3);
}

.leaderboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--border-color);
}

.leaderboard-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.clear-btn {
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.clear-btn:hover:not(:disabled) {
  background-color: var(--mine-color);
  border-color: var(--mine-color);
  color: white;
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: var(--space-6);
  color: var(--text-muted);
  font-size: var(--font-size-base);
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 400px;
  overflow-y: auto;
}

.leaderboard-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-2) var(--space-3);
  background-color: var(--bg-tertiary);
  border-radius: 8px;
  border-left: 4px solid transparent;
  transition: all var(--transition-base);
}

.leaderboard-item.won {
  border-left-color: var(--success-color);
}

.leaderboard-item.lost {
  border-left-color: var(--mine-color);
}

.leaderboard-item:hover {
  background-color: var(--bg-elevated);
}

.game-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.game-index {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  font-weight: var(--font-weight-medium);
  min-width: 30px;
}

.game-difficulty {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.game-result {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.result-badge {
  padding: 4px 8px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  border-radius: 4px;
}

.result-won {
  background-color: rgba(16, 185, 129, 0.2);
  color: var(--success-color);
}

.result-lost {
  background-color: rgba(239, 68, 68, 0.2);
  color: var(--mine-color);
}

.game-time {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  font-family: monospace;
}

.game-date {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  text-align: right;
}

/* Scrollbar */
.leaderboard-list::-webkit-scrollbar,
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.leaderboard-list::-webkit-scrollbar-track,
.modal-body::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 3px;
}

.leaderboard-list::-webkit-scrollbar-thumb,
.modal-body::-webkit-scrollbar-thumb {
  background: var(--bg-elevated);
  border-radius: 3px;
}

.leaderboard-list::-webkit-scrollbar-thumb:hover,
.modal-body::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--space-2);
  }

  .modal-content {
    max-height: 95vh;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-2);
  }

  .stat-value {
    font-size: var(--font-size-xl);
  }

  .leaderboard-item {
    grid-template-columns: 1fr auto;
    gap: var(--space-2);
  }

  .game-date {
    display: none;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .leaderboard-header {
    flex-direction: column;
    gap: var(--space-2);
    align-items: flex-start;
  }

  .leaderboard-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }

  .game-result {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

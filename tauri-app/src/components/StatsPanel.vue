<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import '../assets/styles/main.css';

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

const stats = ref<Stats>({
  totalGames: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
  bestTime: Infinity,
  bestTimeDifficulty: 'N/A',
});

const leaderboard = ref<GameRecord[]>([]);
const showDetails = ref(false);

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

// Add a new game record
const addGameRecord = (difficulty: string, result: 'won' | 'lost', time: number) => {
  const record: GameRecord = {
    id: Date.now().toString(),
    difficulty,
    result,
    time,
    timestamp: Date.now(),
  };

  // Add to leaderboard (keep last 100)
  leaderboard.value.unshift(record);
  if (leaderboard.value.length > 100) {
    leaderboard.value = leaderboard.value.slice(0, 100);
  }

  // Update stats
  stats.value.totalGames++;
  if (result === 'won') {
    stats.value.wins++;
    // Update best time
    if (time < stats.value.bestTime) {
      stats.value.bestTime = time;
      stats.value.bestTimeDifficulty = difficulty;
    }
  } else {
    stats.value.losses++;
  }

  stats.value.winRate = (stats.value.wins / stats.value.totalGames) * 100;

  saveStats();
  saveLeaderboard();
};

// Clear all stats
const clearStats = () => {
  if (confirm('Are you sure you want to clear all statistics?')) {
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
  return date.toLocaleDateString('en-US', {
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

// Expose methods for parent component
defineExpose({
  addGameRecord,
  clearStats,
});
</script>

<template>
  <div class="stats-panel card">
    <div class="stats-header">
      <h2 class="text-xl font-semibold">Statistics</h2>
      <button 
        class="btn btn-sm" 
        @click="showDetails = !showDetails"
        :aria-label="showDetails ? 'Hide details' : 'Show details'"
      >
        {{ showDetails ? 'Hide' : 'Details' }}
      </button>
    </div>

    <div class="stats-summary">
      <div class="stat-item">
        <div class="stat-label">Total Games</div>
        <div class="stat-value">{{ stats.totalGames }}</div>
      </div>

      <div class="stat-item">
        <div class="stat-label">Win Rate</div>
        <div 
          class="stat-value" 
          :class="{ 'text-success': stats.winRate >= 50, 'text-mine': stats.winRate < 50 && stats.totalGames > 0 }"
        >
          {{ formattedWinRate }}%
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-label">Best Time</div>
        <div class="stat-value text-accent">
          {{ formatTime(stats.bestTime) }}
        </div>
      </div>
    </div>

    <div v-if="showDetails" class="stats-details animate-slide-in">
      <div class="stats-breakdown">
        <div class="breakdown-item">
          <span class="breakdown-label">Wins:</span>
          <span class="breakdown-value text-success">{{ stats.wins }}</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-label">Losses:</span>
          <span class="breakdown-value text-mine">{{ stats.losses }}</span>
        </div>
        <div v-if="stats.bestTime !== Infinity" class="breakdown-item">
          <span class="breakdown-label">Best in:</span>
          <span class="breakdown-value">{{ stats.bestTimeDifficulty }}</span>
        </div>
      </div>

      <div class="leaderboard-section">
        <div class="leaderboard-header">
          <h3 class="text-lg font-semibold mb-2">Recent Games (Last 10)</h3>
          <button 
            class="btn btn-sm" 
            @click="clearStats"
            :class="{ 'text-muted': leaderboard.length === 0 }"
            :disabled="leaderboard.length === 0"
          >
            Clear All
          </button>
        </div>

        <div v-if="sortedLeaderboard.length === 0" class="empty-state">
          No games played yet
        </div>

        <div v-else class="leaderboard-list">
          <div 
            v-for="(record, index) in sortedLeaderboard.slice(0, 10)" 
            :key="record.id"
            class="leaderboard-item"
            :class="{ 
              'border-l-4 border-l-success': record.result === 'won',
              'border-l-4 border-l-mine': record.result === 'lost'
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
                {{ record.result === 'won' ? 'Win' : 'Loss' }}
              </span>
              <span class="game-time">{{ formatTime(record.time) }}</span>
            </div>
            <div class="game-date text-muted text-sm">
              {{ formatDate(record.timestamp) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-panel {
  min-width: 280px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-2);
  background-color: var(--bg-tertiary);
  border-radius: 8px;
  transition: all var(--transition-base);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  margin-bottom: 4px;
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.stats-details {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-color);
}

.stats-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background-color: var(--bg-tertiary);
  border-radius: 6px;
  font-size: var(--font-size-sm);
}

.breakdown-label {
  color: var(--text-secondary);
}

.breakdown-value {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.leaderboard-section {
  margin-top: var(--space-3);
}

.leaderboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.empty-state {
  text-align: center;
  padding: var(--space-4);
  color: var(--text-muted);
  font-style: italic;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 400px;
  overflow-y: auto;
}

.leaderboard-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--space-2);
  background-color: var(--bg-tertiary);
  border-radius: 6px;
  transition: all var(--transition-base);
  border-left-width: 4px;
  border-left-style: solid;
}

.leaderboard-item:hover {
  background-color: var(--bg-elevated);
  transform: translateX(2px);
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
}

.game-difficulty {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.game-result {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.result-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.result-won {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.result-lost {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.game-time {
  font-family: 'Courier New', 'Monaco', 'Consolas', monospace;
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.game-date {
  font-size: var(--font-size-sm);
  margin-top: 2px;
}

@media (max-width: 768px) {
  .stats-summary {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-1);
  }

  .stat-item {
    padding: var(--space-1);
  }

  .stat-value {
    font-size: var(--font-size-base);
  }
}

@media (max-width: 480px) {
  .stats-summary {
    grid-template-columns: 1fr;
  }

  .stat-item {
    flex-direction: row;
    justify-content: space-between;
  }

  .stat-label {
    margin-bottom: 0;
  }
}
</style>

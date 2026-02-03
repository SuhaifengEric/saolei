<script setup lang="ts">
/**
 * 游戏控制组件
 * 负责游戏难度选择和新游戏开始
 */
import { ref, computed, watch } from 'vue';
import '../assets/styles/main.css';
import { useI18n } from '../composables/useI18n';
import type { Difficulty } from '../types/game';

// 使用国际化组合式函数
const { t, language } = useI18n();

// 自定义难度接口
interface CustomDifficulty {
  rows: number; // 行数
  cols: number; // 列数
  mines: number; // 地雷数
}

// 难度级别类型
type DifficultyLevel = 'beginner' | 'intermediate' | 'expert' | 'custom';

// 组件事件
const emit = defineEmits<{
  'new-game': [difficulty: Difficulty]; // 开始新游戏
}>();

// 选中的难度级别
const selectedDifficulty = ref<DifficultyLevel>('beginner');
// 是否显示自定义难度设置
const showCustom = ref(false);

// 自定义难度设置
const customDifficulty = ref<CustomDifficulty>({
  rows: 16,
  cols: 30,
  mines: 99,
});

// 难度设置对象
const difficulties: Record<DifficultyLevel, Difficulty> = {
  beginner: {
    name: language.value === 'zh' ? '初级' : 'Beginner',
    rows: 9,
    cols: 9,
    mines: 10,
  },
  intermediate: {
    name: language.value === 'zh' ? '中级' : 'Intermediate',
    rows: 16,
    cols: 16,
    mines: 40,
  },
  expert: {
    name: language.value === 'zh' ? '高级' : 'Expert',
    rows: 16,
    cols: 30,
    mines: 99,
  },
  custom: {
    name: language.value === 'zh' ? '自定义' : 'Custom',
    rows: 16,
    cols: 30,
    mines: 99,
  },
};

// 验证自定义难度
const validateCustomDifficulty = computed(() => {
  const { rows, cols, mines } = customDifficulty.value;
  const totalCells = rows * cols;
  const maxMines = Math.floor(totalCells * 0.85); // 最多85%的格子是地雷
  
  return {
    valid: rows >= 5 && rows <= 30 && cols >= 5 && cols <= 30 && mines >= 1 && mines <= maxMines,
    maxMines,
  };
});

// 监听自定义难度和显示状态变化
watch([customDifficulty, showCustom], () => {
  if (selectedDifficulty.value === 'custom' && validateCustomDifficulty.value.valid) {
    difficulties.custom = {
      name: language.value === 'zh' ? '自定义' : 'Custom',
      rows: customDifficulty.value.rows,
      cols: customDifficulty.value.cols,
      mines: customDifficulty.value.mines,
    };
  }
}, { deep: true });

// 监听语言变化，更新难度名称
watch(language, (newLang) => {
  difficulties.beginner.name = newLang === 'zh' ? '初级' : 'Beginner';
  difficulties.intermediate.name = newLang === 'zh' ? '中级' : 'Intermediate';
  difficulties.expert.name = newLang === 'zh' ? '高级' : 'Expert';
  difficulties.custom.name = newLang === 'zh' ? '自定义' : 'Custom';
});

// 开始新游戏
const startNewGame = () => {
  const difficulty = difficulties[selectedDifficulty.value];
  emit('new-game', difficulty);
};

// 处理难度变化
const handleDifficultyChange = (level: DifficultyLevel) => {
  selectedDifficulty.value = level;
  showCustom.value = level === 'custom';
  startNewGame();
};

// Handle custom input change
const handleCustomInputChange = () => {
  // Validate and clamp values
  if (customDifficulty.value.rows < 5) customDifficulty.value.rows = 5;
  if (customDifficulty.value.rows > 30) customDifficulty.value.rows = 30;
  
  if (customDifficulty.value.cols < 5) customDifficulty.value.cols = 5;
  if (customDifficulty.value.cols > 30) customDifficulty.value.cols = 30;
  
  const maxMines = Math.floor((customDifficulty.value.rows * customDifficulty.value.cols) * 0.85);
  if (customDifficulty.value.mines < 1) customDifficulty.value.mines = 1;
  if (customDifficulty.value.mines > maxMines) customDifficulty.value.mines = maxMines;
};

// Apply custom difficulty
const applyCustomDifficulty = () => {
  if (validateCustomDifficulty.value.valid) {
    selectedDifficulty.value = 'custom';
    difficulties.custom = {
      name: language.value === 'zh' ? '自定义' : 'Custom',
      rows: customDifficulty.value.rows,
      cols: customDifficulty.value.cols,
      mines: customDifficulty.value.mines,
    };
    startNewGame();
  }
};

// Get validation error message
const validationError = computed(() => {
  const { rows, cols, mines } = customDifficulty.value;
  const maxMines = Math.floor((rows * cols) * 0.85);

  if (rows < 5 || rows > 30) {
    return t('controls.error.rows');
  }
  if (cols < 5 || cols > 30) {
    return t('controls.error.cols');
  }
  if (mines < 1) {
    return t('controls.error.mines.min');
  }
  if (mines > maxMines) {
    return t('controls.error.mines.max', { max: maxMines });
  }
  return '';
});
</script>

<template>
  <div class="game-controls">
    <div class="controls-header">
      <h2 class="text-xl font-semibold">{{ t('controls.title') }}</h2>
    </div>

    <div class="difficulty-selector">
      <div class="difficulty-label">{{ t('controls.difficulty') }}</div>
      <div class="difficulty-buttons">
        <button
          v-for="(diff, level) in difficulties"
          v-show="level !== 'custom'"
          :key="level"
          class="btn difficulty-btn"
          :class="{ 'btn-primary': selectedDifficulty === level }"
          @click="handleDifficultyChange(level)"
        >
          {{ diff.name }}
        </button>
        <button
          class="btn difficulty-btn"
          :class="{ 'btn-primary': selectedDifficulty === 'custom' }"
          @click="showCustom = !showCustom"
        >
          {{ t('controls.custom') }}
        </button>
      </div>
    </div>

    <!-- Custom Difficulty Panel -->
    <div v-if="showCustom" class="custom-panel animate-slide-in">
      <div class="custom-title">{{ t('controls.custom.title') }}</div>
      <div class="custom-inputs">
        <div class="input-group">
          <label class="input-label">{{ t('controls.custom.rows') }}</label>
          <input
            v-model.number="customDifficulty.rows"
            type="number"
            min="5"
            max="30"
            class="input"
            @input="handleCustomInputChange"
          >
        </div>

        <div class="input-group">
          <label class="input-label">{{ t('controls.custom.cols') }}</label>
          <input
            v-model.number="customDifficulty.cols"
            type="number"
            min="5"
            max="30"
            class="input"
            @input="handleCustomInputChange"
          >
        </div>

        <div class="input-group">
          <label class="input-label">{{ t('controls.custom.mines') }}</label>
          <input
            v-model.number="customDifficulty.mines"
            type="number"
            min="1"
            :max="validateCustomDifficulty.maxMines"
            class="input"
            @input="handleCustomInputChange"
          >
          <span v-if="!validateCustomDifficulty.valid" class="validation-error">
            {{ validationError }}
          </span>
        </div>
      </div>

      <button
        class="btn btn-primary w-full mt-2"
        :disabled="!validateCustomDifficulty.valid"
        @click="applyCustomDifficulty"
      >
        {{ t('controls.custom.apply') }}
      </button>
    </div>

    <!-- New Game Button -->
    <button class="btn btn-primary new-game-btn" @click="startNewGame">
      <span class="btn-icon">🔄</span>
      <span>{{ t('controls.newGame') }}</span>
      <span class="btn-shortcut">{{ t('controls.newGame.shortcut') }}</span>
    </button>

    <!-- Current Difficulty Info -->
    <div class="current-info">
      {{ t('controls.current') }}
      <span class="current-value">
        {{ difficulties[selectedDifficulty].name }}
        ({{ difficulties[selectedDifficulty].rows }}×{{ difficulties[selectedDifficulty].cols }}, {{ difficulties[selectedDifficulty].mines }} {{ language === 'zh' ? '地雷' : 'mines' }})
      </span>
    </div>
  </div>
</template>

<style scoped>
.game-controls {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: var(--space-3);
  box-shadow: var(--shadow-md);
}

.controls-header {
  margin-bottom: var(--space-3);
}

.difficulty-selector {
  margin-bottom: var(--space-3);
}

.difficulty-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-1);
}

.difficulty-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-1);
}

.difficulty-btn {
  font-size: var(--font-size-sm);
  padding: var(--space-1) var(--space-2);
  transition: all var(--transition-base);
}

.difficulty-btn:hover {
  transform: translateY(-2px);
}

.custom-panel {
  margin-top: var(--space-3);
  margin-bottom: var(--space-3);
  padding: var(--space-2);
  background-color: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.custom-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.custom-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.validation-error {
  font-size: 0.75rem;
  color: var(--mine-color);
  margin-top: 4px;
}

.new-game-btn {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  gap: var(--space-1);
  margin-bottom: var(--space-2);
}

.btn-icon {
  font-size: var(--font-size-lg);
}

.btn-shortcut {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-normal);
}

.current-info {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-align: center;
  padding: var(--space-1);
  background-color: var(--bg-tertiary);
  border-radius: 6px;
}

.current-value {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .difficulty-buttons {
    grid-template-columns: repeat(2, 1fr);
  }

  .custom-inputs {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .game-controls {
    padding: var(--space-2);
  }

  .difficulty-buttons {
    grid-template-columns: 1fr;
  }

  .btn-shortcut {
    display: none;
  }

  .new-game-btn {
    font-size: var(--font-size-sm);
  }
}
</style>

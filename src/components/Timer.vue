<script setup lang="ts">
/**
 * 计时器组件
 * 负责显示游戏时间
 */
import { computed } from 'vue';
import '../assets/styles/main.css';

// 组件属性
interface Props {
  seconds: number; // 秒数
  label?: string; // 标签
  showLabel?: boolean; // 是否显示标签
}

// 属性默认值
const props = withDefaults(defineProps<Props>(), {
  label: 'Time',
  showLabel: false,
});

// 格式化时间为 HH:MM:SS
const formattedTime = computed(() => {
  const hours = Math.floor(props.seconds / 3600);
  const minutes = Math.floor((props.seconds % 3600) / 60);
  const secs = props.seconds % 60;

  // 数字补零函数
  const pad = (num: number) => num.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }
  return `${pad(minutes)}:${pad(secs)}`;
});

// 为工具提示格式化时间
const fullFormattedTime = computed(() => {
  const hours = Math.floor(props.seconds / 3600);
  const minutes = Math.floor((props.seconds % 3600) / 60);
  const secs = props.seconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
});
</script>

<template>
  <div class="timer-container">
    <div v-if="showLabel" class="timer-label">
      {{ label }}
    </div>
    <div 
      class="timer-display" 
      :title="fullFormattedTime"
      :class="{ 'animate-pulse': seconds > 0 }"
    >
      {{ formattedTime }}
    </div>
  </div>
</template>

<style scoped>
.timer-container {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.timer-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.timer-display {
  font-family: 'Courier New', 'Monaco', 'Consolas', monospace;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  padding: var(--space-1) var(--space-3);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  min-width: 100px;
  text-align: center;
  transition: all var(--transition-base);
}

.timer-display:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--accent-primary);
  transform: scale(1.02);
}

@media (max-width: 768px) {
  .timer-display {
    font-size: var(--font-size-lg);
    padding: 6px var(--space-2);
    min-width: 80px;
  }
}

@media (max-width: 480px) {
  .timer-display {
    font-size: var(--font-size-base);
    padding: 4px var(--space-1);
    min-width: 70px;
  }
}
</style>

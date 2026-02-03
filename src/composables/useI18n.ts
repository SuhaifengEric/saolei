import { ref, computed } from 'vue';

export type Language = 'zh' | 'en';

interface Translations {
  [key: string]: string;
}

const zh: Translations = {
  // App
  'app.title': '💣 扫雷',
  'app.theme.dark': '深色模式',
  'app.theme.light': '浅色模式',

  // Game Controls
  'controls.title': '游戏控制',
  'controls.difficulty': '选择难度：',
  'controls.beginner': '初级',
  'controls.intermediate': '中级',
  'controls.expert': '高级',
  'controls.custom': '自定义',
  'controls.newGame': '新游戏',
  'controls.newGame.shortcut': '(F2)',
  'controls.current': '当前：',
  'controls.custom.title': '自定义难度',
  'controls.custom.rows': '行数 (5-30)',
  'controls.custom.cols': '列数 (5-30)',
  'controls.custom.mines': '地雷数',
  'controls.custom.apply': '应用自定义设置',
  'controls.error.rows': '行数必须在 5 到 30 之间',
  'controls.error.cols': '列数必须在 5 到 30 之间',
  'controls.error.mines.min': '至少需要 1 个地雷',
  'controls.error.mines.max': '此棋盘大小最多 {max} 个地雷',

  // Timer
  'timer.label': '时间',

  // Game Status
  'status.initial': '按 F2 或点击"新游戏"开始',
  'status.playing': '游戏进行中...',
  'status.playing.keyboard': '游戏进行中... (键盘已激活)',
  'status.won': '🎉 恭喜你赢了！',
  'status.lost': '💥 游戏结束！下次好运！',

  // Stats
  'stats.title': '游戏统计',
  'stats.totalGames': '总游戏数',
  'stats.wins': '胜利',
  'stats.losses': '失败',
  'stats.winRate': '胜率',
  'stats.bestTime': '最佳时间',
  'stats.avgTime': '平均时间',
  'stats.noRecords': '暂无记录',
  'stats.clear': '清除记录',
  'stats.difficulty.beginner': '初级',
  'stats.difficulty.intermediate': '中级',
  'stats.difficulty.expert': '高级',
  'stats.difficulty.custom': '自定义',

  // Game Board
  'board.empty': '开始新游戏！',
  'board.audio.mute': '静音',
  'board.audio.unmute': '取消静音',
  'board.replay.title': '游戏结束',
  'board.replay.message': '查看错误并重试！',
  'board.replay.mines': '显示的地雷',
  'board.replay.wrongFlags': '错误的标记',
  'board.cell.mine': '地雷',
  'board.cell.hidden': '隐藏格子',

  // Footer
  'footer.leftClick': '左键：揭开',
  'footer.rightClick': '右键：标记',
  'footer.doubleClick': '双击：和弦',
  'footer.f2': 'F2：新游戏',
  'footer.arrows': '方向键：导航',
  'footer.enter': '回车：揭开',
  'footer.space': '空格：标记',

  // Language
  'language.title': '语言',
  'language.zh': '中文',
  'language.en': 'English',
};

const en: Translations = {
  // App
  'app.title': '💣 Minesweeper',
  'app.theme.dark': 'Dark Mode',
  'app.theme.light': 'Light Mode',

  // Game Controls
  'controls.title': 'Game Controls',
  'controls.difficulty': 'Select Difficulty:',
  'controls.beginner': 'Beginner',
  'controls.intermediate': 'Intermediate',
  'controls.expert': 'Expert',
  'controls.custom': 'Custom',
  'controls.newGame': 'New Game',
  'controls.newGame.shortcut': '(F2)',
  'controls.current': 'Current: ',
  'controls.custom.title': 'Custom Difficulty',
  'controls.custom.rows': 'Rows (5-30)',
  'controls.custom.cols': 'Cols (5-30)',
  'controls.custom.mines': 'Mines',
  'controls.custom.apply': 'Apply Custom Settings',
  'controls.error.rows': 'Rows must be between 5 and 30',
  'controls.error.cols': 'Cols must be between 5 and 30',
  'controls.error.mines.min': 'At least 1 mine required',
  'controls.error.mines.max': 'Maximum {max} mines for this board size',

  // Timer
  'timer.label': 'Time',

  // Game Status
  'status.initial': 'Press F2 or click "New Game" to start',
  'status.playing': 'Game in progress...',
  'status.playing.keyboard': 'Game in progress... (Keyboard active)',
  'status.won': '🎉 Congratulations, you won!',
  'status.lost': '💥 Game over! Better luck next time!',

  // Stats
  'stats.title': 'Game Statistics',
  'stats.totalGames': 'Total Games',
  'stats.wins': 'Wins',
  'stats.losses': 'Losses',
  'stats.winRate': 'Win Rate',
  'stats.bestTime': 'Best Time',
  'stats.avgTime': 'Avg Time',
  'stats.noRecords': 'No records yet',
  'stats.clear': 'Clear Records',
  'stats.difficulty.beginner': 'Beginner',
  'stats.difficulty.intermediate': 'Intermediate',
  'stats.difficulty.expert': 'Expert',
  'stats.difficulty.custom': 'Custom',

  // Game Board
  'board.empty': 'Start a new game to begin!',
  'board.audio.mute': 'Mute',
  'board.audio.unmute': 'Unmute',
  'board.replay.title': 'Game Over',
  'board.replay.message': 'Review your mistakes and try again!',
  'board.replay.mines': 'Mines revealed',
  'board.replay.wrongFlags': 'Wrong flags',
  'board.cell.mine': 'Mine',
  'board.cell.hidden': 'Hidden cell',

  // Footer
  'footer.leftClick': 'Left Click: Reveal',
  'footer.rightClick': 'Right Click: Flag',
  'footer.doubleClick': 'Double Click: Chord',
  'footer.f2': 'F2: New Game',
  'footer.arrows': 'Arrows: Navigate',
  'footer.enter': 'Enter: Reveal',
  'footer.space': 'Space: Flag',

  // Language
  'language.title': 'Language',
  'language.zh': '中文',
  'language.en': 'English',
};

const translations: Record<Language, Translations> = { zh, en };

const currentLang = ref<Language>('zh');

export function useI18n() {
  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[currentLang.value][key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(`{${paramKey}}`, String(value));
      });
    }
    return text;
  };

  const setLanguage = (lang: Language) => {
    currentLang.value = lang;
    localStorage.setItem('minesweeper_language', lang);
  };

  const toggleLanguage = () => {
    const newLang = currentLang.value === 'zh' ? 'en' : 'zh';
    setLanguage(newLang);
  };

  const initializeLanguage = () => {
    const savedLang = localStorage.getItem('minesweeper_language') as Language;
    if (savedLang && translations[savedLang]) {
      currentLang.value = savedLang;
    }
  };

  const language = computed(() => currentLang.value);

  return {
    t,
    setLanguage,
    toggleLanguage,
    initializeLanguage,
    language,
  };
}

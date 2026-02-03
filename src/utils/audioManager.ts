/**
 * 音频管理器 - 使用 Web Audio API
 * 为游戏事件生成合成音效，无需外部文件
 */

export type SoundType = 'click' | 'flag' | 'victory' | 'mine' | 'chord';

class AudioManager {
  private context: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.3;

  constructor() {
    // 在首次用户交互时初始化音频上下文
    this.init();
  }

  /**
   * 初始化 AudioContext（必须在用户手势后完成）
   */
  private init(): void {
    if (!this.context) {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.context = new AudioContextClass();
      } catch (e) {
        console.warn('Web Audio API 不支持:', e);
      }
    }
  }

  /**
   * 如果音频上下文被暂停，恢复它（浏览器默认会暂停）
   */
  private resume(): void {
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  /**
   * 播放合成音效
   * @param type - 要播放的音效类型
   */
  play(type: SoundType): void {
    if (this.isMuted) return;
    
    this.init();
    this.resume();

    if (!this.context) return;

    switch (type) {
      case 'click':
        this.playClickSound();
        break;
      case 'flag':
        this.playFlagSound();
        break;
      case 'victory':
        this.playVictorySound();
        break;
      case 'mine':
        this.playMineSound();
        break;
      case 'chord':
        this.playChordSound();
        break;
    }
  }

  /**
   * 生成简单的点击音效（短促的高音哔声）
   */
  private playClickSound(): void {
    if (!this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.setValueAtTime(800, this.context.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(this.volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.1);
  }

  /**
   * 生成标记音效（短促的低音闷响）
   */
  private playFlagSound(): void {
    if (!this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.setValueAtTime(400, this.context.currentTime);
    oscillator.type = 'triangle';

    gainNode.gain.setValueAtTime(this.volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.15);
  }

  /**
   * 生成和弦音效（快速的音符序列）
   */
  private playChordSound(): void {
    if (!this.context) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, index) => {
      const oscillator = this.context!.createOscillator();
      const gainNode = this.context!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.context!.destination);

      oscillator.frequency.setValueAtTime(freq, this.context!.currentTime + index * 0.05);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(this.volume * 0.5, this.context!.currentTime + index * 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.context!.currentTime + index * 0.05 + 0.1);

      oscillator.start(this.context!.currentTime + index * 0.05);
      oscillator.stop(this.context!.currentTime + index * 0.05 + 0.1);
    });
  }

  /**
   * 生成胜利音效（上升的琶音）
   */
  private playVictorySound(): void {
    if (!this.context) return;

    // 琶音：C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const startTime = this.context.currentTime;

    notes.forEach((freq, index) => {
      const oscillator = this.context!.createOscillator();
      const gainNode = this.context!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.context!.destination);

      oscillator.frequency.setValueAtTime(freq, startTime + index * 0.12);
      oscillator.type = 'sine';

      const noteDuration = 0.2;
      gainNode.gain.setValueAtTime(this.volume, startTime + index * 0.12);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + index * 0.12 + noteDuration);

      oscillator.start(startTime + index * 0.12);
      oscillator.stop(startTime + index * 0.12 + noteDuration);
    });
  }

  /**
   * 生成地雷/爆炸音效（低频轰鸣）
   */
  private playMineSound(): void {
    if (!this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.setValueAtTime(100, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 0.3);
    oscillator.type = 'sawtooth';

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, this.context.currentTime);
    filter.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 0.3);

    gainNode.gain.setValueAtTime(this.volume * 0.8, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.3);
  }

  /**
   * 切换静音状态
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * 设置静音状态
   */
  setMute(muted: boolean): void {
    this.isMuted = muted;
  }

  /**
   * 获取当前静音状态
   */
  isAudioMuted(): boolean {
    return this.isMuted;
  }

  /**
   * 设置音量（0.0 到 1.0）
   */
  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * 获取当前音量
   */
  getVolume(): number {
    return this.volume;
  }
}

// 单例实例
let audioManagerInstance: AudioManager | null = null;

/**
 * 获取单例 AudioManager 实例
 */
export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
}

/**
 * 播放音效（便捷函数）
 */
export function playSound(type: SoundType): void {
  getAudioManager().play(type);
}

/**
 * 切换静音（便捷函数）
 */
export function toggleMute(): boolean {
  return getAudioManager().toggleMute();
}

/**
 * 获取音频静音状态（便捷函数）
 */
export function isAudioMuted(): boolean {
  return getAudioManager().isAudioMuted();
}

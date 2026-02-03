/**
 * Audio Manager using Web Audio API
 * Generates synthesized sounds for game events without external files
 */

export type SoundType = 'click' | 'flag' | 'victory' | 'mine' | 'chord';

class AudioManager {
  private context: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.3;

  constructor() {
    // Initialize audio context on first user interaction
    this.init();
  }

  /**
   * Initialize AudioContext (must be done after user gesture)
   */
  private init(): void {
    if (!this.context) {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.context = new AudioContextClass();
      } catch (e) {
        console.warn('Web Audio API not supported:', e);
      }
    }
  }

  /**
   * Resume audio context if suspended (browsers suspend by default)
   */
  private resume(): void {
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  /**
   * Play a synthesized sound
   * @param type - Type of sound to play
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
   * Generate a simple click sound (short, high-pitched beep)
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
   * Generate a flag sound (short, lower-pitched thud)
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
   * Generate a chord sound (quick sequence of notes)
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
   * Generate a victory sound (ascending arpeggio)
   */
  private playVictorySound(): void {
    if (!this.context) return;

    // Arpeggio: C5, E5, G5, C6
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
   * Generate a mine/explode sound (low-frequency rumble)
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
   * Toggle mute state
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Set mute state
   */
  setMute(muted: boolean): void {
    this.isMuted = muted;
  }

  /**
   * Get current mute state
   */
  isAudioMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }
}

// Singleton instance
let audioManagerInstance: AudioManager | null = null;

/**
 * Get the singleton AudioManager instance
 */
export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
}

/**
 * Play a sound (convenience function)
 */
export function playSound(type: SoundType): void {
  getAudioManager().play(type);
}

/**
 * Toggle mute (convenience function)
 */
export function toggleMute(): boolean {
  return getAudioManager().toggleMute();
}

/**
 * Get audio muted state (convenience function)
 */
export function isAudioMuted(): boolean {
  return getAudioManager().isAudioMuted();
}

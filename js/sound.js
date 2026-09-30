/**
 * MindSprint - Web Audio API Sound Synthesizer
 * Zero-dependency, low-latency, pleasant musical UI and gameplay sounds
 */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isUnlocked = false;

    // Load persisted preferences with safe fallbacks
    const storedEnabled = window.appStorage ? window.appStorage.getSetting('soundEnabled') : true;
    this.enabled = storedEnabled !== false;

    const storedVol = window.appStorage ? window.appStorage.getSetting('volume') : 0.8;
    this.volume = typeof storedVol === 'number' && !isNaN(storedVol) ? Math.max(0, Math.min(1, storedVol)) : 0.8;

    // Bind unlock events to ensure AudioContext awakens on any user interaction
    this.setupUnlockListeners();
  }

  setupUnlockListeners() {
    const unlockHandler = () => {
      this.unlockAudio();
    };

    const events = ['click', 'touchstart', 'touchend', 'keydown', 'pointerdown', 'mousedown'];
    events.forEach(evt => {
      window.addEventListener(evt, unlockHandler, { capture: true, passive: true });
      document.addEventListener(evt, unlockHandler, { capture: true, passive: true });
    });
  }

  unlockAudio() {
    this.initContext();
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => {
          this.isUnlocked = true;
        }).catch(() => {});
      } else if (this.ctx.state === 'running') {
        this.isUnlocked = true;
      }
    }
  }

  initContext() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx) {
        if (!this.masterGain) {
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      }
    } catch (e) {
      console.warn('AudioContext initialization error:', e);
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, parseFloat(val) || 0));
    if (window.appStorage) {
      window.appStorage.setSetting('volume', this.volume);
    }
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (window.appStorage) {
      window.appStorage.setSetting('soundEnabled', this.enabled);
    }
    if (this.enabled) {
      this.initContext();
      this.playTone(660, 'sine', 0.1, 0.3, 0);
      this.playTone(880, 'sine', 0.14, 0.3, 0.08);
    }
    return this.enabled;
  }

  /**
   * Internal tone generator with safe envelopes and sample-accurate timeline scheduling
   */
  playTone(freq, type = 'sine', duration = 0.12, gainVal = 0.3, timeOffset = 0) {
    if (!this.enabled || this.volume <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime;
      const startTime = now + Math.max(0, timeOffset);
      const stopTime = startTime + duration;

      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      // Safe linear envelope: attack + decay to eliminate harsh clicks
      const peakGain = Math.max(0.01, gainVal * this.volume);
      gainNode.gain.setValueAtTime(0.001, startTime);
      gainNode.gain.linearRampToValueAtTime(peakGain, startTime + Math.min(0.02, duration * 0.25));
      gainNode.gain.linearRampToValueAtTime(0.0001, stopTime);

      osc.connect(gainNode);
      if (this.masterGain) {
        gainNode.connect(this.masterGain);
      } else {
        gainNode.connect(this.ctx.destination);
      }

      osc.start(startTime);
      osc.stop(stopTime);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // --- UI & Interaction Sounds ---

  playClick() {
    if (!this.enabled || this.volume <= 0) return;
    // Pleasant, modern crisp UI click
    this.playTone(680, 'triangle', 0.05, 0.35, 0);
    this.playTone(920, 'sine', 0.04, 0.25, 0.015);
  }

  playCorrect() {
    if (!this.enabled || this.volume <= 0) return;
    // Ascending melodic success chord (C5, E5, G5, C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sine', 0.18, 0.35, idx * 0.07);
    });
  }

  playWrong() {
    if (!this.enabled || this.volume <= 0) return;
    // Soft, clear low error indicator
    this.playTone(196, 'sawtooth', 0.14, 0.25, 0);
    this.playTone(146.83, 'sawtooth', 0.24, 0.28, 0.07);
  }

  playGameStart() {
    if (!this.enabled || this.volume <= 0) return;
    // Upbeat energetic start fanfare
    const chord = [440, 554.37, 659.25, 880];
    chord.forEach((freq, i) => {
      this.playTone(freq, 'triangle', 0.22, 0.3, i * 0.08);
    });
  }

  playLevelUp() {
    if (!this.enabled || this.volume <= 0) return;
    // Celebratory victory arpeggio
    const scale = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    scale.forEach((freq, i) => {
      this.playTone(freq, 'triangle', 0.24, 0.35, i * 0.06);
    });
  }

  playGameOver() {
    if (!this.enabled || this.volume <= 0) return;
    // Gentle descending completion chord
    const notes = [440, 392, 349.23, 261.63];
    notes.forEach((freq, i) => {
      this.playTone(freq, 'sine', 0.35, 0.25, i * 0.12);
    });
  }

  playTick() {
    if (!this.enabled || this.volume <= 0) return;
    // Metronome countdown clock tick
    this.playTone(1200, 'sine', 0.03, 0.25, 0);
  }

  testSound() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    const melody = [523.25, 659.25, 783.99, 1046.50];
    melody.forEach((freq, i) => {
      this.playTone(freq, 'triangle', 0.22, 0.4, i * 0.1);
    });
  }
}

window.appSound = new SoundManager();

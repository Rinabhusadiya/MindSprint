/**
 * MindSprint - Game 2: Memory Sequence
 * Memorize and reproduce icon sequences in identical order
 */

window.GAME_MODULES['memory_sequence'] = {
  iconsPool: ['⭐️', '🚀', '🍀', '⚡️', '💎', '🔥', '🌸', '🔮'],

  start(container, options) {
    this.container = container;
    this.engine = options.engine;
    this.difficulty = options.difficulty;
    this.isRelaxMode = options.isRelaxMode;
    this.level = 1;
    this.maxLevel = 5;
    this.engine.totalQuestions = this.maxLevel;
    this.engine.correctAnswers = 0;

    // Sequence length starts at 3 or 4 based on difficulty
    const startLengths = { easy: 3, medium: 4, hard: 5 };
    this.seqLength = startLengths[this.difficulty] || 4;

    this.startLevel();
  },

  startLevel() {
    if (this.level > this.maxLevel) {
      this.engine.finishGame(true);
      return;
    }

    // Generate random sequence
    this.currentSequence = [];
    for (let i = 0; i < this.seqLength; i++) {
      const randIcon = this.iconsPool[Math.floor(Math.random() * this.iconsPool.length)];
      this.currentSequence.push(randIcon);
    }
    this.userPicks = [];

    // Phase 1: Memorization Display
    this.container.innerHTML = `
      <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
        Level ${this.level} of ${this.maxLevel} • Memorize the sequence!
      </div>
      <div class="sequence-display-bar" id="seq-display-bar">
        ${this.currentSequence.map(icon => `<div class="sequence-item-pill highlight">${icon}</div>`).join('')}
      </div>
      <div style="font-size: 0.95rem; font-weight: 600; color: var(--primary-400);" id="seq-status-text">
        Memorize: ${this.currentSequence.length} items...
      </div>
    `;

    const displayTimeMs = Math.max(1600, this.seqLength * 750);
    this.engine.startCountdownTimer(Math.ceil(displayTimeMs / 1000) + 12, null);

    this.timerTimeout = setTimeout(() => {
      this.showInputPhase();
    }, displayTimeMs);
  },

  showInputPhase() {
    this.container.innerHTML = `
      <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
        Level ${this.level} of ${this.maxLevel} • Reproduce in exact order!
      </div>

      <div class="sequence-display-bar" id="seq-display-bar">
        ${this.currentSequence.map((_, i) => `<div class="sequence-item-pill" id="seq-slot-${i}">?</div>`).join('')}
      </div>

      <div class="sequence-input-pad">
        ${this.iconsPool.map(icon => `
          <button class="sequence-choice-btn" data-icon="${icon}">${icon}</button>
        `).join('')}
      </div>
      <div style="margin-top: 1rem;">
        <button class="btn-secondary" id="seq-clear-btn" style="padding: 0.4rem 1rem; font-size: 0.85rem;">Clear</button>
      </div>
    `;

    const padButtons = this.container.querySelectorAll('.sequence-choice-btn');
    padButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const icon = btn.getAttribute('data-icon');
        this.handleIconClick(icon);
      });
    });

    const clearBtn = document.getElementById('seq-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.userPicks = [];
        for (let i = 0; i < this.currentSequence.length; i++) {
          const slot = document.getElementById(`seq-slot-${i}`);
          if (slot) slot.textContent = '?';
        }
      });
    }
  },

  handleIconClick(icon) {
    if (this.userPicks.length >= this.currentSequence.length) return;

    const currentIdx = this.userPicks.length;
    this.userPicks.push(icon);

    const slot = document.getElementById(`seq-slot-${currentIdx}`);
    if (slot) {
      slot.textContent = icon;
      slot.classList.add('highlight');
    }

    if (window.appSound) window.appSound.playClick();

    // If filled all slots, verify
    if (this.userPicks.length === this.currentSequence.length) {
      this.verifySequence();
    }
  },

  verifySequence() {
    const isCorrect = this.userPicks.every((icon, i) => icon === this.currentSequence[i]);

    if (isCorrect) {
      if (window.appSound) window.appSound.playCorrect();
      this.engine.addScore(30 * this.level);
      this.engine.incrementCombo();
      this.engine.correctAnswers += 1;
      this.level += 1;
      this.seqLength += 1; // Increase length next level!

      setTimeout(() => {
        this.startLevel();
      }, 1000);
    } else {
      if (window.appSound) window.appSound.playWrong();
      // Show correct icons
      for (let i = 0; i < this.currentSequence.length; i++) {
        const slot = document.getElementById(`seq-slot-${i}`);
        if (slot) {
          slot.textContent = this.currentSequence[i];
          slot.style.borderColor = '#ef4444';
        }
      }
      this.engine.loseLife();
      this.level += 1;

      setTimeout(() => {
        this.startLevel();
      }, 1400);
    }
  },

  cleanup() {
    if (this.timerTimeout) clearTimeout(this.timerTimeout);
  }
};

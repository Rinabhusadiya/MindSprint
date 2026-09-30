/**
 * MindSprint - Game 11: Number Memory
 * Numerical span retention and working memory recall
 */

window.GAME_MODULES['number_memory'] = {
  start(container, options) {
    this.container = container;
    this.engine = options.engine;
    this.difficulty = options.difficulty;
    this.isRelaxMode = options.isRelaxMode;
    this.level = 1;
    this.maxLevel = 5;
    this.engine.totalQuestions = this.maxLevel;
    this.engine.correctAnswers = 0;

    // Digits start at 3 (easy), 4 (medium), 5 (hard)
    const baseDigits = { easy: 3, medium: 4, hard: 5 };
    this.digitsCount = baseDigits[this.difficulty] || 4;

    this.startLevel();
  },

  generateNumber(length) {
    let str = '';
    // First digit 1-9
    str += Math.floor(Math.random() * 9) + 1;
    for (let i = 1; i < length; i++) {
      str += Math.floor(Math.random() * 10);
    }
    return str;
  },

  startLevel() {
    if (this.level > this.maxLevel) {
      this.engine.finishGame(true);
      return;
    }

    this.currentNumber = this.generateNumber(this.digitsCount);

    // Phase 1: Memorization Display
    this.container.innerHTML = `
      <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
        Level ${this.level} of ${this.maxLevel} • Memorize the ${this.digitsCount}-digit number!
      </div>

      <div class="number-memory-flash">${this.currentNumber}</div>

      <div style="font-size: 0.9rem; color: var(--primary-400); font-weight: 600;">
        Memorize now...
      </div>
    `;

    // Display time proportional to digits length
    const displayDuration = Math.max(1800, this.digitsCount * 800);
    this.displayTimeout = setTimeout(() => {
      this.showInputPhase();
    }, displayDuration);
  },

  showInputPhase() {
    this.container.innerHTML = `
      <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
        Level ${this.level} of ${this.maxLevel} • Enter the exact number:
      </div>

      <div class="number-memory-input-wrap">
        <input type="text" id="num-mem-input" class="number-memory-input" placeholder="Type here..." autocomplete="off" autofocus />

        <!-- Numpad for Touch / Quick Access -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; width: 100%; max-width: 280px; margin-top: 0.5rem;">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `
            <button class="choice-btn numpad-btn" data-n="${n}" style="padding: 0.75rem; font-size: 1.25rem;">${n}</button>
          `).join('')}
          <button class="choice-btn numpad-btn" data-action="back" style="padding: 0.75rem; font-size: 1.1rem;">⌫</button>
          <button class="choice-btn numpad-btn" data-n="0" style="padding: 0.75rem; font-size: 1.25rem;">0</button>
          <button class="btn-primary" id="btn-num-submit" style="padding: 0.75rem; font-size: 1rem; border-radius: var(--radius-md);">Submit</button>
        </div>
      </div>
    `;

    const input = document.getElementById('num-mem-input');
    if (input) {
      input.focus();
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.submitNumber(input.value.trim());
        }
      });
    }

    // Numpad clicks
    this.container.querySelectorAll('.numpad-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!input) return;
        const n = btn.getAttribute('data-n');
        const action = btn.getAttribute('data-action');
        if (n !== null) {
          input.value += n;
        } else if (action === 'back') {
          input.value = input.value.slice(0, -1);
        }
        if (window.appSound) window.appSound.playClick();
      });
    });

    const submitBtn = document.getElementById('btn-num-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (input) this.submitNumber(input.value.trim());
      });
    }

    this.engine.startCountdownTimer(15, () => {
      if (input) this.submitNumber(input.value.trim());
    });
  },

  submitNumber(entered) {
    this.engine.stopTimer();
    const isCorrect = entered === this.currentNumber;

    this.container.innerHTML = `
      <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
        Level ${this.level} of ${this.maxLevel} • Result
      </div>

      <div style="background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.75rem; width: 100%; max-width: 480px; text-align: center;">
        <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">${isCorrect ? '🎉 Correct!' : '❌ Not Quite'}</div>
        <div style="font-size: 1rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
          Correct Number: <strong style="color: #10b981; font-size: 1.35rem; letter-spacing: 0.1em;">${this.currentNumber}</strong>
        </div>
        <div style="font-size: 1rem; color: var(--text-secondary);">
          Your Entry: <strong style="color: ${isCorrect ? '#10b981' : '#ef4444'}; font-size: 1.35rem; letter-spacing: 0.1em;">${entered || '(empty)'}</strong>
        </div>
      </div>
    `;

    if (isCorrect) {
      if (window.appSound) window.appSound.playCorrect();
      this.engine.addScore(30 * this.level);
      this.engine.incrementCombo();
      this.engine.correctAnswers += 1;
      this.digitsCount += 1; // Increase length next level!
    } else {
      if (window.appSound) window.appSound.playWrong();
      this.engine.loseLife();
    }

    setTimeout(() => {
      this.level += 1;
      this.startLevel();
    }, 1500);
  },

  cleanup() {
    if (this.displayTimeout) clearTimeout(this.displayTimeout);
  }
};

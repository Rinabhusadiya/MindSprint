/**
 * MindSprint - Game 3: Find The Different
 * Fast visual anomaly scanning and attention to nuance
 */

window.GAME_MODULES['find_different'] = {
  pairs: [
    // Faces & Expressions
    { base: '😀', odd: '😃' },
    { base: '🙂', odd: '🙃' },
    { base: '😌', odd: '😊' },
    { base: '🧐', odd: '🤓' },
    { base: '😮', odd: '😲' },
    { base: '😎', odd: '😏' },
    { base: '🤩', odd: '😍' },
    { base: '🤔', odd: '🤨' },

    // Animals
    { base: '🐱', odd: '🐯' },
    { base: '🦊', odd: '🐺' },
    { base: '🐼', odd: '🐨' },
    { base: '🐸', odd: '🦎' },
    { base: '🐰', odd: '🐭' },
    { base: '🐴', odd: '🦄' },
    { base: '🦅', odd: '🦉' },
    { base: '🐢', odd: '🐍' },
    { base: '🦋', odd: '🐝' },
    { base: '🐬', odd: '🐋' },

    // Food & Fruits
    { base: '🍎', odd: '🍏' },
    { base: '🍋', odd: '🍊' },
    { base: '🍩', odd: '🍪' },
    { base: '🥑', odd: '🥒' },
    { base: '🍓', odd: '🍒' },
    { base: '🥞', odd: '🧇' },
    { base: '🍇', odd: '🫐' },
    { base: '🥐', odd: '🥖' },
    { base: '🧁', odd: '🍰' },
    { base: '🍕', odd: '🥪' },

    // Celestial, Nature & Gems
    { base: '🌕', odd: '🌖' },
    { base: '🌟', odd: '✨' },
    { base: '💎', odd: '🔷' },
    { base: '☀️', odd: '🌤️' },
    { base: '🌹', odd: '🌷' },
    { base: '🍁', odd: '🍂' },
    { base: '☘️', odd: '🍀' },
    { base: '⚡️', odd: '🔥' },
    { base: '🌊', odd: '💧' },
    { base: '🍄', odd: '🌰' },

    // Objects, Symbols & Clocks
    { base: '🏀', odd: '⚽️' },
    { base: '❤️', odd: '💖' },
    { base: '🕐', odd: '🕑' },
    { base: '🎲', odd: '🎯' },
    { base: '🚗', odd: '🚙' },
    { base: '🚀', odd: '🛸' },
    { base: '🔔', odd: '🔕' },
    { base: '🔒', odd: '🔓' },
    { base: '💡', odd: '🕯️' },
    { base: '🛡️', odd: '⚔️' }
  ],
  unseenPairs: [],

  pickPair() {
    if (!this.unseenPairs || this.unseenPairs.length === 0) {
      this.unseenPairs = [...this.pairs].sort(() => Math.random() - 0.5);
    }
    const pair = this.unseenPairs.pop();
    // Dynamically flip base and odd 50% of the time for double variation
    if (Math.random() > 0.5) {
      return { base: pair.odd, odd: pair.base };
    }
    return pair;
  },

  start(container, options) {
    this.container = container;
    this.engine = options.engine;
    this.difficulty = options.difficulty;
    this.isRelaxMode = options.isRelaxMode;
    this.round = 1;
    this.totalRounds = 6;
    this.engine.totalQuestions = this.totalRounds;
    this.engine.correctAnswers = 0;

    this.nextRound();
  },

  nextRound() {
    if (this.round > this.totalRounds) {
      this.engine.finishGame(true);
      return;
    }

    // Grid size scales with round and difficulty
    // Easy: 3x3 to 4x4, Medium: 3x3 to 5x5, Hard: 4x4 to 6x6
    let gridSize = 3;
    if (this.difficulty === 'easy') {
      gridSize = this.round <= 3 ? 3 : 4;
    } else if (this.difficulty === 'medium') {
      gridSize = this.round <= 2 ? 3 : this.round <= 4 ? 4 : 5;
    } else {
      gridSize = this.round <= 2 ? 4 : this.round <= 4 ? 5 : 6;
    }

    const totalCells = gridSize * gridSize;
    const oddIndex = Math.floor(Math.random() * totalCells);
    const pair = this.pickPair();

    const roundSeconds = Math.max(5, 14 - this.round * 1.2);
    this.engine.startCountdownTimer(Math.round(roundSeconds), () => {
      this.handleTimeout();
    });

    this.container.innerHTML = `
      <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
        Round ${this.round} of ${this.totalRounds} • Spot the odd item! (${gridSize}×${gridSize})
      </div>
      <div class="find-grid-container" style="grid-template-columns: repeat(${gridSize}, 1fr);" id="find-grid">
        ${Array.from({ length: totalCells }).map((_, i) => {
          const isOdd = i === oddIndex;
          const char = isOdd ? pair.odd : pair.base;
          return `<button class="find-cell-btn" data-odd="${isOdd}">${char}</button>`;
        }).join('')}
      </div>
    `;

    const buttons = this.container.querySelectorAll('.find-cell-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const isOdd = btn.getAttribute('data-odd') === 'true';
        this.handlePick(isOdd, btn, buttons);
      });
    });
  },

  handlePick(isOdd, clickedBtn, allButtons) {
    this.engine.stopTimer();
    allButtons.forEach(b => b.style.pointerEvents = 'none');

    if (isOdd) {
      clickedBtn.style.background = 'rgba(16, 185, 129, 0.3)';
      clickedBtn.style.borderColor = '#10b981';
      if (window.appSound) window.appSound.playCorrect();
      this.engine.addScore(25);
      this.engine.incrementCombo();
      this.engine.correctAnswers += 1;
    } else {
      clickedBtn.style.background = 'rgba(239, 68, 68, 0.3)';
      clickedBtn.style.borderColor = '#ef4444';
      allButtons.forEach(b => {
        if (b.getAttribute('data-odd') === 'true') {
          b.style.background = 'rgba(16, 185, 129, 0.3)';
          b.style.borderColor = '#10b981';
        }
      });
      this.engine.loseLife();
    }

    setTimeout(() => {
      this.round += 1;
      this.nextRound();
    }, 900);
  },

  handleTimeout() {
    this.engine.loseLife();
    this.round += 1;
    this.nextRound();
  },

  cleanup() {}
};

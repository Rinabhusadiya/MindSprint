/**
 * MindSprint - Game 7: Memory Match
 * 3D Card flipping pair-matching concentration workout
 * Supports: Solo Mode, vs Computer (AI), and 2 Players (Pass & Play)
 */

window.GAME_MODULES['memory_match'] = {
  iconsPool: [
    '🚀', '🦊', '⚡️', '💎', '🌈', '🍕', '🍀', '🎸', '⚽️', '🪐',
    '🦁', '🐬', '🍓', '🥑', '🏆', '🎯', '🔥', '👑', '🔮', '🎨',
    '🌸', '🍉', '🦋', '🐘', '🍦', '🛸', '🧩', '🌙', '☀️', '🍄',
    '🐼', '🌮', '🍩', '🍒', '🌻', '🐳', '🏄‍♂️', '🎷', '🎪', '⛵️',
    '🏝️', '🥝', '🎃', '🍁', '🥨', '🦜', '🧁', '💡', '🛡️', '🔔'
  ],
  unseenIcons: [],

  sampleIcons(count) {
    if (!this.unseenIcons || this.unseenIcons.length < count) {
      const unique = Array.from(new Set(this.iconsPool));
      this.unseenIcons = unique.sort(() => Math.random() - 0.5);
    }
    return this.unseenIcons.splice(0, count);
  },

  start(container, options) {
    this.container = container;
    this.engine = options.engine;
    this.difficulty = options.difficulty;
    this.isRelaxMode = options.isRelaxMode;
    this.matchMode = 'solo'; // 'solo' | 'ai' | 'pvp'
    this.currentTurn = 'p1'; // 'p1' | 'p2'
    this.p1Pairs = 0;
    this.p2Pairs = 0;
    this.moves = 0;
    this.matchedPairs = 0;
    this.flippedCards = [];
    this.isLocked = false;
    this.aiMemory = {}; // Card index -> icon

    this.showModeSelector();
  },

  showModeSelector() {
    this.container.innerHTML = `
      <div style="text-align: center; max-width: 480px; width: 100%;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🃏</div>
        <h2 style="font-size: 1.65rem; font-weight: 800; margin-bottom: 0.4rem;">Memory Match Mode</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.95rem;">
          Choose how you want to play:
        </p>

        <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
          <button class="choice-btn match-mode-btn active" data-mode="solo" style="justify-content: flex-start; gap: 1rem; padding: 0.9rem 1.25rem;">
            <span style="font-size: 1.5rem;">🎯</span>
            <div style="text-align: left;">
              <div style="font-size: 1.05rem; font-weight: 800;">Solo Workout</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">Match all pairs against the clock</div>
            </div>
          </button>
          
          <button class="choice-btn match-mode-btn" data-mode="ai" style="justify-content: flex-start; gap: 1rem; padding: 0.9rem 1.25rem;">
            <span style="font-size: 1.5rem;">🤖</span>
            <div style="text-align: left;">
              <div style="font-size: 1.05rem; font-weight: 800;">Play vs Computer (AI)</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">Turn-based card duel against smart Bot</div>
            </div>
          </button>

          <button class="choice-btn match-mode-btn" data-mode="pvp" style="justify-content: flex-start; gap: 1rem; padding: 0.9rem 1.25rem;">
            <span style="font-size: 1.5rem;">👥</span>
            <div style="text-align: left;">
              <div style="font-size: 1.05rem; font-weight: 800;">2 Players (Pass & Play)</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">Take turns finding pairs on same screen</div>
            </div>
          </button>
        </div>

        <button class="btn-primary" id="btn-start-match-board" style="width: 100%; font-size: 1.1rem; padding: 0.9rem;">
          Deal Cards 🃏
        </button>
      </div>
    `;

    const modeButtons = this.container.querySelectorAll('.match-mode-btn');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.matchMode = btn.getAttribute('data-mode');
        if (window.appSound) window.appSound.playClick();
      });
    });

    const startBtn = document.getElementById('btn-start-match-board');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.setupBoard();
      });
    }
  },

  setupBoard() {
    const pairCounts = { easy: 4, medium: 6, hard: 8 };
    this.numPairs = pairCounts[this.difficulty] || 6;
    this.engine.totalQuestions = this.numPairs;
    this.engine.correctAnswers = 0;
    this.p1Pairs = 0;
    this.p2Pairs = 0;
    this.moves = 0;
    this.matchedPairs = 0;
    this.flippedCards = [];
    this.isLocked = false;
    this.aiMemory = {};
    this.currentTurn = 'p1';

    const selectedIcons = this.sampleIcons(this.numPairs);
    const deck = [...selectedIcons, ...selectedIcons].sort(() => Math.random() - 0.5);

    const cols = 4;
    const roundSeconds = deck.length * (this.difficulty === 'easy' ? 8 : 6);

    if (this.matchMode === 'solo') {
      this.engine.startCountdownTimer(roundSeconds, () => {
        this.handleTimeout();
      });
    } else {
      this.engine.stopTimer(); // No strict timer in 1v1 turn-based battle
    }

    const p2Label = this.matchMode === 'ai' ? '🤖 Computer AI' : '👤 Player 2';

    this.container.innerHTML = `
      <div style="width: 100%; max-width: 540px; margin-bottom: 0.75rem;">
        ${this.matchMode === 'solo' ? `
          <div style="display: flex; justify-content: space-between; font-size: 0.95rem; font-weight: 700; color: var(--text-muted);">
            <div>Pairs Found: <span id="match-pairs-count" style="color: var(--primary-400);">0 / ${this.numPairs}</span></div>
            <div>Moves: <span id="match-moves-count" style="color: var(--text-primary);">0</span></div>
          </div>
        ` : `
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-primary); padding: 0.6rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div id="p1-score-pill" style="font-weight: 800; color: var(--primary-400); border-bottom: 2px solid var(--primary-400);">
              👤 Player 1: <span id="p1-pairs-num">0</span>
            </div>
            <div id="turn-indicator" style="font-size: 0.8rem; font-weight: 800; background: rgba(99, 102, 241, 0.15); padding: 0.2rem 0.65rem; border-radius: var(--radius-full); color: var(--primary-400);">
              Player 1's Turn
            </div>
            <div id="p2-score-pill" style="font-weight: 800; color: #06b6d4;">
              ${p2Label}: <span id="p2-pairs-num">0</span>
            </div>
          </div>
        `}
      </div>

      <div class="memory-grid" style="grid-template-columns: repeat(${cols}, 1fr);" id="memory-grid">
        ${deck.map((icon, idx) => `
          <div class="memory-card-flip" data-card-idx="${idx}" data-icon="${icon}">
            <div class="card-face card-back">?</div>
            <div class="card-face card-front">${icon}</div>
          </div>
        `).join('')}
      </div>
    `;

    this.cards = Array.from(this.container.querySelectorAll('.memory-card-flip'));
    this.cards.forEach(card => {
      card.addEventListener('click', () => {
        if (this.currentTurn === 'p2' && this.matchMode === 'ai') return; // Ignore clicks during AI turn
        this.handleCardClick(card);
      });
    });
  },

  handleCardClick(card) {
    if (this.isLocked) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

    const idx = parseInt(card.getAttribute('data-card-idx'), 10);
    const icon = card.getAttribute('data-icon');

    // Register card in AI memory
    this.aiMemory[idx] = icon;

    card.classList.add('flipped');
    if (window.appSound) window.appSound.playClick();
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      this.moves += 1;
      const movesEl = document.getElementById('match-moves-count');
      if (movesEl) movesEl.textContent = this.moves;

      this.checkMatch();
    }
  },

  checkMatch() {
    this.isLocked = true;
    const [c1, c2] = this.flippedCards;
    const icon1 = c1.getAttribute('data-icon');
    const icon2 = c2.getAttribute('data-icon');

    if (icon1 === icon2) {
      // MATCH FOUND!
      setTimeout(() => {
        c1.classList.add('matched');
        c2.classList.add('matched');
        this.matchedPairs += 1;

        if (this.matchMode === 'solo') {
          this.engine.correctAnswers += 1;
          this.engine.addScore(30);
          this.engine.incrementCombo();
        } else {
          if (this.currentTurn === 'p1') {
            this.p1Pairs += 1;
            const p1El = document.getElementById('p1-pairs-num');
            if (p1El) p1El.textContent = this.p1Pairs;
            this.engine.addScore(25);
          } else {
            this.p2Pairs += 1;
            const p2El = document.getElementById('p2-pairs-num');
            if (p2El) p2El.textContent = this.p2Pairs;
          }
        }

        if (window.appSound) window.appSound.playCorrect();

        const countEl = document.getElementById('match-pairs-count');
        if (countEl) countEl.textContent = `${this.matchedPairs} / ${this.numPairs}`;

        this.flippedCards = [];
        this.isLocked = false;

        // Check if board complete
        if (this.matchedPairs === this.numPairs) {
          setTimeout(() => {
            this.finishMatch();
          }, 700);
        } else if (this.matchMode !== 'solo') {
          // In 2P/AI, player who matched gets ANOTHER turn!
          if (this.currentTurn === 'p2' && this.matchMode === 'ai') {
            setTimeout(() => this.triggerAITurn(), 900);
          }
        }
      }, 400);
    } else {
      // MISMATCH
      setTimeout(() => {
        c1.classList.remove('flipped');
        c2.classList.remove('flipped');
        if (this.matchMode === 'solo') this.engine.resetCombo();

        this.flippedCards = [];
        this.isLocked = false;

        // Switch turns in PvP / AI mode
        if (this.matchMode !== 'solo') {
          this.switchTurn();
        }
      }, 900);
    }
  },

  switchTurn() {
    this.currentTurn = this.currentTurn === 'p1' ? 'p2' : 'p1';
    const indicator = document.getElementById('turn-indicator');
    const p1Pill = document.getElementById('p1-score-pill');
    const p2Pill = document.getElementById('p2-score-pill');
    const p2Label = this.matchMode === 'ai' ? 'Computer AI' : 'Player 2';

    if (indicator) {
      if (this.currentTurn === 'p1') {
        indicator.textContent = "Player 1's Turn";
        indicator.style.color = 'var(--primary-400)';
        indicator.style.background = 'rgba(99, 102, 241, 0.15)';
        if (p1Pill) p1Pill.style.borderBottom = '2px solid var(--primary-400)';
        if (p2Pill) p2Pill.style.borderBottom = 'none';
      } else {
        indicator.textContent = `${p2Label}'s Turn`;
        indicator.style.color = '#06b6d4';
        indicator.style.background = 'rgba(6, 182, 212, 0.15)';
        if (p2Pill) p2Pill.style.borderBottom = '2px solid #06b6d4';
        if (p1Pill) p1Pill.style.borderBottom = 'none';
      }
    }

    if (this.currentTurn === 'p2' && this.matchMode === 'ai') {
      setTimeout(() => this.triggerAITurn(), 800);
    }
  },

  // --- Computer AI Turn Logic ---
  triggerAITurn() {
    if (this.currentTurn !== 'p2' || this.isLocked) return;

    // Remaining unflipped & unmatched cards
    const available = this.cards.filter(c => !c.classList.contains('matched') && !c.classList.contains('flipped'));
    if (available.length < 2) return;

    // 1. Check if AI already remembers a matching pair
    let pairIndices = this.findPairInAIMemory();

    if (pairIndices) {
      const [idx1, idx2] = pairIndices;
      const card1 = this.cards.find(c => parseInt(c.getAttribute('data-card-idx'), 10) === idx1);
      const card2 = this.cards.find(c => parseInt(c.getAttribute('data-card-idx'), 10) === idx2);
      this.executeAIFlips(card1, card2);
    } else {
      // 2. Pick a random unknown card
      const c1 = available[Math.floor(Math.random() * available.length)];
      const idx1 = parseInt(c1.getAttribute('data-card-idx'), 10);
      const icon1 = c1.getAttribute('data-icon');

      // Check if pair for icon1 is in memory
      let matchIdx = null;
      for (const [k, v] of Object.entries(this.aiMemory)) {
        if (parseInt(k, 10) !== idx1 && v === icon1) {
          const matchCard = this.cards.find(c => parseInt(c.getAttribute('data-card-idx'), 10) === parseInt(k, 10));
          if (matchCard && !matchCard.classList.contains('matched')) {
            matchIdx = parseInt(k, 10);
            break;
          }
        }
      }

      let c2 = null;
      if (matchIdx !== null) {
        c2 = this.cards.find(c => parseInt(c.getAttribute('data-card-idx'), 10) === matchIdx);
      } else {
        const remaining = available.filter(c => c !== c1);
        c2 = remaining[Math.floor(Math.random() * remaining.length)];
      }

      this.executeAIFlips(c1, c2);
    }
  },

  findPairInAIMemory() {
    const iconToIndices = {};
    for (const [idxStr, icon] of Object.entries(this.aiMemory)) {
      const idx = parseInt(idxStr, 10);
      const card = this.cards.find(c => parseInt(c.getAttribute('data-card-idx'), 10) === idx);
      if (card && !card.classList.contains('matched')) {
        if (!iconToIndices[icon]) iconToIndices[icon] = [];
        iconToIndices[icon].push(idx);
        if (iconToIndices[icon].length === 2) {
          return iconToIndices[icon];
        }
      }
    }
    return null;
  },

  executeAIFlips(card1, card2) {
    if (!card1 || !card2) return;
    this.handleCardClick(card1);
    setTimeout(() => {
      this.handleCardClick(card2);
    }, 600);
  },

  finishMatch() {
    if (this.matchMode === 'solo') {
      this.engine.finishGame(true);
    } else {
      const isP1Winner = this.p1Pairs > this.p2Pairs;
      const isTie = this.p1Pairs === this.p2Pairs;
      const p2Label = this.matchMode === 'ai' ? 'Computer AI' : 'Player 2';

      this.engine.finishGame(isP1Winner);

      // Duel Victory Result
      const body = document.getElementById('game-modal-body');
      if (!body) return;

      body.innerHTML = `
        <div class="game-result-screen" style="max-width: 500px; animation: popIn 0.35s ease-out;">
          <div style="font-size: 3.5rem; margin-bottom: 0.5rem;">👑</div>
          <div class="result-badge" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;">
            🃏 Memory Match Battle Result
          </div>
          <h2 class="result-title">
            ${isTie ? "It's a Tie!" : (isP1Winner ? '🎉 PLAYER 1 WINS!' : `🤖 ${p2Label.toUpperCase()} WINS!`)}
          </h2>

          <div style="display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin: 1.5rem 0;">
            <div style="text-align: center; padding: 1rem 1.5rem; background: var(--bg-primary); border: 2px solid var(--primary-400); border-radius: var(--radius-lg);">
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">PLAYER 1</div>
              <div style="font-size: 2.2rem; font-weight: 900; color: var(--primary-400);">${this.p1Pairs} pairs</div>
            </div>
            <div style="font-size: 1.25rem; font-weight: 900; color: var(--text-muted);">VS</div>
            <div style="text-align: center; padding: 1rem 1.5rem; background: var(--bg-primary); border: 2px solid #06b6d4; border-radius: var(--radius-lg);">
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">${p2Label.toUpperCase()}</div>
              <div style="font-size: 2.2rem; font-weight: 900; color: #06b6d4;">${this.p2Pairs} pairs</div>
            </div>
          </div>

          <div class="result-actions">
            <button class="btn-primary" id="btn-match-rematch">
              🔄 Rematch
            </button>
            <button class="btn-secondary" onclick="window.gameEngine.closeGame()">
              🏠 Back to Games
            </button>
          </div>
        </div>
      `;

      document.getElementById('btn-match-rematch').addEventListener('click', () => {
        this.setupBoard();
      });
    }
  },

  handleTimeout() {
    this.engine.finishGame(false);
  },

  cleanup() {
    this.flippedCards = [];
  }
};

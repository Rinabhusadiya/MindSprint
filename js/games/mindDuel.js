/**
 * MindSprint - Game 13: Mind Duel (1v1 Brain Battle)
 * Multi-user head-to-head cognitive battle:
 * Supports Player vs Player (2 Players on same screen) & Player vs Computer (AI Bot)
 */

window.GAME_MODULES['mind_duel'] = {
  start(container, options) {
    this.container = container;
    this.engine = options.engine;
    this.difficulty = options.difficulty;
    this.isRelaxMode = options.isRelaxMode;

    // Default battle mode
    this.duelMode = 'ai'; // 'ai' | 'pvp'
    this.aiLevel = this.difficulty; // 'easy' | 'medium' | 'hard'
    this.p1Score = 0;
    this.p2Score = 0;
    this.currentRound = 1;
    this.totalRounds = 5;
    this.roundActive = false;
    this.aiTimeout = null;

    this.showModeSelection();
  },

  showModeSelection() {
    this.container.innerHTML = `
      <div style="text-align: center; max-width: 520px; width: 100%;">
        <div style="font-size: 3.5rem; margin-bottom: 0.5rem;">⚔️</div>
        <h2 style="font-size: 1.85rem; font-weight: 800; margin-bottom: 0.5rem;">Mind Duel • 1v1 Battle</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.95rem;">
          Compete in 5 rapid-fire cognitive clashes. Whoever solves and reacts fastest wins each round!
        </p>

        <div style="margin-bottom: 1.5rem;">
          <div style="font-weight: 700; margin-bottom: 0.75rem; color: var(--text-primary);">Select Opponent:</div>
          <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
            <button class="choice-btn duel-mode-btn active" data-mode="ai" style="padding: 0.9rem 1.4rem; font-size: 1.05rem;">
              🤖 Play vs Computer (AI)
            </button>
            <button class="choice-btn duel-mode-btn" data-mode="pvp" style="padding: 0.9rem 1.4rem; font-size: 1.05rem;">
              👥 2 Players (Same Device)
            </button>
          </div>
        </div>

        <div id="ai-diff-container" style="margin-bottom: 1.75rem;">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">
            Computer AI Intelligence:
          </div>
          <div class="difficulty-selector" style="margin-bottom: 0;">
            <button class="diff-btn ${this.aiLevel === 'easy' ? 'active' : ''}" data-ai="easy">Casual Bot</button>
            <button class="diff-btn ${this.aiLevel === 'medium' ? 'active' : ''}" data-ai="medium">Clever Bot</button>
            <button class="diff-btn ${this.aiLevel === 'hard' ? 'active' : ''}" data-ai="hard">Genius AI</button>
          </div>
        </div>

        <button class="btn-primary" id="btn-start-duel-match" style="width: 100%; max-width: 320px; font-size: 1.15rem; padding: 1rem 2rem;">
          Start Duel! ⚔️
        </button>
      </div>
    `;

    const modeButtons = this.container.querySelectorAll('.duel-mode-btn');
    const aiDiffContainer = document.getElementById('ai-diff-container');

    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.duelMode = btn.getAttribute('data-mode');
        if (aiDiffContainer) {
          aiDiffContainer.style.display = this.duelMode === 'ai' ? 'block' : 'none';
        }
        if (window.appSound) window.appSound.playClick();
      });
    });

    const aiDiffButtons = this.container.querySelectorAll('[data-ai]');
    aiDiffButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        aiDiffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.aiLevel = btn.getAttribute('data-ai');
        if (window.appSound) window.appSound.playClick();
      });
    });

    const startBtn = document.getElementById('btn-start-duel-match');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.p1Score = 0;
        this.p2Score = 0;
        this.currentRound = 1;
        this.startRound();
      });
    }
  },

  startRound() {
    if (this.currentRound > this.totalRounds) {
      this.finishDuel();
      return;
    }

    this.roundActive = true;
    if (this.aiTimeout) clearTimeout(this.aiTimeout);

    // Pick round type (1: Math, 2: Reaction, 3: True/False, 4: Stroop Color, 5: Anomaly)
    const types = ['math', 'reaction', 'true_false', 'stroop', 'anomaly'];
    const rType = types[this.currentRound - 1] || 'math';

    this.renderRoundSkeleton(rType);
    this.mountChallenge(rType);
  },

  renderRoundSkeleton(rType) {
    const p2Label = this.duelMode === 'ai' ? '🤖 Computer AI' : '👤 Player 2';

    this.container.innerHTML = `
      <div style="width: 100%; max-width: 680px; display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
        
        <!-- Scoreboard Header -->
        <div style="width: 100%; display: flex; align-items: center; justify-content: space-between; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 0.75rem 1.25rem;">
          
          <!-- Player 1 Score -->
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(99, 102, 241, 0.2); border: 2px solid var(--primary-400); display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
              👤
            </div>
            <div>
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">PLAYER 1</div>
              <div style="font-size: 1.4rem; font-weight: 900; color: var(--primary-400); line-height: 1;">${this.p1Score}</div>
            </div>
          </div>

          <!-- Round Pill -->
          <div style="text-align: center;">
            <span style="font-size: 0.75rem; font-weight: 800; background: rgba(236, 72, 153, 0.15); color: #ec4899; padding: 0.25rem 0.75rem; border-radius: var(--radius-full); text-transform: uppercase;">
              ⚔️ Round ${this.currentRound} / ${this.totalRounds}
            </span>
          </div>

          <!-- Player 2 / AI Score -->
          <div style="display: flex; align-items: center; gap: 0.6rem; text-align: right; flex-direction: row-reverse;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(6, 182, 212, 0.2); border: 2px solid #06b6d4; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
              ${this.duelMode === 'ai' ? '🤖' : '👤'}
            </div>
            <div>
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">${p2Label.toUpperCase()}</div>
              <div style="font-size: 1.4rem; font-weight: 900; color: #06b6d4; line-height: 1;">${this.p2Score}</div>
            </div>
          </div>
        </div>

        <!-- Interactive Battle Stage -->
        <div id="duel-stage-container" style="width: 100%; min-height: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center;"></div>
      </div>
    `;
  },

  mountChallenge(rType) {
    const stage = document.getElementById('duel-stage-container');
    if (!stage) return;

    if (rType === 'math') {
      this.setupMathClash(stage);
    } else if (rType === 'reaction') {
      this.setupReactionClash(stage);
    } else if (rType === 'true_false') {
      this.setupTrueFalseClash(stage);
    } else if (rType === 'stroop') {
      this.setupStroopClash(stage);
    } else {
      this.setupAnomalyClash(stage);
    }
  },

  // --- Challenge 1: Quick Math Clash ---
  setupMathClash(stage) {
    const a = Math.floor(Math.random() * 20) + 7;
    const b = Math.floor(Math.random() * 20) + 7;
    const answer = a + b;
    const choices = new Set([answer]);
    while (choices.size < 4) {
      const fake = answer + (Math.floor(Math.random() * 8) + 1) * (Math.random() > 0.5 ? 1 : -1);
      if (fake > 0 && fake !== answer) choices.add(fake);
    }
    const options = Array.from(choices).sort(() => Math.random() - 0.5);

    stage.innerHTML = `
      <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
        ⚡️ Math Clash: First to solve correctly wins!
      </div>
      <div class="math-equation-card" style="margin-bottom: 1rem; padding: 1.25rem;">
        <div class="math-equation-text" style="font-size: 2.4rem;">${a} + ${b} = ?</div>
      </div>
      <div class="pattern-options-grid" id="duel-math-options">
        ${options.map(opt => `<button class="choice-btn duel-opt-btn" data-val="${opt}">${opt}</button>`).join('')}
      </div>
    `;

    const buttons = stage.querySelectorAll('.duel-opt-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (!this.roundActive) return;
        const val = parseInt(btn.getAttribute('data-val'), 10);
        if (val === answer) {
          this.awardRoundPoint('p1', 'Player 1 solved it first!');
        } else {
          this.awardRoundPoint('p2', `${this.duelMode === 'ai' ? 'Computer' : 'Player 2'} gets the point (Player 1 made an error)!`);
        }
      });
    });

    if (this.duelMode === 'ai') {
      this.scheduleAIResponse(() => {
        if (!this.roundActive) return;
        const aiSuccess = this.aiRollSuccess();
        if (aiSuccess) {
          this.awardRoundPoint('p2', '🤖 Computer AI solved it first!');
        } else {
          this.awardRoundPoint('p1', '🤖 Computer AI missed! Point to Player 1!');
        }
      });
    }
  },

  // --- Challenge 2: Reaction Reflex Duel ---
  setupReactionClash(stage) {
    stage.innerHTML = `
      <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
        ⚡️ Reflex Duel: Wait for GREEN, then tap your buzzer fastest!
      </div>
      <div class="reaction-arena state-waiting" id="duel-reflex-pad" style="height: 180px; width: 100%;">
        <div class="reaction-title" id="duel-reflex-title">Wait for Green...</div>
      </div>
      <div style="display: flex; gap: 1rem; width: 100%; margin-top: 1rem; justify-content: center;">
        <button class="btn-primary" id="btn-p1-buzzer" style="flex: 1; padding: 1rem; font-size: 1.1rem; border-radius: var(--radius-md);">
          👤 Player 1 Buzzer
        </button>
        ${this.duelMode === 'pvp' ? `
          <button class="btn-secondary" id="btn-p2-buzzer" style="flex: 1; padding: 1rem; font-size: 1.1rem; border-radius: var(--radius-md); border-color: #06b6d4; color: #06b6d4;">
            👤 Player 2 Buzzer
          </button>
        ` : ''}
      </div>
    `;

    let greenActive = false;
    const pad = document.getElementById('duel-reflex-pad');
    const title = document.getElementById('duel-reflex-title');
    const p1Buzzer = document.getElementById('btn-p1-buzzer');
    const p2Buzzer = document.getElementById('btn-p2-buzzer');

    const randomDelay = Math.floor(Math.random() * 2500) + 1500;
    this.reflexTimer = setTimeout(() => {
      if (!this.roundActive) return;
      greenActive = true;
      pad.className = 'reaction-arena state-ready';
      title.textContent = '⚡️ BUZZ NOW!';

      if (this.duelMode === 'ai') {
        const aiDelayMap = { easy: 650, medium: 420, hard: 280 };
        const aiDelay = aiDelayMap[this.aiLevel] || 420;
        this.aiTimeout = setTimeout(() => {
          if (!this.roundActive || !greenActive) return;
          this.awardRoundPoint('p2', '🤖 Computer AI buzzed in first!');
        }, aiDelay);
      }
    }, randomDelay);

    p1Buzzer.addEventListener('click', () => {
      if (!this.roundActive) return;
      if (!greenActive) {
        // False start!
        this.awardRoundPoint('p2', 'Player 1 buzzed too early! Point to Opponent.');
      } else {
        this.awardRoundPoint('p1', 'Player 1 buzzed fastest!');
      }
    });

    if (p2Buzzer) {
      p2Buzzer.addEventListener('click', () => {
        if (!this.roundActive) return;
        if (!greenActive) {
          this.awardRoundPoint('p1', 'Player 2 buzzed too early! Point to Player 1.');
        } else {
          this.awardRoundPoint('p2', 'Player 2 buzzed fastest!');
        }
      });
    }
  },

  // --- Challenge 3: True / False Brain Clash ---
  setupTrueFalseClash(stage) {
    const isTrue = Math.random() > 0.5;
    const a = Math.floor(Math.random() * 9) + 3;
    const b = Math.floor(Math.random() * 9) + 3;
    const realProd = a * b;
    const displayedProd = isTrue ? realProd : realProd + (Math.floor(Math.random() * 4) + 1) * (Math.random() > 0.5 ? 1 : -1);

    stage.innerHTML = `
      <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
        ⚡️ True or False Clash: Is this calculation correct?
      </div>
      <div class="math-equation-card" style="margin-bottom: 1.25rem; padding: 1.25rem;">
        <div class="math-equation-text" style="font-size: 2.2rem;">${a} × ${b} = ${displayedProd}</div>
      </div>
      <div style="display: flex; gap: 1rem; width: 100%; max-width: 380px;">
        <button class="choice-btn duel-tf-btn" data-answer="true" style="flex: 1; border-color: #10b981; color: #10b981;">
          ✓ TRUE
        </button>
        <button class="choice-btn duel-tf-btn" data-answer="false" style="flex: 1; border-color: #ef4444; color: #ef4444;">
          ✗ FALSE
        </button>
      </div>
    `;

    stage.querySelectorAll('.duel-tf-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!this.roundActive) return;
        const picked = btn.getAttribute('data-answer') === 'true';
        if (picked === isTrue) {
          this.awardRoundPoint('p1', 'Player 1 got it right!');
        } else {
          this.awardRoundPoint('p2', `${this.duelMode === 'ai' ? 'Computer' : 'Player 2'} gets the point!`);
        }
      });
    });

    if (this.duelMode === 'ai') {
      this.scheduleAIResponse(() => {
        if (!this.roundActive) return;
        const aiSuccess = this.aiRollSuccess();
        if (aiSuccess) {
          this.awardRoundPoint('p2', '🤖 Computer AI answered correctly first!');
        } else {
          this.awardRoundPoint('p1', '🤖 Computer AI erred! Point to Player 1!');
        }
      });
    }
  },

  // --- Challenge 4: Stroop Color Clash ---
  setupStroopClash(stage) {
    const colors = [
      { text: 'RED', css: '#ef4444' },
      { text: 'BLUE', css: '#3b82f6' },
      { text: 'GREEN', css: '#10b981' },
      { text: 'YELLOW', css: '#f59e0b' }
    ];

    const match = Math.random() > 0.5;
    const textItem = colors[Math.floor(Math.random() * colors.length)];
    let colorItem = textItem;
    if (!match) {
      const others = colors.filter(c => c.text !== textItem.text);
      colorItem = others[Math.floor(Math.random() * others.length)];
    }

    stage.innerHTML = `
      <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
        ⚡️ Stroop Clash: Does the word text match its ink color?
      </div>
      <div class="math-equation-card" style="margin-bottom: 1.25rem; padding: 1.5rem;">
        <div style="font-size: 3rem; font-weight: 900; letter-spacing: 0.1em; color: ${colorItem.css};">
          ${textItem.text}
        </div>
      </div>
      <div style="display: flex; gap: 1rem; width: 100%; max-width: 380px;">
        <button class="choice-btn duel-stroop-btn" data-answer="true" style="flex: 1; border-color: #10b981; color: #10b981;">
          YES (Match)
        </button>
        <button class="choice-btn duel-stroop-btn" data-answer="false" style="flex: 1; border-color: #ef4444; color: #ef4444;">
          NO (Mismatch)
        </button>
      </div>
    `;

    stage.querySelectorAll('.duel-stroop-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!this.roundActive) return;
        const picked = btn.getAttribute('data-answer') === 'true';
        if (picked === match) {
          this.awardRoundPoint('p1', 'Player 1 identified the color match first!');
        } else {
          this.awardRoundPoint('p2', `${this.duelMode === 'ai' ? 'Computer' : 'Player 2'} gets the point!`);
        }
      });
    });

    if (this.duelMode === 'ai') {
      this.scheduleAIResponse(() => {
        if (!this.roundActive) return;
        if (this.aiRollSuccess()) {
          this.awardRoundPoint('p2', '🤖 Computer AI answered first!');
        } else {
          this.awardRoundPoint('p1', '🤖 Computer AI slipped up! Point to Player 1!');
        }
      });
    }
  },

  // --- Challenge 5: Anomaly Clash ---
  setupAnomalyClash(stage) {
    const pairs = [
      { base: '💎', odd: '🔷' },
      { base: '🍎', odd: '🍏' },
      { base: '🌟', odd: '✨' },
      { base: '😀', odd: '😃' },
      { base: '🐱', odd: '🐯' },
      { base: '🦊', odd: '🐺' },
      { base: '🐼', odd: '🐨' },
      { base: '🌕', odd: '🌖' },
      { base: '🏀', odd: '⚽️' },
      { base: '🥑', odd: '🥒' },
      { base: '❤️', odd: '💖' },
      { base: '🍋', odd: '🍊' },
      { base: '🍩', odd: '🍪' },
      { base: '🕐', odd: '🕑' },
      { base: '🎲', odd: '🎯' },
      { base: '🚀', odd: '🛸' },
      { base: '🐸', odd: '🦎' },
      { base: '🔔', odd: '🔕' },
      { base: '🔒', odd: '🔓' },
      { base: '🌹', odd: '🌷' },
      { base: '🍁', odd: '🍂' },
      { base: '⚡️', odd: '🔥' },
      { base: '🌊', odd: '💧' },
      { base: '☀️', odd: '🌤️' }
    ];
    const rawPair = pairs[Math.floor(Math.random() * pairs.length)];
    const pair = Math.random() > 0.5 ? { base: rawPair.odd, odd: rawPair.base } : rawPair;
    const total = 9; // 3x3 grid
    const oddIdx = Math.floor(Math.random() * total);

    stage.innerHTML = `
      <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
        ⚡️ Anomaly Clash: Tap the odd symbol first!
      </div>
      <div class="find-grid-container" style="grid-template-columns: repeat(3, 1fr); max-width: 260px; margin-bottom: 0.5rem;">
        ${Array.from({ length: total }).map((_, i) => {
          const isOdd = i === oddIdx;
          return `<button class="find-cell-btn duel-cell-btn" data-odd="${isOdd}">${isOdd ? pair.odd : pair.base}</button>`;
        }).join('')}
      </div>
    `;

    stage.querySelectorAll('.duel-cell-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!this.roundActive) return;
        const isOdd = btn.getAttribute('data-odd') === 'true';
        if (isOdd) {
          this.awardRoundPoint('p1', 'Player 1 spotted the anomaly first!');
        } else {
          this.awardRoundPoint('p2', `${this.duelMode === 'ai' ? 'Computer' : 'Player 2'} gets the point!`);
        }
      });
    });

    if (this.duelMode === 'ai') {
      this.scheduleAIResponse(() => {
        if (!this.roundActive) return;
        if (this.aiRollSuccess()) {
          this.awardRoundPoint('p2', '🤖 Computer AI found the anomaly first!');
        } else {
          this.awardRoundPoint('p1', 'Point to Player 1!');
        }
      });
    }
  },

  // --- AI Logic Helpers ---
  scheduleAIResponse(callback) {
    // Response delay scales with AI Level
    const delays = {
      easy: Math.floor(Math.random() * 1200) + 2200,   // 2.2s - 3.4s
      medium: Math.floor(Math.random() * 800) + 1400,  // 1.4s - 2.2s
      hard: Math.floor(Math.random() * 500) + 900      // 0.9s - 1.4s
    };
    const delay = delays[this.aiLevel] || 1800;
    this.aiTimeout = setTimeout(callback, delay);
  },

  aiRollSuccess() {
    const accuracyRates = { easy: 0.65, medium: 0.85, hard: 0.96 };
    const rate = accuracyRates[this.aiLevel] || 0.85;
    return Math.random() < rate;
  },

  awardRoundPoint(winner, reason) {
    if (!this.roundActive) return;
    this.roundActive = false;
    if (this.aiTimeout) clearTimeout(this.aiTimeout);
    if (this.reflexTimer) clearTimeout(this.reflexTimer);

    if (winner === 'p1') {
      this.p1Score += 1;
      if (window.appSound) window.appSound.playCorrect();
    } else {
      this.p2Score += 1;
      if (window.appSound) window.appSound.playWrong();
    }

    const stage = document.getElementById('duel-stage-container');
    if (stage) {
      stage.innerHTML = `
        <div style="background: var(--bg-primary); border: 2px solid ${winner === 'p1' ? 'var(--primary-400)' : '#06b6d4'}; border-radius: var(--radius-lg); padding: 1.5rem; text-align: center; max-width: 440px; animation: popIn 0.3s ease-out;">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">${winner === 'p1' ? '🎉' : '🤖'}</div>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: ${winner === 'p1' ? 'var(--primary-400)' : '#06b6d4'}; margin-bottom: 0.35rem;">
            ${winner === 'p1' ? 'Round to Player 1!' : (this.duelMode === 'ai' ? 'Round to Computer AI!' : 'Round to Player 2!')}
          </h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">${reason}</p>
        </div>
      `;
    }

    setTimeout(() => {
      this.currentRound += 1;
      this.startRound();
    }, 1800);
  },

  finishDuel() {
    const isP1Winner = this.p1Score > this.p2Score;
    const isTie = this.p1Score === this.p2Score;
    const p2Label = this.duelMode === 'ai' ? 'Computer AI' : 'Player 2';

    // Award platform points
    const finalScore = this.p1Score * 50;
    this.engine.score = finalScore;
    this.engine.finishGame(isP1Winner);

    // Replace result view with Duel Champion Result
    const body = document.getElementById('game-modal-body');
    if (!body) return;

    body.innerHTML = `
      <div class="game-result-screen" style="max-width: 520px; animation: popIn 0.35s ease-out;">
        <div style="font-size: 3.5rem; margin-bottom: 0.5rem;">👑</div>
        <div class="result-badge" style="background: rgba(236, 72, 153, 0.15); color: #ec4899; border-color: rgba(236, 72, 153, 0.3);">
          ⚔️ 1v1 Battle Result
        </div>
        <h2 class="result-title">
          ${isTie ? '🤝 Epic Tie Match!' : (isP1Winner ? '🎉 PLAYER 1 VICTORIOUS!' : `🤖 ${p2Label.toUpperCase()} WINS!`)}
        </h2>

        <!-- Match Final Scores -->
        <div style="display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin: 1.5rem 0;">
          <div style="text-align: center; padding: 1rem 1.5rem; background: var(--bg-primary); border: 2px solid var(--primary-400); border-radius: var(--radius-lg);">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">PLAYER 1</div>
            <div style="font-size: 2.5rem; font-weight: 900; color: var(--primary-400);">${this.p1Score}</div>
          </div>
          <div style="font-size: 1.5rem; font-weight: 900; color: var(--text-muted);">VS</div>
          <div style="text-align: center; padding: 1rem 1.5rem; background: var(--bg-primary); border: 2px solid #06b6d4; border-radius: var(--radius-lg);">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">${p2Label.toUpperCase()}</div>
            <div style="font-size: 2.5rem; font-weight: 900; color: #06b6d4;">${this.p2Score}</div>
          </div>
        </div>

        <div class="result-actions">
          <button class="btn-primary" id="btn-duel-rematch">
            ⚔️ Rematch
          </button>
          <button class="btn-secondary" onclick="window.gameEngine.closeGame()">
            🏠 Back to Library
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-duel-rematch').addEventListener('click', () => {
      this.p1Score = 0;
      this.p2Score = 0;
      this.currentRound = 1;
      this.startRound();
    });
  },

  cleanup() {
    this.roundActive = false;
    if (this.aiTimeout) clearTimeout(this.aiTimeout);
    if (this.reflexTimer) clearTimeout(this.reflexTimer);
  }
};

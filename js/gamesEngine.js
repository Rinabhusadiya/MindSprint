/**
 * MindSprint - Core Games Engine & Lifecycle Coordinator
 * Orchestrates modal flow, timers, lives, combos, result cards, and confetti
 */

window.ALL_GAMES_METADATA = [
  {
    id: 'number_pattern',
    name: 'Number Pattern',
    category: 'Logic',
    catKey: 'logic',
    icon: '🔢',
    desc: 'Identify mathematical patterns and deduct the missing number in the sequence.',
    instructions: 'Examine the number sequence carefully. Look for arithmetic steps, geometric doubling, squares, or fibonacci relations, then pick the correct missing value.',
    rules: ['4 choices per question', 'Dynamic questions generated dynamically', 'Score scales with speed and difficulty']
  },
  {
    id: 'memory_sequence',
    name: 'Memory Sequence',
    category: 'Memory',
    catKey: 'memory',
    icon: '🧠',
    desc: 'Memorize sequences of icons and reproduce them in exact order.',
    instructions: 'Watch the sequence flash on screen. Remember the exact order, then click the icons in identical sequence when the input pad appears.',
    rules: ['Sequence length increases with levels', 'Mistakes cost 1 life in Challenge Mode', 'Trains spatial and working memory']
  },
  {
    id: 'find_different',
    name: 'Find The Different',
    category: 'Focus',
    catKey: 'focus',
    icon: '🔍',
    desc: 'Spot the subtle odd emoji or icon out from a crowded visual grid.',
    instructions: 'Scan the grid quickly to find the single item that is different from all the rest. Click it before the timer expires.',
    rules: ['Grid size expands each round', 'Quick detection earns combo multipliers', 'Sharp visual acuity test']
  },
  {
    id: 'quick_math',
    name: 'Quick Math',
    category: 'Logic',
    catKey: 'logic',
    icon: '➗',
    desc: 'Solve fast arithmetic equations under pressure and boost your numerical fluency.',
    instructions: 'Calculate the equation as quickly as possible and tap the correct solution before the timer runs out.',
    rules: ['Easy (+/-), Medium (×/÷), Hard (mixed)', 'Combo multipliers for successive correct answers', 'Time bonus for rapid solving']
  },
  {
    id: 'reaction_test',
    name: 'Reaction Test',
    category: 'Speed',
    catKey: 'speed',
    icon: '⚡️',
    desc: 'Measure your visual reflexes down to the exact millisecond.',
    instructions: 'Wait for the red screen to turn vibrant GREEN, then click or tap as fast as humanly possible! Avoid clicking too early.',
    rules: ['Random delay between 1.5s - 4.5s', 'Early clicks trigger a false start penalty', 'Computes best and average reaction times']
  },
  {
    id: 'word_scramble',
    name: 'Word Scramble',
    category: 'Word',
    catKey: 'word',
    icon: '🔤',
    desc: 'Unscramble mixed letter tiles across themes like Animals, Science, Tech, and Nature.',
    instructions: 'Tap the letter tiles in the correct sequence to reconstruct the hidden word. Tap filled slots to send letters back.',
    rules: ['Multiple word themes', 'Hint button available if stuck', 'Difficulty scales word length']
  },
  {
    id: 'memory_match',
    name: 'Memory Match',
    category: 'Memory',
    catKey: 'memory',
    icon: '🃏',
    desc: 'Flip cards face up to uncover matching pairs in as few moves as possible.',
    instructions: 'Click two cards to flip them. If their icons match, they stay open. If not, they flip back face down. Clear all pairs!',
    rules: ['Levels: 4 pairs, 6 pairs, 8 pairs', 'Tracks move efficiency and completion time', 'Pure concentration and recall exercise']
  },
  {
    id: 'logic_puzzle',
    name: 'Logic Puzzle',
    category: 'Logic',
    catKey: 'logic',
    icon: '💡',
    desc: 'Tackle deductive reasoning questions, ranking problems, and logical situations.',
    instructions: 'Read the logic scenario and select the most logically sound conclusion from 4 choices.',
    rules: ['Visual and analytical deduction', 'Detailed reasoning revealed on submit', 'Multiple diverse logic queries']
  },
  {
    id: 'focus_challenge',
    name: 'Focus Challenge',
    category: 'Focus',
    catKey: 'focus',
    icon: '🎯',
    desc: 'Filter visual noise and click only designated target bubbles amidst moving distractors.',
    instructions: 'Observe the target banner (e.g. "Click only 🔴 RED circles"). Tap targets as they bounce and avoid tapping distractors!',
    rules: ['Target changes dynamically', 'Speed and quantity increase per level', 'Tapping wrong object deducts a life']
  },
  {
    id: 'odd_color',
    name: 'Odd Color',
    category: 'Focus',
    catKey: 'focus',
    icon: '🎨',
    desc: 'Identify the tile with a subtly different hue or lightness shade.',
    instructions: 'One square in the grid has a slightly different color tint than all the others. Find and click it before time runs out.',
    rules: ['Grid expands from 3×3 to 6×6', 'Color delta becomes finer and harder each round', 'Tests color perception and nuance']
  },
  {
    id: 'number_memory',
    name: 'Number Memory',
    category: 'Memory',
    catKey: 'memory',
    icon: '🧮',
    desc: 'Memorize increasingly long numerical sequences and recall them flawlessly.',
    instructions: 'Watch the digits appear on screen. Once they vanish, type in the exact number using the on-screen pad or keyboard.',
    rules: ['Starts at 4 digits, climbs to 10+ digits', 'Flash time is proportional to length', 'Instant feedback comparing submitted vs correct']
  },
  {
    id: 'typing_speed',
    name: 'Typing Speed',
    category: 'Speed',
    catKey: 'speed',
    icon: '⌨️',
    desc: 'Type curated brain and science passages to test WPM and keystroke accuracy.',
    instructions: 'Type the displayed passage as fast and accurately as possible. The indicator highlights correct letters in green and errors in red.',
    rules: ['Live WPM & accuracy calculation', 'Real-time error tracking', 'Mobile touch keyboard & desktop keyboard supported']
  },
  {
    id: 'mind_duel',
    name: 'Mind Duel (1v1 Battle)',
    category: 'Battle',
    catKey: 'battle',
    icon: '⚔️',
    desc: 'Compete head-to-head against Computer AI or challenge a friend in rapid cognitive clashes!',
    instructions: 'Select Play vs Computer (AI) or 2 Players on same screen. Compete across 5 rapid-fire mental challenges (Math speed, reflex clash, true/false, Stroop color test, and anomaly spotter). Whoever reacts and answers correctly first wins the round!',
    rules: ['Modes: 🤖 vs Computer (AI) & 👥 2 Players (Local)', 'AI difficulty levels: Casual, Clever, and Genius Bot', '5 fast-paced head-to-head showdown rounds']
  }
];

class GamesEngine {
  constructor() {
    this.modal = document.getElementById('game-modal');
    this.activeGameId = null;
    this.activeGameModule = null;
    this.isDailyMode = false;
    this.difficulty = 'medium';
    this.isRelaxMode = false;

    // Runtime state
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.combo = 1;
    this.timerInterval = null;
    this.timeLeft = 0;
    this.timeElapsed = 0;
    this.totalQuestions = 0;
    this.correctAnswers = 0;

    this.initDOM();
  }

  initDOM() {
    // Close modal listener
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeGame());
    }
  }

  getGameMeta(gameId) {
    return window.ALL_GAMES_METADATA.find(g => g.id === gameId);
  }

  openGame(gameId, isDaily = false) {
    const meta = this.getGameMeta(gameId);
    if (!meta) return;

    this.activeGameId = gameId;
    this.isDailyMode = isDaily;
    this.difficulty = window.appStorage.getSetting('defaultDifficulty') || 'medium';
    this.isRelaxMode = window.appStorage.getSetting('relaxMode') || false;

    // Reset runtime stats
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.combo = 1;
    this.totalQuestions = 0;
    this.correctAnswers = 0;
    this.timeElapsed = 0;
    this.stopTimer();

    // Setup Modal Header
    const titleEl = document.getElementById('game-header-title');
    const iconEl = document.getElementById('game-header-icon');
    if (titleEl) titleEl.textContent = meta.name;
    if (iconEl) iconEl.textContent = meta.icon;

    this.updateHUD();

    // Render Instructions Screen
    this.showInstructionsScreen(meta);

    // Open Modal
    if (this.modal) {
      this.modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    if (window.appSound) window.appSound.playClick();
  }

  showInstructionsScreen(meta) {
    const body = document.getElementById('game-modal-body');
    if (!body) return;

    const gStats = window.appStorage.state.gameStats[meta.id] || { bestScore: 0 };

    body.innerHTML = `
      <div class="game-instructions-screen">
        <div class="instructions-icon">${meta.icon}</div>
        <h2 class="instructions-title">${meta.name}</h2>
        <p class="instructions-desc">${meta.instructions}</p>

        <div class="instructions-rules-box">
          <strong>Key Training Guidelines:</strong>
          <ul>
            ${meta.rules.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 1.25rem;">
          <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Difficulty Level:</span>
          <div class="difficulty-selector" style="margin-top: 0.5rem;">
            <button class="diff-btn ${this.difficulty === 'easy' ? 'active' : ''}" data-diff="easy">Easy</button>
            <button class="diff-btn ${this.difficulty === 'medium' ? 'active' : ''}" data-diff="medium">Medium</button>
            <button class="diff-btn ${this.difficulty === 'hard' ? 'active' : ''}" data-diff="hard">Hard</button>
          </div>
        </div>

        <div class="mode-toggle-wrap">
          <label style="display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="instr-relax-checkbox" ${this.isRelaxMode ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: #10b981;">
            <span>🌿 Relax Mode (No strict timer, unlimited retries)</span>
          </label>
        </div>

        <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.35rem; align-items: center;">
          <div>Personal Best: <strong style="color: var(--text-primary); font-size: 1.1rem;">${gStats.bestScore || 0} pts</strong></div>
          <div style="font-size: 0.82rem;">🎯 Played: <strong>${gStats.timesPlayed || 0} times</strong> • ⏱️ Total Time: <strong>${window.appStorage.formatDuration(gStats.totalTimeSpent || 0)}</strong></div>
        </div>

        <button class="btn-primary" id="btn-start-game-now" style="width: 100%; max-width: 320px; font-size: 1.15rem; padding: 1rem 2rem;">
          Start Challenge 🚀
        </button>
      </div>
    `;

    // Bind difficulty clicks
    body.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        body.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.difficulty = btn.getAttribute('data-diff');
        if (window.appSound) window.appSound.playClick();
      });
    });

    // Bind relax mode checkbox
    const relaxCheckbox = document.getElementById('instr-relax-checkbox');
    if (relaxCheckbox) {
      relaxCheckbox.addEventListener('change', (e) => {
        this.isRelaxMode = e.target.checked;
        this.updateHUD();
      });
    }

    // Bind start button
    const startBtn = document.getElementById('btn-start-game-now');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startGame());
    }
  }

  startGame() {
    const body = document.getElementById('game-modal-body');
    if (!body) return;

    body.innerHTML = `
      <div id="game-active-arena" class="game-active-arena"></div>
    `;

    const arena = document.getElementById('game-active-arena');

    // Fetch the game runner
    const runner = window.GAME_MODULES && window.GAME_MODULES[this.activeGameId];
    if (runner) {
      this.activeGameModule = runner;
      if (window.appSound) window.appSound.playGameStart();
      this.startTimeElapsedTracker();
      runner.start(arena, {
        difficulty: this.difficulty,
        isRelaxMode: this.isRelaxMode,
        engine: this
      });
    } else {
      arena.innerHTML = `<p style="color: #ef4444;">Game module not loaded yet.</p>`;
    }
  }

  updateHUD() {
    const livesPill = document.getElementById('hud-lives-pill');
    const timerPill = document.getElementById('hud-timer-pill');
    const scorePill = document.getElementById('hud-score-pill');
    const comboPill = document.getElementById('hud-combo-pill');

    if (livesPill) {
      if (this.isRelaxMode) {
        livesPill.innerHTML = `<span>🌿</span> Relax`;
        livesPill.style.color = '#10b981';
      } else {
        const hearts = '❤️'.repeat(Math.max(0, this.lives));
        livesPill.innerHTML = `<span>Lives:</span> ${hearts || '💀'}`;
        livesPill.style.color = '#ef4444';
      }
    }

    if (timerPill) {
      if (this.isRelaxMode) {
        timerPill.innerHTML = `⏱️ ∞`;
      } else {
        timerPill.innerHTML = `⏱️ ${this.timeLeft}s`;
      }
    }

    if (scorePill) scorePill.innerHTML = `Score: <strong>${this.score}</strong>`;

    if (comboPill) {
      if (this.combo > 1) {
        comboPill.style.display = 'flex';
        comboPill.innerHTML = `🔥 ${this.combo}x`;
      } else {
        comboPill.style.display = 'none';
      }
    }
  }

  startCountdownTimer(seconds, onExpireCallback) {
    this.stopTimer();
    this.timeLeft = seconds;
    this.updateHUD();

    if (this.isRelaxMode) return; // No timer expiry in relax mode

    this.timerInterval = setInterval(() => {
      this.timeLeft -= 1;
      this.updateHUD();
      if (this.timeLeft <= 3 && this.timeLeft > 0 && window.appSound) {
        window.appSound.playTick();
      }
      if (this.timeLeft <= 0) {
        this.stopTimer();
        if (onExpireCallback) onExpireCallback();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  startTimeElapsedTracker() {
    this.timeElapsed = 0;
    this.elapsedInterval = setInterval(() => {
      this.timeElapsed += 1;
    }, 1000);
  }

  stopTimeElapsedTracker() {
    if (this.elapsedInterval) {
      clearInterval(this.elapsedInterval);
      this.elapsedInterval = null;
    }
  }

  addScore(pts) {
    const multiplied = Math.round(pts * (this.combo > 1 ? this.combo * 0.8 : 1));
    this.score += multiplied;
    this.updateHUD();
  }

  incrementCombo() {
    this.combo += 1;
    this.updateHUD();
  }

  resetCombo() {
    this.combo = 1;
    this.updateHUD();
  }

  loseLife() {
    if (this.isRelaxMode) return;
    this.lives -= 1;
    this.resetCombo();
    this.updateHUD();
    if (window.appSound) window.appSound.playWrong();

    if (this.lives <= 0) {
      this.finishGame(false);
    }
  }

  finishGame(completed = true) {
    this.stopTimer();
    this.stopTimeElapsedTracker();

    if (this.activeGameModule && this.activeGameModule.cleanup) {
      this.activeGameModule.cleanup();
    }

    const meta = this.getGameMeta(this.activeGameId);
    const prevBest = window.appStorage.state.gameStats[this.activeGameId]?.bestScore || 0;
    const isNewHigh = this.score > prevBest && this.score > 0;

    // Accuracy computation
    const accuracy = this.totalQuestions > 0 ? Math.round((this.correctAnswers / this.totalQuestions) * 100) : 100;

    // Record game in Storage
    window.appStorage.recordGameResult(
      this.activeGameId,
      meta.catKey,
      this.score,
      accuracy,
      this.timeElapsed
    );

    // If Daily Challenge, record completion
    if (this.isDailyMode && window.appDaily) {
      window.appDaily.recordGameCompletion(this.activeGameId, this.score);
    }

    // Live update metrics on Dashboard and Brain Profile
    if (window.appMain) {
      window.appMain.updateDashboardMetrics();
    }
    if (window.appScore) {
      window.appScore.renderBrainProfile();
    }


    // Render Result Screen
    this.showResultScreen(meta, isNewHigh, accuracy);
  }

  showResultScreen(meta, isNewHigh, accuracy) {
    const body = document.getElementById('game-modal-body');
    if (!body) return;

    if (window.appSound) {
      if (accuracy >= 80 || isNewHigh) {
        window.appSound.playLevelUp();
      } else {
        window.appSound.playGameOver();
      }
    }

    // Trigger confetti on new high score or accuracy >= 90
    if (isNewHigh || accuracy >= 90) {
      this.triggerConfetti();
    }

    // Rating stars
    let starsHtml = '<span class="star-gold">★</span><span class="star-gray">★</span><span class="star-gray">★</span>';
    if (accuracy >= 90) {
      starsHtml = '<span class="star-gold">★</span><span class="star-gold">★</span><span class="star-gold">★</span>';
    } else if (accuracy >= 65) {
      starsHtml = '<span class="star-gold">★</span><span class="star-gold">★</span><span class="star-gray">★</span>';
    }

    const ratingText = window.appScore.getPerformanceRating(this.score, accuracy);

    body.innerHTML = `
      <div class="game-result-screen">
        <div class="result-stars">${starsHtml}</div>
        <div class="result-badge">${ratingText}</div>
        <h2 class="result-title">${accuracy >= 70 ? '🎉 Exceptional Training!' : 'Training Session Complete'}</h2>

        ${isNewHigh ? `
          <div class="result-high-score-banner">
            🏆 NEW PERSONAL BEST RECORD!
          </div>
        ` : ''}

        <div class="result-stats-box">
          <div class="result-stat-item">
            <span class="label">Session Score</span>
            <span class="val" style="color: var(--primary-400);">${this.score}</span>
          </div>
          <div class="result-stat-item">
            <span class="label">Accuracy</span>
            <span class="val" style="color: #10b981;">${accuracy}%</span>
          </div>
          <div class="result-stat-item">
            <span class="label">Session Time</span>
            <span class="val">${window.appStorage.formatDuration(this.timeElapsed)}</span>
          </div>
          <div class="result-stat-item">
            <span class="label">Total Training</span>
            <span class="val" style="color: #06b6d4; font-size: 1.15rem;">${(window.appStorage.state.gameStats[this.activeGameId]?.timesPlayed || 1)} plays • ${window.appStorage.formatDuration(window.appStorage.state.gameStats[this.activeGameId]?.totalTimeSpent || this.timeElapsed)}</span>
          </div>
        </div>

        <div class="result-actions">
          <button class="btn-primary" id="btn-result-replay">
            🔄 Play Again
          </button>
          <button class="btn-secondary" id="btn-result-next">
            ⏭️ Next Game
          </button>
          <button class="btn-secondary" id="btn-result-exit">
            🏠 Back to Games
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-result-replay').addEventListener('click', () => {
      this.startGame();
    });

    document.getElementById('btn-result-next').addEventListener('click', () => {
      // Find next game
      const currIdx = window.ALL_GAMES_METADATA.findIndex(g => g.id === this.activeGameId);
      const nextIdx = (currIdx + 1) % window.ALL_GAMES_METADATA.length;
      this.openGame(window.ALL_GAMES_METADATA[nextIdx].id, this.isDailyMode);
    });

    document.getElementById('btn-result-exit').addEventListener('click', () => {
      this.closeGame();
    });
  }

  triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const pieces = [];
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
    for (let i = 0; i < 70; i++) {
      pieces.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        w: Math.random() * 8 + 4,
        h: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 16,
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.35,
        alpha: 1
      });
    }

    let frame = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rSpeed;
        p.alpha -= 0.015;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });
      frame++;
      if (alive && frame < 90) {
        requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    render();
  }

  closeGame() {
    this.stopTimer();
    this.stopTimeElapsedTracker();
    if (this.activeGameModule && this.activeGameModule.cleanup) {
      this.activeGameModule.cleanup();
    }
    if (this.modal) {
      this.modal.classList.remove('open');
      document.body.style.overflow = '';
    }
    this.activeGameId = null;
    this.activeGameModule = null;

    // Refresh dashboard stats on main view
    if (window.appMain) {
      window.appMain.updateDashboardMetrics();
    }
  }
}

window.GAME_MODULES = {};
function initGameEngine() {
  if (!window.gameEngine) {
    window.gameEngine = new GamesEngine();
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGameEngine);
} else {
  initGameEngine();
}

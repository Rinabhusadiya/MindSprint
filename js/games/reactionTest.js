/**
 * MindSprint - Game 5: Reaction Test
 * Visual reflex tester with millisecond precision and false-start protection
 */

window.GAME_MODULES['reaction_test'] = {
  start(container, options) {
    this.container = container;
    this.engine = options.engine;
    this.difficulty = options.difficulty;
    this.isRelaxMode = options.isRelaxMode;
    this.round = 1;
    this.totalRounds = 5;
    this.engine.totalQuestions = this.totalRounds;
    this.engine.correctAnswers = 0;
    this.times = [];
    this.state = 'idle'; // idle | waiting | ready | too_soon | result

    this.renderBoard();
  },

  renderBoard() {
    this.container.innerHTML = `
      <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
        Attempt ${this.round} of ${this.totalRounds}
      </div>

      <div class="reaction-arena state-result" id="reaction-arena">
        <div class="reaction-icon" id="react-icon">⏱️</div>
        <div class="reaction-title" id="react-title">Click to Begin</div>
        <div class="reaction-subtext" id="react-subtext">Tap anywhere inside this box to start</div>
      </div>

      <div class="reaction-history-pills" id="react-pills">
        ${this.times.map((t, i) => `<span class="reaction-pill">#${i + 1}: ${t}ms</span>`).join('')}
      </div>
    `;

    const arena = document.getElementById('reaction-arena');
    arena.addEventListener('click', () => this.handleArenaClick());
  },

  handleArenaClick() {
    const arena = document.getElementById('reaction-arena');
    const icon = document.getElementById('react-icon');
    const title = document.getElementById('react-title');
    const subtext = document.getElementById('react-subtext');

    if (this.state === 'idle' || this.state === 'result' || this.state === 'too_soon') {
      // Transition to WAITING (Red)
      this.state = 'waiting';
      arena.className = 'reaction-arena state-waiting';
      icon.textContent = '✋';
      title.textContent = 'Wait for Green...';
      subtext.textContent = 'Do not click yet!';

      if (window.appSound) window.appSound.playClick();

      // Random delay between 1500ms and 4500ms
      const delay = Math.floor(Math.random() * 3000) + 1500;
      this.waitTimeout = setTimeout(() => {
        this.triggerReady();
      }, delay);
    } else if (this.state === 'waiting') {
      // Clicked TOO SOON!
      clearTimeout(this.waitTimeout);
      this.state = 'too_soon';
      arena.className = 'reaction-arena state-too-soon';
      icon.textContent = '⚠️';
      title.textContent = 'Too Soon!';
      subtext.textContent = 'Click to try this attempt again';
      if (window.appSound) window.appSound.playWrong();
    } else if (this.state === 'ready') {
      // Valid Reaction Click!
      const elapsed = Date.now() - this.startTime;
      this.times.push(elapsed);
      this.engine.correctAnswers += 1;

      // Score bonus based on speed
      let points = 20;
      if (elapsed < 250) points = 50;
      else if (elapsed < 320) points = 35;
      else if (elapsed < 420) points = 25;
      this.engine.addScore(points);

      if (window.appSound) window.appSound.playCorrect();

      this.state = 'result';
      arena.className = 'reaction-arena state-result';
      icon.textContent = '⚡️';
      title.textContent = `${elapsed} ms`;
      subtext.textContent = elapsed < 280 ? 'Incredible reflexes! Click for next round' : 'Good reaction! Click to continue';

      // Update pills
      const pillsContainer = document.getElementById('react-pills');
      if (pillsContainer) {
        pillsContainer.innerHTML = this.times.map((t, i) => `<span class="reaction-pill">#${i + 1}: ${t}ms</span>`).join('');
      }

      this.round += 1;
      if (this.round > this.totalRounds) {
        setTimeout(() => {
          this.engine.finishGame(true);
        }, 1200);
      }
    }
  },

  triggerReady() {
    const arena = document.getElementById('reaction-arena');
    const icon = document.getElementById('react-icon');
    const title = document.getElementById('react-title');
    const subtext = document.getElementById('react-subtext');

    if (!arena) return;

    this.state = 'ready';
    this.startTime = Date.now();
    arena.className = 'reaction-arena state-ready';
    icon.textContent = '🎯';
    title.textContent = 'CLICK NOW!';
    subtext.textContent = 'Quickly tap anywhere!';
  },

  cleanup() {
    if (this.waitTimeout) clearTimeout(this.waitTimeout);
  }
};

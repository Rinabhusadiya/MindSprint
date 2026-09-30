/**
 * MindSprint - Game 10: Odd Color
 * Color nuance and subtle chromatic difference detection
 */

window.GAME_MODULES['odd_color'] = {
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

    // Grid size
    let gridSize = 3;
    if (this.round >= 5) gridSize = 5;
    else if (this.round >= 3) gridSize = 4;

    const totalTiles = gridSize * gridSize;
    const oddIndex = Math.floor(Math.random() * totalTiles);

    // Color generation (HSL)
    const hue = Math.floor(Math.random() * 360);
    const sat = Math.floor(Math.random() * 40) + 50; // 50-90%
    const baseLightness = Math.floor(Math.random() * 30) + 40; // 40-70%

    // Delta difference shrinks as round progresses and by difficulty
    const diffFactor = this.difficulty === 'easy' ? 1.4 : this.difficulty === 'medium' ? 1.0 : 0.7;
    const lightnessDelta = Math.max(2.5, (16 - this.round * 2.2) * diffFactor);

    const oddLightness = baseLightness > 50 ? baseLightness - lightnessDelta : baseLightness + lightnessDelta;

    const baseColor = `hsl(${hue}, ${sat}%, ${baseLightness}%)`;
    const oddColor = `hsl(${hue}, ${sat}%, ${oddLightness}%)`;

    const roundSeconds = Math.max(5, 12 - this.round * 1.1);
    this.engine.startCountdownTimer(Math.round(roundSeconds), () => {
      this.handleTimeout();
    });

    this.container.innerHTML = `
      <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
        Round ${this.round} of ${this.totalRounds} • Find the different color tile (${gridSize}×${gridSize})
      </div>

      <div class="odd-color-grid" style="grid-template-columns: repeat(${gridSize}, 1fr);" id="odd-color-grid">
        ${Array.from({ length: totalTiles }).map((_, i) => {
          const isOdd = i === oddIndex;
          const bg = isOdd ? oddColor : baseColor;
          return `<button class="odd-color-tile" style="background-color: ${bg};" data-odd="${isOdd}"></button>`;
        }).join('')}
      </div>
    `;

    const tiles = this.container.querySelectorAll('.odd-color-tile');
    tiles.forEach(tile => {
      tile.addEventListener('click', () => {
        const isOdd = tile.getAttribute('data-odd') === 'true';
        this.handleTileClick(isOdd, tile, tiles);
      });
    });
  },

  handleTileClick(isOdd, clickedTile, allTiles) {
    this.engine.stopTimer();
    allTiles.forEach(t => t.style.pointerEvents = 'none');

    if (isOdd) {
      clickedTile.style.outline = '4px solid #10b981';
      clickedTile.style.transform = 'scale(1.08)';
      if (window.appSound) window.appSound.playCorrect();
      this.engine.addScore(25);
      this.engine.incrementCombo();
      this.engine.correctAnswers += 1;
    } else {
      clickedTile.style.outline = '4px solid #ef4444';
      allTiles.forEach(t => {
        if (t.getAttribute('data-odd') === 'true') {
          t.style.outline = '4px solid #10b981';
          t.style.transform = 'scale(1.08)';
        }
      });
      if (window.appSound) window.appSound.playWrong();
      this.engine.loseLife();
    }

    setTimeout(() => {
      this.round += 1;
      this.nextRound();
    }, 850);
  },

  handleTimeout() {
    this.engine.loseLife();
    this.round += 1;
    this.nextRound();
  },

  cleanup() {}
};

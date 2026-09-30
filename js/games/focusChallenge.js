/**
 * MindSprint - Game 9: Focus Challenge
 * Target selection amidst dynamic moving visual distractors
 */

window.GAME_MODULES['focus_challenge'] = {
  shapes: [
    { id: 'red_circle', label: '🔴 RED Circle', icon: '🔴', isTarget: false },
    { id: 'blue_circle', label: '🔵 BLUE Circle', icon: '🔵', isTarget: false },
    { id: 'yellow_star', label: '⭐️ GOLD Star', icon: '⭐️', isTarget: false },
    { id: 'green_square', label: '🟩 GREEN Square', icon: '🟩', isTarget: false },
    { id: 'purple_diamond', label: '💜 PURPLE Heart', icon: '💜', isTarget: false },
    { id: 'orange_diamond', label: '🔶 ORANGE Diamond', icon: '🔶', isTarget: false }
  ],

  start(container, options) {
    this.container = container;
    this.engine = options.engine;
    this.difficulty = options.difficulty;
    this.isRelaxMode = options.isRelaxMode;
    this.level = 1;
    this.maxLevel = 3;
    this.engine.totalQuestions = this.maxLevel * 4;
    this.engine.correctAnswers = 0;
    this.bubbles = [];
    this.animFrame = null;

    this.startLevel();
  },

  startLevel() {
    if (this.level > this.maxLevel) {
      this.engine.finishGame(true);
      return;
    }

    // Pick target
    const targetShape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
    this.currentTarget = targetShape;

    this.container.innerHTML = `
      <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
        Phase ${this.level} of ${this.maxLevel} • Focus Challenge
      </div>

      <div class="focus-target-banner">
        <span>Target:</span>
        <span style="font-size: 1.25rem;">${targetShape.label}</span>
      </div>

      <div class="focus-canvas-area" id="focus-arena"></div>
    `;

    this.arena = document.getElementById('focus-arena');

    // Spawn bubbles
    const bubbleCount = 7 + this.level * 3;
    this.bubbles = [];

    // Ensure at least 3-4 target bubbles exist
    const targetCount = 3 + this.level;
    const allItems = [];
    for (let i = 0; i < targetCount; i++) allItems.push(targetShape);
    while (allItems.length < bubbleCount) {
      const distractor = this.shapes.filter(s => s.id !== targetShape.id)[Math.floor(Math.random() * (this.shapes.length - 1))];
      allItems.push(distractor);
    }
    allItems.sort(() => Math.random() - 0.5);

    const arenaWidth = this.arena.clientWidth > 0 ? this.arena.clientWidth : 320;
    const arenaHeight = this.arena.clientHeight > 0 ? this.arena.clientHeight : 260;
    const speedMult = this.difficulty === 'easy' ? 0.9 : this.difficulty === 'medium' ? 1.4 : 2.0;

    allItems.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'focus-bubble';
      el.textContent = item.icon;
      el.setAttribute('data-id', item.id);
      this.arena.appendChild(el);

      const bObj = {
        el,
        item,
        x: Math.max(5, Math.random() * (arenaWidth - 56)),
        y: Math.max(5, Math.random() * (arenaHeight - 56)),
        vx: (Math.random() - 0.5) * 2.2 * speedMult,
        vy: (Math.random() - 0.5) * 2.2 * speedMult,
        alive: true
      };

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleBubbleClick(bObj);
      });

      this.bubbles.push(bObj);
    });

    const roundSeconds = 16 - this.level * 2;
    this.engine.startCountdownTimer(roundSeconds, () => {
      this.level += 1;
      this.startLevel();
    });

    this.startAnimation();
  },

  handleBubbleClick(bubble) {
    if (!bubble.alive) return;

    if (bubble.item.id === this.currentTarget.id) {
      // Correct target clicked!
      bubble.alive = false;
      bubble.el.style.transform = 'scale(1.4)';
      bubble.el.style.opacity = '0';
      if (window.appSound) window.appSound.playCorrect();
      this.engine.addScore(25);
      this.engine.incrementCombo();
      this.engine.correctAnswers += 1;

      setTimeout(() => {
        if (bubble.el.parentNode) bubble.el.parentNode.removeChild(bubble.el);
      }, 200);

      // Check if all targets cleared in this phase
      const remainingTargets = this.bubbles.filter(b => b.alive && b.item.id === this.currentTarget.id);
      if (remainingTargets.length === 0) {
        this.engine.stopTimer();
        this.level += 1;
        setTimeout(() => {
          this.startLevel();
        }, 600);
      }
    } else {
      // Wrong distractor clicked!
      if (window.appSound) window.appSound.playWrong();
      this.engine.loseLife();
      bubble.el.style.animation = 'shake 0.3s';
      setTimeout(() => {
        bubble.el.style.animation = '';
      }, 300);
    }
  },

  startAnimation() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);

    const loop = () => {
      const arenaW = this.arena ? (this.arena.clientWidth || 320) : 320;
      const arenaH = this.arena ? (this.arena.clientHeight || 260) : 260;

      this.bubbles.forEach(b => {
        if (!b.alive) return;
        b.x += b.vx;
        b.y += b.vy;

        // Bounce off arena edges dynamically
        if (b.x <= 0) { b.x = 0; b.vx *= -1; }
        if (b.x >= arenaW - 52) { b.x = arenaW - 52; b.vx *= -1; }
        if (b.y <= 0) { b.y = 0; b.vy *= -1; }
        if (b.y >= arenaH - 52) { b.y = arenaH - 52; b.vy *= -1; }

        b.el.style.left = `${b.x}px`;
        b.el.style.top = `${b.y}px`;
      });
      this.animFrame = requestAnimationFrame(loop);
    };
    this.animFrame = requestAnimationFrame(loop);
  },

  cleanup() {
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
  }
};

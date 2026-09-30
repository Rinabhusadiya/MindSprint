/**
 * MindSprint - Game 1: Number Pattern
 * Dynamic numerical pattern deduction puzzle
 */

window.GAME_MODULES['number_pattern'] = {
  start(container, options) {
    this.container = container;
    this.engine = options.engine;
    this.difficulty = options.difficulty;
    this.isRelaxMode = options.isRelaxMode;
    this.round = 1;
    this.totalRounds = 5;
    this.engine.totalQuestions = this.totalRounds;
    this.engine.correctAnswers = 0;

    this.nextQuestion();
  },

  generatePattern() {
    let sequence = [];
    let answer = 0;
    const diff = this.difficulty;

    if (diff === 'easy') {
      const type = Math.random() > 0.5 ? 'add' : 'sub';
      const step = Math.floor(Math.random() * 5) + 2;
      let start = Math.floor(Math.random() * 20) + 1;
      if (type === 'sub') start += step * 5;

      for (let i = 0; i < 4; i++) {
        sequence.push(start);
        start = type === 'add' ? start + step : start - step;
      }
      answer = start;
    } else if (diff === 'medium') {
      const pType = Math.floor(Math.random() * 3);
      if (pType === 0) {
        // Geometric doubling / tripling
        const mult = Math.random() > 0.6 ? 3 : 2;
        let start = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < 4; i++) {
          sequence.push(start);
          start *= mult;
        }
        answer = start;
      } else if (pType === 1) {
        // Square sequence
        const baseStart = Math.floor(Math.random() * 4) + 1;
        for (let i = 0; i < 4; i++) {
          sequence.push(Math.pow(baseStart + i, 2));
        }
        answer = Math.pow(baseStart + 4, 2);
      } else {
        // Incrementing differences (+2, +4, +6, +8...)
        let start = Math.floor(Math.random() * 10) + 1;
        let delta = 2;
        for (let i = 0; i < 4; i++) {
          sequence.push(start);
          start += delta;
          delta += 2;
        }
        answer = start;
      }
    } else {
      // Hard
      const pType = Math.floor(Math.random() * 3);
      if (pType === 0) {
        // Fibonacci style
        let a = Math.floor(Math.random() * 5) + 1;
        let b = a + Math.floor(Math.random() * 3) + 1;
        sequence = [a, b, a + b, b + (a + b)];
        answer = (a + b) + (b + (a + b));
      } else if (pType === 1) {
        // Alternating (+2, *2, +2, *2)
        const addVal = Math.floor(Math.random() * 3) + 2;
        let val = Math.floor(Math.random() * 5) + 2;
        for (let i = 0; i < 4; i++) {
          sequence.push(val);
          val = i % 2 === 0 ? val + addVal : val * 2;
        }
        answer = val;
      } else {
        // Cubes or descending square series
        const base = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < 4; i++) {
          sequence.push(Math.pow(base + i, 3));
        }
        answer = Math.pow(base + 4, 3);
      }
    }

    // Generate 3 unique distractors
    const choices = new Set([answer]);
    while (choices.size < 4) {
      const offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const fake = answer + offset;
      if (fake > 0 && fake !== answer) {
        choices.add(fake);
      }
    }

    return {
      sequence,
      answer,
      options: Array.from(choices).sort(() => Math.random() - 0.5)
    };
  },

  nextQuestion() {
    if (this.round > this.totalRounds) {
      this.engine.finishGame(true);
      return;
    }

    const { sequence, answer, options } = this.generatePattern();
    this.currentAnswer = answer;

    const timerMap = { easy: 18, medium: 12, hard: 8 };
    const roundSeconds = timerMap[this.difficulty] || 12;

    this.container.innerHTML = `
      <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
        Question ${this.round} of ${this.totalRounds}
      </div>

      <div class="pattern-sequence-container">
        ${sequence.map(n => `<div class="pattern-num-badge">${n}</div>`).join('')}
        <div class="pattern-num-badge target-slot">?</div>
      </div>

      <div class="pattern-options-grid">
        ${options.map(opt => `
          <button class="choice-btn" data-val="${opt}">${opt}</button>
        `).join('')}
      </div>
    `;

    // Start timer
    this.engine.startCountdownTimer(roundSeconds, () => {
      this.handleTimeout();
    });

    // Attach button listeners
    const buttons = this.container.querySelectorAll('.choice-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const selected = parseInt(btn.getAttribute('data-val'), 10);
        this.checkAnswer(selected, btn, buttons);
      });
    });
  },

  checkAnswer(selected, clickedBtn, allButtons) {
    this.engine.stopTimer();
    allButtons.forEach(b => b.style.pointerEvents = 'none');

    if (selected === this.currentAnswer) {
      clickedBtn.classList.add('correct');
      if (window.appSound) window.appSound.playCorrect();
      this.engine.addScore(25);
      this.engine.incrementCombo();
      this.engine.correctAnswers += 1;
    } else {
      clickedBtn.classList.add('wrong');
      allButtons.forEach(b => {
        if (parseInt(b.getAttribute('data-val'), 10) === this.currentAnswer) {
          b.classList.add('correct');
        }
      });
      this.engine.loseLife();
    }

    setTimeout(() => {
      this.round += 1;
      this.nextQuestion();
    }, 1100);
  },

  handleTimeout() {
    this.container.querySelectorAll('.choice-btn').forEach(b => {
      b.style.pointerEvents = 'none';
      if (parseInt(b.getAttribute('data-val'), 10) === this.currentAnswer) {
        b.classList.add('correct');
      }
    });
    this.engine.loseLife();
    setTimeout(() => {
      this.round += 1;
      this.nextQuestion();
    }, 1200);
  },

  cleanup() {
    // Clean intervals or listeners if any
  }
};

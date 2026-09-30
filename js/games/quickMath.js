/**
 * MindSprint - Game 4: Quick Math
 * Rapid mental arithmetic calculations under timed pressure
 */

window.GAME_MODULES['quick_math'] = {
  start(container, options) {
    this.container = container;
    this.engine = options.engine;
    this.difficulty = options.difficulty;
    this.isRelaxMode = options.isRelaxMode;
    this.round = 1;
    this.totalRounds = 6;
    this.engine.totalQuestions = this.totalRounds;
    this.engine.correctAnswers = 0;

    this.nextProblem();
  },

  generateProblem() {
    let questionText = '';
    let answer = 0;
    const diff = this.difficulty;

    if (diff === 'easy') {
      const isAdd = Math.random() > 0.5;
      const a = Math.floor(Math.random() * 45) + 10;
      const b = Math.floor(Math.random() * 45) + 10;
      if (isAdd) {
        questionText = `${a} + ${b}`;
        answer = a + b;
      } else {
        const big = Math.max(a, b);
        const small = Math.min(a, b);
        questionText = `${big} - ${small}`;
        answer = big - small;
      }
    } else if (diff === 'medium') {
      const isMult = Math.random() > 0.5;
      if (isMult) {
        const a = Math.floor(Math.random() * 11) + 3;
        const b = Math.floor(Math.random() * 12) + 3;
        questionText = `${a} × ${b}`;
        answer = a * b;
      } else {
        const b = Math.floor(Math.random() * 10) + 2;
        answer = Math.floor(Math.random() * 12) + 2;
        const a = b * answer;
        questionText = `${a} ÷ ${b}`;
      }
    } else {
      // Hard: mixed operations
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        const a = Math.floor(Math.random() * 8) + 4;
        const b = Math.floor(Math.random() * 8) + 3;
        const c = Math.floor(Math.random() * 25) + 5;
        questionText = `(${a} × ${b}) - ${c}`;
        answer = (a * b) - c;
      } else if (type === 1) {
        const b = Math.floor(Math.random() * 8) + 2;
        const res = Math.floor(Math.random() * 10) + 4;
        const a = b * res;
        const c = Math.floor(Math.random() * 20) + 10;
        questionText = `(${a} ÷ ${b}) + ${c}`;
        answer = res + c;
      } else {
        const a = Math.floor(Math.random() * 30) + 20;
        const b = Math.floor(Math.random() * 20) + 10;
        const c = Math.floor(Math.random() * 5) + 2;
        questionText = `(${a} - ${b}) × ${c}`;
        answer = (a - b) * c;
      }
    }

    // 3 unique distractors
    const choices = new Set([answer]);
    while (choices.size < 4) {
      const offset = (Math.floor(Math.random() * 6) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const fake = answer + offset;
      if (fake !== answer) {
        choices.add(fake);
      }
    }

    return {
      questionText,
      answer,
      options: Array.from(choices).sort(() => Math.random() - 0.5)
    };
  },

  nextProblem() {
    if (this.round > this.totalRounds) {
      this.engine.finishGame(true);
      return;
    }

    const { questionText, answer, options } = this.generateProblem();
    this.currentAnswer = answer;

    const roundSeconds = this.difficulty === 'easy' ? 12 : this.difficulty === 'medium' ? 9 : 7;
    this.engine.startCountdownTimer(roundSeconds, () => {
      this.handleTimeout();
    });

    this.container.innerHTML = `
      <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
        Question ${this.round} of ${this.totalRounds}
      </div>

      <div class="math-equation-card">
        <div class="math-equation-text">${questionText} = ?</div>
      </div>

      <div class="pattern-options-grid">
        ${options.map(opt => `
          <button class="choice-btn" data-val="${opt}">${opt}</button>
        `).join('')}
      </div>
    `;

    const buttons = this.container.querySelectorAll('.choice-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const chosen = parseInt(btn.getAttribute('data-val'), 10);
        this.handlePick(chosen, btn, buttons);
      });
    });
  },

  handlePick(chosen, clickedBtn, allButtons) {
    this.engine.stopTimer();
    allButtons.forEach(b => b.style.pointerEvents = 'none');

    if (chosen === this.currentAnswer) {
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
      this.nextProblem();
    }, 950);
  },

  handleTimeout() {
    this.engine.loseLife();
    this.round += 1;
    this.nextProblem();
  },

  cleanup() {}
};

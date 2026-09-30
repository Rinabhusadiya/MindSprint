/**
 * MindSprint - Game 12: Typing Speed
 * Real-time keystroke precision, speed and WPM cognitive workout
 */

window.GAME_MODULES['typing_speed'] = {
  sentences: [
    // Easy / Concise
    'Focus your mind on one single task at a time.',
    'Small daily improvements create massive long term results.',
    'Deep breathing helps clear mental fog and restores calm.',
    'Curiosity is the engine that drives creative breakthroughs.',
    'Clear thinking begins with honest and careful observation.',
    'Every master was once an eager and patient beginner.',
    'Calm persistence overcomes almost every sudden obstacle.',
    'A calm mind observes patterns that hurried eyes miss.',
    'Consistent practice turns complex skills into natural instincts.',
    'Sharp focus and steady rhythm beat rushed haste every time.',

    // Medium / Standard
    'The human brain has roughly eighty-six billion neurons that constantly spark thoughts.',
    'Consistent daily exercise keeps your mind sharp, focused, and adaptable to change.',
    'Neuroplasticity allows our neural connections to grow stronger with every new challenge.',
    'Rapid pattern recognition enables faster decisions under high pressure situations.',
    'Logic and creativity work together to discover elegant solutions to hard puzzles.',
    'Memory retention strengthens when ideas are connected to vivid mental stories.',
    'Cognitive flexibility helps us quickly switch perspectives when facts change.',
    'Great innovators solve complex challenges by breaking them into simple questions.',
    'Visual attention sharpens when you consciously slow down to inspect details.',
    'Deliberate mental workouts protect memory and boost reasoning capabilities.',

    // Hard / Complex & In-depth
    'Working memory acts as our mental workspace, juggling multiple pieces of information while navigating intricate strategic problems.',
    'Synaptic plasticity proves that intellectual capacity expands throughout life whenever we engage in demanding mental disciplines.',
    'Effective problem solving combines analytical deduction, emotional composure, and the agility to discard outdated assumptions.',
    'Rapid information processing requires selective inhibition, filtering out noisy distractions to preserve deep concentration.',
    'The prefrontal cortex coordinates abstract reasoning, planning, and goal pursuit against compelling impulsive temptations.',
    'Cognitive resilience is the extraordinary ability to learn from mental missteps and calibrate strategy with calm confidence.',
    'Mastering swift keystrokes demands harmonious coordination between visual perception, motor reflexes, and tactile awareness.',
    'Critical thinking demands questioning comfortable dogmas and evaluating evidence with rigorous mathematical objectivity.',
    'Creative genius emerges at the fascinating intersection where disciplined structure meets boundless imaginative curiosity.',
    'An agile intellect transforms unexpected setbacks into valuable data points for refining subsequent attempts.'
  ],
  unseenSentences: [],

  pickSentence() {
    if (!this.unseenSentences || this.unseenSentences.length === 0) {
      this.unseenSentences = [...this.sentences].sort(() => Math.random() - 0.5);
    }

    let candidates = this.unseenSentences;
    if (this.difficulty === 'easy') {
      candidates = this.unseenSentences.filter(s => s.length <= 65);
    } else if (this.difficulty === 'medium') {
      candidates = this.unseenSentences.filter(s => s.length > 60 && s.length <= 100);
    } else {
      candidates = this.unseenSentences.filter(s => s.length > 95);
    }

    let text;
    if (candidates.length > 0) {
      text = candidates[0];
      const idx = this.unseenSentences.indexOf(text);
      if (idx !== -1) this.unseenSentences.splice(idx, 1);
    } else {
      let pool = [...this.sentences].sort(() => Math.random() - 0.5);
      if (this.difficulty === 'easy') pool = pool.filter(s => s.length <= 65);
      else if (this.difficulty === 'medium') pool = pool.filter(s => s.length > 60 && s.length <= 100);
      else pool = pool.filter(s => s.length > 95);
      if (pool.length === 0) pool = [...this.sentences];
      text = pool[0];
      this.unseenSentences = pool.slice(1);
    }

    return text;
  },

  start(container, options) {
    this.container = container;
    this.engine = options.engine;
    this.difficulty = options.difficulty;
    this.isRelaxMode = options.isRelaxMode;
    this.engine.totalQuestions = 1;
    this.engine.correctAnswers = 0;

    // Pick a non-repeating sentence
    this.text = this.pickSentence();
    this.userTyped = '';
    this.startTime = null;
    this.errors = 0;

    this.renderBoard();
  },

  renderBoard() {
    this.container.innerHTML = `
      <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
        Typing Speed Challenge • Start typing below!
      </div>

      <div class="typing-box" id="typing-display-box">
        ${this.renderFormattedText()}
      </div>

      <input type="text" id="typing-input-field" class="typing-hidden-input" autocomplete="off" autocapitalize="off" spellcheck="false" />

      <div class="typing-live-stats">
        <div class="typing-stat">WPM: <span id="typing-wpm-val">0</span></div>
        <div class="typing-stat">Accuracy: <span id="typing-acc-val">100%</span></div>
        <div class="typing-stat">Errors: <span id="typing-err-val" style="color: #ef4444;">0</span></div>
      </div>

      <div style="margin-top: 1.25rem;">
        <button class="btn-primary" id="btn-focus-typing" style="font-size: 0.9rem; padding: 0.6rem 1.4rem;">
          ⌨️ Click to Type
        </button>
      </div>
    `;

    const input = document.getElementById('typing-input-field');
    const box = document.getElementById('typing-display-box');
    const focusBtn = document.getElementById('btn-focus-typing');

    const focusInput = () => {
      if (input) {
        input.focus();
        box.style.borderColor = 'var(--primary-400)';
      }
    };

    box.addEventListener('click', focusInput);
    if (focusBtn) focusBtn.addEventListener('click', focusInput);

    if (input) {
      input.focus();
      input.addEventListener('input', (e) => this.handleTypingInput(e.target.value));
    }

    this.engine.startCountdownTimer(45, () => {
      this.finishTest();
    });
  },

  renderFormattedText() {
    const chars = this.text.split('');
    let html = '';
    for (let i = 0; i < chars.length; i++) {
      let cls = '';
      if (i < this.userTyped.length) {
        cls = this.userTyped[i] === chars[i] ? 'correct' : 'incorrect';
      } else if (i === this.userTyped.length) {
        cls = 'current';
      }
      html += `<span class="typing-char ${cls}">${chars[i]}</span>`;
    }
    return html;
  },

  handleTypingInput(val) {
    if (!this.startTime) {
      this.startTime = Date.now();
    }
    if (window.appSound) {
      window.appSound.playTone(850, 'triangle', 0.03, 0.15);
    }

    this.userTyped = val;
    const box = document.getElementById('typing-display-box');
    if (box) box.innerHTML = this.renderFormattedText();

    // Calculate real-time stats
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    const wordCount = val.length / 5;
    const wpm = elapsedMinutes > 0 ? Math.round(wordCount / elapsedMinutes) : 0;

    let mistakes = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== this.text[i]) mistakes++;
    }
    this.errors = mistakes;

    const acc = val.length > 0 ? Math.max(0, Math.round(((val.length - mistakes) / val.length) * 100)) : 100;

    const wpmEl = document.getElementById('typing-wpm-val');
    const accEl = document.getElementById('typing-acc-val');
    const errEl = document.getElementById('typing-err-val');

    if (wpmEl) wpmEl.textContent = wpm;
    if (accEl) accEl.textContent = `${acc}%`;
    if (errEl) errEl.textContent = mistakes;

    // Check completion
    if (val.length >= this.text.length) {
      this.finishTest(wpm, acc);
    }
  },

  finishTest(finalWpm = 0, finalAcc = 100) {
    this.engine.stopTimer();
    const elapsedMinutes = this.startTime ? (Date.now() - this.startTime) / 60000 : 0.5;
    const wordCount = this.userTyped.length / 5;
    const wpm = finalWpm || (elapsedMinutes > 0 ? Math.round(wordCount / elapsedMinutes) : 0);
    const acc = finalAcc;

    let score = Math.round(wpm * 2.5 + (acc >= 90 ? 40 : 15));
    if (acc === 100) score += 30;

    this.engine.addScore(score);
    this.engine.correctAnswers = acc >= 75 ? 1 : 0;

    setTimeout(() => {
      this.engine.finishGame(true);
    }, 600);
  },

  cleanup() {}
};

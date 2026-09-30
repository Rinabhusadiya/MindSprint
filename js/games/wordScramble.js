/**
 * MindSprint - Game 6: Word Scramble
 * Anagram solving across varied knowledge domains
 */

window.GAME_MODULES['word_scramble'] = {
  wordsDatabase: {
    animals: [
      'LION', 'BEAR', 'WOLF', 'DEER', 'HAWK', 'FROG', 'DUCK', 'CRAB', 'PUMA', 'SEAL', 'OTTER', 'KOALA', 'PANDA', 'ZEBRA', 'TIGER', 'EAGLE',
      'DOLPHIN', 'PENGUIN', 'CHEETAH', 'GIRAFFE', 'LEOPARD', 'GORILLA', 'HAMSTER', 'BUFFALO', 'OCTOPUS', 'FALCON', 'BADGER',
      'KANGAROO', 'CROCODILE', 'CHAMELEON', 'ELEPHANT', 'FLAMINGO', 'HEDGEHOG', 'JELLYFISH', 'ALLIGATOR'
    ],
    food: [
      'APPLE', 'BREAD', 'PIZZA', 'MANGO', 'LEMON', 'BERRY', 'PEACH', 'GRAPE', 'SALAD', 'TOAST', 'ONION', 'SUSHI',
      'BANANA', 'BURGER', 'CARROT', 'CHEESE', 'MUFFIN', 'NOODLE', 'WAFFLE', 'GARLIC', 'TOMATO', 'ORANGE', 'AVOCADO', 'PANCAKE',
      'CHOCOLATE', 'SANDWICH', 'SPAGHETTI', 'PINEAPPLE', 'BLUEBERRY', 'CROISSANT', 'GUACAMOLE'
    ],
    technology: [
      'ROBOT', 'PHONE', 'MOUSE', 'CABLE', 'PIXEL', 'CLOUD', 'DRIVE', 'CHIP', 'CYBER', 'LOGIC',
      'LAPTOP', 'SCREEN', 'CAMERA', 'SERVER', 'ROUTER', 'ENGINE', 'MEMORY', 'SOCKET', 'CIRCUIT', 'NETWORK',
      'SATELLITE', 'PROCESSOR', 'ALGORITHM', 'INTERFACE', 'HARDWARE', 'DATABASE', 'KEYBOARD', 'BLUETOOTH'
    ],
    nature: [
      'RIVER', 'STORM', 'OCEAN', 'SOLAR', 'BEACH', 'CLIFF', 'CLOUD', 'PLANT', 'DESERT', 'FOREST',
      'VOLCANO', 'GLACIER', 'SUNRISE', 'CANYON', 'RAINBOW', 'THUNDER', 'TROPICS', 'VALLEY', 'SUNSET', 'ISLAND',
      'MOUNTAIN', 'WATERFALL', 'LIGHTNING', 'HURRICANE', 'RAINFOREST', 'AVALANCHE', 'EARTHQUAKE'
    ],
    science: [
      'ATOM', 'CELL', 'ORBIT', 'FORCE', 'LIGHT', 'SPACE', 'COMET', 'LASER', 'RADAR', 'SCALE',
      'PLANET', 'GALAXY', 'OXYGEN', 'ENERGY', 'FUSION', 'PROTON', 'OPTICS', 'GENOME', 'NEURON', 'VACUUM',
      'GRAVITY', 'MOLECULE', 'ASTEROID', 'QUANTUM', 'SPECTRUM', 'ELECTRON', 'TELESCOPE', 'CHEMISTRY'
    ],
    mind: [
      'LOGIC', 'FOCUS', 'BRAIN', 'SMART', 'QUICK', 'THINK', 'SHARP', 'SOLVE', 'ALERT', 'LEARN',
      'MEMORY', 'PUZZLE', 'RIDDLE', 'WISDOM', 'GENIUS', 'REASON', 'ENERGY', 'INSIGHT', 'TACTIC', 'CLEVER',
      'COGNITION', 'CREATIVE', 'STRATEGY', 'INTELLECT', 'SYLLABLE', 'SYNAPSE', 'INTUITION'
    ]
  },
  unseenWords: {},

  start(container, options) {
    this.container = container;
    this.engine = options.engine;
    this.difficulty = options.difficulty;
    this.isRelaxMode = options.isRelaxMode;
    this.round = 1;
    this.totalRounds = 4;
    this.engine.totalQuestions = this.totalRounds;
    this.engine.correctAnswers = 0;

    this.nextWord();
  },

  pickWord() {
    const cats = Object.keys(this.wordsDatabase);
    const category = cats[Math.floor(Math.random() * cats.length)];

    if (!this.unseenWords[category] || this.unseenWords[category].length === 0) {
      this.unseenWords[category] = [...this.wordsDatabase[category]].sort(() => Math.random() - 0.5);
    }

    let candidateList = this.unseenWords[category];
    let diffFiltered = candidateList;
    if (this.difficulty === 'easy') {
      diffFiltered = candidateList.filter(w => w.length <= 5);
    } else if (this.difficulty === 'medium') {
      diffFiltered = candidateList.filter(w => w.length >= 5 && w.length <= 7);
    } else {
      diffFiltered = candidateList.filter(w => w.length >= 6);
    }

    let word;
    if (diffFiltered.length > 0) {
      word = diffFiltered[0];
      const idx = this.unseenWords[category].indexOf(word);
      if (idx !== -1) this.unseenWords[category].splice(idx, 1);
    } else {
      let fullList = [...this.wordsDatabase[category]].sort(() => Math.random() - 0.5);
      if (this.difficulty === 'easy') fullList = fullList.filter(w => w.length <= 5);
      else if (this.difficulty === 'medium') fullList = fullList.filter(w => w.length >= 5 && w.length <= 7);
      else fullList = fullList.filter(w => w.length >= 6);
      if (fullList.length === 0) fullList = [...this.wordsDatabase[category]];
      word = fullList[0];
      this.unseenWords[category] = fullList.slice(1);
    }

    return { word, category };
  },

  scramble(str) {
    const arr = str.split('');
    let shuffled = '';
    do {
      shuffled = arr.sort(() => Math.random() - 0.5).join('');
    } while (shuffled === str && str.length > 2);
    return shuffled;
  },

  nextWord() {
    if (this.round > this.totalRounds) {
      this.engine.finishGame(true);
      return;
    }

    const { word, category } = this.pickWord();
    this.targetWord = word;
    this.categoryName = category;
    this.scrambled = this.scramble(word);

    this.pickedLetters = [];
    this.poolItems = this.scrambled.split('').map((char, id) => ({ id, char, used: false }));

    const roundSeconds = this.difficulty === 'easy' ? 25 : this.difficulty === 'medium' ? 18 : 14;
    this.engine.startCountdownTimer(roundSeconds, () => {
      this.handleTimeout();
    });

    this.renderQuestion();
  },

  renderQuestion() {
    this.container.innerHTML = `
      <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem;">
        Word ${this.round} of ${this.totalRounds}
      </div>
      <div class="scramble-category-badge">Category: ${this.categoryName.toUpperCase()}</div>

      <!-- Target Slots Row -->
      <div class="scramble-slots-row" id="scramble-slots">
        ${this.targetWord.split('').map((_, i) => {
          const item = this.pickedLetters[i];
          return `
            <div class="letter-slot ${item ? 'filled' : ''}" data-slot-idx="${i}">
              ${item ? item.char : ''}
            </div>
          `;
        }).join('')}
      </div>

      <!-- Pool Letters Row -->
      <div class="scramble-pool-row" id="scramble-pool">
        ${this.poolItems.map(p => `
          <button class="pool-letter-btn ${p.used ? 'used' : ''}" data-pool-id="${p.id}">
            ${p.char}
          </button>
        `).join('')}
      </div>

      <div class="scramble-actions">
        <button class="btn-secondary" id="btn-scramble-hint" style="font-size: 0.85rem; padding: 0.45rem 1rem;">
          💡 Hint
        </button>
        <button class="btn-secondary" id="btn-scramble-clear" style="font-size: 0.85rem; padding: 0.45rem 1rem;">
          🔄 Clear
        </button>
      </div>
    `;

    // Bind Pool letter clicks
    this.container.querySelectorAll('.pool-letter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const poolId = parseInt(btn.getAttribute('data-pool-id'), 10);
        this.selectPoolLetter(poolId);
      });
    });

    // Bind Slot clicks to undo
    this.container.querySelectorAll('.letter-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        const idx = parseInt(slot.getAttribute('data-slot-idx'), 10);
        this.removeLetterFromSlot(idx);
      });
    });

    // Hint button
    const hintBtn = document.getElementById('btn-scramble-hint');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        const firstLetter = this.targetWord[0];
        const lastLetter = this.targetWord[this.targetWord.length - 1];
        alert(`💡 Clue: Starts with '${firstLetter}' and ends with '${lastLetter}'`);
      });
    }

    // Clear button
    const clearBtn = document.getElementById('btn-scramble-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.pickedLetters = [];
        this.poolItems.forEach(p => p.used = false);
        this.renderQuestion();
      });
    }
  },

  selectPoolLetter(poolId) {
    const item = this.poolItems.find(p => p.id === poolId);
    if (!item || item.used) return;

    if (this.pickedLetters.length < this.targetWord.length) {
      item.used = true;
      this.pickedLetters.push(item);
      if (window.appSound) window.appSound.playClick();
      this.renderQuestion();

      // Check if full word formed
      if (this.pickedLetters.length === this.targetWord.length) {
        this.checkWord();
      }
    }
  },

  removeLetterFromSlot(slotIdx) {
    if (slotIdx >= this.pickedLetters.length) return;
    const item = this.pickedLetters[slotIdx];
    item.used = false;
    this.pickedLetters.splice(slotIdx, 1);
    if (window.appSound) window.appSound.playClick();
    this.renderQuestion();
  },

  checkWord() {
    this.engine.stopTimer();
    const formed = this.pickedLetters.map(p => p.char).join('');

    if (formed === this.targetWord) {
      if (window.appSound) window.appSound.playCorrect();
      this.engine.addScore(30);
      this.engine.incrementCombo();
      this.engine.correctAnswers += 1;

      this.container.querySelectorAll('.letter-slot').forEach(s => {
        s.style.borderColor = '#10b981';
        s.style.background = 'rgba(16, 185, 129, 0.2)';
      });

      setTimeout(() => {
        this.round += 1;
        this.nextWord();
      }, 900);
    } else {
      if (window.appSound) window.appSound.playWrong();
      this.engine.loseLife();
      this.container.querySelectorAll('.letter-slot').forEach(s => {
        s.style.borderColor = '#ef4444';
        s.style.background = 'rgba(239, 68, 68, 0.2)';
      });

      setTimeout(() => {
        this.pickedLetters = [];
        this.poolItems.forEach(p => p.used = false);
        this.renderQuestion();
      }, 1000);
    }
  },

  handleTimeout() {
    this.engine.loseLife();
    this.round += 1;
    this.nextWord();
  },

  cleanup() {}
};

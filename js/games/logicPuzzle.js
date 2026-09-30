/**
 * MindSprint - Game 8: Logic Puzzle
 * Deductive reasoning, relationship analysis, and logic questions
 * Features a large 32-question bank with non-repeating queue across sessions!
 */

window.GAME_MODULES['logic_puzzle'] = {
  puzzlesPool: [
    {
      q: 'Liam is taller than Noah. Noah is taller than Emma. Oliver is taller than Liam. Who is the shortest?',
      options: ['Emma', 'Noah', 'Liam', 'Oliver'],
      answer: 'Emma',
      reason: 'Since Emma is shorter than Noah, who is shorter than Liam and Oliver, Emma is the shortest.'
    },
    {
      q: 'If all Bloops are Razzies, and all Razzies are Lizzies, are all Bloops definitely Lizzies?',
      options: ['Yes, definitely', 'No, never', 'Only some Bloops', 'Cannot be determined'],
      answer: 'Yes, definitely',
      reason: 'By transitive set containment: Bloops ⊆ Razzies ⊆ Lizzies.'
    },
    {
      q: 'A clock shows 3:15. What is the angle between the hour hand and the minute hand?',
      options: ['7.5 degrees', '0 degrees', '15 degrees', '5 degrees'],
      answer: '7.5 degrees',
      reason: 'At 3:15, the minute hand is at 90°, and the hour hand has moved 1/4 of an hour: 30° / 4 = 7.5°.'
    },
    {
      q: 'If yesterday was Wednesday, what day will it be 3 days after tomorrow?',
      options: ['Monday', 'Sunday', 'Saturday', 'Tuesday'],
      answer: 'Monday',
      reason: 'Yesterday was Wednesday, so today is Thursday. Tomorrow is Friday. Three days after Friday is Monday.'
    },
    {
      q: 'Which word does NOT belong with the others?',
      options: ['Ounce', 'Inch', 'Yard', 'Centimeter'],
      answer: 'Ounce',
      reason: 'Ounce measures mass/weight, while inch, yard, and centimeter measure length/distance.'
    },
    {
      q: 'Five machines make 5 widgets in 5 minutes. How many minutes do 100 machines need to make 100 widgets?',
      options: ['5 minutes', '100 minutes', '20 minutes', '1 minute'],
      answer: '5 minutes',
      reason: 'Each machine takes 5 minutes to make 1 widget. So 100 machines make 100 widgets simultaneously in 5 minutes.'
    },
    {
      q: 'Look at this series: 36, 34, 30, 28, 24, ? What number comes next?',
      options: ['22', '20', '26', '18'],
      answer: '22',
      reason: 'This is an alternating subtraction series: -2, -4, -2, -4, -2. 24 - 2 = 22.'
    },
    {
      q: 'A doctor gives you 3 pills and tells you to take one every 30 minutes. How many minutes will the pills last?',
      options: ['60 minutes', '90 minutes', '30 minutes', '45 minutes'],
      answer: '60 minutes',
      reason: 'Pill 1 at 0 mins, Pill 2 at 30 mins, Pill 3 at 60 mins. Total elapsed time = 60 mins.'
    },
    {
      q: 'Some months have 30 days, and some have 31 days. How many months have 28 days?',
      options: ['All 12 months', 'Only 1 month', '2 months', '4 months'],
      answer: 'All 12 months',
      reason: 'Every single month has at least 28 days!'
    },
    {
      q: 'A man points to a photograph and says: "Brothers and sisters I have none, but that man\'s father is my father\'s son." Who is in the photo?',
      options: ['His son', 'His father', 'Himself', 'His nephew'],
      answer: 'His son',
      reason: '"My father\'s son" is the speaker himself (since he has no siblings). So "that man\'s father is me", meaning the photo is his son.'
    },
    {
      q: 'If South-East becomes North, North-East becomes West, and so on, what will West become?',
      options: ['South-East', 'North-East', 'South-West', 'North-West'],
      answer: 'South-East',
      reason: 'The directions are being rotated 135° clockwise. West rotated 135° clockwise becomes South-East.'
    },
    {
      q: 'Which number is the odd one out: 2, 3, 5, 7, 9, 11, 13?',
      options: ['9', '2', '11', '13'],
      answer: '9',
      reason: '9 is a composite number (3 × 3), whereas all other numbers in the set are prime.'
    },
    {
      q: 'A bat and a ball together cost $1.10. The bat costs $1.00 more than the ball. How much does the ball cost?',
      options: ['$0.05', '$0.10', '$0.01', '$0.15'],
      answer: '$0.05',
      reason: 'Ball = $0.05 and Bat = $1.05 ($1.05 - $0.05 = $1.00, and $1.05 + $0.05 = $1.10).'
    },
    {
      q: 'In a race, if you overtake the person in second place, what position are you in?',
      options: ['Second place', 'First place', 'Third place', 'Last place'],
      answer: 'Second place',
      reason: 'You took the second person\'s position, so you are now in second place!'
    },
    {
      q: 'If two\'s company, and three\'s a crowd, what are four and five?',
      options: ['Nine', 'A gang', 'A mob', 'Seven'],
      answer: 'Nine',
      reason: 'Simple arithmetic riddle: 4 + 5 = 9!'
    },
    {
      q: 'If a rooster lays an egg on top of a slanted barn roof, which way does it roll?',
      options: ['Roosters don\'t lay eggs', 'Down the left', 'Down the right', 'It stays on top'],
      answer: 'Roosters don\'t lay eggs',
      reason: 'Roosters are male chickens and do not lay eggs!'
    },
    {
      q: 'Look at the sequence: J, F, M, A, M, J, J, ? What letter comes next?',
      options: ['A', 'S', 'O', 'N'],
      answer: 'A',
      reason: 'These are the first letters of months: January, February... July, August (A).'
    },
    {
      q: 'A farmer has 17 sheep. All but 9 die. How many live sheep does he have left?',
      options: ['9', '8', '0', '17'],
      answer: '9',
      reason: '"All but 9 die" means 9 survived!'
    },
    {
      q: 'Which of the following geometric shapes has the greatest number of sides?',
      options: ['Octagon', 'Heptagon', 'Hexagon', 'Pentagon'],
      answer: 'Octagon',
      reason: 'An octagon has 8 sides, heptagon has 7, hexagon has 6, and pentagon has 5.'
    },
    {
      q: 'If it takes 8 men 10 hours to build a wall, how long would it take 4 men working at the same pace?',
      options: ['20 hours', '5 hours', '15 hours', '40 hours'],
      answer: '20 hours',
      reason: 'Half as many workers need twice as much time: 10 × 2 = 20 hours.'
    },
    {
      q: 'Look at the pattern: 2, 6, 12, 20, 30, ? What comes next?',
      options: ['42', '40', '36', '48'],
      answer: '42',
      reason: 'The increments are +4, +6, +8, +10, +12. 30 + 12 = 42.'
    },
    {
      q: 'Mary\'s father has 5 daughters: Nana, Nene, Nini, Nono. What is the fifth daughter\'s name?',
      options: ['Mary', 'Nunu', 'Nina', 'Nona'],
      answer: 'Mary',
      reason: 'The riddle states "Mary\'s father has 5 daughters", so the fifth is Mary!'
    },
    {
      q: 'Which word is the opposite of "ARTIFICIAL"?',
      options: ['Natural', 'Genuine', 'Solid', 'Future'],
      answer: 'Natural',
      reason: 'Natural directly contrasts with artificial (man-made).'
    },
    {
      q: 'A train leaves Station A traveling at 60 mph. An hour later, a second train leaves traveling 90 mph. How long until the second train catches up?',
      options: ['2 hours', '1.5 hours', '3 hours', '1 hour'],
      answer: '2 hours',
      reason: 'First train has a 60-mile lead. The relative speed is 90 - 60 = 30 mph. 60 miles / 30 mph = 2 hours.'
    },
    {
      q: 'If all Zips are Zaps, and no Zaps are Zops, can any Zip be a Zop?',
      options: ['No, impossible', 'Yes, definitely', 'Only in some cases', 'Cannot tell'],
      answer: 'No, impossible',
      reason: 'Since Zips are inside Zaps, and Zaps have zero overlap with Zops, no Zip can be a Zop.'
    },
    {
      q: 'What is heavier: a pound of gold or a pound of feathers?',
      options: ['They weigh the same', 'Gold', 'Feathers', 'Depends on gravity'],
      answer: 'They weigh the same',
      reason: 'A pound is a unit of weight; both weigh exactly one pound!'
    },
    {
      q: 'Look at the sequence: 1, 1, 2, 3, 5, 8, 13, ? What number comes next?',
      options: ['21', '20', '18', '24'],
      answer: '21',
      reason: 'This is the Fibonacci sequence: 8 + 13 = 21.'
    },
    {
      q: 'How many sides does a circle have?',
      options: ['2 (Inside and Outside)', '0', 'Infinite', '1'],
      answer: '2 (Inside and Outside)',
      reason: 'A classic logic riddle: a circle has an inside and an outside!'
    },
    {
      q: 'What comes once in a minute, twice in a moment, but never in a thousand years?',
      options: ['The letter M', 'A second', 'Time', 'A breath'],
      answer: 'The letter M',
      reason: 'The letter "M" appears once in "minute", twice in "moment", and 0 times in "a thousand years".'
    },
    {
      q: 'A lily pad doubles in size every day. If it covers the entire pond on Day 48, on which day does it cover half the pond?',
      options: ['Day 47', 'Day 24', 'Day 46', 'Day 12'],
      answer: 'Day 47',
      reason: 'Since it doubles every day, on the day right before Day 48 (Day 47), it covered exactly half!'
    },
    {
      q: 'You are in a dark room with a candle, a wood stove, and a gas lamp. You only have one match. What do you light first?',
      options: ['The match', 'The candle', 'The stove', 'The lamp'],
      answer: 'The match',
      reason: 'You must light the match first before lighting anything else!'
    },
    {
      q: 'Which number divided by any non-zero number always equals 0?',
      options: ['0', '1', 'Infinity', '-1'],
      answer: '0',
      reason: '0 divided by any non-zero number is always 0.'
    }
  ],

  unseenQueue: [],

  start(container, options) {
    this.container = container;
    this.engine = options.engine;
    this.difficulty = options.difficulty;
    this.isRelaxMode = options.isRelaxMode;
    this.round = 1;
    this.totalRounds = 4;
    this.engine.totalQuestions = this.totalRounds;
    this.engine.correctAnswers = 0;

    // Persistent unseen pool across replays - guarantees brand new questions every time!
    if (!this.unseenQueue || this.unseenQueue.length < this.totalRounds) {
      this.unseenQueue = [...this.puzzlesPool].sort(() => Math.random() - 0.5);
    }

    // Pull 4 unique questions for this session
    this.sessionPuzzles = this.unseenQueue.splice(0, this.totalRounds);
    this.nextPuzzle();
  },

  nextPuzzle() {
    if (this.round > this.totalRounds) {
      this.engine.finishGame(true);
      return;
    }

    const currentPuzzle = this.sessionPuzzles[this.round - 1];
    this.currentPuzzle = currentPuzzle;

    const roundSeconds = this.difficulty === 'easy' ? 24 : this.difficulty === 'medium' ? 18 : 13;
    this.engine.startCountdownTimer(roundSeconds, () => {
      this.handleTimeout();
    });

    // Shuffle choices
    const shuffledChoices = [...currentPuzzle.options].sort(() => Math.random() - 0.5);
    const letters = ['A', 'B', 'C', 'D'];

    this.container.innerHTML = `
      <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
        Puzzle ${this.round} of ${this.totalRounds}
      </div>

      <div class="puzzle-question-card">
        <div class="puzzle-question-text">${currentPuzzle.q}</div>
      </div>

      <div class="puzzle-options-list">
        ${shuffledChoices.map((opt, i) => `
          <button class="puzzle-option-btn" data-choice="${opt}">
            <span class="puzzle-opt-badge">${letters[i]}</span>
            <span>${opt}</span>
          </button>
        `).join('')}
      </div>
      <div id="puzzle-feedback" style="min-height: 24px; font-size: 0.88rem; font-weight: 600; margin-top: 0.5rem;"></div>
    `;

    const buttons = this.container.querySelectorAll('.puzzle-option-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const choice = btn.getAttribute('data-choice');
        this.checkAnswer(choice, btn, buttons);
      });
    });
  },

  checkAnswer(choice, clickedBtn, allButtons) {
    this.engine.stopTimer();
    allButtons.forEach(b => b.style.pointerEvents = 'none');
    const feedback = document.getElementById('puzzle-feedback');

    if (choice === this.currentPuzzle.answer) {
      clickedBtn.style.borderColor = '#10b981';
      clickedBtn.style.background = 'rgba(16, 185, 129, 0.2)';
      if (window.appSound) window.appSound.playCorrect();
      this.engine.addScore(30);
      this.engine.incrementCombo();
      this.engine.correctAnswers += 1;
      if (feedback) {
        feedback.innerHTML = `<span style="color: #10b981;">✓ Correct! ${this.currentPuzzle.reason}</span>`;
      }
    } else {
      clickedBtn.style.borderColor = '#ef4444';
      clickedBtn.style.background = 'rgba(239, 68, 68, 0.2)';
      allButtons.forEach(b => {
        if (b.getAttribute('data-choice') === this.currentPuzzle.answer) {
          b.style.borderColor = '#10b981';
          b.style.background = 'rgba(16, 185, 129, 0.2)';
        }
      });
      if (window.appSound) window.appSound.playWrong();
      this.engine.loseLife();
      if (feedback) {
        feedback.innerHTML = `<span style="color: #ef4444;">✗ Explanation: ${this.currentPuzzle.reason}</span>`;
      }
    }

    setTimeout(() => {
      this.round += 1;
      this.nextPuzzle();
    }, 1800);
  },

  handleTimeout() {
    this.engine.loseLife();
    this.round += 1;
    this.nextPuzzle();
  },

  cleanup() {}
};

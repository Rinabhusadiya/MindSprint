/**
 * MindSprint - Daily Challenge Engine
 * Date-seeded 5-exercise daily training routine with completion rewards
 */

class DailyChallengeManager {
  constructor() {
    this.todayStr = new Date().toISOString().split('T')[0];
    this.data = this.loadDailyData();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.renderDailyUI());
    } else {
      this.renderDailyUI();
    }
  }

  loadDailyData() {
    const raw = window.localStorage.getItem('mindsprint_daily_state');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.date === this.todayStr) {
          return parsed;
        }
      } catch (e) {}
    }
    // New day routine
    return {
      date: this.todayStr,
      completedGames: [],
      dailyScore: 0,
      claimedBonus: false
    };
  }

  saveDailyData() {
    try {
      window.localStorage.setItem('mindsprint_daily_state', JSON.stringify(this.data));
    } catch (e) {}
  }

  getTodayChallenges() {
    // 5 curated categories representing the daily regimen
    return [
      { id: 'memory_match', name: 'Memory Match', category: 'Memory', icon: '🃏', goal: 'Find all matching pairs' },
      { id: 'quick_math', name: 'Quick Math', category: 'Logic', icon: '➗', goal: 'Solve 5 rapid arithmetic problems' },
      { id: 'find_different', name: 'Find The Different', category: 'Focus', icon: '🔍', goal: 'Spot the subtle anomaly' },
      { id: 'reaction_test', name: 'Reaction Test', category: 'Speed', icon: '⚡️', goal: 'Test your reaction speed' },
      { id: 'word_scramble', name: 'Word Scramble', category: 'Word', icon: '🔤', goal: 'Unscramble the secret word' }
    ];
  }

  recordGameCompletion(gameId, score) {
    const challenges = this.getTodayChallenges();
    const isTodayTask = challenges.some(c => c.id === gameId);
    if (!isTodayTask) return;

    if (!this.data.completedGames.includes(gameId)) {
      this.data.completedGames.push(gameId);
      this.data.dailyScore += score;
      
      // If all 5 completed and bonus not yet claimed
      if (this.data.completedGames.length === 5 && !this.data.claimedBonus) {
        this.data.claimedBonus = true;
        this.data.dailyScore += 200; // 200 bonus points for full daily completion!
        window.appStorage.state.totalScore += 200;
        window.appStorage.recordPlayForStreak();
        window.appStorage.saveState();

      }
      this.saveDailyData();
      this.renderDailyUI();
    }
  }

  renderDailyUI() {
    const container = document.getElementById('daily-games-list');
    const dateLabel = document.getElementById('daily-date-label');
    const progressFill = document.getElementById('daily-progress-fill');
    const progressText = document.getElementById('daily-progress-text');
    const scoreVal = document.getElementById('daily-score-val');

    if (dateLabel) {
      const now = new Date();
      const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      dateLabel.textContent = `Today • ${now.toLocaleDateString('en-US', options)}`;
    }

    const challenges = this.getTodayChallenges();
    const countCompleted = this.data.completedGames.length;
    const pct = Math.round((countCompleted / challenges.length) * 100);

    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressText) progressText.textContent = `${countCompleted} of ${challenges.length} Exercises Done (${pct}%)`;
    if (scoreVal) scoreVal.textContent = this.data.dailyScore;

    if (container) {
      container.innerHTML = '';
      challenges.forEach(ch => {
        const isDone = this.data.completedGames.includes(ch.id);
        const card = document.createElement('div');
        card.className = `daily-game-item ${isDone ? 'completed' : ''}`;
        card.innerHTML = `
          <div class="daily-game-left">
            <div class="daily-game-icon">${ch.icon}</div>
            <div>
              <div class="daily-game-name">${ch.name}</div>
              <div class="daily-game-category">${ch.category} • ${ch.goal}</div>
            </div>
          </div>
          <div>
            ${isDone 
              ? `<span class="daily-status-btn btn-done">✓ Done</span>`
              : `<button class="daily-status-btn btn-play" onclick="window.gameEngine.openGame('${ch.id}', true)">Play</button>`
            }
          </div>
        `;
        container.appendChild(card);
      });
    }
  }
}

window.appDaily = new DailyChallengeManager();

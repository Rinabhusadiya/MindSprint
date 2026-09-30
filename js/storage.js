/**
 * MindSprint - Storage Management Module
 * Robust LocalStorage wrapper with fallback, persistence and state helpers
 */

const STORAGE_KEYS = {
  STATE: 'mindsprint_app_state',
  ACHIEVEMENTS: 'mindsprint_achievements',
  DAILY: 'mindsprint_daily_challenge',
  SCORES: 'mindsprint_game_scores'
};

const DEFAULT_STATE = {
  theme: 'dark',
  soundEnabled: true,
  volume: 0.8,
  bgAnimation: true,
  relaxMode: false,
  reducedMotion: false,
  defaultDifficulty: 'medium',
  playerName: 'Brain Runner',
  totalScore: 0,
  bestScore: 0,
  gamesPlayed: 0,
  totalTimeSeconds: 0,
  streak: {
    current: 1,
    longest: 1,
    lastPlayedDate: new Date().toISOString().split('T')[0]
  },
  gameStats: {},
  categoryStats: {
    memory: { played: 0, totalAccuracy: 0, totalScore: 0 },
    logic: { played: 0, totalAccuracy: 0, totalScore: 0 },
    focus: { played: 0, totalAccuracy: 0, totalScore: 0 },
    speed: { played: 0, totalAccuracy: 0, totalScore: 0 },
    math: { played: 0, totalAccuracy: 0, totalScore: 0 },
    word: { played: 0, totalAccuracy: 0, totalScore: 0 },
    battle: { played: 0, totalAccuracy: 0, totalScore: 0 }
  }
};

class StorageManager {
  constructor() {
    this.memoryFallback = {};
    this.state = this.loadState();
    this.checkStreakIntegrity();
  }

  isLocalStorageAvailable() {
    try {
      const test = '__storage_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  loadState() {
    if (this.isLocalStorageAvailable()) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.STATE);
        if (raw) {
          const parsed = JSON.parse(raw);
          return { ...DEFAULT_STATE, ...parsed };
        }
      } catch (err) {
        console.warn('Error reading from localStorage:', err);
      }
    }
    return { ...DEFAULT_STATE };
  }

  saveState() {
    if (this.isLocalStorageAvailable()) {
      try {
        window.localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(this.state));
      } catch (err) {
        console.warn('Error writing to localStorage:', err);
      }
    }
  }

  getSetting(key) {
    return this.state[key] !== undefined ? this.state[key] : DEFAULT_STATE[key];
  }

  setSetting(key, value) {
    this.state[key] = value;
    this.saveState();
  }

  // --- Streak Calculations ---
  checkStreakIntegrity() {
    const today = new Date().toISOString().split('T')[0];
    const streak = this.state.streak || { current: 1, longest: 1, lastPlayedDate: today };

    if (!streak.lastPlayedDate) {
      streak.lastPlayedDate = today;
      streak.current = 1;
      streak.longest = 1;
    } else {
      const lastDate = new Date(streak.lastPlayedDate);
      const currDate = new Date(today);
      const diffDays = Math.floor((currDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Logged in next day, maintain streak
      } else if (diffDays > 1) {
        // Streak broken
        streak.current = 1;
      }
    }

    this.state.streak = streak;
    this.saveState();
  }

  recordPlayForStreak() {
    const today = new Date().toISOString().split('T')[0];
    const streak = this.state.streak;

    if (streak.lastPlayedDate !== today) {
      const lastDate = new Date(streak.lastPlayedDate);
      const currDate = new Date(today);
      const diffDays = Math.floor((currDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak.current += 1;
      } else if (diffDays > 1) {
        streak.current = 1;
      }

      if (streak.current > streak.longest) {
        streak.longest = streak.current;
      }
      streak.lastPlayedDate = today;
      this.saveState();
    }
  }

  formatDuration(seconds = 0) {
    const s = Math.round(seconds);
    if (s <= 0) return '0s';
    if (s < 60) return `${s}s`;
    const mins = Math.floor(s / 60);
    const remSec = s % 60;
    if (mins < 60) {
      return remSec > 0 ? `${mins}m ${remSec}s` : `${mins}m`;
    }
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h`;
  }

  // --- Gameplay Recording ---
  recordGameResult(gameId, category, score, accuracy, timeTaken) {
    this.state.totalScore = (this.state.totalScore || 0) + score;
    this.state.gamesPlayed = (this.state.gamesPlayed || 0) + 1;
    this.state.totalTimeSeconds = (this.state.totalTimeSeconds || 0) + (timeTaken || 0);
    this.state.totalAccuracySum = (this.state.totalAccuracySum || 0) + (accuracy || 0);
    
    if (score > (this.state.bestScore || 0)) {
      this.state.bestScore = score;
    }

    // Update specific game stats
    if (!this.state.gameStats) {
      this.state.gameStats = {};
    }
    if (!this.state.gameStats[gameId]) {
      this.state.gameStats[gameId] = {
        timesPlayed: 0,
        bestScore: 0,
        bestAccuracy: 0,
        bestTime: 9999,
        totalTimeSpent: 0,
        totalScore: 0,
        totalAccuracy: 0
      };
    }

    const gStats = this.state.gameStats[gameId];
    gStats.timesPlayed = (gStats.timesPlayed || 0) + 1;
    gStats.totalTimeSpent = (gStats.totalTimeSpent || 0) + (timeTaken || 0);
    gStats.totalScore = (gStats.totalScore || 0) + score;
    gStats.totalAccuracy = (gStats.totalAccuracy || 0) + accuracy;
    if (score > (gStats.bestScore || 0)) gStats.bestScore = score;
    if (accuracy > (gStats.bestAccuracy || 0)) gStats.bestAccuracy = accuracy;
    if (timeTaken > 0 && timeTaken < (gStats.bestTime || 9999)) gStats.bestTime = timeTaken;

    // Update category performance
    if (!this.state.categoryStats) {
      this.state.categoryStats = {};
    }
    if (category) {
      if (!this.state.categoryStats[category]) {
        this.state.categoryStats[category] = { played: 0, totalScore: 0, totalAccuracy: 0 };
      }
      const cat = this.state.categoryStats[category];
      cat.played += 1;
      cat.totalScore += score;
      cat.totalAccuracy += accuracy;
    }

    this.recordPlayForStreak();
    this.saveState();
  }

  // --- Live Brain Profile Computation ---
  getBrainProfile() {
    const stats = this.state;
    const gameStats = stats.gameStats || {};
    const catStats = stats.categoryStats || {};

    // Helper to calculate live domain metrics directly from active gameplay
    const computeDomain = (gameIds, catKey) => {
      let played = 0;
      let totalAcc = 0;
      let totalScore = 0;
      let bestScore = 0;

      // Scan all matching games
      gameIds.forEach(id => {
        const gs = gameStats[id];
        if (gs && gs.timesPlayed > 0) {
          played += gs.timesPlayed;
          totalScore += (gs.totalScore || gs.bestScore || 0);
          totalAcc += (gs.totalAccuracy !== undefined ? gs.totalAccuracy : (gs.bestAccuracy || 0) * gs.timesPlayed);
          if ((gs.bestScore || 0) > bestScore) bestScore = gs.bestScore;
        }
      });

      // Synchronize with categoryStats
      if (catKey && catStats[catKey]) {
        const cs = catStats[catKey];
        if (cs.played > played) {
          played = cs.played;
          totalAcc = cs.totalAccuracy;
          totalScore = cs.totalScore;
        }
      }

      const avgAcc = played > 0 ? Math.round(totalAcc / played) : 0;
      
      // Dynamic live score: 0 if no workouts, calculated live from accuracy + experience + peak score
      let val = 0;
      if (played > 0) {
        const accScore = avgAcc * 0.7; // up to 70 pts
        const volBonus = Math.min(20, played * 4); // up to 20 pts from training experience
        const bestBonus = Math.min(10, Math.round(bestScore / 60)); // up to 10 pts from high score
        val = Math.min(99, Math.max(15, Math.round(accScore + volBonus + bestBonus)));
      }

      return {
        played,
        avgAcc,
        bestScore,
        val
      };
    };

    const memory = computeDomain(['memory_sequence', 'memory_match', 'number_memory'], 'memory');
    const logic = computeDomain(['number_pattern', 'quick_math', 'logic_puzzle'], 'logic');
    const focus = computeDomain(['find_different', 'focus_challenge', 'odd_color'], 'focus');
    const speed = computeDomain(['reaction_test', 'typing_speed'], 'speed');

    // Total overall accuracy across all games played
    let totalPlayed = stats.gamesPlayed || 0;
    let totalAccSum = stats.totalAccuracySum || 0;
    if (!totalAccSum && stats.gameStats) {
      Object.values(stats.gameStats).forEach(gs => {
        if (gs.timesPlayed) {
          totalAccSum += (gs.totalAccuracy !== undefined ? gs.totalAccuracy : (gs.bestAccuracy || 0) * gs.timesPlayed);
        }
      });
    }

    const overallAvgAcc = totalPlayed > 0 && totalAccSum > 0 ? Math.min(100, Math.round(totalAccSum / totalPlayed)) : 0;
    const accuracyDomain = {
      played: totalPlayed,
      avgAcc: overallAvgAcc,
      bestScore: stats.bestScore || 0,
      val: overallAvgAcc
    };

    // Calculate Overall Brain Index live
    const activeDomains = [memory.val, logic.val, focus.val, speed.val].filter(v => v > 0);
    let overallIndex = 0;
    if (activeDomains.length > 0) {
      const activeAvg = activeDomains.reduce((a, b) => a + b, 0) / activeDomains.length;
      overallIndex = Math.min(99, Math.round(activeAvg * 0.75 + overallAvgAcc * 0.25));
    } else if (totalPlayed > 0 && overallAvgAcc > 0) {
      overallIndex = overallAvgAcc;
    }

    return {
      memory,
      logic,
      focus,
      speed,
      accuracy: accuracyDomain,
      overallIndex,
      totalGames: totalPlayed
    };
  }

  // --- Reset All Data ---
  resetAll() {
    if (this.isLocalStorageAvailable()) {
      window.localStorage.removeItem(STORAGE_KEYS.STATE);
      window.localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
      window.localStorage.removeItem(STORAGE_KEYS.DAILY);
      window.localStorage.removeItem(STORAGE_KEYS.SCORES);
    }
    this.state = { ...DEFAULT_STATE, streak: { current: 1, longest: 1, lastPlayedDate: new Date().toISOString().split('T')[0] } };
    this.saveState();
  }
}

window.appStorage = new StorageManager();

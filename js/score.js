/**
 * MindSprint - Score & Brain Profile Engine
 * Computes ratings, combos, difficulty bonuses, brain domain performance, and local rankings
 */

class ScoreManager {
  constructor() {}

  calculateRoundScore(baseCorrect, totalQuestions, timeTakenSec, difficulty, combo = 1) {
    const diffMultipliers = { easy: 1.0, medium: 1.5, hard: 2.0 };
    const mult = diffMultipliers[difficulty] || 1.0;

    // Accuracy calculation
    const accuracy = totalQuestions > 0 ? Math.round((baseCorrect / totalQuestions) * 100) : 0;

    // Base score: 15 points per correct item
    let points = baseCorrect * 15;

    // Speed bonus: rewarded if completed efficiently
    if (timeTakenSec > 0 && timeTakenSec < totalQuestions * 8) {
      const timeBonus = Math.max(0, Math.round((totalQuestions * 8 - timeTakenSec) * 3));
      points += timeBonus;
    }

    // Combo streak bonus
    if (combo > 1) {
      points += Math.round(combo * 5);
    }

    // Apply difficulty multiplier
    points = Math.round(points * mult);

    // Flawless round bonus
    if (accuracy === 100 && baseCorrect >= 3) {
      points += 50;
    }

    return {
      points: Math.max(10, points),
      accuracy,
      timeTaken: Math.round(timeTakenSec)
    };
  }

  getPerformanceRating(score, accuracy) {
    if (accuracy === 100 && score >= 200) return '🧠 Genius';
    if (accuracy >= 90 && score >= 140) return '⚡️ Master';
    if (accuracy >= 80) return '🌟 Excellent';
    if (accuracy >= 65) return '👍 Great';
    return '🌱 Developing';
  }

  renderBrainProfile() {
    const profile = window.appStorage.getBrainProfile();
    const stats = window.appStorage.state;
    const streak = window.appStorage.getSetting('streak') || { current: 1 };

    const nameEl = document.getElementById('profile-player-name');
    const rankEl = document.getElementById('profile-rank-badge');
    const scoreEl = document.getElementById('profile-brain-index');
    const subtitleEl = document.getElementById('profile-index-subtitle');
    const gamesPlayedEl = document.getElementById('profile-games-count');

    const totalPlayed = stats.gamesPlayed || 0;
    const overallIndex = profile.overallIndex || 0;

    if (nameEl) nameEl.textContent = stats.playerName || 'Brain Runner';

    // Dynamic Rank Title
    let rankTitle = '🌱 Novice Explorer';
    if (totalPlayed >= 16 && overallIndex >= 85) {
      rankTitle = '👑 Neuro Grandmaster';
    } else if (totalPlayed >= 9 && overallIndex >= 70) {
      rankTitle = '🎯 Synapse Master';
    } else if (totalPlayed >= 4 && overallIndex >= 50) {
      rankTitle = '🧠 Brain Athlete';
    } else if (totalPlayed >= 1) {
      rankTitle = '⚡️ Cognitive Trainee';
    }
    if (rankEl) rankEl.textContent = rankTitle;

    // Overall Brain Index
    if (scoreEl) {
      scoreEl.textContent = overallIndex;
    }
    if (subtitleEl) {
      subtitleEl.textContent = totalPlayed > 0 ? 'Live dynamic cognitive index' : 'Play games to calibrate index';
    }

    // Games Count & Training Summary
    if (gamesPlayedEl) {
      const timeStr = window.appStorage.formatDuration(stats.totalTimeSeconds || 0);
      gamesPlayedEl.textContent = `${totalPlayed} Games Completed • ⏱️ ${timeStr} Total Training Time • 🔥 ${streak.current || 1} Day Streak`;
    }

    // Render 5 categories metrics
    const metricsConfig = [
      {
        key: 'memory',
        name: 'Memory',
        icon: '🧩',
        data: profile.memory,
        color: '#8b5cf6',
        desc: 'Visual recall, sequence retention, and working memory.'
      },
      {
        key: 'logic',
        name: 'Logic & Reasoning',
        icon: '💡',
        data: profile.logic,
        color: '#3b82f6',
        desc: 'Pattern deduction, mathematical fluency, and analytical agility.'
      },
      {
        key: 'focus',
        name: 'Focus & Observation',
        icon: '🎯',
        data: profile.focus,
        color: '#f59e0b',
        desc: 'Sustained attention, anomaly detection, and color discernment.'
      },
      {
        key: 'speed',
        name: 'Processing Speed',
        icon: '⚡️',
        data: profile.speed,
        color: '#ef4444',
        desc: 'Motor reflex, visual recognition, and keystroke pace.'
      },
      {
        key: 'accuracy',
        name: 'Cognitive Accuracy',
        icon: '💎',
        data: profile.accuracy,
        color: '#10b981',
        desc: 'Precision under timed conditions and mistake avoidance.'
      }
    ];

    const grid = document.getElementById('profile-metrics-grid');
    if (grid) {
      grid.innerHTML = '';
      metricsConfig.forEach(m => {
        const d = m.data;
        const isUntrained = d.played === 0;

        let tierLabel = 'Untrained';
        let tierColor = 'var(--text-muted)';
        let tierBg = 'rgba(148, 163, 184, 0.15)';

        if (!isUntrained) {
          if (d.val >= 88) {
            tierLabel = '🧠 Genius';
            tierColor = '#10b981';
            tierBg = 'rgba(16, 185, 129, 0.15)';
          } else if (d.val >= 75) {
            tierLabel = '⚡️ Advanced';
            tierColor = '#6366f1';
            tierBg = 'rgba(99, 102, 241, 0.15)';
          } else if (d.val >= 60) {
            tierLabel = '👍 Proficient';
            tierColor = '#f59e0b';
            tierBg = 'rgba(245, 158, 11, 0.15)';
          } else {
            tierLabel = '🌱 Practicing';
            tierColor = '#06b6d4';
            tierBg = 'rgba(6, 182, 212, 0.15)';
          }
        }

        // Live insight recommendation
        let insight = m.desc;
        if (isUntrained) {
          insight = `💡 No workouts completed yet. Play exercises in this skill to calibrate and activate live tracking.`;
        } else {
          insight = `🎯 Live stats: ${d.played} session${d.played > 1 ? 's' : ''} completed with ${d.avgAcc}% average accuracy. High score: ${d.bestScore} pts.`;
        }

        const card = document.createElement('div');
        card.className = 'metric-card';
        card.innerHTML = `
          <div class="metric-header">
            <div class="metric-title-group">
              <span class="metric-icon">${m.icon}</span>
              <span class="metric-name">${m.name}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="metric-tier-tag" style="color: ${tierColor}; background: ${tierBg};">${tierLabel}</span>
              <div class="metric-score-pct" style="color: ${m.color};">${isUntrained ? '--' : d.val + '%'}</div>
            </div>
          </div>
          <div class="metric-bar-track">
            <div class="metric-bar-fill" style="width: ${d.val}%; background: ${m.color};"></div>
          </div>
          <div class="metric-mini-stats">
            <span>🎮 ${d.played} played</span>
            <span>🏆 Best: ${d.bestScore} pts</span>
            <span>🎯 Acc: ${isUntrained ? '0%' : d.avgAcc + '%'}</span>
          </div>
          <div class="metric-insights">${insight}</div>
        `;
        grid.appendChild(card);
      });
    }
  }

  renderLeaderboard() {
    const tableBody = document.getElementById('leaderboard-tbody');
    const myBestsGrid = document.getElementById('my-bests-grid');
    const stats = window.appStorage.state;

    // Benchmark local leaderboard records to compete against
    const benchmarks = [
      { rank: 1, name: 'Athena 9000 (AI Benchmark)', score: 3850, badge: 'rank-1' },
      { rank: 2, name: 'QuantumThinker', score: 3120, badge: 'rank-2' },
      { rank: 3, name: 'NeuroSprint Pro', score: 2640, badge: 'rank-3' },
      { rank: 4, name: 'LogicSeeker_99', score: 1980, badge: '' },
      { rank: 5, name: 'SynapsePulse', score: 1540, badge: '' }
    ];

    // Insert user record in correct rank
    const userScore = stats.totalScore || 0;
    const userName = (stats.playerName || 'You') + ' (My Best)';
    const userEntry = { rank: '-', name: userName, score: userScore, isUser: true };

    const combined = [...benchmarks, userEntry].sort((a, b) => b.score - a.score);

    if (tableBody) {
      tableBody.innerHTML = '';
      combined.forEach((row, idx) => {
        const tr = document.createElement('tr');
        if (row.isUser) tr.className = 'user-row';
        tr.innerHTML = `
          <td><span class="rank-badge ${idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : ''}">${idx + 1}</span></td>
          <td>${row.name}</td>
          <td><strong>${row.score.toLocaleString()}</strong></td>
        `;
        tableBody.appendChild(tr);
      });
    }

    // Render My Personal Bests by Game
    if (myBestsGrid && window.ALL_GAMES_METADATA) {
      myBestsGrid.innerHTML = '';
      window.ALL_GAMES_METADATA.forEach(g => {
        const gStat = stats.gameStats[g.id] || { bestScore: 0, timesPlayed: 0, totalTimeSpent: 0 };
        const timeFormatted = window.appStorage.formatDuration(gStat.totalTimeSpent || 0);
        const card = document.createElement('div');
        card.className = 'stat-card';
        card.innerHTML = `
          <div class="stat-icon-wrap" style="background: rgba(99, 102, 241, 0.15); color: var(--primary-400);">
            ${g.icon}
          </div>
          <div>
            <div class="stat-label">${g.name}</div>
            <div class="stat-value">${gStat.bestScore} <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-muted);">pts</span></div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 3px;">
              <span>🎯 ${gStat.timesPlayed || 0} plays</span> • <span>⏱️ ${timeFormatted}</span>
            </div>
          </div>
        `;
        myBestsGrid.appendChild(card);
      });
    }
  }
}

window.appScore = new ScoreManager();

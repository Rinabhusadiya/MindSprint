/**
 * MindSprint - Main Application Controller
 * Handles UI events, settings binding, catalog filtering, themes, and dashboard synchronization
 */

class MindSprintApp {
  constructor() {
    this.currentCategoryFilter = 'all';
    this.searchQuery = '';
    this.init();
  }

  init() {
    this.applyTheme(window.appStorage.getSetting('theme') || 'dark');
    this.initHeaderControls();
    this.initSettingsControls();
    this.initCatalogFilters();
    this.renderGamesCatalog();
    this.updateDashboardMetrics();
    this.initResetDialog();

    // Check streak upon loading
    window.appStorage.checkStreakIntegrity();

    // Render daily challenge immediately with today's live date
    if (window.appDaily) {
      window.appDaily.renderDailyUI();
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    window.appStorage.setSetting('theme', theme);

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      themeToggleBtn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }

    const themeSelect = document.getElementById('setting-theme-select');
    if (themeSelect) themeSelect.value = theme;
  }

  initHeaderControls() {
    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        this.applyTheme(next);
        if (window.appSound) window.appSound.playClick();
      });
    }

    // Sound Toggle
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
      const isSound = window.appStorage.getSetting('soundEnabled');
      soundBtn.innerHTML = isSound ? '🔊' : '🔇';
      soundBtn.addEventListener('click', () => {
        const enabled = window.appSound.toggleSound();
        soundBtn.innerHTML = enabled ? '🔊' : '🔇';
        const soundCheckbox = document.getElementById('setting-sound-toggle');
        if (soundCheckbox) soundCheckbox.checked = enabled;
      });
    }

    // Header Streak Pill
    this.updateStreakBadge();
  }

  updateStreakBadge() {
    const streakBadge = document.getElementById('header-streak-badge');
    if (streakBadge) {
      const streak = window.appStorage.getSetting('streak') || { current: 1 };
      streakBadge.innerHTML = `<span class="fire-icon">🔥</span> <span class="streak-count-text">${streak.current} ${streak.current === 1 ? 'Day' : 'Days'}</span>`;
    }
  }

  updateDashboardMetrics() {
    const state = window.appStorage.state;
    const totalScoreEl = document.getElementById('dash-total-score');
    const bestScoreEl = document.getElementById('dash-best-score');
    const gamesPlayedEl = document.getElementById('dash-games-played');
    const totalTimeEl = document.getElementById('dash-total-time');
    const streakEl = document.getElementById('dash-streak-count');

    if (totalScoreEl) totalScoreEl.textContent = (state.totalScore || 0).toLocaleString();
    if (bestScoreEl) bestScoreEl.textContent = (state.bestScore || 0).toLocaleString();
    if (gamesPlayedEl) gamesPlayedEl.textContent = (state.gamesPlayed || 0).toLocaleString();
    if (totalTimeEl) totalTimeEl.textContent = window.appStorage.formatDuration(state.totalTimeSeconds || 0);
    if (streakEl) streakEl.textContent = `${state.streak?.current || 1} Days`;

    this.updateStreakBadge();
  }

  initCatalogFilters() {
    // Category pill buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategoryFilter = btn.getAttribute('data-category');
        this.renderGamesCatalog();
        if (window.appSound) window.appSound.playClick();
      });
    });

    // Search bar
    const searchInput = document.getElementById('games-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderGamesCatalog();
      });
    }

    // Category preview shortcuts on Home page
    document.querySelectorAll('[data-cat-shortcut]').forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.getAttribute('data-cat-shortcut');
        window.appNav.navigateTo('games');
        const targetBtn = document.querySelector(`.filter-btn[data-category="${cat}"]`);
        if (targetBtn) targetBtn.click();
      });
    });
  }

  renderGamesCatalog() {
    const grid = document.getElementById('games-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const state = window.appStorage.state;

    const filtered = window.ALL_GAMES_METADATA.filter(g => {
      const matchCat = this.currentCategoryFilter === 'all' || g.catKey.toLowerCase() === this.currentCategoryFilter.toLowerCase();
      const matchSearch = !this.searchQuery || g.name.toLowerCase().includes(this.searchQuery) || g.desc.toLowerCase().includes(this.searchQuery);
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <h3>No brain workouts found</h3>
          <p>Try searching with another keyword or resetting the category filter.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(g => {
      const gStat = state.gameStats[g.id] || { bestScore: 0, timesPlayed: 0, totalTimeSpent: 0 };
      const card = document.createElement('div');
      card.className = 'game-card';
      card.setAttribute('data-game-id', g.id);
      card.style.setProperty('--cat-accent', `var(--cat-${g.catKey}, var(--primary-gradient))`);

      const timeFormatted = window.appStorage.formatDuration(gStat.totalTimeSpent || 0);

      card.innerHTML = `
        <div class="game-card-top">
          <div class="game-card-icon">${g.icon}</div>
          <span class="game-category-tag">${g.category}</span>
        </div>
        <h3 class="game-card-title">${g.name}</h3>
        <p class="game-card-desc">${g.desc}</p>
        <div class="game-card-footer">
          <div class="game-best-score">
            <span style="font-size: 0.78rem;">High Score: <strong style="color: var(--text-primary); font-size: 0.95rem;">${gStat.bestScore || 0} pts</strong></span>
            <span style="font-size: 0.74rem; color: var(--text-muted); margin-top: 3px; display: flex; align-items: center; gap: 0.35rem;">
              <span>🎯 ${gStat.timesPlayed || 0} plays</span> • <span>⏱️ ${timeFormatted}</span>
            </span>
          </div>
          <button class="game-play-btn" onclick="window.gameEngine.openGame('${g.id}')">
            Play <span>▶</span>
          </button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  initSettingsControls() {
    // Theme Select
    const themeSelect = document.getElementById('setting-theme-select');
    if (themeSelect) {
      themeSelect.value = window.appStorage.getSetting('theme');
      themeSelect.addEventListener('change', (e) => this.applyTheme(e.target.value));
    }

    // Master Sound Toggle
    const soundToggle = document.getElementById('setting-sound-toggle');
    if (soundToggle) {
      soundToggle.checked = window.appStorage.getSetting('soundEnabled');
      soundToggle.addEventListener('change', (e) => {
        window.appStorage.setSetting('soundEnabled', e.target.checked);
        window.appSound.enabled = e.target.checked;
        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) soundBtn.innerHTML = e.target.checked ? '🔊' : '🔇';
      });
    }

    // Volume Slider
    const volumeSlider = document.getElementById('setting-volume-slider');
    const volumeValLabel = document.getElementById('volume-val-label');
    if (volumeSlider) {
      const currentVol = window.appStorage.getSetting('volume') !== undefined ? window.appStorage.getSetting('volume') : 0.8;
      volumeSlider.value = Math.round(currentVol * 100);
      if (volumeValLabel) volumeValLabel.textContent = `${Math.round(currentVol * 100)}%`;

      volumeSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        window.appSound.setVolume(val / 100);
        if (volumeValLabel) volumeValLabel.textContent = `${val}%`;
      });

      volumeSlider.addEventListener('change', () => {
        if (window.appSound) {
          window.appSound.playTone(800, 'triangle', 0.08, 0.3);
        }
      });
    }

    // Audio Output Test Button
    const testSoundBtn = document.getElementById('btn-test-sound');
    if (testSoundBtn) {
      testSoundBtn.addEventListener('click', () => {
        if (!window.appSound.enabled) {
          window.appSound.enabled = true;
          window.appStorage.setSetting('soundEnabled', true);
          const soundToggle = document.getElementById('setting-sound-toggle');
          if (soundToggle) soundToggle.checked = true;
          const soundBtn = document.getElementById('sound-toggle-btn');
          if (soundBtn) soundBtn.innerHTML = '🔊';
        }
        window.appSound.testSound();
      });
    }

    // Background Animation Toggle
    const bgAnimToggle = document.getElementById('setting-bg-anim-toggle');
    if (bgAnimToggle) {
      bgAnimToggle.checked = window.appStorage.getSetting('bgAnimation');
      bgAnimToggle.addEventListener('change', (e) => {
        if (window.appBgCanvas) window.appBgCanvas.toggle(e.target.checked);
      });
    }

    // Difficulty Select
    const diffSelect = document.getElementById('setting-diff-select');
    if (diffSelect) {
      diffSelect.value = window.appStorage.getSetting('defaultDifficulty') || 'medium';
      diffSelect.addEventListener('change', (e) => {
        window.appStorage.setSetting('defaultDifficulty', e.target.value);
      });
    }

    // Reduced Motion Toggle
    const motionToggle = document.getElementById('setting-reduced-motion-toggle');
    if (motionToggle) {
      motionToggle.checked = window.appStorage.getSetting('reducedMotion') || false;
      if (motionToggle.checked) document.body.classList.add('reduced-motion');

      motionToggle.addEventListener('change', (e) => {
        window.appStorage.setSetting('reducedMotion', e.target.checked);
        if (e.target.checked) {
          document.body.classList.add('reduced-motion');
          if (window.appBgCanvas) window.appBgCanvas.stop();
        } else {
          document.body.classList.remove('reduced-motion');
          if (window.appBgCanvas && window.appStorage.getSetting('bgAnimation')) {
            window.appBgCanvas.start();
          }
        }
      });
    }

    // Player Name Input
    const nameInput = document.getElementById('setting-player-name');
    if (nameInput) {
      nameInput.value = window.appStorage.getSetting('playerName') || 'Brain Runner';
      nameInput.addEventListener('input', (e) => {
        const val = e.target.value.trim() || 'Brain Runner';
        window.appStorage.setSetting('playerName', val);
      });
    }
  }

  initResetDialog() {
    const resetBtn = document.getElementById('btn-reset-all-data');
    const dialogModal = document.getElementById('dialog-confirm-modal');
    const confirmBtn = document.getElementById('btn-dialog-confirm-reset');
    const cancelBtn = document.getElementById('btn-dialog-cancel');

    if (resetBtn && dialogModal) {
      resetBtn.addEventListener('click', () => {
        dialogModal.classList.add('open');
      });
    }

    if (cancelBtn && dialogModal) {
      cancelBtn.addEventListener('click', () => {
        dialogModal.classList.remove('open');
      });
    }

    if (confirmBtn && dialogModal) {
      confirmBtn.addEventListener('click', () => {
        window.appStorage.resetAll();
        dialogModal.classList.remove('open');
        this.updateDashboardMetrics();
        this.renderGamesCatalog();
        alert('All scores, progress, and streaks have been reset.');
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.appMain = new MindSprintApp();
});

/**
 * MindSprint - SPA Navigation Router
 * Handles seamless view switching, URL hash sync, active states, and history navigation
 */

class NavigationManager {
  constructor() {
    this.currentView = 'home';
    this.validViews = ['home', 'games', 'daily', 'settings'];
    this.init();
  }

  init() {
    // Hash change listener for browser back/forward buttons
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (this.validViews.includes(hash)) {
        this.navigateTo(hash, false);
      }
    });

    // Check initial hash
    const initialHash = window.location.hash.replace('#', '');
    if (this.validViews.includes(initialHash)) {
      this.navigateTo(initialHash, false);
    } else {
      this.navigateTo('home', false);
    }

    // Attach click events to nav links
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = el.getAttribute('data-nav');
        this.navigateTo(targetView);
      });
    });
  }

  navigateTo(viewId, updateHash = true) {
    if (!this.validViews.includes(viewId)) viewId = 'home';
    this.currentView = viewId;

    if (updateHash) {
      window.location.hash = viewId;
    }

    // Update section visibility
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });
    const activeSec = document.getElementById(`view-${viewId}`);
    if (activeSec) {
      activeSec.classList.add('active');
    }

    // Update active nav links in desktop and mobile menus
    document.querySelectorAll('[data-nav]').forEach(link => {
      if (link.getAttribute('data-nav') === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Specific view render hooks
    if (viewId === 'daily' && window.appDaily) {
      window.appDaily.renderDailyUI();
    } else if (viewId === 'home') {
      if (window.appMain) window.appMain.updateDashboardMetrics();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.appSound) {
      window.appSound.playClick();
    }
  }
}

window.appNav = new NavigationManager();

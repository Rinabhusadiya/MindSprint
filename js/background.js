/**
 * MindSprint - Animated Background Canvas
 * High performance, subtle floating particles & soft glowing nodes
 */

class BackgroundCanvas {
  constructor() {
    this.canvas = document.getElementById('bg-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationFrameId = null;
    this.enabled = window.appStorage.getSetting('bgAnimation');
    this.reducedMotion = window.appStorage.getSetting('reducedMotion') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.mouse = { x: -1000, y: -1000 };
    
    this.init();
  }

  init() {
    if (!this.canvas) return;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    if (this.enabled && !this.reducedMotion) {
      this.createParticles();
      this.start();
    } else {
      this.stop();
    }
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.createParticles();
  }

  createParticles() {
    this.particles = [];
    const count = Math.min(45, Math.floor((this.width * this.height) / 28000));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2.5 + 1.2,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        baseAlpha: Math.random() * 0.4 + 0.15
      });
    }
  }

  start() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.enabled = true;
    document.body.classList.remove('no-bg-anim');
    const loop = () => {
      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop() {
    this.enabled = false;
    document.body.classList.add('no-bg-anim');
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  toggle(enable) {
    if (enable !== undefined) {
      this.enabled = enable;
    } else {
      this.enabled = !this.enabled;
    }
    window.appStorage.setSetting('bgAnimation', this.enabled);
    if (this.enabled && !this.reducedMotion) {
      this.start();
    } else {
      this.stop();
    }
  }

  render() {
    if (!this.ctx || !this.enabled) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const particleColor = isDark ? '99, 102, 241' : '79, 70, 229';

    // Draw and connect particles
    const len = this.particles.length;
    for (let i = 0; i < len; i++) {
      const p = this.particles[i];

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      // Mouse repulsion subtle effect
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        p.x -= (dx / dist) * 0.8;
        p.y -= (dy / dist) * 0.8;
      }

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${particleColor}, ${p.baseAlpha})`;
      this.ctx.fill();

      // Connect near particles
      for (let j = i + 1; j < len; j++) {
        const p2 = this.particles[j];
        const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist2 < 120) {
          const lineAlpha = (1 - dist2 / 120) * 0.14;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(${particleColor}, ${lineAlpha})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
        }
      }
    }
  }
}

window.appBgCanvas = null;
document.addEventListener('DOMContentLoaded', () => {
  window.appBgCanvas = new BackgroundCanvas();
});

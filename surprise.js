/* ============================================================ */
/* SURPRISE PAGE JAVASCRIPT - FLOATING HEARTS & PARTICLES       */
/* ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initFloatingCanvas();
  initInteractiveHearts();
  triggerGiftOpenCelebration();
});

/* ============================================================ */
/* 1. FLOATING HEARTS & SPARKLES CANVAS ENGINE                  */
/* ============================================================ */
function initFloatingCanvas() {
  const canvas = document.getElementById('heartsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const EMOJIS = ['💗', '💕', '💖', '🫶🏻', '✨', '🌸', '🎀'];
  const particles = [];
  const MAX_PARTICLES = 36;

  class HeartParticle {
    constructor(initial = false) {
      this.reset(initial);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 30;
      this.size = 14 + Math.random() * 20;
      this.speedY = 0.6 + Math.random() * 1.4;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.wobbleSpeed = 0.02 + Math.random() * 0.03;
      this.wobbleAmp = 20 + Math.random() * 30;
      this.wobbleOffset = Math.random() * Math.PI * 2;
      this.alpha = 0.4 + Math.random() * 0.5;
      this.emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      this.rotation = (Math.random() - 0.5) * 0.4;
      this.spinSpeed = (Math.random() - 0.5) * 0.02;
    }

    update() {
      this.y -= this.speedY;
      this.wobbleOffset += this.wobbleSpeed;
      this.x += Math.sin(this.wobbleOffset) * 0.8 + this.speedX;
      this.rotation += this.spinSpeed;

      if (this.y < -40 || this.x < -40 || this.x > width + 40) {
        this.reset(false);
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.alpha;
      ctx.font = `${this.size}px 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.emoji, 0, 0);
      ctx.restore();
    }
  }

  for (let i = 0; i < MAX_PARTICLES; i++) {
    particles.push(new HeartParticle(true));
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw(ctx);
    }
    requestAnimationFrame(loop);
  }

  loop();
}

/* ============================================================ */
/* 2. TAP / CLICK ANYWHERE TO SPAWN BURST OF HEARTS             */
/* ============================================================ */
function initInteractiveHearts() {
  document.addEventListener('click', (e) => {
    // Avoid double spawning on links
    if (e.target.closest('a')) return;
    spawnHeartsBurst(e.clientX, e.clientY);
  });
}

function spawnHeartsBurst(x, y) {
  const BURST_EMOJIS = ['💗', '💕', '🫶🏻', '✨', '💖'];
  for (let i = 0; i < 6; i++) {
    const el = document.createElement('div');
    el.innerText = BURST_EMOJIS[Math.floor(Math.random() * BURST_EMOJIS.length)];
    el.style.position = 'fixed';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.fontSize = `${18 + Math.random() * 16}px`;
    el.style.pointerEvents = 'none';
    el.style.zIndex = '99999';
    el.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    el.style.transform = 'translate(-50%, -50%) scale(0.5)';
    el.style.opacity = '1';

    document.body.appendChild(el);

    const angle = (Math.PI * 2 * i) / 6 + (Math.random() - 0.5);
    const dist = 40 + Math.random() * 60;
    const destX = Math.cos(angle) * dist;
    const destY = Math.sin(angle) * dist - 30;

    requestAnimationFrame(() => {
      el.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(1.3) rotate(${(Math.random() - 0.5) * 40}deg)`;
      el.style.opacity = '0';
    });

    setTimeout(() => {
      el.remove();
    }, 850);
  }
}

/* ============================================================ */
/* 3. GIFT UNWRAPPING ENTRY CELEBRATION                        */
/* ============================================================ */
function triggerGiftOpenCelebration() {
  setTimeout(() => {
    const midX = window.innerWidth / 2;
    const midY = window.innerHeight / 2;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        spawnHeartsBurst(midX + (Math.random() - 0.5) * 200, midY + (Math.random() - 0.5) * 150);
      }, i * 220);
    }
  }, 300);
}

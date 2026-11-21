/**
 * Seamless Dual-Sequence Scrollytelling Engine
 * Merges Sequence 1 (Cat Bholu) and Sequence 2 (Happy Birthday)
 * with a smooth transition and bold white title overlay.
 */

const CONFIG = {
  seq1Count: 239,
  seq1Prefix: 'seq1/frame_',
  seq1Pad: 4, // frame_0001.jpg -> frame_0239.jpg

  seq2Count: 239,
  seq2Prefix: 'seq2/frame_',
  seq2Pad: 5, // frame_00001.jpg -> frame_00239.jpg

  totalFrames: 478,
  // Smooth LERP factor
  ease: 0.08,

  // Timeline landmarks: 44% Seq 1, 10% Transition, 46% Seq 2
  transStart: 0.44,
  transEnd: 0.54
};

let canvas;
let ctx;
let scrollTrack;
let transitionOverlay;
let kittyFraming;
let scrollHint;
let loader;
let loaderBar;
let loaderText;

const seq1Images = new Array(CONFIG.seq1Count);
const seq2Images = new Array(CONFIG.seq2Count);

let loadedCount = 0;
let currentProgress = 0;
let targetProgress = 0;
let isAnimating = false;

// Format frame file paths
function getSeq1Path(i) {
  return `${CONFIG.seq1Prefix}${String(i + 1).padStart(CONFIG.seq1Pad, '0')}.jpg`;
}

function getSeq2Path(i) {
  return `${CONFIG.seq2Prefix}${String(i + 1).padStart(CONFIG.seq2Pad, '0')}.jpg`;
}

// Adjust canvas resolution for high-DPI displays
function resizeCanvas() {
  if (!canvas || !ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const displayW = window.innerWidth;
  const displayH = window.innerHeight;
  const targetW = Math.round(displayW * dpr);
  const targetH = Math.round(displayH * dpr);

  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }

  render(currentProgress);
}

// Draw image covering the canvas completely (object-fit: cover)
function drawCover(img, alpha = 1.0) {
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const cw = canvas.width;
  const ch = canvas.height;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;

  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);
  ctx.globalAlpha = 1.0;
}

// Safely retrieve image with closest loaded fallback
function getSafeImage(arr, index, count) {
  let img = arr[index];
  if (img && img.complete && img.naturalWidth > 0) return img;

  // Search backward first
  for (let offset = 1; offset < count; offset++) {
    if (index - offset >= 0) {
      const prev = arr[index - offset];
      if (prev && prev.complete && prev.naturalWidth > 0) return prev;
    }
    if (index + offset < count) {
      const next = arr[index + offset];
      if (next && next.complete && next.naturalWidth > 0) return next;
    }
  }
  return null;
}

// Render state at given progress (0.0 to 1.0)
function render(p) {
  if (!ctx || !canvas) return;

  // Scroll hint visibility
  if (scrollHint) {
    scrollHint.style.opacity = p > 0.015 ? '0' : '1';
  }

  // Transparent framing text around kitty during Sequence 1
  if (kittyFraming) {
    if (p < 0.38) {
      kittyFraming.style.opacity = '1';
    } else if (p < CONFIG.transStart) {
      const fadeT = (p - 0.38) / (CONFIG.transStart - 0.38);
      kittyFraming.style.opacity = Math.max(0, 1 - fadeT).toFixed(3);
    } else {
      kittyFraming.style.opacity = '0';
    }
  }

  // --- PHASE 1: Sequence 1 (Cat Sequence) ---
  if (p < CONFIG.transStart) {
    const fraction = p / CONFIG.transStart;
    const frameIndex = Math.min(CONFIG.seq1Count - 1, Math.max(0, Math.round(fraction * (CONFIG.seq1Count - 1))));
    const img = getSafeImage(seq1Images, frameIndex, CONFIG.seq1Count);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (img) drawCover(img, 1.0);

    if (transitionOverlay) {
      transitionOverlay.style.opacity = '0';
      transitionOverlay.style.transform = 'scale(0.92)';
    }
  }

  // --- PHASE 2: Transition Zone with Bold White Text Overlay ---
  else if (p <= CONFIG.transEnd) {
    const t = (p - CONFIG.transStart) / (CONFIG.transEnd - CONFIG.transStart); // 0.0 -> 1.0

    // Blend between Sequence 1 last frame and Sequence 2 first frame
    const img1 = getSafeImage(seq1Images, CONFIG.seq1Count - 1, CONFIG.seq1Count);
    const img2 = getSafeImage(seq2Images, 0, CONFIG.seq2Count);

    let blend = 0;
    if (t <= 0.2) {
      blend = 0;
    } else if (t >= 0.8) {
      blend = 1;
    } else {
      blend = (t - 0.2) / 0.6;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (blend < 1 && img1) drawCover(img1, 1 - blend);
    if (blend > 0 && img2) drawCover(img2, blend);

    // Text Reveal & Dissolve Curve
    let textOpacity = 0;
    let textScale = 0.92;

    if (t < 0.25) {
      const localT = t / 0.25;
      textOpacity = localT;
      textScale = 0.92 + (0.08 * localT);
    } else if (t <= 0.75) {
      textOpacity = 1;
      textScale = 1.0;
    } else {
      const localT = (t - 0.75) / 0.25;
      textOpacity = 1 - localT;
      textScale = 1.0 + (0.06 * localT);
    }

    if (transitionOverlay) {
      transitionOverlay.style.opacity = textOpacity.toFixed(3);
      transitionOverlay.style.transform = `scale(${textScale.toFixed(3)})`;
    }
  }

  // --- PHASE 3: Sequence 2 (Happy Birthday Celebration) ---
  else {
    const fraction = (p - CONFIG.transEnd) / (1 - CONFIG.transEnd);
    const frameIndex = Math.min(CONFIG.seq2Count - 1, Math.max(0, Math.round(fraction * (CONFIG.seq2Count - 1))));
    const img = getSafeImage(seq2Images, frameIndex, CONFIG.seq2Count);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (img) drawCover(img, 1.0);

    if (transitionOverlay) {
      transitionOverlay.style.opacity = '0';
      transitionOverlay.style.transform = 'scale(1.06)';
    }
  }
}

// Update scroll target progress based on scrollTrack position
function updateScroll() {
  if (!scrollTrack) return;

  const trackTop = scrollTrack.offsetTop;
  const trackHeight = scrollTrack.offsetHeight - window.innerHeight;
  const scrollY = window.scrollY - trackTop;

  const rawProgress = trackHeight > 0 ? scrollY / trackHeight : 0;
  targetProgress = Math.max(0, Math.min(1, rawProgress));

  startAnimationLoop();
}

// RAF animation loop using LERP
function tick() {
  const diff = targetProgress - currentProgress;

  if (Math.abs(diff) > 0.0004) {
    currentProgress += diff * CONFIG.ease;
  } else {
    currentProgress = targetProgress;
    isAnimating = false;
  }

  render(currentProgress);

  if (isAnimating) {
    requestAnimationFrame(tick);
  }
}

function startAnimationLoop() {
  if (!isAnimating) {
    isAnimating = true;
    requestAnimationFrame(tick);
  }
}

// Preload both sequences
function preloadAll() {
  const onImageReady = (isFirst) => {
    loadedCount++;

    const percent = Math.round((loadedCount / CONFIG.totalFrames) * 100);
    if (loaderBar) loaderBar.style.width = `${percent}%`;
    if (loaderText) loaderText.textContent = `Loading ${percent}%`;

    // Render immediately as soon as Sequence 1 Frame 1 is ready
    if (isFirst) {
      render(0);
    }

    if (loadedCount >= CONFIG.totalFrames) {
      setTimeout(() => {
        if (loader) loader.classList.add('hidden');
      }, 100);
    }
  };

  // Preload Sequence 1
  for (let i = 0; i < CONFIG.seq1Count; i++) {
    const img = new Image();
    const isFirst = (i === 0);

    img.onload = () => {
      if (img.decode) {
        img.decode().then(() => onImageReady(isFirst)).catch(() => onImageReady(isFirst));
      } else {
        onImageReady(isFirst);
      }
    };
    img.onerror = () => onImageReady(isFirst);

    img.src = getSeq1Path(i);
    seq1Images[i] = img;
  }

  // Preload Sequence 2
  for (let i = 0; i < CONFIG.seq2Count; i++) {
    const img = new Image();

    img.onload = () => {
      if (img.decode) {
        img.decode().then(() => onImageReady(false)).catch(() => onImageReady(false));
      } else {
        onImageReady(false);
      }
    };
    img.onerror = () => onImageReady(false);

    img.src = getSeq2Path(i);
    seq2Images[i] = img;
  }
}

// Initialization
function init() {
  canvas = document.getElementById('canvas');
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  scrollTrack = document.getElementById('scrollTrack');
  transitionOverlay = document.getElementById('transitionOverlay');
  kittyFraming = document.getElementById('kittyFraming');
  scrollHint = document.getElementById('scrollHint');
  loader = document.getElementById('loader');
  loaderBar = document.getElementById('loader-bar');
  loaderText = document.getElementById('loader-text');

  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', resizeCanvas, { passive: true });

  resizeCanvas();
  preloadAll();
  updateScroll();
}

// Toggle Envelope / Letter Open State
function toggleLetter() {
  const container = document.getElementById('letterInteractive');
  if (container) {
    container.classList.toggle('opened');
  }
}

// Letter & Photo Modal Lightbox
function openLetterModal(src) {
  const modal = document.getElementById('letterModal');
  const img = document.getElementById('modalImg');
  if (img) {
    img.src = (typeof src === 'string' && src) ? src : 'birthday_letter.jpg';
  }
  if (modal) modal.classList.add('active');
}

function closeLetterModal() {
  const modal = document.getElementById('letterModal');
  if (modal) modal.classList.remove('active');
}

window.toggleLetter = toggleLetter;
window.openLetterModal = openLetterModal;
window.closeLetterModal = closeLetterModal;

// Smooth Gift Opening Transition to surprise.html
function openBirthdaySurprise(e) {
  if (e && e.preventDefault) e.preventDefault();
  const curtain = document.getElementById('giftTransitionCurtain');
  if (curtain) {
    curtain.classList.add('active');
  }

  // Spawn floating hearts burst around click point
  const x = (e && e.clientX) ? e.clientX : window.innerWidth / 2;
  const y = (e && e.clientY) ? e.clientY : window.innerHeight / 2;

  const EMOJIS = ['💗', '💕', '🫶🏻', '✨', '🎁', '💖'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    p.style.position = 'fixed';
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.fontSize = `${20 + Math.random() * 24}px`;
    p.style.pointerEvents = 'none';
    p.style.zIndex = '99999999';
    p.style.transition = 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)';
    p.style.transform = 'translate(-50%, -50%) scale(0.5)';
    p.style.opacity = '1';

    document.body.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 140;
    const destX = Math.cos(angle) * dist;
    const destY = Math.sin(angle) * dist - 50;

    requestAnimationFrame(() => {
      p.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(1.4) rotate(${(Math.random() - 0.5) * 60}deg)`;
      p.style.opacity = '0';
    });

    setTimeout(() => p.remove(), 950);
  }

  setTimeout(() => {
    window.location.href = 'surprise.html';
  }, 650);
}

window.openBirthdaySurprise = openBirthdaySurprise;

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLetterModal();
});

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

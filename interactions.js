(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const motionAllowed = () => !reduced.matches && root.dataset.motion !== 'paused';

  // A short brand entrance, once per tab. CSS and the head timer also dismiss it.
  let introTimer;
  function dismissIntro() {
    root.classList.remove('intro-pending');
    clearTimeout(introTimer);
    document.removeEventListener('keydown', dismissIntro);
    document.removeEventListener('pointerdown', dismissIntro);
  }
  if (root.classList.contains('intro-pending')) {
    try { sessionStorage.setItem('lira:intro:v1', 'seen'); } catch (_) { /* Optional storage. */ }
    introTimer = setTimeout(dismissIntro, 1450);
    document.addEventListener('keydown', dismissIntro);
    document.addEventListener('pointerdown', dismissIntro, { passive: true });
  }

  // Reveal section groups, not individual links. Everything remains visible without JS.
  let revealObserver;
  const reveals = [...document.querySelectorAll('.section-heading,.project-grid,.experience-layout,.capability-grid,.contact')];
  function revealAll() {
    revealObserver?.disconnect();
    reveals.forEach(el => el.classList.add('is-revealed'));
  }
  if (motionAllowed() && 'IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .08 });
    reveals.forEach(el => {
      // Don't hide content that the visitor can already see or reached via a deep link.
      if (el.getBoundingClientRect().top < innerHeight) return;
      el.classList.add('reveal-ready');
      revealObserver.observe(el);
    });
    document.addEventListener('focusin', e => e.target.closest('.reveal-ready')?.classList.add('is-revealed'));
  }

  let surface = null, magnet = null;
  const forcedColors = matchMedia('(forced-colors: active)');
  const clickable = 'a[href],button:enabled,summary';
  const textField = 'input,textarea,[contenteditable=true]';
  const trail = document.createElement('canvas');
  const trailContext = trail.getContext('2d');
  const points = [];
  let trailFrame = 0;
  trail.className = 'cursor-trail';
  trail.setAttribute('aria-hidden', 'true');

  function clearTrail() {
    if (trailFrame) cancelAnimationFrame(trailFrame);
    trailFrame = 0;
    points.length = 0;
    if (trail.isConnected) trailContext.clearRect(0, 0, innerWidth, innerHeight);
  }
  function sizeTrail() {
    if (!trail.isConnected) return;
    clearTrail();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    trail.width = Math.round(innerWidth * dpr);
    trail.height = Math.round(innerHeight * dpr);
    trailContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    trailContext.lineCap = 'round';
  }
  function drawTrail(time) {
    trailFrame = 0;
    const overLink = points[points.length - 1].overLink;
    const lifetime = overLink ? 120 : 170;
    while (points.length && time - points[0].time >= lifetime) points.shift();
    trailContext.clearRect(0, 0, innerWidth, innerHeight);
    if (points.length < 2) return;

    let remaining = overLink ? 40 : 64;
    for (let i = points.length - 1; i > 0 && remaining > 0; i--) {
      const head = points[i], tail = points[i - 1];
      const length = Math.hypot(head.x - tail.x, head.y - tail.y);
      if (!length) continue;
      const fraction = Math.min(1, remaining / length);
      const fade = 1 - Math.max(0, time - tail.time) / lifetime;
      trailContext.beginPath();
      trailContext.moveTo(head.x, head.y);
      trailContext.lineTo(head.x + (tail.x - head.x) * fraction, head.y + (tail.y - head.y) * fraction);
      trailContext.strokeStyle = `rgba(182,247,123,${fade * (overLink ? .43 : .32)})`;
      trailContext.lineWidth = .55 + fade * 1.35;
      trailContext.stroke();
      remaining -= length;
    }
    trailFrame = requestAnimationFrame(drawTrail);
  }
  function trackTrail(e) {
    if (!trailContext || forcedColors.matches || e.pointerType !== 'mouse' ||
        e.target.closest(textField) || ((e.buttons & 1) && !e.target.closest(clickable))) {
      clearTrail();
      return;
    }
    if (!trail.isConnected) {
      document.body.append(trail);
      sizeTrail();
    }
    const time = performance.now();
    const previous = points[points.length - 1];
    const { clientX: x, clientY: y } = e;
    if (previous && (time - previous.time > 120 || Math.hypot(x - previous.x, y - previous.y) > 120)) {
      clearTrail();
    }
    points.push({ x, y, time, overLink: Boolean(e.target.closest(clickable)) });
    if (points.length > 22) points.shift();
    if (!trailFrame && points.length > 1) trailFrame = requestAnimationFrame(drawTrail);
  }
  function resetSurface() {
    if (!surface) return;
    surface.style.setProperty('--tilt-x', '0deg');
    surface.style.setProperty('--tilt-y', '0deg');
    surface.style.setProperty('--spot-opacity', '0');
    surface = null;
  }
  function resetMagnet() {
    if (!magnet) return;
    magnet.style.setProperty('--mag-x', '0px');
    magnet.style.setProperty('--mag-y', '0px');
    magnet = null;
  }
  function resetHover() {
    resetSurface();
    resetMagnet();
    clearTrail();
  }
  function pointerMove(e) {
    if (!fine.matches || !motionAllowed() || e.pointerType === 'touch') return;
    trackTrail(e);
    const { clientX: x, clientY: y } = e;
    const nextSurface = e.target.closest('.project-card,.featured-project,.capability-grid article,.signal-art');
    if (nextSurface !== surface) { resetSurface(); surface = nextSurface; }
    if (surface) {
      const r = surface.getBoundingClientRect();
      const nx = Math.max(0, Math.min(1, (x - r.left) / r.width));
      const ny = Math.max(0, Math.min(1, (y - r.top) / r.height));
      surface.style.setProperty('--spot-x', `${nx * 100}%`);
      surface.style.setProperty('--spot-y', `${ny * 100}%`);
      surface.style.setProperty('--spot-opacity', '1');
      const tilt = surface.classList.contains('featured-project') ? 1 : 2;
      surface.style.setProperty('--tilt-x', `${(.5 - ny) * tilt}deg`);
      surface.style.setProperty('--tilt-y', `${(nx - .5) * tilt}deg`);
    }
    const nextMagnet = e.target.closest('.button,.brand,.nav-contact');
    if (nextMagnet !== magnet) { resetMagnet(); magnet = nextMagnet; }
    if (magnet) {
      const r = magnet.getBoundingClientRect();
      magnet.style.setProperty('--mag-x', `${Math.max(-5, Math.min(5, (x - r.left - r.width / 2) * .08))}px`);
      magnet.style.setProperty('--mag-y', `${Math.max(-4, Math.min(4, (y - r.top - r.height / 2) * .1))}px`);
    }
  }
  function syncMotion() {
    const allowed = motionAllowed();
    root.classList.toggle('pointer-effects', allowed && fine.matches);
    if (!allowed) { dismissIntro(); revealAll(); }
    if (!allowed || !fine.matches) resetHover();
  }
  document.addEventListener('pointermove', pointerMove, { passive: true });
  document.addEventListener('pointercancel', resetHover, { passive: true });
  document.addEventListener('pointerleave', resetHover);
  document.addEventListener('keydown', resetHover);
  document.addEventListener('visibilitychange', () => { if (document.hidden) resetHover(); });
  document.addEventListener('portfolio:motion', syncMotion);
  window.addEventListener('blur', resetHover);
  window.addEventListener('scroll', resetHover, { passive: true });
  window.addEventListener('resize', sizeTrail, { passive: true });
  forcedColors.addEventListener('change', clearTrail);
  reduced.addEventListener('change', syncMotion);
  fine.addEventListener('change', syncMotion);
  syncMotion();
})();

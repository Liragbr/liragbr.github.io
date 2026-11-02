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

  const halo = document.querySelector('.cursor-halo');
  let frame = 0, x = 0, y = 0, hx = 0, hy = 0, tracking = false;
  let surface = null, magnet = null;
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
  function stopPointer() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; tracking = false;
    root.classList.remove('cursor-visible', 'cursor-interactive', 'cursor-pressed');
    resetSurface(); resetMagnet();
  }
  function follow() {
    frame = 0;
    if (!tracking || document.hidden || !motionAllowed() || !fine.matches) return;
    hx += (x - hx) * .2; hy += (y - hy) * .2;
    halo.style.transform = `translate3d(${hx}px,${hy}px,0) translate(-50%,-50%)`;
    if (Math.abs(x - hx) + Math.abs(y - hy) > .15) frame = requestAnimationFrame(follow);
  }
  function pointerMove(e) {
    if (!halo || !fine.matches || !motionAllowed() || e.pointerType === 'touch') return;
    x = e.clientX; y = e.clientY;
    if (!tracking) { hx = x; hy = y; tracking = true; }
    root.classList.add('cursor-visible');
    root.classList.toggle('cursor-interactive', Boolean(e.target.closest('a,button,summary')));
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
    if (!frame) frame = requestAnimationFrame(follow);
  }
  function syncMotion() {
    const allowed = motionAllowed();
    root.classList.toggle('pointer-effects', allowed && fine.matches);
    if (!allowed) { dismissIntro(); revealAll(); }
    if (!allowed || !fine.matches) stopPointer();
  }
  document.addEventListener('pointermove', pointerMove, { passive: true });
  document.addEventListener('pointerdown', e => { if (tracking && e.pointerType !== 'touch') root.classList.add('cursor-pressed'); }, { passive: true });
  document.addEventListener('pointerup', () => root.classList.remove('cursor-pressed'), { passive: true });
  document.addEventListener('pointercancel', stopPointer, { passive: true });
  document.addEventListener('pointerleave', stopPointer);
  document.addEventListener('keydown', stopPointer);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopPointer(); });
  document.addEventListener('portfolio:motion', syncMotion);
  window.addEventListener('blur', stopPointer);
  window.addEventListener('scroll', stopPointer, { passive: true });
  reduced.addEventListener('change', syncMotion);
  fine.addEventListener('change', syncMotion);
  syncMotion();
})();

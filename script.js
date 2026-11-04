(() => {
  'use strict';
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('nav-links');
  function closeMenu() { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
  if (toggle && nav) {
    document.body.classList.add('js');
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); toggle.focus(); } });
    document.addEventListener('click', e => { if (!e.target.closest('.site-header')) closeMenu(); });
  }
  const figure = document.querySelector('.signal-art');
  if (!figure) return;
  const button = figure.querySelector('.motion-toggle');
  const readout = figure.querySelector('#signal-stage');
  const stage = figure.querySelector('.signal-stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let inView = true;
  let paused = false;

  function syncArt() {
    const active = inView && !document.hidden && !paused && !reduced.matches;
    figure.classList.toggle('signal-running', active);
    readout.textContent = active ? 'SCAN / ACTIVE' : 'FRAME / STILL';
    if (!active) resetPointer();
  }
  function syncMotion() {
    button.hidden = reduced.matches;
    document.documentElement.dataset.motion = paused || reduced.matches ? 'paused' : 'running';
    document.dispatchEvent(new Event('portfolio:motion'));
    syncArt();
  }
  function resetPointer() {
    stage.style.removeProperty('--skull-x');
    stage.style.removeProperty('--skull-y');
  }
  button.addEventListener('click', () => {
    paused = !paused;
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Retomar animações' : 'Pausar animações';
    syncMotion();
  });
  stage.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || !figure.classList.contains('signal-running')) return;
    const { left, top, width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    stage.style.setProperty('--skull-x', `${((e.clientX - left) / width - .5) * 13}px`);
    stage.style.setProperty('--skull-y', `${((e.clientY - top) / height - .5) * 9}px`);
  }, { passive: true });
  stage.addEventListener('pointerleave', resetPointer);
  stage.addEventListener('pointercancel', resetPointer);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncArt();
    }).observe(figure);
  }
  reduced.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncArt);
  syncMotion();
})();

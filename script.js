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
  const map = figure.querySelector('.investigation-map');
  const time = figure.querySelector('.investigation-time');
  const detail = figure.querySelector('.investigation-detail');
  const nodes = [...map.querySelectorAll('.map-node')];
  let selected = map.querySelector('[aria-pressed="true"]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let inView = true;
  let paused = false;

  function syncArt() {
    const active = inView && !document.hidden && !paused && !reduced.matches;
    figure.classList.toggle('signal-running', active);
  }
  function syncMotion() {
    button.hidden = reduced.matches;
    document.documentElement.dataset.motion = paused || reduced.matches ? 'paused' : 'running';
    document.dispatchEvent(new Event('portfolio:motion'));
    syncArt();
  }
  function showEvidence(node) {
    if (map.dataset.evidence === node.dataset.node) return;
    map.dataset.evidence = node.dataset.node;
    time.textContent = node.dataset.time;
    detail.textContent = node.dataset.detail;
  }
  nodes.forEach(node => {
    node.disabled = false;
    node.addEventListener('pointerenter', e => {
      if (e.pointerType === 'mouse') showEvidence(node);
    });
    node.addEventListener('pointerleave', () => showEvidence(selected));
    node.addEventListener('click', () => {
      selected.setAttribute('aria-pressed', 'false');
      selected = node;
      selected.setAttribute('aria-pressed', 'true');
      showEvidence(selected);
    });
  });
  button.addEventListener('click', () => {
    paused = !paused;
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Retomar animações' : 'Pausar animações';
    syncMotion();
  });
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

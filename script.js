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
  const canvas = document.getElementById('signal-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const figure = canvas.closest('figure');
  const button = figure.querySelector('.motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, frame = 0, last = 0, visible = true, paused = false, phase = 0;
  const glyphs = ' .:+*#%@';
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const step = width < 400 ? 8 : 9;
    const sy = step * 1.32;
    const scale = Math.min(width * .44, height * .43);
    ctx.font = `${step}px monospace`;
    ctx.textAlign = 'center';
    for (let y = sy; y < height; y += sy) {
      for (let x = step; x < width; x += step) {
        const nx = (x - width / 2) / scale, ny = (y - height / 2) / scale;
        const angle = Math.atan2(ny, nx), r = Math.hypot(nx, ny);
        const contour = .79 + .065 * Math.sin(angle * 5 + phase * .24) + .035 * Math.cos(angle * 9 - phase * .18);
        const shell = Math.exp(-Math.pow((r - contour) * 10, 2));
        const inner = Math.exp(-Math.pow((r - .38 - .035 * Math.sin(angle * 4 - phase * .2)) * 12, 2)) * .8;
        const sweep = .6 + .4 * Math.cos(angle - phase * .4 + r * 4);
        const value = Math.min(1, Math.max(shell, inner) * sweep);
        if (value < .04) {
          if (Math.round(x / step) % 8 === 0 && Math.round(y / sy) % 5 === 0) { ctx.fillStyle = '#31402c'; ctx.fillText('+', x, y); }
          continue;
        }
        ctx.fillStyle = `rgba(182,247,123,${.2 + value * .8})`;
        ctx.fillText(glyphs[Math.min(glyphs.length - 1, Math.floor(value * glyphs.length))], x, y);
      }
    }
  }
  function canAnimate() { return visible && !document.hidden && !paused && !reduced.matches; }
  function tick(time) {
    frame = 0;
    if (!canAnimate()) return;
    if (time - last > 80) { phase += .045; draw(); last = time; }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    button.hidden = reduced.matches;
    document.documentElement.dataset.motion = paused || reduced.matches ? 'paused' : 'running';
    document.dispatchEvent(new Event('portfolio:motion'));
    if (canAnimate()) frame = requestAnimationFrame(tick); else draw();
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
  }
  button.addEventListener('click', () => { paused = !paused; button.setAttribute('aria-pressed', String(paused)); button.textContent = paused ? 'Retomar animações' : 'Pausar animações'; sync(); });
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(figure);
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  resize(); figure.classList.add('canvas-ready'); sync();
})();

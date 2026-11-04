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
  const figure = canvas.closest('figure');
  const button = figure.querySelector('.motion-toggle');
  const readout = figure.querySelector('#signal-stage');
  const fallback = figure.querySelector('.ascii-fallback');
  const ctx = canvas.getContext('2d');
  const rows = fallback.textContent.trimEnd().replace(/^\n/, '').split('\n');
  const columns = Math.max(...rows.map(row => row.length));
  const glyphs = rows.flatMap((row, y) => [...row].flatMap((char, x) =>
    char === ' ' ? [] : [{ x, y, char, tone: char === '+' ? .92 : char === ':' ? .74 : .56 }]
  ));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  let width = 0, height = 0, cell = 0, line = 0;
  let frame = 0, last = -Infinity, visible = true, paused = false, phase = 0;
  let targetX = 0, targetY = 0, driftX = 0, driftY = 0;

  function canAnimate() {
    return Boolean(ctx && visible && !document.hidden && !paused && !reduced.matches);
  }
  function draw(animated) {
    if (!ctx || width < 24 || height < 24) return;
    ctx.clearRect(0, 0, width, height);
    const left = (width - cell * columns) / 2;
    const top = (height - line * rows.length) / 2;
    const scan = phase % (rows.length + 19) - 9;
    for (const { x, y, char, tone } of glyphs) {
      const beam = animated ? Math.max(0, 1 - Math.abs(y - scan) / 5) : 0;
      const ripple = animated ? Math.sin(y * .49 + phase * .18) * beam * 2.6 : 0;
      const depth = .35 + tone * .65;
      const px = left + x * cell + (animated ? driftX * depth + ripple : 0);
      const py = top + (y + .5) * line + (animated ? driftY * depth : 0);
      ctx.globalAlpha = Math.min(1, tone + beam * .34);
      ctx.fillStyle = beam > .4 ? '#ddffc5' : '#b6e99b';
      ctx.fillText(beam > .83 && (x * 7 + y * 3) % 11 === 0 ? '+' : char, px, py);
    }
    ctx.globalAlpha = 1;
  }
  function tick(time) {
    frame = 0;
    if (!canAnimate()) return;
    if (time - last >= 40) {
      if (Number.isFinite(last)) phase += Math.min(time - last, 90) * .011;
      last = time;
      driftX += (targetX - driftX) * .23;
      driftY += (targetY - driftY) * .23;
      draw(true);
    }
    frame = requestAnimationFrame(tick);
  }
  function syncArt() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    last = -Infinity;
    const animated = canAnimate();
    readout.textContent = animated ? 'SCAN / ACTIVE' : 'FRAME / STILL';
    if (animated) frame = requestAnimationFrame(tick);
    else {
      targetX = targetY = driftX = driftY = 0;
      draw(false);
    }
  }
  function syncMotion() {
    button.hidden = reduced.matches;
    document.documentElement.dataset.motion = paused || reduced.matches ? 'paused' : 'running';
    document.dispatchEvent(new Event('portfolio:motion'));
    syncArt();
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const style = getComputedStyle(fallback);
    ctx.font = `500 ${style.fontSize} ${style.fontFamily}`;
    ctx.textBaseline = 'middle';
    cell = ctx.measureText('M').width;
    line = parseFloat(style.lineHeight);
    draw(canAnimate());
    figure.classList.toggle('canvas-ready', width >= 24 && height >= 24);
  }
  button.addEventListener('click', () => {
    paused = !paused;
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Retomar animações' : 'Pausar animações';
    syncMotion();
  });
  if (ctx) {
    figure.addEventListener('pointermove', e => {
      if (!canAnimate() || !pointer.matches || e.pointerType === 'touch') return;
      const rect = canvas.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, (e.clientX - rect.left) / width * 2 - 1)) * 12;
      targetY = Math.max(-1, Math.min(1, (e.clientY - rect.top) / height * 2 - 1)) * 9;
    }, { passive: true });
    const resetPointer = () => { targetX = targetY = 0; };
    figure.addEventListener('pointerleave', resetPointer);
    figure.addEventListener('pointercancel', resetPointer);
    pointer.addEventListener('change', resetPointer);
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        syncArt();
      }).observe(figure);
    }
    resize();
    document.fonts?.ready.then(resize);
  }
  reduced.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncArt);
  syncMotion();
})();

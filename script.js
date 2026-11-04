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
  const readout = figure.querySelector('#signal-stage');
  const rows = figure.querySelector('.ascii-fallback').textContent.trimEnd().replace(/^\n/, '').split('\n');
  const columns = Math.max(...rows.map(row => row.length));
  const stages = ['SCAN / USB', 'SCAN / MCU', 'SCAN / RF'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, frame = 0, last = 0, visible = true, paused = false, phase = 0;
  function draw() {
    if (width < 24 || height < 24) return;
    ctx.clearRect(0, 0, width, height);
    const fontSize = Math.min(15, (width - 12) / (columns * .63), (height - 8) / (rows.length * 1.04));
    ctx.font = `500 ${fontSize}px monospace`;
    ctx.textBaseline = 'top';
    const cellWidth = ctx.measureText('M').width;
    const rowHeight = fontSize * 1.04;
    const startX = (width - cellWidth * columns) / 2;
    const startY = (height - rowHeight * rows.length) / 2;
    const scan = phase % (rows.length + 6) - 3;
    const scanning = canAnimate();
    const stage = stages[Math.max(0, Math.min(2, Math.floor(scan / (rows.length / 3))))];
    if (readout.textContent !== stage) readout.textContent = stage;
    if (scanning && scan >= 0 && scan < rows.length) {
      ctx.fillStyle = '#b6f77b22';
      ctx.fillRect(startX + 3 * cellWidth, startY + scan * rowHeight, (columns - 3) * cellWidth, 1);
    }
    rows.forEach((row, y) => {
      const beam = scanning ? Math.max(0, 1 - Math.abs(y - scan) / 4) : 0;
      for (let x = 0; x < row.length; x += 1) {
        const glyph = row[x];
        if (glyph === ' ') continue;
        const pin = glyph === 'O' || glyph === '@';
        const label = /[A-Z0-9]/.test(glyph) && !pin;
        const base = label ? .92 : pin ? .74 : glyph === '.' || glyph === ':' ? .38 : .56;
        ctx.fillStyle = label ? '#e0f6d0' : `rgba(182,247,123,${Math.min(1, base + beam * .55)})`;
        ctx.fillText(glyph, startX + x * cellWidth, startY + y * rowHeight);
      }
    });
  }
  function canAnimate() { return visible && !document.hidden && !paused && !reduced.matches; }
  function tick(time) {
    frame = 0;
    if (!canAnimate()) return;
    if (time - last > 64) { phase += .48; draw(); last = time; }
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

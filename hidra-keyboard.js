const panel = document.querySelector('.hidra-keyboard');

if (panel && 'IntersectionObserver' in window) {
  const stage = panel.querySelector('.hidra-keyboard-stage');
  const mouseMotion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  let nearViewport = false;
  let figure;
  let loading = false;
  let unavailable = false;

  function canAnimate() {
    return nearViewport && mouseMotion.matches && !document.hidden &&
      document.documentElement.dataset.motion !== 'paused';
  }

  async function syncKeyboard() {
    if (!canAnimate()) {
      figure?.destroy();
      figure = undefined;
      panel.classList.remove('is-interactive');
      return;
    }
    if (figure || loading || unavailable) return;

    loading = true;
    try {
      const { keyboard } = await import('./vendor/hairline/keyboard.js');
      if (!canAnimate()) return;

      figure = keyboard(stage, {
        theme: 'dark',
        intensity: 0.35,
        play: false,
      });
      panel.classList.add('is-interactive');
    } catch (error) {
      unavailable = true;
      stage.replaceChildren();
      console.warn('O teclado Hairline ficou na versão estática.', error);
    } finally {
      loading = false;
    }
  }

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    nearViewport = true;
    observer.disconnect();
    syncKeyboard();
  }, { rootMargin: '120px' });
  observer.observe(panel);

  document.addEventListener('portfolio:motion', syncKeyboard);
  document.addEventListener('visibilitychange', syncKeyboard);
  mouseMotion.addEventListener('change', syncKeyboard);
}

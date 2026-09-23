(() => {
  const steps = [...document.querySelectorAll('[data-heritage-step]')];
  const frames = [...document.querySelectorAll('[data-heritage-frame]')];
  const progressLabel = document.getElementById('heritageProgress');
  const story = document.querySelector('.heritage-story');
  if (!steps.length || !frames.length || !story) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const activate = index => {
    steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    frames.forEach((frame, i) => frame.classList.toggle('is-active', i === index));
    if (progressLabel) progressLabel.textContent = String(index + 1).padStart(2, '0');
    story.style.setProperty('--heritage-progress', String((index + 1) / frames.length));
  };

  activate(0);
  if (reduceMotion) return;

  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    activate(Number(visible.target.dataset.heritageStep || 0));
  }, {
    threshold: [0.35, 0.5, 0.65],
    rootMargin: '-18% 0px -28% 0px'
  });

  steps.forEach(step => observer.observe(step));
})();

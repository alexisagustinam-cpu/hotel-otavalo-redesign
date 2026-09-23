(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const collectionToggle = document.getElementById('collectionToggle');
  const collectionPanel = document.getElementById('collectionPanel');
  const setCollection = open => {
    if (!collectionToggle || !collectionPanel) return;
    collectionToggle.setAttribute('aria-expanded', String(open));
    collectionPanel.setAttribute('aria-hidden', String(!open));
    collectionPanel.classList.toggle('is-open', open);
  };
  collectionToggle?.addEventListener('click', () => setCollection(collectionToggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setCollection(false); });
  document.addEventListener('click', event => {
    if (!collectionPanel?.classList.contains('is-open')) return;
    if (!collectionPanel.contains(event.target) && !collectionToggle?.contains(event.target)) setCollection(false);
  });

  const slides = [...document.querySelectorAll('.hero-slide')];
  const current = document.getElementById('heroSequenceCurrent');
  let active = 0;
  let timer;
  const show = index => {
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    active = index;
    if (current) current.textContent = String(index + 1).padStart(2, '0');
    const nextImg = slides[(index + 1) % slides.length]?.querySelector('img');
    if (nextImg && !nextImg.dataset.preloaded) {
      const preloader = new Image();
      preloader.src = nextImg.src;
      nextImg.dataset.preloaded = 'true';
    }
  };
  const start = () => {
    if (reduceMotion || slides.length < 2) return;
    clearInterval(timer);
    timer = setInterval(() => show((active + 1) % slides.length), 5500);
  };
  if (slides.length) { show(0); start(); }
  document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(timer) : start());

  const applyV2Language = () => {
    const lang = localStorage.getItem('hotelOtavaloLang') || 'es';
    document.querySelectorAll('[data-v2-es][data-v2-en]').forEach(el => {
      el.textContent = lang === 'en' ? el.dataset.v2En : el.dataset.v2Es;
    });
  };
  applyV2Language();
  document.querySelectorAll('.lang').forEach(button => button.addEventListener('click', () => setTimeout(applyV2Language, 0)));
})();

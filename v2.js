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

  /* hero-morph.js owns the homepage carousel when available. */
  const slides = window.hotelHeroMorphManaged ? [] : [...document.querySelectorAll('.hero-slide')];
  const current = document.getElementById('heroSequenceCurrent');
  let active = 0;
  let timer;
  let transitioning = false;

  const readyImage = img => new Promise(resolve => {
    if (!img) return resolve();
    img.loading = 'eager';
    img.decoding = 'async';
    const finish = () => {
      const decoded = img.decode ? img.decode().catch(() => {}) : Promise.resolve();
      Promise.resolve(decoded).finally(() => {
        img.classList.remove('image-pending');
        img.classList.add('image-ready');
        resolve();
      });
    };
    if (img.complete && img.naturalWidth > 0) return finish();
    img.classList.add('image-pending');
    img.addEventListener('load', finish, {once:true});
    img.addEventListener('error', resolve, {once:true});
  });

  const show = async index => {
    if (!slides.length || transitioning || index === active) return;
    transitioning = true;
    const target = slides[index];
    const targetImg = target?.querySelector('img');
    await readyImage(targetImg);
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    active = index;
    if (current) current.textContent = String(index + 1).padStart(2, '0');
    transitioning = false;

    const nextImg = slides[(index + 1) % slides.length]?.querySelector('img');
    if (nextImg) readyImage(nextImg);
  };

  const start = () => {
    if (reduceMotion || slides.length < 2) return;
    clearInterval(timer);
    timer = setInterval(() => show((active + 1) % slides.length), 6000);
  };

  if (slides.length) {
    const first = slides[0].querySelector('img');
    first?.classList.add('image-ready');
    slides.slice(1).forEach(slide => readyImage(slide.querySelector('img')));
    if (current) current.textContent = '01';
    start();
  }
  document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(timer) : start());

  const setText = (selector, es, en, html=false) => {
    const node = document.querySelector(selector);
    if (!node) return;
    const lang = localStorage.getItem('hotelOtavaloLang') || 'es';
    const value = lang === 'en' ? en : es;
    html ? node.innerHTML = value : node.textContent = value;
  };
  const applyV2Language = () => {
    const lang = localStorage.getItem('hotelOtavaloLang') || 'es';
    document.querySelectorAll('[data-v2-es][data-v2-en]').forEach(el => {
      el.textContent = lang === 'en' ? el.dataset.v2En : el.dataset.v2Es;
    });
    setText('.tour360 .section-index','Explora antes de llegar','Explore before you arrive');
    setText('.tour360 h2','Entra a la casa.<br>Desde cualquier lugar.','Enter the house.<br>From anywhere.',true);
    setText('.recognition .section-index','Reconocimiento & impacto','Recognition & impact');
    setText('.recognition h2','Una estancia local.<br>Reconocida fuera de Ecuador.','A local stay.<br>Recognized beyond Ecuador.',true);
    setText('.journey .section-index','Art Hotels Ecuador · 04 propiedades','Art Hotels Ecuador · 04 properties');
    setText('.journey h2','Continúa el viaje<br>por Ecuador.','Continue the journey<br>through Ecuador.',true);
    document.querySelectorAll('.journey-card span').forEach(el => el.textContent = lang === 'en' ? 'Explore ↗' : 'Explorar ↗');
    const bcorp = document.querySelector('.recognition-item:nth-child(3) p');
    if (bcorp) bcorp.textContent = lang === 'en' ? 'ARTHOTELES Ecuador S.A. · Since 2026' : 'ARTHOTELES Ecuador S.A. · Desde 2026';
  };
  applyV2Language();
  document.querySelectorAll('.lang').forEach(button => button.addEventListener('click', () => setTimeout(applyV2Language, 0)));
})();

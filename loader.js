const app = document.getElementById('app');
const heroPath = 'partials/01-header-hero.html';
const lowerParts = ['partials/02-heritage-rooms.html','partials/03-experiences-gastronomy.html','partials/04-itinerary-footer.html'];
const fetchText = path => fetch(path).then(response => { if (!response.ok) throw new Error(`No se pudo cargar ${path}`); return response.text(); });
const loadScript = src => new Promise((resolve, reject) => { const script=document.createElement('script'); script.src=src; script.onload=resolve; script.onerror=reject; document.body.appendChild(script); });
const safeLoad = (src, timeout = 3600) => Promise.race([loadScript(src),new Promise((_, reject) => window.setTimeout(() => reject(new Error(`Timeout cargando ${src}`)), timeout))]).catch(error => console.warn(`No se pudo cargar ${src}`, error));

const decodeImage = img => new Promise(resolve => {
  if (!img) return resolve();
  if (img.dataset.decodeBound === '1' && img.classList.contains('image-ready')) return resolve();
  img.dataset.decodeBound = '1';
  img.classList.add('image-pending');

  const finish = () => {
    const decoded = img.decode ? img.decode().catch(() => {}) : Promise.resolve();
    Promise.resolve(decoded).finally(() => {
      img.classList.remove('image-pending');
      img.classList.add('image-ready');
      resolve();
    });
  };

  const fail = () => {
    const fallback = img.dataset.fallback;
    if (fallback && img.dataset.fallbackTried !== '1') {
      img.dataset.fallbackTried = '1';
      img.removeAttribute('srcset');
      img.src = fallback;
      img.addEventListener('load', finish, {once:true});
      img.addEventListener('error', () => { img.classList.remove('image-pending'); resolve(); }, {once:true});
      return;
    }
    img.classList.remove('image-pending');
    resolve();
  };

  if (img.complete && img.naturalWidth > 0) return finish();
  img.addEventListener('load', finish, {once:true});
  img.addEventListener('error', fail, {once:true});
});

const runIdle = (fn, timeout=900) => {
  if ('requestIdleCallback' in window) requestIdleCallback(fn, {timeout});
  else setTimeout(fn, Math.min(timeout, 450));
};

const prepareHomepageImages = heroImage => {
  const heroSlides = [...document.querySelectorAll('.hero-slide img')].filter(img => img !== heroImage);

  /* Only the next hero frame gets immediate priority. */
  const nextHero = heroSlides[0];
  if (nextHero) {
    nextHero.loading='eager';
    nextHero.decoding='async';
    nextHero.fetchPriority='high';
    decodeImage(nextHero);
  }

  /* Remaining hero frames warm quietly once the first paint is safe. */
  runIdle(() => heroSlides.slice(1).forEach(img => {
    img.loading='eager';
    img.decoding='async';
    img.fetchPriority='auto';
    decodeImage(img);
  }), 550);

  /* Heritage is the next visible chapter. */
  const heritage = [...document.querySelectorAll('.heritage-frame img')];
  heritage.slice(0,2).forEach(img => {
    img.loading='eager';
    img.decoding='async';
    img.fetchPriority='auto';
    decodeImage(img);
  });
  runIdle(() => heritage.slice(2).forEach(img => {
    img.loading='eager';
    img.decoding='async';
    decodeImage(img);
  }), 700);

  /* Rooms load in the background well before the user reaches the horizontal chapter. */
  const rooms = [...document.querySelectorAll('.stay-card img')];
  rooms.forEach(img => {
    img.classList.add('image-pending');
    img.decoding='async';
    img.fetchPriority='auto';
  });
  runIdle(() => rooms.forEach(img => {
    img.loading='eager';
    decodeImage(img);
  }), 800);

  /* Lower-page media starts roughly 1200px before entering the viewport. */
  const later = [...document.querySelectorAll('.experience-tile img,.taste-panel img,.events-compact-media img,.journey-card img')];
  later.forEach(img => {
    img.loading='lazy';
    img.decoding='async';
    img.fetchPriority='low';
    img.classList.add('image-pending');
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        img.loading='eager';
        img.fetchPriority='auto';
        decodeImage(img);
        observer.unobserve(img);
      });
    }, {rootMargin:'1200px 0px'});
    later.forEach(img => observer.observe(img));
  } else {
    runIdle(() => later.forEach(decodeImage), 1100);
  }
};

(async()=>{
  try{
    const lowerPromise=Promise.all(lowerParts.map(fetchText));
    const heroHtml=await fetchText(heroPath);
    app.innerHTML=heroHtml;
    const lowerHtml=await lowerPromise;
    app.insertAdjacentHTML('beforeend',lowerHtml.join(''));

    await loadScript('script.js');

    /* The cinematic entrance cannot start until the first hero image is fully loaded and decoded. */
    const heroImage=document.querySelector('.hero-slide.is-active img') || document.querySelector('.hero-slide img') || document.querySelector('.hero-media img');
    if(heroImage){
      heroImage.loading='eager';
      heroImage.decoding='async';
      heroImage.fetchPriority='high';
      await decodeImage(heroImage);
    }
    prepareHomepageImages(heroImage);

    /* Ported from the supplied Morph Gallery concept: WebGL morph when CORS allows it,
       horizontal right-to-left wipe fallback otherwise. */
    await loadScript('hero-morph.js');
    await loadScript('v2.js');
    await safeLoad('https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js');
    await Promise.all([
      safeLoad('https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js'),
      safeLoad('https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/SplitText.min.js'),
      safeLoad('https://unpkg.com/lenis@1.3.21/dist/lenis.min.js')
    ]);
    await loadScript('v3.js');
    await loadScript('enhancements.js');
    await loadScript('stability.js');
  }catch(error){
    console.error(error);
    app.innerHTML='<main style="padding:40px;font-family:sans-serif">No se pudo cargar la demo.</main>';
  }
})();

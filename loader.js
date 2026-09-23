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

  if (img.complete && img.naturalWidth > 0) return finish();
  img.addEventListener('load', finish, {once:true});
  img.addEventListener('error', () => {
    img.classList.remove('image-pending');
    resolve();
  }, {once:true});
});

const prepareHomepageImages = heroImage => {
  const heroSlides = [...document.querySelectorAll('.hero-slide img')].filter(img => img !== heroImage);
  heroSlides.forEach(img => {
    img.loading='eager';
    img.decoding='async';
    img.fetchPriority='high';
    decodeImage(img);
  });

  /* Only the next two chapters compete for bandwidth immediately. */
  const early = [...document.querySelectorAll('.heritage-frame img,.stay-card img')];
  early.forEach((img,index) => {
    img.loading='eager';
    img.decoding='async';
    img.fetchPriority=index < 3 ? 'high' : 'auto';
    decodeImage(img);
  });

  /* Everything else starts loading shortly before it becomes visible. */
  const later = [...document.querySelectorAll('.experience-tile img,.taste-panel img,.events-compact-media img,.journey-card img')];
  later.forEach(img => {
    img.loading='lazy';
    img.decoding='async';
    img.classList.add('image-pending');
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        img.loading='eager';
        decodeImage(img);
        observer.unobserve(img);
      });
    }, {rootMargin:'900px 0px'});
    later.forEach(img => observer.observe(img));
  } else {
    setTimeout(() => later.forEach(decodeImage), 500);
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

    /* Do not start the cinematic entrance until the first hero image is actually decoded. */
    const heroImage=document.querySelector('.hero-slide.is-active img') || document.querySelector('.hero-slide img') || document.querySelector('.hero-media img');
    if(heroImage){
      heroImage.loading='eager';
      heroImage.decoding='async';
      heroImage.fetchPriority='high';
      await decodeImage(heroImage);
    }
    prepareHomepageImages(heroImage);

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

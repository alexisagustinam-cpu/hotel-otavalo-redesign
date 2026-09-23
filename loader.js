const app = document.getElementById('app');
const heroPath = 'partials/01-header-hero.html';
const lowerParts = ['partials/02-heritage-rooms.html','partials/03-experiences-gastronomy.html','partials/04-itinerary-footer.html'];
const fetchText = path => fetch(path).then(response => { if (!response.ok) throw new Error(`No se pudo cargar ${path}`); return response.text(); });
const loadScript = src => new Promise((resolve, reject) => { const script=document.createElement('script'); script.src=src; script.onload=resolve; script.onerror=reject; document.body.appendChild(script); });
const safeLoad = (src, timeout = 3600) => Promise.race([loadScript(src),new Promise((_, reject) => window.setTimeout(() => reject(new Error(`Timeout cargando ${src}`)), timeout))]).catch(error => console.warn(`No se pudo cargar ${src}`, error));

const decodeImage = img => new Promise(resolve => {
  if (!img) return resolve();
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
  img.addEventListener('error', () => { img.classList.remove('image-pending'); resolve(); }, {once:true});
});

const warmHomepageImages = heroImage => {
  const selector = [
    '.hero-slide img',
    '.heritage-frame img',
    '.stay-card img',
    '.experience-tile img',
    '.taste-panel img',
    '.events-compact-media img',
    '.journey-card img'
  ].join(',');
  const images = [...document.querySelectorAll(selector)].filter(img => img !== heroImage);
  images.forEach(img => {
    img.loading = 'eager';
    img.decoding = 'async';
    img.classList.add('image-pending');
  });

  /* Prioritize what appears next; the rest continues in the background. */
  const priority = images.filter(img => img.closest('.hero-slide,.heritage-frame,.stay-card'));
  const later = images.filter(img => !priority.includes(img));
  Promise.allSettled(priority.map(decodeImage));
  const startLater = () => Promise.allSettled(later.map(decodeImage));
  if ('requestIdleCallback' in window) requestIdleCallback(startLater, {timeout:1200});
  else setTimeout(startLater, 350);
};

(async()=>{
  try{
    const lowerPromise=Promise.all(lowerParts.map(fetchText));
    const heroHtml=await fetchText(heroPath);
    app.innerHTML=heroHtml;
    const lowerHtml=await lowerPromise;
    app.insertAdjacentHTML('beforeend',lowerHtml.join(''));

    await loadScript('script.js');

    /* Keep the intro covering the page until the first hero frame is fully decoded. */
    const heroImage=document.querySelector('.hero-slide.is-active img');
    if(heroImage){
      heroImage.loading='eager';
      heroImage.decoding='async';
      heroImage.fetchPriority='high';
      await decodeImage(heroImage);
    }
    warmHomepageImages(heroImage);

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

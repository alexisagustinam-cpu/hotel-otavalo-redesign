const app = document.getElementById('app');
const heroPath = 'partials/01-header-hero.html';
const lowerParts = [
  'partials/02-heritage-rooms.html',
  'partials/03-experiences-gastronomy.html',
  'partials/04-itinerary-footer.html'
];

const fetchText = path => fetch(path).then(response => {
  if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
  return response.text();
});

const loadScript = src => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = src;
  script.onload = resolve;
  script.onerror = reject;
  document.body.appendChild(script);
});

(async () => {
  try {
    const lowerPromise = Promise.all(lowerParts.map(fetchText));
    const heroHtml = await fetchText(heroPath);
    app.innerHTML = heroHtml;

    const lowerHtml = await lowerPromise;
    app.insertAdjacentHTML('beforeend', lowerHtml.join(''));

    await loadScript('script.js');
    await loadScript('v2.js');
    await loadScript('scroll-story.js');
  } catch (error) {
    console.error(error);
    app.innerHTML = '<main style="padding:40px;font-family:sans-serif">No se pudo cargar la demo.</main>';
  }
})();

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

(async () => {
  try {
    const lowerPromise = Promise.all(lowerParts.map(fetchText));
    const heroHtml = await fetchText(heroPath);

    // Paint the critical above-the-fold content immediately instead of
    // waiting for the entire page to finish downloading.
    app.innerHTML = heroHtml;

    const lowerHtml = await lowerPromise;
    app.insertAdjacentHTML('beforeend', lowerHtml.join(''));

    const script = document.createElement('script');
    script.src = 'script.js';
    document.body.appendChild(script);
  } catch (error) {
    console.error(error);
    app.innerHTML = '<main style="padding:40px;font-family:sans-serif">No se pudo cargar la demo.</main>';
  }
})();

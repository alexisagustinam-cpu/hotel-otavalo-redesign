const parts = [
  'partials/01-header-hero.html',
  'partials/02-heritage-rooms.html',
  'partials/03-experiences-gastronomy.html',
  'partials/04-itinerary-footer.html'
];

Promise.all(parts.map(path => fetch(path).then(r => {
  if (!r.ok) throw new Error(`No se pudo cargar ${path}`);
  return r.text();
})))
  .then(html => {
    document.getElementById('app').innerHTML = html.join('');
    const script = document.createElement('script');
    script.src = 'script.js';
    document.body.appendChild(script);
  })
  .catch(error => {
    console.error(error);
    document.getElementById('app').innerHTML = '<main style="padding:40px;font-family:sans-serif">No se pudo cargar la demo.</main>';
  });

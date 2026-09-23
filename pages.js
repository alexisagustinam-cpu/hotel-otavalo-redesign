const BOOKING_URL = 'https://secuream.e-gds.com/mamacucharabyarthotels/shoppingcart/availability.aspx?hotelid=461';
const IMG = {
  house:'https://hotelotavalo.com/wp-content/uploads/2026/05/slider-1.jpg',
  roomLuxury:'https://hotelotavalo.com/wp-content/uploads/revslider/o/9/1679ec66b0d273e25c0eca01c4bf8432.webp',
  roomTub:'https://hotelotavalo.com/wp-content/uploads/revslider/o/9/b168ee34804b96fb02a7d364facba6a4.webp',
  roomDeluxe:'https://hotelotavalo.com/wp-content/uploads/revslider/o/9/fa646ab66294c9684f7573e8aab89dd6.webp',
  roomInterior:'https://hotelotavalo.com/wp-content/uploads/revslider/o/9/28176bc0cab1af1b6a991782d8427b02.webp',
  sarance:'https://hotelotavalo.com/wp-content/uploads/2026/05/sarance-8.jpg',
  rooftop:'https://hotelotavalo.com/wp-content/uploads/2026/05/nukanchikwan-7.jpg',
  equator:'https://hotelotavalo.com/wp-content/uploads/2026/05/equator-face-5.jpg',
  kawsaymi:'https://hotelotavalo.com/wp-content/uploads/2026/05/kawsaymi-5.jpg',
  taita:'https://hotelotavalo.com/wp-content/uploads/2026/05/taita-gundo-1.jpg'
};

const common = {
  es:{nav:['Hotel','Habitaciones','Experiencias','Gastronomía','Otavalo'],reserve:'Reservar',back:'Volver al inicio',discover:'También puedes descubrir',book:'Consultar disponibilidad',footer:'Concepto de rediseño · 2026'},
  en:{nav:['Hotel','Rooms','Experiences','Gastronomy','Otavalo'],reserve:'Book',back:'Back to home',discover:'You may also discover',book:'Check availability',footer:'Redesign concept · 2026'}
};

const pages = window.HOTEL_PAGES;
const routeMap = {
  '/habitaciones':'habitaciones','/habitaciones/luxury':'luxury','/habitaciones/deluxe':'deluxe','/habitaciones/superior':'superior',
  '/restaurante':'restaurante','/rooftop':'rooftop','/experiencias':'experiencias','/experiencias/equator-face':'equator-face','/experiencias/kawsaymi':'kawsaymi','/experiencias/taita-gundo':'taita-gundo'
};
const normalizePath = p => p.replace(/\/$/,'') || '/';
const params = new URLSearchParams(location.search);
const pageKey = params.get('page') || routeMap[normalizePath(location.pathname)] || 'habitaciones';
let lang = localStorage.getItem('hotelOtavaloLang') || 'es';
if(!pages[pageKey]) location.href='/';

function header(c){return `<header class="site-header scrolled internal-header" id="siteHeader"><a class="brand" href="/"><span class="brand-main">Hotel Otavalo</span><span class="brand-sub">Art Hotels Ecuador</span></a><nav class="desktop-nav" aria-label="Main navigation">${c.nav.map((n,i)=>`<a href="/${['#hotel','#habitaciones','#experiencias','#gastronomia','#otavalo'][i]}">${n}</a>`).join('')}</nav><div class="header-actions"><button class="lang" id="detailLang" type="button">${lang==='es'?'ES <span>/</span> EN':'EN <span>/</span> ES'}</button><a class="header-book" href="${BOOKING_URL}" target="_blank" rel="noreferrer">${c.reserve}</a><button class="menu-toggle" id="menuToggle" aria-expanded="false" aria-controls="mobileNav"><span></span><span></span></button></div></header><nav class="mobile-nav" id="mobileNav">${c.nav.map((n,i)=>`<a href="/${['#hotel','#habitaciones','#experiencias','#gastronomia','#otavalo'][i]}">${n}</a>`).join('')}<a href="${BOOKING_URL}" target="_blank" rel="noreferrer">${c.book}</a></nav>`}
function facts(items){return `<div class="facts">${items.map(([a,b])=>`<div class="fact"><span>${a}</span><strong>${b}</strong></div>`).join('')}</div>`}
function cards(items){return `<section class="collection"><div class="collection-head"><h2>${lang==='es'?'Elige por dónde continuar.':'Choose where to continue.'}</h2><p>${lang==='es'?'Cada espacio mantiene la misma lógica: primero entender el lugar, después decidir.':'Every space follows the same logic: understand the place first, then decide.'}</p></div><div class="collection-grid">${items.map(([t,d,u,img])=>`<a class="collection-card" href="${u}" ${u.startsWith('http')?'target="_blank" rel="noreferrer"':''}><img src="${img}" alt="" loading="lazy"><div class="collection-card-copy"><h3>${t}</h3><p>${d}</p><span class="text-link text-link-light">${lang==='es'?'Descubrir':'Discover'}</span></div></a>`).join('')}</div></section>`}
function related(items,c){return `<section class="related"><div class="related-inner"><h2>${c.discover}</h2><div class="related-links">${items.map(([t,u])=>`<a class="related-link" href="${u}">${t}<span>↗</span></a>`).join('')}</div></div></section>`}
function render(){
  const d=pages[pageKey][lang], c=common[lang]; document.documentElement.lang=lang; document.title=`${d.eyebrow} | Hotel Otavalo`;
  document.getElementById('detailApp').innerHTML=`${header(c)}<main><section class="detail-hero"><div class="detail-hero-media"><img src="${d.hero}" alt="" fetchpriority="high"></div><div class="detail-hero-shade"></div><div class="detail-hero-copy"><a class="detail-back" href="/">← ${c.back}</a><p class="detail-eyebrow">${d.eyebrow}</p><h1>${d.title}</h1><p class="detail-lead">${d.lead}</p></div></section><div class="detail-main"><section class="detail-intro"><h2>${d.introTitle}</h2><div class="detail-intro-copy">${d.intro.map(p=>`<p>${p}</p>`).join('')}<div class="detail-actions"><a class="button button-dark" href="${BOOKING_URL}" target="_blank" rel="noreferrer">${c.book}</a></div></div></section>${facts(d.facts)}<div class="detail-gallery"><figure><img src="${d.gallery[0]}" alt="" loading="lazy"></figure><figure><img src="${d.gallery[1]}" alt="" loading="lazy"></figure></div>${d.sectionTitle?`<section class="detail-section"><h2>${d.sectionTitle}</h2><div class="detail-section-copy"><ul>${d.section.map(x=>`<li><span>${x}</span><span>—</span></li>`).join('')}</ul></div></section>`:''}${d.cards?cards(d.cards):''}</div>${d.related?related(d.related,c):''}</main><footer class="detail-footer"><div><p class="brand-main">Hotel Otavalo</p><small>Art Hotels Ecuador</small></div><div><a href="/">${c.back}</a><p><small>${c.footer}</small></p></div></footer>`;
  bindUI();
}
function bindUI(){
  const toggle=document.getElementById('detailLang'); if(toggle) toggle.onclick=()=>{lang=lang==='es'?'en':'es';localStorage.setItem('hotelOtavaloLang',lang);render();};
  const menu=document.getElementById('menuToggle'), nav=document.getElementById('mobileNav'); if(menu&&nav){menu.onclick=()=>{const open=!nav.classList.contains('open');nav.classList.toggle('open',open);menu.classList.toggle('active',open);document.body.style.overflow=open?'hidden':'';};}
}
render();

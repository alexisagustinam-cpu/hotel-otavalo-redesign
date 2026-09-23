const header = document.getElementById('siteHeader');
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');

const syncHeader = () => header?.classList.toggle('scrolled', window.scrollY > 42 || mobileNav?.classList.contains('open'));
window.addEventListener('scroll', syncHeader, { passive: true });
syncHeader();

menuToggle?.addEventListener('click', () => {
  const open = !mobileNav.classList.contains('open');
  mobileNav.classList.toggle('open', open);
  menuToggle.classList.toggle('active', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
  syncHeader();
});
mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileNav.classList.remove('open'); menuToggle?.classList.remove('active'); menuToggle?.setAttribute('aria-expanded','false'); document.body.style.overflow=''; syncHeader();
}));

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), { threshold: 0.14, rootMargin: '0px 0px -4% 0px' });
document.querySelectorAll('.reveal, .reveal-media').forEach(el => observer.observe(el));

const today = new Date(), tomorrow = new Date(today), nextDay = new Date(today);
tomorrow.setDate(today.getDate()+1); nextDay.setDate(today.getDate()+2);
const toInputDate = d => d.toISOString().slice(0,10);
const checkin=document.getElementById('checkin'), checkout=document.getElementById('checkout');
if(checkin&&checkout){checkin.min=toInputDate(today);checkin.value=toInputDate(tomorrow);checkout.min=toInputDate(tomorrow);checkout.value=toInputDate(nextDay);checkin.addEventListener('change',()=>{if(!checkin.value)return;const min=new Date(`${checkin.value}T12:00:00`);min.setDate(min.getDate()+1);checkout.min=toInputDate(min);if(!checkout.value||checkout.value<=checkin.value)checkout.value=toInputDate(min);});}

let currentLang = localStorage.getItem('hotelOtavaloLang') || 'es';
const originals = new WeakMap();
function swap(selector, english, html=false){
  const nodes=[...document.querySelectorAll(selector)]; const vals=Array.isArray(english)?english:[english];
  nodes.forEach((el,i)=>{if(!originals.has(el)) originals.set(el, html?el.innerHTML:el.textContent); const value=vals[i] ?? vals[vals.length-1]; if(currentLang==='en'){html?el.innerHTML=value:el.textContent=value;} else {const original=originals.get(el);html?el.innerHTML=original:el.textContent=original;}});
}
function applyLanguage(){
  document.documentElement.lang=currentLang;
  swap('.skip-link','Skip to content');
  swap('.desktop-nav a',['Hotel','Rooms','Experiences','Gastronomy','Otavalo']);
  swap('.mobile-nav a',['Hotel','Rooms','Experiences','Gastronomy','Otavalo','Check availability']);
  swap('.header-book','Book');
  swap('.hero h1','Sleep inside<br>the history<br>of Otavalo.',true);
  swap('.hero-copy','A historic 1930 house transformed into a boutique hotel, where architecture, Ecuadorian art and Andean culture become part of the stay.');
  swap('.hero-actions .button','Check availability'); swap('.hero-actions .text-link','Discover the house');
  swap('.hero-foot small',['Origin of the house','Reborn as a boutique hotel','Explore Otavalo on foot']);
  swap('.booking-field label',['Arrival','Departure','Guests']); swap('#guests option',['2 adults','1 adult','3 adults','4 adults']); swap('.booking-submit','Check availability ↗');
  swap('.statement-grid > .section-index','A house for discovering a city.'); swap('.statement-copy h2','Otavalo does not end at Plaza de Ponchos.<br><span>That is where it begins.</span>',true); swap('.statement-copy p','Stay to discover the crafts, flavors, music and landscapes that make this city one of the most distinctive cultural territories in the Ecuadorian Andes.');
  swap('.heritage .section-index','Heritage'); swap('.heritage h2','Almost a century<br>inside these walls.',true); swap('.heritage-head > p:last-child','The original architecture remains the protagonist: stone, brick, wood and restored arches meet art and contemporary hospitality.');
  swap('.timeline-item h3',['The house is born','A history of hospitality','Restore, do not erase','The house opens again']);
  swap('.timeline-item div p',['Elías Endara builds the house inspired by Spanish colonial architecture.','The property evolves and becomes part of the city’s hotel memory.','Art Hotels Ecuador begins a complete restoration while preserving the building’s heritage character.','It reopens as a luxury boutique hotel: a new chapter for a historic Otavalo building.']);
  swap('.rooms .section-index','Rooms'); swap('.rooms-head h2','Choose how you want<br>to inhabit the house.',true); swap('.rooms-head div p','Stone and brick spaces, carved headboards and a selection of art that keeps every stay from feeling generic.'); swap('.rooms-head > a','Explore the rooms');
  swap('.room-caption span','Private balcony · King or Twin · Tub or Jacuzzi'); swap('.room-card-text p',['Exposed stone, selected art and crafted details.','Contemporary comfort inside a building with memory.']); swap('.room-card-text a',['View room','Explore categories']);
  swap('.experiences .section-index','Living culture'); swap('.experiences-head h2','Meet Otavalo<br>through the people who<br>keep it alive.',true); swap('.experience-card h3',['Weave','Cook','Listen']);
  swap('.experience-card .experience-text > p:not(.experience-number)',['Visit a family weaving on traditional pedal and backstrap looms beside Lake San Pablo.','Share ancestral cooking around the tulpa, wood-fired oven and recipes kept alive by an Otavaleño Kichwa family.','Discover how Andean instruments are made and played, and how music connects to local worldview.']);
  swap('.experience-card .text-link',['Discover Andean looms','Meet Kawsaymi','Enter Taita Gundo']); swap('.experiences-all .text-link','See all experiences');
  swap('.art-break .section-index','Art in situ'); swap('.art-copy h2','A hotel that can also<br>be walked like a gallery.',true); swap('.art-copy > p:last-child','Works, objects and details appear through corridors, rooms and corners of the house. Art does not decorate the hotel: it is part of its identity.');
  swap('.gastronomy-restaurant h2','Flavors born<br>in Ecuador.',true); swap('.gastronomy-restaurant span','A contemporary interpretation of the country’s ingredients, memories and kitchens.'); swap('.gastronomy-restaurant .text-link','Discover the restaurant');
  swap('.gastronomy-rooftop h2','Otavalo changes<br>at sunset.',true); swap('.gastronomy-rooftop span','Cocktails, music and a privileged view toward Taita Imbabura.'); swap('.gastronomy-rooftop .text-link','Go up to the rooftop');
  swap('.itinerary .section-index','48 hours in Otavalo'); swap('.itinerary-head h2','Come for the market.<br>Stay for everything else.',true); swap('.day-number',['Day 1','Day 2']);
  swap('.day h3',['Plaza de Ponchos','Check-in and art in situ','Rooftop at sunset','Dinner at Sarance','A slow breakfast','Peguche and Taita Gundo','Lake San Pablo and looms','Back to the house']);
  swap('.day li p',['Textiles, crafts and the pulse of central Otavalo.','Walk the house, its artworks and materials before settling in.','Canelazo, local cocktails and Taita Imbabura on the horizon.','A journey through ingredients and kitchens from different regions of Ecuador.','Start inside the house before heading into the Andes.','Waterfall, community and Andean music in the same morning.','Discover textile techniques passed through generations.','One final afternoon to slow down before continuing your journey.']);
  swap('.quote blockquote p','It feels like a museum filled with art. Excellent architecture and 10/10 service.'); swap('.quote blockquote footer','Verified review · Tripadvisor');
  swap('.final-book .section-index','Your room in the heart of Otavalo'); swap('.final-book h2','The city is waiting.<br>The house is too.',true); swap('.final-book .button','Check availability');
  swap('.footer-label',['Visit us','Reservations']); swap('.footer-end a','Back to top ↑'); swap('.footer-end span','Redesign concept · 2026');
  document.querySelectorAll('.lang').forEach(btn=>btn.innerHTML=currentLang==='es'?'ES <span>/</span> EN':'EN <span>/</span> ES');
}
document.querySelectorAll('.lang').forEach(btn=>btn.addEventListener('click',()=>{currentLang=currentLang==='es'?'en':'es';localStorage.setItem('hotelOtavaloLang',currentLang);applyLanguage();}));
applyLanguage();

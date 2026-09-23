const header = document.getElementById('siteHeader');
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');

const syncHeader = () => {
  header.classList.toggle('scrolled', window.scrollY > 42 || mobileNav.classList.contains('open'));
};

window.addEventListener('scroll', syncHeader, { passive: true });
syncHeader();

menuToggle.addEventListener('click', () => {
  const open = !mobileNav.classList.contains('open');
  mobileNav.classList.toggle('open', open);
  menuToggle.classList.toggle('active', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
  syncHeader();
});

mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    syncHeader();
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14, rootMargin: '0px 0px -4% 0px' });

document.querySelectorAll('.reveal, .reveal-media').forEach(el => observer.observe(el));

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const nextDay = new Date(today);
nextDay.setDate(today.getDate() + 2);
const toInputDate = d => d.toISOString().slice(0, 10);
const checkin = document.getElementById('checkin');
const checkout = document.getElementById('checkout');
if (checkin && checkout) {
  checkin.min = toInputDate(today);
  checkin.value = toInputDate(tomorrow);
  checkout.min = toInputDate(tomorrow);
  checkout.value = toInputDate(nextDay);
  checkin.addEventListener('change', () => {
    if (!checkin.value) return;
    const minCheckout = new Date(`${checkin.value}T12:00:00`);
    minCheckout.setDate(minCheckout.getDate() + 1);
    checkout.min = toInputDate(minCheckout);
    if (!checkout.value || checkout.value <= checkin.value) checkout.value = toInputDate(minCheckout);
  });
}

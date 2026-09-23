(() => {
  const nav=document.querySelector('.desktop-nav');
  if(nav&&!nav.dataset.enhanced){
    nav.dataset.enhanced='true';
    const makeGroup=(href,items)=>{
      const link=[...nav.querySelectorAll(':scope > a')].find(a=>a.getAttribute('href')===href);
      if(!link)return;
      const group=document.createElement('div');group.className='nav-group';link.replaceWith(group);group.appendChild(link);
      const menu=document.createElement('div');menu.className='nav-dropdown';items.forEach(([t,u,s])=>{const a=document.createElement('a');a.href=u;a.innerHTML=`<span>${t}</span><small>${s||''}</small>`;menu.appendChild(a)});group.appendChild(menu);
    };
    makeGroup('/habitaciones',[['Luxury','/habitaciones/luxury','43–50 m²'],['Deluxe','/habitaciones/deluxe','35 m²'],['Superior','/habitaciones/superior','40 m²'],['Premium','/habitaciones/premium','40–45 m²'],['Ver todas','/habitaciones','28 habitaciones']]);
    makeGroup('/experiencias',[['Equator Face','/experiencias/equator-face','Tejer'],['Kawsaymi','/experiencias/kawsaymi','Cocinar'],['Taita Gundo','/experiencias/taita-gundo','Escuchar'],['Sombreros de Ilumán','/experiencias/sombreros-iluman','Moldear'],['Arte Nayia','/experiencias/arte-nayia','Crear']]);
    makeGroup('/gastronomia',[['Restaurante Sarance','/restaurante','Mesa'],['Rooftop Ñukanchikwan Taki','/rooftop','Atardecer']]);
    const otavalo=[...nav.querySelectorAll(':scope > a')].find(a=>a.getAttribute('href')==='/otavalo');
    if(otavalo){const events=document.createElement('a');events.href='#eventos';events.textContent='Eventos';otavalo.after(events);const contact=document.createElement('a');contact.href='#contacto';contact.textContent='Contacto';events.after(contact)}
  }
  const mobile=document.getElementById('mobileNav');
  if(mobile&&!mobile.querySelector('[href="#eventos"]')){const before=mobile.lastElementChild;[['Eventos','#eventos'],['Contacto','#contacto']].forEach(([t,u])=>{const a=document.createElement('a');a.href=u;a.textContent=t;mobile.insertBefore(a,before)});}
  document.querySelectorAll('img').forEach(img=>{if(img.dataset.fallbackBound)return;img.dataset.fallbackBound='1';img.addEventListener('error',()=>{const fallback=img.closest('.stay-card')?'https://hotelotavalo.com/wp-content/uploads/revslider/o/9/1679ec66b0d273e25c0eca01c4bf8432.webp':'https://hotelotavalo.com/wp-content/uploads/2026/05/slider-1.jpg';if(img.src!==fallback){img.src=fallback;img.onerror=null}})});
})();
(() => {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const killTriggersInside = root => {
    if (!root) return;
    ScrollTrigger.getAll().forEach(st => {
      const trigger = st.trigger;
      if (trigger === root || (trigger instanceof Element && root.contains(trigger))) st.kill(true);
    });
  };

  /* Rooms: one system only — vertical scroll controls horizontal travel. */
  const originalStay = document.querySelector('.stay-horizontal');
  if (originalStay && !reduceMotion && window.matchMedia('(min-width:761px)').matches) {
    killTriggersInside(originalStay);
    gsap.killTweensOf([
      originalStay,
      originalStay.querySelector('.stay-horizontal-track'),
      ...originalStay.querySelectorAll('.stay-card'),
      ...originalStay.querySelectorAll('.stay-card img')
    ].filter(Boolean));

    const stay = originalStay.cloneNode(true);
    originalStay.replaceWith(stay);
    stay.querySelector('.stay-drag-hint')?.remove();

    const track = stay.querySelector('.stay-horizontal-track');
    const progress = stay.querySelector('.stay-horizontal-progress');
    const cards = [...stay.querySelectorAll('.stay-card')];

    gsap.set(stay, {clearProps:'position,top,left,right,bottom,transform,opacity'});
    gsap.set(track, {x:0});
    cards.forEach(card => {
      gsap.set(card, {clearProps:'transform,opacity'});
      const img = card.querySelector('img');
      if (img) gsap.set(img, {clearProps:'transform'});
    });

    const distance = () => Math.max(1, track.scrollWidth - stay.clientWidth);

    gsap.fromTo(stay,
      {scale:.94},
      {scale:1,ease:'none',scrollTrigger:{trigger:stay,start:'top 88%',end:'center center',scrub:.45}}
    );

    const roomST = ScrollTrigger.create({
      trigger: stay,
      start: 'center center',
      end: () => `+=${distance()}`,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: self => {
        const d = distance();
        gsap.set(track, {x: -d * self.progress});
        progress?.style.setProperty('--stay-progress', String(Math.max(.04, self.progress)));
      },
      onRefresh: self => {
        const d = distance();
        gsap.set(track, {x: -d * self.progress});
      }
    });

    window.addEventListener('load', () => roomST.refresh(), {once:true});
  }

  /* Experiences: clear legacy overlapping motion and reveal only after the image is ready. */
  const experience = document.querySelector('.experience-scene');
  if (experience && !reduceMotion) {
    killTriggersInside(experience);
    const tiles = [...experience.querySelectorAll('.experience-tile')];
    const figures = [...experience.querySelectorAll('.experience-tile figure')];
    const imgs = [...experience.querySelectorAll('.experience-tile img')];
    gsap.killTweensOf([...tiles, ...figures, ...imgs]);
    gsap.set(figures, {clipPath:'none'});
    gsap.set(imgs, {clearProps:'transform'});

    tiles.forEach((tile,index) => {
      gsap.set(tile, {opacity:0, y:32 + (index % 2) * 14});
      ScrollTrigger.create({
        trigger: tile,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          const img = tile.querySelector('img');
          const reveal = () => gsap.to(tile,{opacity:1,y:0,duration:.72,ease:'power3.out',delay:index*.03});
          if (!img || (img.complete && img.naturalWidth)) reveal();
          else img.addEventListener('load', reveal, {once:true});
        }
      });
    });
  }

  /* Collection: remove every legacy clip/reveal that can hide the three hotel cards. */
  const journey = document.querySelector('.journey');
  if (journey) {
    killTriggersInside(journey);
    const cards = [...journey.querySelectorAll('.journey-card')];
    cards.forEach((card,index) => {
      card.classList.remove('v3-reveal-media');
      const img = card.querySelector('img');
      gsap.killTweensOf([card,img].filter(Boolean));
      gsap.set(card,{clipPath:'none',visibility:'visible',clearProps:'transform'});
      if (img) gsap.set(img,{visibility:'visible',clearProps:'transform,clipPath'});

      if (reduceMotion) {
        gsap.set(card,{opacity:1,y:0});
        if (img) gsap.set(img,{opacity:1});
        return;
      }

      gsap.set(card,{opacity:0,y:26});
      ScrollTrigger.create({
        trigger:card,
        start:'top 92%',
        once:true,
        onEnter:()=>{
          const reveal=()=>gsap.to(card,{opacity:1,y:0,duration:.68,ease:'power3.out',delay:index*.05});
          if(!img||(img.complete&&img.naturalWidth)) reveal();
          else img.addEventListener('load',reveal,{once:true});
        }
      });
    });
  }

  requestAnimationFrame(() => ScrollTrigger.refresh());
})();

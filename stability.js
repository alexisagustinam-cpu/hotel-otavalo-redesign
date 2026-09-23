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

  /* Rooms — rebuild the chapter after V3 so the old drag listeners and pin are gone. */
  const oldStayArea = document.querySelector('.stay-horizontal');
  if (oldStayArea && !reduceMotion && window.matchMedia('(min-width:761px)').matches) {
    killTriggersInside(oldStayArea);
    const oldTrack = oldStayArea.querySelector('.stay-horizontal-track');
    const oldCards = [...oldStayArea.querySelectorAll('.stay-card')];
    gsap.killTweensOf([oldStayArea, oldTrack, ...oldCards, ...oldStayArea.querySelectorAll('img')].filter(Boolean));

    const stayArea = oldStayArea.cloneNode(true);
    oldStayArea.replaceWith(stayArea);
    const stayTrack = stayArea.querySelector('.stay-horizontal-track');
    const stayProgress = stayArea.querySelector('.stay-horizontal-progress');
    const cards = [...stayArea.querySelectorAll('.stay-card')];

    gsap.set(stayArea, {clearProps:'transform,opacity'});
    gsap.set(stayTrack, {x:0});
    cards.forEach(card => gsap.set(card.querySelector('img'), {clearProps:'transform'}));

    gsap.fromTo(stayArea,
      {scale:.90, opacity:.88},
      {scale:1, opacity:1, ease:'none', scrollTrigger:{trigger:stayArea,start:'top 88%',end:'center center',scrub:.65}}
    );

    const distance = () => Math.max(0, stayTrack.scrollWidth - stayArea.clientWidth);
    const roomTween = gsap.to(stayTrack, {
      x: () => -distance(),
      ease:'none',
      scrollTrigger:{
        trigger:stayArea,
        start:'center center',
        end:() => `+=${Math.max(distance() * 1.16, window.innerWidth * 1.55)}`,
        pin:true,
        pinSpacing:true,
        anticipatePin:1,
        scrub:.8,
        invalidateOnRefresh:true,
        onUpdate:self => stayProgress?.style.setProperty('--stay-progress', String(Math.max(.04, self.progress)))
      }
    });

    const roomST = roomTween.scrollTrigger;
    cards.forEach((card,index) => {
      const img = card.querySelector('img');
      if (!img) return;
      gsap.fromTo(img,
        {xPercent:index % 2 ? 2.5 : -2.5, scale:1.045},
        {xPercent:index % 2 ? -1.5 : 1.5, scale:1.01, ease:'none', scrollTrigger:{trigger:stayArea,start:'center center',end:() => roomST.end,scrub:true}}
      );
    });

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startScroll = 0;
    let suppressClick = false;
    const setScroll = value => {
      const target = Math.max(roomST.start, Math.min(roomST.end, value));
      if (window.hotelOtavaloLenis?.scrollTo) window.hotelOtavaloLenis.scrollTo(target, {immediate:true, force:true});
      else window.scrollTo(0, target);
      ScrollTrigger.update();
    };

    stayArea.style.cursor = 'grab';
    stayArea.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      dragging = true;
      moved = false;
      suppressClick = false;
      startX = e.clientX;
      startScroll = window.scrollY;
      stayArea.setPointerCapture?.(e.pointerId);
      stayArea.style.cursor = 'grabbing';
      document.body.classList.add('room-dragging');
    });
    stayArea.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) moved = true;
      if (moved) {
        setScroll(startScroll - dx * 2.35);
        e.preventDefault();
      }
    }, {passive:false});
    const stopDrag = e => {
      if (!dragging) return;
      dragging = false;
      suppressClick = moved;
      stayArea.releasePointerCapture?.(e.pointerId);
      stayArea.style.cursor = 'grab';
      document.body.classList.remove('room-dragging');
    };
    stayArea.addEventListener('pointerup', stopDrag);
    stayArea.addEventListener('pointercancel', stopDrag);
    stayArea.addEventListener('click', e => {
      if (!suppressClick) return;
      e.preventDefault();
      e.stopPropagation();
      suppressClick = false;
    }, true);
  }

  /* Experiences — remove the old scrubbed/absolute choreography and use stable editorial reveals. */
  const experienceScene = document.querySelector('.experience-scene');
  if (experienceScene && !reduceMotion) {
    killTriggersInside(experienceScene);
    const tiles = [...experienceScene.querySelectorAll('.experience-tile')];
    const center = experienceScene.querySelector('.experience-center-mark');
    const thread = experienceScene.querySelector('.experience-thread');
    gsap.killTweensOf([experienceScene, center, thread, ...tiles, ...experienceScene.querySelectorAll('img'), ...experienceScene.querySelectorAll('figure')].filter(Boolean));
    gsap.set(tiles, {clearProps:'transform,opacity'});
    gsap.set(experienceScene.querySelectorAll('figure'), {clearProps:'clipPath,transform'});
    gsap.set(experienceScene.querySelectorAll('img'), {clearProps:'transform'});
    if (thread) gsap.set(thread, {clearProps:'transform'});

    const masks = [
      'inset(0 100% 0 0)',
      'inset(100% 0 0 0)',
      'inset(0 0 100% 0)',
      'inset(0 0 0 100%)',
      'inset(100% 0 0 0)'
    ];
    tiles.forEach((tile,index) => {
      const figure = tile.querySelector('figure');
      gsap.fromTo(tile,
        {y:index % 2 ? 48 : 70, opacity:0},
        {y:0, opacity:1, duration:.9, ease:'power4.out', scrollTrigger:{trigger:tile,start:'top 88%',once:true}, delay:index*.035}
      );
      if (figure) gsap.fromTo(figure,
        {clipPath:masks[index] || masks[0]},
        {clipPath:'inset(0% 0% 0% 0%)', duration:1.05, ease:'power4.inOut', scrollTrigger:{trigger:tile,start:'top 90%',once:true}}
      );
    });
    if (center) gsap.fromTo(center,
      {xPercent:-8, opacity:.35},
      {xPercent:8, opacity:1, ease:'none', scrollTrigger:{trigger:experienceScene,start:'top bottom',end:'bottom top',scrub:true}}
    );
  }

  /* Collection — no parallax or divider artifacts; each property reveals independently. */
  const journey = document.querySelector('.journey');
  if (journey && !reduceMotion) {
    killTriggersInside(journey);
    const cards = [...journey.querySelectorAll('.journey-card')];
    cards.forEach((card,index) => {
      gsap.killTweensOf([card, card.querySelector('img')].filter(Boolean));
      gsap.set(card, {clearProps:'transform,opacity,clipPath'});
      gsap.set(card.querySelector('img'), {clearProps:'transform'});
      gsap.fromTo(card,
        {y:36 + index * 8, opacity:0},
        {y:0, opacity:1, duration:.82, ease:'power3.out', scrollTrigger:{trigger:card,start:'top 90%',once:true}, delay:index*.08}
      );
    });
  }

  requestAnimationFrame(() => ScrollTrigger.refresh());
})();
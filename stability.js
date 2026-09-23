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

  /* Rooms — no drag, no GSAP pin. Native sticky + one scrubbed horizontal tween. */
  const stayScene = document.querySelector('.stay-scene');
  const oldStayArea = document.querySelector('.stay-horizontal');
  if (stayScene && oldStayArea && !reduceMotion && window.matchMedia('(min-width:761px)').matches) {
    killTriggersInside(oldStayArea);
    const oldTrack = oldStayArea.querySelector('.stay-horizontal-track');
    const oldCards = [...oldStayArea.querySelectorAll('.stay-card')];
    gsap.killTweensOf([oldStayArea, oldTrack, ...oldCards, ...oldStayArea.querySelectorAll('img')].filter(Boolean));

    /* Clone once to remove every pointer listener installed by older versions. */
    const stayArea = oldStayArea.cloneNode(true);
    oldStayArea.replaceWith(stayArea);
    const stayTrack = stayArea.querySelector('.stay-horizontal-track');
    const stayProgress = stayArea.querySelector('.stay-horizontal-progress');
    const cards = [...stayArea.querySelectorAll('.stay-card')];

    gsap.set(stayArea, {clearProps:'transform,opacity'});
    gsap.set(stayTrack, {x:0});
    cards.forEach(card => {
      const img = card.querySelector('img');
      if (img) gsap.set(img, {clearProps:'transform'});
    });

    const distance = () => Math.max(0, stayTrack.scrollWidth - stayArea.clientWidth);
    const travel = () => Math.max(distance(), window.innerWidth * 1.15);
    const syncSceneSpace = () => {
      stayScene.style.setProperty('--stay-scroll-space', `${Math.ceil(travel() + window.innerHeight * .08)}px`);
    };
    syncSceneSpace();

    /* The frame grows into place before the horizontal sequence begins. */
    gsap.fromTo(stayArea,
      {scale:.92, opacity:.9},
      {
        scale:1,
        opacity:1,
        ease:'none',
        scrollTrigger:{trigger:stayArea,start:'top 86%',end:'top 22%',scrub:.55}
      }
    );

    const roomTween = gsap.to(stayTrack, {
      x:() => -distance(),
      ease:'none',
      scrollTrigger:{
        trigger:stayArea,
        start:'top 16%',
        end:() => `+=${travel()}`,
        scrub:.75,
        invalidateOnRefresh:true,
        onUpdate:self => stayProgress?.style.setProperty('--stay-progress', String(Math.max(.04, self.progress)))
      }
    });

    cards.forEach((card,index) => {
      const img = card.querySelector('img');
      if (!img) return;
      gsap.fromTo(img,
        {xPercent:index % 2 ? 2.2 : -2.2, scale:1.04},
        {
          xPercent:index % 2 ? -1.3 : 1.3,
          scale:1.01,
          ease:'none',
          scrollTrigger:{trigger:stayArea,start:'top 16%',end:() => `+=${travel()}`,scrub:true}
        }
      );
    });

    window.addEventListener('resize', () => {
      syncSceneSpace();
      roomTween.scrollTrigger?.refresh();
    }, {passive:true});
  }

  /* Experiences — stable editorial reveals; keep this chapter dark. */
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
        {y:index % 2 ? 44 : 66, opacity:0},
        {y:0, opacity:1, duration:.9, ease:'power4.out', scrollTrigger:{trigger:tile,start:'top 88%',once:true}, delay:index*.035}
      );
      if (figure) gsap.fromTo(figure,
        {clipPath:masks[index] || masks[0]},
        {clipPath:'inset(0)', duration:1.05, ease:'power4.inOut', scrollTrigger:{trigger:tile,start:'top 90%',once:true}}
      );
    });
    if (center) gsap.fromTo(center,
      {xPercent:-6, opacity:.3},
      {xPercent:6, opacity:1, ease:'none', scrollTrigger:{trigger:experienceScene,start:'top bottom',end:'bottom top',scrub:true}}
    );
  }

  /* Collection — whitespace separates properties, never lines. */
  const journey = document.querySelector('.journey');
  if (journey && !reduceMotion) {
    killTriggersInside(journey);
    const cards = [...journey.querySelectorAll('.journey-card')];
    cards.forEach((card,index) => {
      gsap.killTweensOf([card, card.querySelector('img')].filter(Boolean));
      gsap.set(card, {clearProps:'transform,opacity,clipPath'});
      const img = card.querySelector('img');
      if (img) gsap.set(img, {clearProps:'transform'});
      gsap.fromTo(card,
        {y:30 + index * 6, opacity:0},
        {y:0, opacity:1, duration:.82, ease:'power3.out', scrollTrigger:{trigger:card,start:'top 90%',once:true}, delay:index*.07}
      );
    });
  }

  requestAnimationFrame(() => ScrollTrigger.refresh());
})();

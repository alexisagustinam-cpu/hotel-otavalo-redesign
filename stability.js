(() => {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const killTriggersInside = root => {
    if (!root || !ScrollTrigger) return;
    ScrollTrigger.getAll().forEach(st => {
      const trigger = st.trigger;
      if (trigger === root || (trigger instanceof Element && root.contains(trigger))) st.kill(true);
    });
  };

  /*
    ROOMS — one system only.
    No GSAP pin, no drag, no sticky/ScrollTrigger collision.
    A native sticky viewport stays visible while vertical scrolling maps directly
    to the horizontal position of the four room cards.
  */
  const originalStay = document.querySelector('.stay-horizontal');
  if (originalStay && window.matchMedia('(min-width:761px)').matches) {
    killTriggersInside(originalStay);
    if (gsap) {
      gsap.killTweensOf([
        originalStay,
        originalStay.querySelector('.stay-horizontal-track'),
        ...originalStay.querySelectorAll('.stay-card'),
        ...originalStay.querySelectorAll('.stay-card img')
      ].filter(Boolean));
    }

    /* Remove pointer listeners and any inline transforms left by older versions. */
    const stay = originalStay.cloneNode(true);
    originalStay.replaceWith(stay);
    stay.querySelector('.stay-drag-hint')?.remove();

    const track = stay.querySelector('.stay-horizontal-track');
    const progress = stay.querySelector('.stay-horizontal-progress');
    if (track) {
      track.style.transform = 'translate3d(0,0,0)';
      stay.style.transform = 'none';
      stay.style.opacity = '1';

      const shell = document.createElement('div');
      shell.className = 'stay-scroll-shell';
      stay.parentNode.insertBefore(shell, stay);
      shell.appendChild(stay);

      let horizontalDistance = 0;
      let verticalTravel = 1;
      let startY = 0;
      let raf = 0;

      const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

      const sync = () => {
        raf = 0;
        if (reduceMotion || horizontalDistance <= 0) {
          track.style.transform = 'translate3d(0,0,0)';
          progress?.style.setProperty('--stay-progress', '.04');
          return;
        }
        const p = clamp((window.scrollY - startY) / verticalTravel, 0, 1);
        track.style.transform = `translate3d(${-horizontalDistance * p}px,0,0)`;
        progress?.style.setProperty('--stay-progress', String(Math.max(.04, p)));
      };

      const requestSync = () => {
        if (!raf) raf = requestAnimationFrame(sync);
      };

      const measure = () => {
        track.style.transform = 'translate3d(0,0,0)';
        horizontalDistance = Math.max(0, track.scrollWidth - stay.clientWidth);

        /* Keep the chapter concise: roughly 2.2–2.6 viewport heights for all 4 rooms. */
        verticalTravel = Math.max(
          window.innerHeight * 2.25,
          Math.min(horizontalDistance, window.innerHeight * 2.65)
        );

        const stickyTop = window.innerHeight * 0.16;
        shell.style.height = `${Math.ceil(stay.offsetHeight + verticalTravel)}px`;
        const shellTop = shell.getBoundingClientRect().top + window.scrollY;
        startY = shellTop - stickyTop;
        sync();
      };

      window.addEventListener('scroll', requestSync, {passive:true});
      window.addEventListener('resize', () => requestAnimationFrame(measure), {passive:true});
      stay.querySelectorAll('img').forEach(img => {
        if (!img.complete) img.addEventListener('load', () => requestAnimationFrame(measure), {once:true});
      });
      if ('ResizeObserver' in window) {
        const ro = new ResizeObserver(() => requestAnimationFrame(measure));
        ro.observe(stay);
        ro.observe(track);
      }
      requestAnimationFrame(measure);
    }
  }

  /* Experiences: keep the approved dark chapter; reveal only after its image is ready. */
  const experience = document.querySelector('.experience-scene');
  if (experience && !reduceMotion && gsap && ScrollTrigger) {
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

  /* Collection: preserve the fix that keeps all three property images visible. */
  const journey = document.querySelector('.journey');
  if (journey) {
    killTriggersInside(journey);
    const cards = [...journey.querySelectorAll('.journey-card')];
    cards.forEach((card,index) => {
      card.classList.remove('v3-reveal-media');
      const img = card.querySelector('img');
      if (gsap) {
        gsap.killTweensOf([card,img].filter(Boolean));
        gsap.set(card,{clipPath:'none',visibility:'visible',clearProps:'transform'});
        if (img) gsap.set(img,{visibility:'visible',clearProps:'transform,clipPath'});
      } else {
        card.style.clipPath='none';
        card.style.visibility='visible';
        card.style.transform='none';
        if (img) { img.style.visibility='visible'; img.style.transform='none'; }
      }

      if (reduceMotion || !gsap || !ScrollTrigger) {
        card.style.opacity='1';
        if (img) img.style.opacity='1';
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

  if (ScrollTrigger) requestAnimationFrame(() => ScrollTrigger.refresh());
})();

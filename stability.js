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

  /* Rooms: native sticky shell + direct scroll mapping. No GSAP pin and no drag. */
  const stayScene = document.querySelector('.stay-scene');
  const oldStayArea = document.querySelector('.stay-horizontal');
  if (stayScene && oldStayArea && window.matchMedia('(min-width:761px)').matches && !reduceMotion) {
    killTriggersInside(oldStayArea);
    if (gsap) {
      const oldTrack = oldStayArea.querySelector('.stay-horizontal-track');
      gsap.killTweensOf([oldStayArea, oldTrack, ...oldStayArea.querySelectorAll('.stay-card'), ...oldStayArea.querySelectorAll('img')].filter(Boolean));
    }

    /* Clone to remove pointer listeners installed by previous iterations. */
    const stayArea = oldStayArea.cloneNode(true);
    oldStayArea.replaceWith(stayArea);
    stayArea.querySelector('.stay-drag-hint')?.remove();

    const track = stayArea.querySelector('.stay-horizontal-track');
    const progress = stayArea.querySelector('.stay-horizontal-progress');
    if (track) {
      const shell = document.createElement('div');
      shell.className = 'stay-scroll-shell';
      stayArea.parentNode.insertBefore(shell, stayArea);
      shell.appendChild(stayArea);

      let distance = 0;
      let start = 0;
      let raf = 0;

      const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
      const sync = () => {
        raf = 0;
        if (!distance) {
          track.style.transform = 'translate3d(0,0,0)';
          return;
        }
        const p = clamp((window.scrollY - start) / distance, 0, 1);
        track.style.transform = `translate3d(${-distance * p}px,0,0)`;
        progress?.style.setProperty('--stay-progress', String(Math.max(.04, p)));
      };
      const requestSync = () => {
        if (!raf) raf = requestAnimationFrame(sync);
      };
      const measure = () => {
        track.style.transform = 'translate3d(0,0,0)';
        distance = Math.max(0, track.scrollWidth - stayArea.clientWidth);
        const stickyHeight = stayArea.offsetHeight;
        shell.style.height = `${Math.ceil(stickyHeight + distance)}px`;
        const topOffset = window.innerHeight * .16;
        const shellTop = shell.getBoundingClientRect().top + window.scrollY;
        start = shellTop - topOffset;
        sync();
      };

      window.addEventListener('scroll', requestSync, {passive:true});
      window.addEventListener('resize', () => requestAnimationFrame(measure), {passive:true});
      stayArea.querySelectorAll('img').forEach(img => {
        if (!img.complete) img.addEventListener('load', () => requestAnimationFrame(measure), {once:true});
      });
      if ('ResizeObserver' in window) new ResizeObserver(() => requestAnimationFrame(measure)).observe(stayArea);
      requestAnimationFrame(measure);
    }
  }

  /* Journey: never allow reveal/parallax logic to hide the property images. */
  const journey = document.querySelector('.journey');
  if (journey) {
    killTriggersInside(journey);
    const cards = [...journey.querySelectorAll('.journey-card')];
    cards.forEach(card => {
      card.classList.remove('v3-reveal-media');
      if (gsap) gsap.killTweensOf([card, card.querySelector('img')].filter(Boolean));
      card.style.opacity = '1';
      card.style.visibility = 'visible';
      card.style.clipPath = 'none';
      card.style.transform = 'none';
      const img = card.querySelector('img');
      if (img) {
        img.style.opacity = '1';
        img.style.visibility = 'visible';
        img.style.transform = 'none';
      }
    });
  }

  /* Experiences keep the approved dark chapter; only clear stale hidden states. */
  const experienceScene = document.querySelector('.experience-scene');
  if (experienceScene) {
    experienceScene.querySelectorAll('.experience-tile').forEach(tile => {
      if (tile.style.visibility === 'hidden') tile.style.visibility = 'visible';
    });
  }

  if (ScrollTrigger) requestAnimationFrame(() => ScrollTrigger.refresh());
})();

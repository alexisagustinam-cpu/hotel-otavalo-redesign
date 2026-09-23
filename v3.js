(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const SplitText = window.SplitText;

  const setActiveScene = (steps, frames, index, current) => {
    steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    frames.forEach((frame, i) => frame.classList.toggle('is-active', i === index));
    if (current) current.textContent = String(index + 1).padStart(2, '0');
  };

  const observerScene = (stepSelector, frameSelector, currentSelector) => {
    const steps = [...document.querySelectorAll(stepSelector)];
    const frames = [...document.querySelectorAll(frameSelector)];
    const current = document.querySelector(currentSelector);
    if (!steps.length || !frames.length) return;
    setActiveScene(steps, frames, 0, current);
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      setActiveScene(steps, frames, Number(visible.target.dataset.sceneIndex || 0), current);
    }, { threshold:[.35,.55,.72], rootMargin:'-18% 0px -30% 0px' });
    steps.forEach(step => observer.observe(step));
  };

  const tasteButtons = [...document.querySelectorAll('[data-taste-trigger]')];
  const tastePanels = [...document.querySelectorAll('[data-taste-panel]')];
  let tasteIndex = 0;
  let tasteTimer;
  const setTaste = name => {
    tasteIndex = Math.max(0, tasteButtons.findIndex(btn => btn.dataset.tasteTrigger === name));
    tasteButtons.forEach(btn => {
      const active = btn.dataset.tasteTrigger === name;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    tastePanels.forEach(panel => panel.classList.toggle('is-active', panel.dataset.tastePanel === name));
  };
  const startTasteAuto = () => {
    clearInterval(tasteTimer);
    if (reduceMotion || tasteButtons.length < 2) return;
    tasteTimer = window.setInterval(() => {
      tasteIndex = (tasteIndex + 1) % tasteButtons.length;
      setTaste(tasteButtons[tasteIndex].dataset.tasteTrigger);
    }, 5200);
  };
  tasteButtons.forEach(btn => btn.addEventListener('click', () => { setTaste(btn.dataset.tasteTrigger); startTasteAuto(); }));
  const tasteStage = document.querySelector('.taste-stage');
  tasteStage?.addEventListener('pointerenter', () => clearInterval(tasteTimer));
  tasteStage?.addEventListener('pointerleave', startTasteAuto);
  if (tasteButtons.length) { setTaste(tasteButtons[0].dataset.tasteTrigger); startTasteAuto(); }

  const cookieCard = document.getElementById('v3Cookies');
  const cookieChoice = localStorage.getItem('hotelOtavaloCookies');
  if (cookieCard && !cookieChoice) {
    window.setTimeout(() => {
      cookieCard.classList.add('is-visible');
      if (gsap && !reduceMotion) gsap.to(cookieCard, {opacity:1,y:0,duration:.6,ease:'power3.out'});
      else { cookieCard.style.opacity = '1'; cookieCard.style.transform = 'none'; }
    }, 2200);
  }
  document.querySelectorAll('[data-cookie-choice]').forEach(btn => btn.addEventListener('click', () => {
    localStorage.setItem('hotelOtavaloCookies', btn.dataset.cookieChoice);
    if (gsap && !reduceMotion) gsap.to(cookieCard,{opacity:0,y:12,duration:.35,ease:'power2.in',onComplete:()=>cookieCard?.remove()});
    else cookieCard?.remove();
  }));

  if (!gsap || !ScrollTrigger || reduceMotion) {
    document.getElementById('v3Intro')?.remove();
    document.querySelectorAll('.v3-reveal-media').forEach(el => el.style.clipPath = 'none');
    observerScene('[data-heritage-step]','[data-heritage-frame]','#heritageProgress');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);

  if (window.Lenis) {
    const lenis = new window.Lenis({duration:1.06,smoothWheel:true,wheelMultiplier:.92,touchMultiplier:1.1});
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    window.hotelOtavaloLenis = lenis;
  }

  const intro = document.getElementById('v3Intro');
  const introProgress = intro?.querySelector('.v3-intro-progress i');
  const introArch = intro?.querySelector('.v3-intro-arch');
  const introCopy = intro?.querySelectorAll('.v3-intro-copy > *');
  const hero = document.querySelector('.hero-v2');
  const heroMedia = hero?.querySelector('.hero-media');
  const heroKicker = hero?.querySelector('.hero-kicker');
  const heroCopy = hero?.querySelector('.hero-copy');
  const heroActions = hero?.querySelector('.hero-actions');
  const heroFoot = hero?.querySelector('.hero-foot');
  const hero360 = hero?.querySelector('.hero-360');
  const award = document.getElementById('v3Award');

  let titleSplit = null;
  const heroTitle = document.getElementById('hero-title');
  if (SplitText && heroTitle) titleSplit = new SplitText(heroTitle,{type:'lines',linesClass:'v3-title-line'});

  const entrance = gsap.timeline({defaults:{ease:'power3.out'}});
  if (intro) {
    entrance
      .set(intro,{yPercent:0})
      .fromTo(introCopy,{y:18,opacity:0},{y:0,opacity:1,duration:.65,stagger:.08})
      .to(introProgress,{scaleX:1,duration:.8,ease:'power2.inOut'},'<.05')
      .to(introArch,{scale:1.045,duration:.75,ease:'power2.inOut'},'<.15')
      .to(intro,{yPercent:-100,duration:.9,ease:'power4.inOut'})
      .set(intro,{display:'none'})
      .add(() => intro.classList.add('is-gone'));
  }
  if (heroMedia) entrance.fromTo(heroMedia,{clipPath:'inset(12% 10% 12% 10%)',scale:1.08},{clipPath:'inset(0% 0% 0% 0%)',scale:1.025,duration:1.05,ease:'power4.out'}, intro ? '-=.52' : 0);
  if (heroKicker) entrance.from(heroKicker,{y:16,opacity:0,duration:.5},'-=.68');
  if (titleSplit?.lines?.length) entrance.from(titleSplit.lines,{yPercent:112,opacity:0,duration:.82,stagger:.08,ease:'power4.out'},'-=.44');
  else if (heroTitle) entrance.from(heroTitle,{y:34,opacity:0,duration:.82},'-=.44');
  entrance.from([heroCopy,heroActions].filter(Boolean),{y:18,opacity:0,duration:.58,stagger:.08},'-=.42');
  if (heroFoot) entrance.from(heroFoot.children,{y:14,opacity:0,duration:.5,stagger:.06},'-=.3');
  if (hero360) entrance.from(hero360,{scale:.82,opacity:0,duration:.55,ease:'power3.out'},'-=.34');
  if (award) entrance.fromTo(award,{scale:.62,rotate:-9,opacity:0},{scale:1,rotate:0,opacity:1,duration:.78,ease:'back.out(1.45)'},'-=.44');

  if (hero && award) {
    const hideAward = () => gsap.to(award,{y:-34,scale:.76,rotate:5,opacity:0,duration:.42,ease:'power3.inOut',overwrite:true});
    const showAward = () => gsap.to(award,{y:0,scale:1,rotate:0,opacity:1,duration:.58,ease:'back.out(1.25)',overwrite:true});
    ScrollTrigger.create({trigger:hero,start:'top+=110 top',end:'bottom top',onEnter:hideAward,onLeaveBack:showAward});
  }
  if (hero && heroMedia) gsap.to(heroMedia,{yPercent:7,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});

  const heritageSteps = [...document.querySelectorAll('[data-heritage-step]')];
  const heritageFrames = [...document.querySelectorAll('[data-heritage-frame]')];
  const heritageCurrent = document.querySelector('#heritageProgress');
  const activateHeritage = index => {
    heritageSteps.forEach((step,i) => step.classList.toggle('is-active',i===index));
    heritageFrames.forEach((frame,i) => {
      const active = i===index;
      frame.classList.toggle('is-active',active);
      gsap.to(frame,{opacity:active?1:0,scale:active?1:1.025,duration:.68,ease:'power3.out',overwrite:true});
    });
    if (heritageCurrent) heritageCurrent.textContent = String(index+1).padStart(2,'0');
  };
  if (heritageSteps.length && heritageFrames.length) {
    activateHeritage(0);
    heritageSteps.forEach((step,index) => ScrollTrigger.create({trigger:step,start:'top 56%',end:'bottom 44%',onEnter:()=>activateHeritage(index),onEnterBack:()=>activateHeritage(index)}));
  }

  document.querySelectorAll('[data-heritage-step] .year').forEach(year => gsap.from(year,{xPercent:-14,opacity:.18,ease:'none',scrollTrigger:{trigger:year,start:'top 82%',end:'center 54%',scrub:true}}));

  const stayArea = document.querySelector('.stay-horizontal');
  const stayTrack = document.querySelector('.stay-horizontal-track');
  const stayProgress = document.querySelector('.stay-horizontal-progress');
  if (stayArea && stayTrack && window.matchMedia('(min-width:1081px)').matches) {
    const distance = () => Math.max(0, stayTrack.scrollWidth - stayArea.clientWidth);
    gsap.to(stayTrack, {
      x: () => -distance(),
      ease:'none',
      scrollTrigger:{trigger:stayArea,start:'top 112px',end:() => `+=${Math.max(distance(), window.innerWidth * .9)}`,scrub:1,pin:true,anticipatePin:1,invalidateOnRefresh:true,onUpdate:self => stayProgress?.style.setProperty('--stay-progress', String(Math.max(.08,self.progress)))}
    });
    document.querySelectorAll('.stay-card').forEach((card,i) => {
      const img = card.querySelector('img');
      if (img) gsap.fromTo(img,{xPercent:i%2?3:-3,scale:1.06},{xPercent:i%2?-2:2,scale:1.01,ease:'none',scrollTrigger:{trigger:stayArea,start:'top 112px',end:() => `+=${Math.max(distance(), window.innerWidth*.9)}`,scrub:true}});
    });
  }

  const experienceTiles = [...document.querySelectorAll('.experience-tile')];
  experienceTiles.forEach((tile,i) => {
    gsap.from(tile,{y:i%2?92:64,x:i%3===0?-28:(i%3===2?28:0),rotate:i%2?1.5:-1.2,opacity:0,duration:.95,ease:'power4.out',scrollTrigger:{trigger:tile,start:'top 88%',once:true}});
    const img=tile.querySelector('img');
    if (img) gsap.fromTo(img,{yPercent:-7,scale:1.05},{yPercent:3,scale:1.015,ease:'none',scrollTrigger:{trigger:tile,start:'top bottom',end:'bottom top',scrub:true}});
  });

  const thread = document.querySelector('.experience-thread');
  if (thread) {
    const paths = thread.querySelectorAll('path');
    paths.forEach((path,i) => {
      const length = path.getTotalLength?.() || 1000;
      gsap.set(path,{strokeDasharray:`${length*.05} ${length*.035}`,strokeDashoffset:length*.22});
      gsap.to(path,{strokeDashoffset:-length*.26,ease:'none',scrollTrigger:{trigger:'.experience-scene',start:'top bottom',end:'bottom top',scrub:true},delay:i*.06});
    });
    gsap.to(thread,{yPercent:16,rotate:4,ease:'none',scrollTrigger:{trigger:'.experience-scene',start:'top bottom',end:'bottom top',scrub:true}});
  }

  document.querySelectorAll('.v3-reveal-media').forEach(media => gsap.to(media,{clipPath:'inset(0% 0% 0% 0%)',duration:1.05,ease:'power4.out',scrollTrigger:{trigger:media,start:'top 82%',once:true}}));

  document.querySelectorAll('.v3-split').forEach(node => {
    if (!SplitText) return;
    const split = new SplitText(node,{type:'lines',linesClass:'v3-copy-line'});
    gsap.from(split.lines,{yPercent:110,opacity:0,duration:.8,stagger:.07,ease:'power4.out',scrollTrigger:{trigger:node,start:'top 82%',once:true}});
  });

  document.querySelectorAll('.v3-magnetic').forEach(el => {
    const xTo = gsap.quickTo(el,'x',{duration:.45,ease:'power3.out'});
    const yTo = gsap.quickTo(el,'y',{duration:.45,ease:'power3.out'});
    el.addEventListener('pointermove',e=>{const rect=el.getBoundingClientRect();xTo((e.clientX-(rect.left+rect.width/2))*.12);yTo((e.clientY-(rect.top+rect.height/2))*.12);});
    el.addEventListener('pointerleave',()=>{xTo(0);yTo(0);});
  });

  document.querySelectorAll('.journey-card').forEach(card => {const img=card.querySelector('img');if(img)gsap.fromTo(img,{yPercent:-4},{yPercent:4,ease:'none',scrollTrigger:{trigger:card,start:'top bottom',end:'bottom top',scrub:true}});});

  ScrollTrigger.refresh();
})();

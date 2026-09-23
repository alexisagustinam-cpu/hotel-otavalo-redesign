(() => {
  const media = document.querySelector('.hero-v2 .hero-media');
  const slides = media ? [...media.querySelectorAll('.hero-slide')] : [];
  if (!media || slides.length < 2) return;

  window.hotelHeroMorphManaged = true;
  media.dataset.morphManaged = 'true';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const title = document.getElementById('hero-title');
  const copy = document.querySelector('.hero-copy');
  const current = document.getElementById('heroSequenceCurrent');
  const AUTOPLAY = 6000;
  const DURATION = 1250;

  const scenes = {
    es: [
      {
        title: 'Duerme dentro<br>de la historia<br>de Otavalo.',
        copy: 'Una casa histórica de 1930 transformada en hotel boutique, donde arquitectura, arte ecuatoriano y cultura andina forman parte de la estancia.'
      },
      {
        title: 'Despierta entre<br>piedra, madera<br>y memoria.',
        copy: 'Habitaciones donde el carácter patrimonial de la casa convive con descanso contemporáneo, arte y detalles trabajados en Ecuador.'
      },
      {
        title: 'Conoce Otavalo<br>desde quienes<br>lo mantienen vivo.',
        copy: 'Telares, oficios y encuentros con comunidades convierten la estancia en una forma de acercarse a la cultura local desde dentro.'
      },
      {
        title: 'Ecuador también<br>se descubre<br>en la mesa.',
        copy: 'Sarance reúne ingredientes, memorias y técnicas de distintas regiones del país en una experiencia gastronómica ligada al territorio.'
      },
      {
        title: 'La ciudad cambia<br>cuando cae<br>la tarde.',
        copy: 'Ñukanchikwan Taki mira hacia Taita Imbabura entre coctelería, sabores locales, música y el ritmo tranquilo del atardecer.'
      }
    ],
    en: [
      {
        title: 'Sleep inside<br>the history<br>of Otavalo.',
        copy: 'A historic 1930 house transformed into a boutique hotel, where architecture, Ecuadorian art and Andean culture become part of the stay.'
      },
      {
        title: 'Wake among<br>stone, wood<br>and memory.',
        copy: 'Rooms where the heritage character of the house meets contemporary comfort, art and details crafted in Ecuador.'
      },
      {
        title: 'Meet Otavalo<br>through those who<br>keep it alive.',
        copy: 'Looms, local crafts and community encounters turn a stay into a closer way of experiencing the culture of Otavalo.'
      },
      {
        title: 'Ecuador can also<br>be discovered<br>at the table.',
        copy: 'Sarance brings together ingredients, memories and techniques from across the country in a culinary experience connected to place.'
      },
      {
        title: 'The city changes<br>as the sun<br>goes down.',
        copy: 'Ñukanchikwan Taki looks toward Taita Imbabura with local flavors, cocktails, music and the slower rhythm of sunset.'
      }
    ]
  };

  const lang = () => localStorage.getItem('hotelOtavaloLang') === 'en' ? 'en' : 'es';
  let active = 0;
  let busy = false;
  let timer = 0;
  let useWebGL = false;
  let webglTransition = null;

  const setText = (index, animate = true) => {
    const scene = scenes[lang()][index] || scenes[lang()][0];
    if (!title || !copy) return;
    if (!animate || reduceMotion || !title.animate) {
      title.innerHTML = scene.title;
      copy.textContent = scene.copy;
      return;
    }
    const out = [title, copy].map((node, i) => node.animate(
      [{opacity:1, transform:'translate3d(0,0,0)'},{opacity:0, transform:'translate3d(-10px,0,0)'}],
      {duration:190 + i * 25, easing:'cubic-bezier(.4,0,1,1)', fill:'forwards'}
    ));
    Promise.all(out.map(a => a.finished.catch(() => {}))).then(() => {
      title.innerHTML = scene.title;
      copy.textContent = scene.copy;
      [title, copy].forEach((node, i) => node.animate(
        [{opacity:0, transform:'translate3d(16px,0,0)'},{opacity:1, transform:'translate3d(0,0,0)'}],
        {duration:440 + i * 35, easing:'cubic-bezier(.22,1,.36,1)', fill:'both'}
      ));
    });
  };

  setText(0, false);

  const setSequence = index => {
    if (current) current.textContent = String(index + 1).padStart(2, '0');
  };

  const showDom = async index => {
    if (busy || index === active) return;
    busy = true;
    const outgoing = slides[active];
    const incoming = slides[index];
    const img = incoming.querySelector('img');
    if (img && !img.complete) {
      await new Promise(resolve => {
        img.addEventListener('load', resolve, {once:true});
        img.addEventListener('error', resolve, {once:true});
      });
    }

    slides.forEach((slide, i) => {
      slide.style.zIndex = i === active ? '1' : i === index ? '2' : '0';
      slide.style.opacity = i === active || i === index ? '1' : '0';
      slide.style.visibility = i === active || i === index ? 'visible' : 'hidden';
    });
    incoming.style.clipPath = 'inset(0 0 0 100%)';
    incoming.style.webkitClipPath = 'inset(0 0 0 100%)';
    setText(index, true);
    setSequence(index);

    const inAnim = incoming.animate([
      {clipPath:'inset(0 0 0 100%)', transform:'translate3d(1.8%,0,0) scale(1.018)'},
      {clipPath:'inset(0 0 0 0)', transform:'translate3d(0,0,0) scale(1)'}
    ], {duration:DURATION, easing:'cubic-bezier(.22,1,.36,1)', fill:'forwards'});
    const outImg = outgoing.querySelector('img');
    const outAnim = outImg?.animate([
      {transform:'translate3d(0,0,0) scale(1)'},
      {transform:'translate3d(-2.2%,0,0) scale(1.025)'}
    ], {duration:DURATION, easing:'cubic-bezier(.22,1,.36,1)', fill:'forwards'});

    await Promise.all([inAnim.finished.catch(()=>{}), outAnim?.finished?.catch(()=>{})]);
    active = index;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === active);
      slide.style.zIndex = i === active ? '1' : '0';
      slide.style.opacity = i === active ? '1' : '0';
      slide.style.visibility = i === active ? 'visible' : 'hidden';
      slide.style.clipPath = 'none';
      slide.style.webkitClipPath = 'none';
      slide.style.transform = 'none';
      const slideImg = slide.querySelector('img');
      if (slideImg) slideImg.style.transform = 'none';
    });
    busy = false;
  };

  const VERT = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main(){
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position,0.0,1.0);
    }
  `;

  const FRAG = `
    precision highp float;
    uniform sampler2D u_from;
    uniform sampler2D u_to;
    uniform float u_progress;
    uniform vec2 u_resolution;
    uniform float u_fromAspect;
    uniform float u_toAspect;
    varying vec2 v_uv;

    vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}
    float snoise(vec2 v){
      const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
      vec2 i=floor(v+dot(v,C.yy));
      vec2 x0=v-i+dot(i,C.xx);
      vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
      vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);
      vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
      vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;
      vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;
      m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
      vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
      return 130.0*dot(m,g);
    }
    float fbm(vec2 v){float value=0.0;float amplitude=.5;for(int i=0;i<5;i++){value+=amplitude*snoise(v);v*=2.0;amplitude*=.5;}return value;}
    vec2 mirror(vec2 uv){return 1.0-abs(1.0-mod(uv,2.0));}
    vec2 coverUV(vec2 uv,float imgAspect){
      float canvasAspect=u_resolution.x/u_resolution.y;
      vec2 scale=(canvasAspect>imgAspect)?vec2(1.0,imgAspect/canvasAspect):vec2(canvasAspect/imgAspect,1.0);
      return mirror((uv-.5)*scale+.5);
    }
    void main(){
      float edge=.13;
      float adjusted=u_progress*(1.0+2.0*edge)-edge;
      float n=fbm(v_uv*3.25+vec2(u_progress*.32,0.0))*.5+.5;
      float lum=length(texture2D(u_to,coverUV(v_uv,u_toAspect)).rgb);
      n=smoothstep(0.0,2.0,lum+n);
      /* Directional bias: the incoming frame breaks through at the right edge first. */
      n=mix(n,1.0-v_uv.x,.42);
      float mixFactor=1.0-smoothstep(adjusted-edge,adjusted+edge,n);
      /* Horizontal parallax instead of the original vertical drift. */
      vec2 fromUV=coverUV(v_uv+vec2(n*u_progress*.055,0.0),u_fromAspect);
      vec2 toUV=coverUV(v_uv+vec2(n*(1.0-u_progress)*-.032,0.0),u_toAspect);
      gl_FragColor=mix(texture2D(u_from,fromUV),texture2D(u_to,toUV),mixFactor);
    }
  `;

  const compile = (gl, type, source) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('shader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || 'shader compile');
    return shader;
  };

  const initWebGL = async () => {
    if (reduceMotion) throw new Error('reduced motion');
    const canvas = document.createElement('canvas');
    canvas.className = 'hero-morph-canvas';
    canvas.setAttribute('aria-hidden','true');
    media.appendChild(canvas);
    const gl = canvas.getContext('webgl', {alpha:false, antialias:false});
    if (!gl) throw new Error('no webgl');

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('link');
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program,'a_position');
    gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);

    const uniforms = {};
    ['from','to','progress','resolution','fromAspect','toAspect'].forEach(name => uniforms[name]=gl.getUniformLocation(program,'u_'+name));
    const textures=[]; const aspects=[];

    const load = src => new Promise((resolve,reject) => {
      const img=new Image();
      img.crossOrigin='anonymous';
      img.decoding='async';
      img.onload=()=>resolve(img);
      img.onerror=()=>reject(new Error('cors/image'));
      img.src=src;
    });

    const images = await Promise.all(slides.map(slide => load(slide.querySelector('img')?.currentSrc || slide.querySelector('img')?.src)));
    images.forEach((img,i) => {
      const texture=gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      textures[i]=texture; aspects[i]=img.naturalWidth/Math.max(1,img.naturalHeight);
    });

    const resize = () => {
      const dpr=Math.min(window.devicePixelRatio||1,2);
      const w=Math.max(1,Math.round(canvas.clientWidth*dpr));
      const h=Math.max(1,Math.round(canvas.clientHeight*dpr));
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
    };
    new ResizeObserver(resize).observe(canvas); resize();

    const draw = (from,to,p) => {
      resize();
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,textures[from]);gl.uniform1i(uniforms.from,0);
      gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,textures[to]);gl.uniform1i(uniforms.to,1);
      gl.uniform1f(uniforms.progress,p);
      gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);
      gl.uniform1f(uniforms.fromAspect,aspects[from]);
      gl.uniform1f(uniforms.toAspect,aspects[to]);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    };

    draw(0,0,1);
    canvas.classList.add('is-ready');
    useWebGL = true;

    webglTransition = index => new Promise(resolve => {
      const from=active; const started=performance.now();
      setText(index,true); setSequence(index);
      const frame = now => {
        const raw=Math.min(1,(now-started)/DURATION);
        const p=raw<.5?16*Math.pow(raw,5):1-Math.pow(-2*raw+2,5)/2;
        draw(from,index,p);
        if(raw<1) requestAnimationFrame(frame);
        else {active=index;resolve();}
      };
      requestAnimationFrame(frame);
    });
  };

  const go = async index => {
    if (busy || index === active) return;
    const target = (index + slides.length) % slides.length;
    if (useWebGL && webglTransition) {
      busy = true;
      await webglTransition(target);
      busy = false;
    } else {
      await showDom(target);
    }
  };

  const start = () => {
    clearInterval(timer);
    if (reduceMotion) return;
    timer = window.setInterval(() => go(active + 1), AUTOPLAY);
  };

  initWebGL().catch(() => {
    const canvas = media.querySelector('.hero-morph-canvas');
    canvas?.remove();
    useWebGL = false;
    slides.forEach((slide,i)=>{
      slide.style.visibility=i===0?'visible':'hidden';
      slide.style.opacity=i===0?'1':'0';
    });
  }).finally(start);

  document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(timer) : start());
  document.querySelectorAll('.lang').forEach(button => button.addEventListener('click', () => setTimeout(() => setText(active,false),0)));
})();

/* ENGINE — shows each approved photograph exactly as composed, brought subtly to life.

   Two systems that never touch each other:
   NAVIGATION   a small push toward the clicked area, blended into the next scene.
                Every scene has its own camera, reset to its default on arrival.
   ENVIRONMENT  fog, grasses, foliage, firelight, daylight and the animals. These
                are painted only inside the masks in atmosphere.js.

   You should not need to edit this file: settings live in config.js and atmosphere.js. */

window.createEngine = function (canvas, CFG, ATM) {
  const A = CFG.animation;
  let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = x => { x = clamp(x); return x * x * x * (x * (6 * x - 15) + 10); };
  const sineInOut = x => .5 - .5 * Math.cos(Math.PI * clamp(x));
  const lerp = (a, b, t) => a + (b - a) * t;

  const MAXW = 14, MAXB = 3;
  const VS = 'attribute vec2 p;varying vec2 vS;void main(){vS=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
  const FS = `
precision highp float;
varying vec2 vS;
#define MAXW ${MAXW}
#define MAXB ${MAXB}
uniform sampler2D uA,uMA,uB,uH;
uniform vec4 uCamA,uCamB,uWA[MAXW],uWB[MAXW],uBE[MAXB];
uniform vec3 uFire;
uniform vec2 uFogP;
uniform float uBA[MAXB];
uniform float uT,uFog,uGrass,uTree,uLight,uDust,uMix,uHover,uAsp,uDbg,uVig,uRigN,uFx,uFogBank;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*noise(p);p=p*2.03+vec2(17.,9.);a*=.5;}return s;}
vec2 camUV(vec4 c,vec2 s){return c.xy+(s-.5)*2.*c.zw;}
vec2 rig(vec2 q){vec2 a=vec2(uAsp,1.),d=vec2(0.);
 for(int i=0;i<MAXW;i++){if(float(i)>=uRigN)break;
  vec2 e=(q-uWA[i].xy)/uWA[i].zw;float r=dot(e,e);
  if(r<1.){float w=1.-r;w=w*w*(3.-2.*w);vec2 v=(q-uWB[i].xy)*a;float sn=sin(uWB[i].z),cs=cos(uWB[i].z);
   d+=(vec2(cs*v.x+sn*v.y,-sn*v.x+cs*v.y)/a+uWB[i].xy-q)*w;}
 }return q+d;}
vec3 lids(vec3 c,vec2 q){
 for(int j=0;j<MAXB;j++){if(uBA[j]>.01){vec2 e=(q-uBE[j].xy)/uBE[j].zw;float r=dot(e,e);
  if(r<1.){float top=-1.+2.*uBA[j];float cov=(1.-smoothstep(top-.3,top+.3,e.y))*smoothstep(1.,.5,r);
   vec3 sk=texture2D(uA,q-vec2(0.,uBE[j].w*2.3)).rgb;c=mix(c,sk*.92,cov);}}}
 return c;}
float mist(vec2 p,float sp){vec2 w=vec2(fbm(p*.8+vec2(uT*.016,uT*.006)),fbm(p*.65+vec2(-uT*.012,5.2+uT*.009)));
 return fbm(p+1.4*w+vec2(-uT*sp,uT*sp*.1));}
float dust(vec2 q){float v=0.;
 for(int l=0;l<2;l++){float fl=float(l),sc=24.+fl*20.;
  vec2 p=q*vec2(uAsp,1.)*sc;p+=vec2(uT*.035,-uT*.05*(1.+fl*.4));p.x+=sin(p.y*.4+uT*.15)*.4;
  vec2 id=floor(p),f=fract(p)-.5;float r=hash(id+fl);
  if(r>.86){vec2 o=(vec2(hash(id+3.),hash(id+7.))-.5)*.6;
   v+=smoothstep(.07,.0,length(f-o))*(.5+.5*sin(uT*.4+r*60.));}
 }return v;}
void main(){
 vec2 s=vS,q=camUV(uCamA,s);
 if(uRigN>.5)q=rig(q);
 vec4 m=texture2D(uMA,q);
 float t=uT;
 if(m.b>.002&&uGrass>0.){float g=.55+.45*sin(q.x*9.-t*.55+sin(t*.23)*2.);
  q.x+=m.b*uGrass*.0013*g*(sin(q.x*140.+q.y*46.+t*1.3)*.6+sin(q.x*310.-q.y*70.-t*2.1)*.4);
  q.y+=m.b*uGrass*.0005*g*sin(q.x*190.+t*1.7);}
 if(m.a>.002&&uTree>0.){float b=.6+.4*sin(t*.2+q.x*3.);
  q+=m.a*uTree*.00075*b*vec2(sin(q.y*38.+t*.7)+sin(q.x*27.+t*.45),cos(q.x*33.+t*.6));}
 vec3 c=texture2D(uA,q).rgb;
 if(uRigN>.5)c=lids(c,q);
 if(uFire.z>0.&&uFx>0.){
  float d=length((q-uFire.xy)*vec2(uAsp,1.))/uFire.z;
  if(d<4.){float fl=.55*noise(vec2(t*3.1,1.))+.45*noise(vec2(t*7.3,9.));
   if(d<1.){float w=(1.-d)*(1.-d)*uFx;c=texture2D(uA,q+vec2(sin(q.y*260.-t*7.)*.0016*w,-.0012*w*fl)).rgb;c*=1.+w*(fl-.4)*.55;}
   c+=c*vec3(1.,.62,.3)*(fl-.45)*.2*exp(-d*d*.5)*uFx;}
 }
 if(uFog>0.&&m.g>.004){
  vec2 p=q*vec2(uAsp,1.)+uFogP;p.y*=1.+uFogBank*1.4;float sl=1.+uFogBank*.65;
  float far=smoothstep(.34,.72,mist(p*2.4,.045*sl));
  float mid=smoothstep(.4,.76,mist(p*4.1+vec2(11.,3.),.075*sl));
  float wisp=smoothstep(.46,.8,fbm(p*7.+vec2(-t*.12*sl,t*.01)));
  float dens=(.62+.38*noise(p*1.3+vec2(-t*.03,t*.017)))*(1.-uFogBank*.18*(.5+.5*sin(t*.11+p.x*.9)));
  float a=clamp(far*.62+mid*.42+wisp*.2,0.,1.)*dens*m.g*uFog*(1.-smoothstep(.2,.36,m.r));
  c=1.-(1.-c)*(1.-vec3(.99,.93,.87)*a);
 }
 float l=dot(c,vec3(.3,.59,.11));
 if(uLight>0.){float cl=noise(q*vec2(1.6,1.)+t*vec2(.024,.009));c*=1.+uLight*(cl-.5)*2.*smoothstep(.28,.85,l);}
 if(uDust>0.)c+=vec3(1.,.9,.74)*dust(q)*uDust*.5*(.25+l);
 if(uHover>.001){float h=texture2D(uH,q).r*uHover;c=c*(1.-.09*uHover*(1.-h))+c*h*vec3(.22,.17,.1);}
 if(uMix>.0005)c=mix(c,texture2D(uB,camUV(uCamB,s)).rgb,uMix);
 c+=(hash(gl_FragCoord.xy*.73+fract(t))-.5)/190.;
 if(uDbg>.5){vec4 k=texture2D(uMA,q);
  if(uDbg<1.5)c=vec3(k.r);else if(uDbg<2.5)c=mix(c,vec3(.2,.5,1.),k.g);else if(uDbg<3.5)c=mix(c,vec3(0.,1.,.2),k.b);else c=mix(c,vec3(1.,.1,.1),k.a);}
 gl_FragColor=vec4(c,1.);
}`.replace('uVig,', '');

  let gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  let ctx2d = null, prog, U = {}, hoverTex;
  const HW = 320, HH = 180;

  function initGL() {
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.bindAttribLocation(prog, 0, 'p'); gl.linkProgram(prog); gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    U = {};
    const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(prog, i); U[a.name] = gl.getUniformLocation(prog, a.name); }
    ['uA','uMA','uB','uH'].forEach((k, i) => U[k] && gl.uniform1i(U[k], i));
    hoverTex = gl.createTexture();
    uploadRaw(hoverTex, new Uint8Array(HW * HH), HW, HH, gl.LUMINANCE);
  }
  function setTex(t) { gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); }
  function uploadRaw(t, data, w, h, fmt) { gl.activeTexture(gl.TEXTURE5); setTex(t); gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, fmt, w, h, 0, fmt, gl.UNSIGNED_BYTE, data); }
  function uploadImg(t, img) { gl.activeTexture(gl.TEXTURE5); setTex(t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img); }

  if (gl) { try { initGL(); } catch (e) { console.warn(e); gl = null; } }
  if (!gl) { const c2 = canvas.cloneNode(); canvas.replaceWith(c2); canvas = c2; ctx2d = canvas.getContext('2d'); }

  /* ---- mask rasteriser: paints the polygons in atmosphere.js ---- */
  const MW = 1024, MH = 576;
  function blurCh(src, r, w, h) {
    if (r < 1) return src;
    let a = Float32Array.from(src), b = new Float32Array(w * h);
    for (let pass = 0; pass < 2; pass++) {
      for (let y = 0; y < h; y++) { let s = 0, o = y * w;
        for (let x = -r; x <= r; x++) s += a[o + clamp(x, 0, w - 1)];
        for (let x = 0; x < w; x++) { b[o + x] = s / (2 * r + 1); s += a[o + Math.min(w - 1, x + r + 1)] - a[o + Math.max(0, x - r)]; } }
      for (let x = 0; x < w; x++) { let s = 0;
        for (let y = -r; y <= r; y++) s += b[clamp(y, 0, h - 1) * w + x];
        for (let y = 0; y < h; y++) { a[y * w + x] = s / (2 * r + 1); s += b[Math.min(h - 1, y + r + 1) * w + x] - b[Math.max(0, y - r) * w + x]; } }
    }
    return a;
  }
  function paint(layer, W, H) {
    const c = document.createElement('canvas'); c.width = MW; c.height = MH;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.fillStyle = '#000'; x.fillRect(0, 0, MW, MH);
    const sx = MW / W, sy = MH / H, g = v => { const n = Math.round(v * 255); return `rgb(${n},${n},${n})`; };
    ((layer && layer.shapes) || []).forEach(s => {
      x.beginPath(); s.pts.forEach((p, i) => i ? x.lineTo(p[0] * sx, p[1] * sy) : x.moveTo(p[0] * sx, p[1] * sy)); x.closePath();
      if (s.gy || s.gx) { const q = s.gy || s.gx, gr = s.gy ? x.createLinearGradient(0, q[0] * sy, 0, q[2] * sy) : x.createLinearGradient(q[0] * sx, 0, q[2] * sx, 0);
        gr.addColorStop(0, g(q[1])); gr.addColorStop(1, g(q[3])); x.fillStyle = gr; } else x.fillStyle = g(s.v);
      x.fill();
    });
    const d = x.getImageData(0, 0, MW, MH).data, out = new Uint8ClampedArray(MW * MH);
    for (let i = 0; i < out.length; i++) out[i] = d[i * 4];
    return blurCh(out, Math.round(((layer && layer.blur) || 0) * 2), MW, MH);
  }
  function buildMask(id, W, H) {
    const a = ATM[id] || {}, r = paint(a.depth, W, H), g = paint(a.fog, W, H), b = paint(a.grass, W, H), t = paint(a.tree, W, H);
    const data = new Uint8Array(MW * MH * 4);
    for (let i = 0; i < MW * MH; i++) { data[i*4] = r[i]; data[i*4+1] = g[i]; data[i*4+2] = b[i]; data[i*4+3] = t[i]; }
    return data;
  }

  /* ---- scenes ---- */
  const scenes = {};
  function load(id) {
    if (scenes[id]) return scenes[id].ready;
    const sc = CFG.scenes[id], rec = { id, cfg: sc, W: sc.size[0], H: sc.size[1], fx: (ATM[id] || {}).fx || {} };
    scenes[id] = rec;
    rec.ready = new Promise((res, rej) => {
      const im = new Image(); im.onload = () => {
        rec.img = im; rec.mask = buildMask(id, rec.W, rec.H);
        if (gl) gpu(rec);
        res(rec);
      }; im.onerror = () => rej(new Error('Could not load ' + sc.image)); im.src = sc.image;
    });
    return rec.ready;
  }
  function gpu(rec) { rec.tex = gl.createTexture(); uploadImg(rec.tex, rec.img); rec.mtex = gl.createTexture(); uploadRaw(rec.mtex, rec.mask, MW, MH, gl.RGBA); }
  canvas.addEventListener('webglcontextlost', e => e.preventDefault());
  canvas.addEventListener('webglcontextrestored', () => { initGL(); Object.values(scenes).forEach(r => r.img && gpu(r)); });

  /* ---- framing: the whole photograph, at its own proportions ---- */
  const frameEl = canvas.parentElement, IA = 1672 / 941;
  let vw = 1, vh = 1, fx0 = 0, fy0 = 0, scale = 1, narrow = false;
  function resize() {
    const W = innerWidth, H = innerHeight, sa = W / H;
    narrow = sa < A.narrowBelow;
    if (narrow || Math.abs(sa / IA - 1) < .015) { vw = W; vh = H; fx0 = 0; fy0 = 0; }
    else if (sa > IA) { vh = H; vw = Math.round(H * IA); fx0 = Math.round((W - vw) / 2); fy0 = 0; }
    else { vw = W; vh = Math.round(W / IA); fx0 = 0; fy0 = Math.round((H - vh) / 2); }
    frameEl.style.cssText = `left:${fx0}px;top:${fy0}px;width:${vw}px;height:${vh}px`;
    const rs = document.documentElement.style;
    rs.setProperty('--fx', fx0 + 'px'); rs.setProperty('--fy', fy0 + 'px'); rs.setProperty('--fw', vw + 'px');
    const dpr = Math.min(devicePixelRatio || 1, coarse ? 1.75 : 2) * scale;
    canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
    if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
  }
  addEventListener('resize', resize); resize();

  /* The camera. Each scene's default is computed fresh; nothing is inherited. */
  function view(rec) { const ia = rec.W / rec.H, sa = vw / vh; return sa > ia ? [.5, .5 * ia / sa] : [.5 * sa / ia, .5]; }
  function clampCam(rec, c) {
    const v = view(rec), hw = v[0] / c.z, hh = v[1] / c.z;
    c.cx = clamp(c.cx, Math.min(.5, hw), Math.max(.5, 1 - hw));
    c.cy = clamp(c.cy, Math.min(.5, hh), Math.max(.5, 1 - hh));
    return c;
  }
  function defaultCam(rec) {
    const foc = narrow ? (rec.cfg.focusNarrow || rec.cfg.focus) : [rec.W / 2, rec.H / 2];
    return clampCam(rec, { cx: foc[0] / rec.W, cy: foc[1] / rec.H, z: 1 });
  }
  const toU = (rec, c) => { const v = view(rec); return [c.cx, c.cy, v[0] / c.z, v[1] / c.z]; };

  /* ---- state ---- */
  let cur = null, tr = null, t0 = performance.now(), last = 0, fps = 60, slow = 0, frames = 0, fxRamp = 0;
  let ptr = [0, 0], ptrT = [0, 0], pan = [0, 0], hover = 0, hoverT = 0, camU = [.5, .5, .5, .5];
  const frameCbs = [], api = { debug: 0 };
  const nowMs = () => api.manual ? api.t : performance.now();

  function enter(rec) { cur = rec; pan = [0, 0]; fxRamp = 0; hover = 0; hoverT = 0; }
  function show(id) { return load(id).then(enter); }

  /* NAVIGATION: small push toward the clicked area, soft blend to the next scene at its default framing. */
  function go(toId, opts) {
    if (tr || !cur) return Promise.resolve();
    opts = opts || {};
    return load(toId).then(B => new Promise(done => {
      const from = currentCam(cur), target = opts.focus ? [opts.focus[0] / cur.W, opts.focus[1] / cur.H] : [from.cx, from.cy];
      tr = { R: cur, B, done, t0: nowMs(), dur: (reduced ? A.reducedSeconds : A.transitionSeconds) * 1000, from, target };
      hoverT = 0;
    }));
  }
  function currentCam(rec) { const c = defaultCam(rec); c.cx += pan[0]; c.cy += pan[1]; return clampCam(rec, c); }

  function step(now) { requestAnimationFrame(step); if (!api.manual && !api.paused) frame(now); }
  function frame(now) {
    const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
    if (api.manual) frames = 0; else { frames++; if (dt > .04) slow++; }
    if (frames >= 50) { if (slow > 36 && scale > .78) { scale *= .88; resize(); } frames = 0; slow = 0; }
    if (!cur) return;
    const k = 1 - Math.exp(-dt * 5);
    ptr[0] += (ptrT[0] - ptr[0]) * k * .6; ptr[1] += (ptrT[1] - ptr[1]) * k * .6;
    hover += (hoverT - hover) * k * 1.3;
    fxRamp = Math.min(1, fxRamp + dt / A.settleSeconds);

    let R = cur, B = null, mix = 0, cam, camB = null;
    if (tr) {
      const p = clamp((now - tr.t0) / tr.dur), t = tr;
      R = t.R; B = t.B;
      const e = reduced ? 0 : sineInOut(p);
      cam = clampCam(R, { z: 1 + A.pushAmount * e, cx: lerp(t.from.cx, t.target[0], e * .5), cy: lerp(t.from.cy, t.target[1], e * .5) });
      mix = reduced ? p : smooth((p - .18) / .74);
      camB = toU(B, defaultCam(B));
      if (p >= 1) { enter(B); R = B; B = null; mix = 0; tr = null; cam = defaultCam(R); t.done(); }
    } else cam = currentCam(R);

    camU = toU(R, cam);
    fps += ((1 / Math.max(dt, .001)) - fps) * .05;
    if (!tr && !reduced) stepRig(R, now / 1000); else if (R.rigA) R.rigN = 0;
    if (gl) drawGL(R, B, mix, camB, now); else draw2D(R, B, mix, camB);
    frameCbs.forEach(f => f());
  }

  function drawGL(R, B, mix, camB, now) {
    const f = R.fx, a = A.intensity * (reduced ? 0 : 1), ramp = fxRamp;
    const bind = (i, t) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t); };
    bind(0, R.tex); bind(1, R.mtex); bind(2, B ? B.tex : R.tex); bind(3, hoverTex);
    const set1 = (k, v) => U[k] && gl.uniform1f(U[k], v);
    gl.uniform4fv(U.uCamA, camU); gl.uniform4fv(U.uCamB, camB || camU);
    const fr = f.fire; gl.uniform3f(U.uFire, fr ? fr[0] / R.W : 0, fr ? fr[1] / R.H : 0, fr && !reduced ? fr[2] / R.H : 0);
    gl.uniform2f(U.uFogP, -ptr[0] * .012 * A.fogParallax, -ptr[1] * .006 * A.fogParallax);
    set1('uT', (now - t0) / 1000); set1('uFx', ramp); set1('uAsp', R.W / R.H); set1('uDbg', api.debug);
    set1('uFog', (f.fog || 0) * ramp * (reduced ? A.intensity * .6 : a));
    set1('uGrass', (f.grass || 0) * a * ramp); set1('uTree', (f.tree || 0) * a * ramp);
    set1('uLight', (f.light || 0) * a * ramp); set1('uDust', (f.dust || 0) * a * ramp);
    set1('uMix', mix); set1('uHover', hover); set1('uFogBank', f.fogBank || 0);
    const n = !tr && !reduced ? R.rigN || 0 : 0; set1('uRigN', n);
    if (n && U['uWA[0]']) { gl.uniform4fv(U['uWA[0]'], R.rigA); gl.uniform4fv(U['uWB[0]'], R.rigB);
      if (U['uBE[0]']) { gl.uniform4fv(U['uBE[0]'], R.bE); gl.uniform1fv(U['uBA[0]'], R.bA); } }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function draw2D(R, B, mix, camB) {
    const W = canvas.width, H = canvas.height, blit = (rec, c) => { const sw = c[2] * 2 * rec.W, sh = c[3] * 2 * rec.H; ctx2d.drawImage(rec.img, c[0] * rec.W - sw / 2, c[1] * rec.H - sh / 2, sw, sh, 0, 0, W, H); };
    ctx2d.globalAlpha = 1; blit(R, camU);
    if (B && mix > 0) { ctx2d.globalAlpha = mix; blit(B, camB); }
  }

  /* ---- the animals: small local movements on independent random timers ---- */
  const rnd = (a, b) => a + Math.random() * (b - a);
  function buildRig(R) {
    const list = (ATM[R.id] || {}).rig || [];
    R.actors = list.map(a => ({ cfg: a, head: 0, from: 0, to: 0, t0: 0, dur: 1, next: 0, ears: [], blink: { next: 0, t0: -9 }, rate: rnd(1.25, 1.7), ph: rnd(0, 6), born: false }));
    R.rigA = new Float32Array(MAXW * 4); R.rigB = new Float32Array(MAXW * 4); R.bE = new Float32Array(MAXB * 4); R.bA = new Float32Array(MAXB); R.rigN = 0;
  }
  function stepRig(R, t) {
    if (!R.actors) buildRig(R);
    const amt = fxRamp; let w = 0, b = 0;
    R.actors.forEach(a => {
      const c = a.cfg, st = c.start || 0;
      if (!a.born) { a.born = true; a.next = t + st + rnd(.5, 2); a.blink.next = t + st + rnd(1, 3); }
      if (t > a.next) { a.from = a.head; a.to = rnd(-1, 1); a.t0 = t; a.dur = rnd(2.4, 4.6); a.next = t + a.dur + rnd(5, 13); }
      a.head = lerp(a.from, a.to, smooth((t - a.t0) / a.dur));
      let earI = 0;
      c.warps.forEach(k => {
        if (w >= MAXW) return;
        let ang = 0;
        if (k.type === 'head') ang = a.head + .16 * Math.sin(t * .31 + a.ph);
        else if (k.type === 'breath') ang = Math.sin(t * a.rate + a.ph);
        else if (k.type === 'ear') {
          const e = a.ears[earI] || (a.ears[earI] = { next: t + st + rnd(1.5, 5), t0: -9, dur: 1, dir: 1 });
          if (t > e.next) { e.t0 = t; e.dur = rnd(.45, 1.1); e.dir = Math.random() < .5 ? -1 : 1; e.next = t + rnd(4, 11) + e.dur; }
          const x = (t - e.t0) / e.dur; ang = x >= 0 && x <= 1 ? e.dir * Math.sin(x * Math.PI) * (1 + .3 * Math.sin(x * 15)) : 0;
          earI++;
        }
        const i = w * 4;
        R.rigA.set([k.c[0] / R.W, k.c[1] / R.H, k.r[0] / R.W, k.r[1] / R.H], i);
        R.rigB.set([k.p[0] / R.W, k.p[1] / R.H, ang * k.amp * Math.PI / 180 * amt, 0], i); w++;
      });
      (c.blinks || []).forEach(k => {
        if (b >= MAXB) return;
        if (t > a.blink.next) { a.blink.t0 = t; a.blink.next = t + rnd(3.5, 9); }
        const x = (t - a.blink.t0) / .3;
        R.bE.set([k.c[0] / R.W, k.c[1] / R.H, k.r[0] / R.W, k.r[1] / R.H], b * 4);
        R.bA[b] = x >= 0 && x <= 1 ? Math.sin(x * Math.PI) * amt : 0; b++;
      });
    });
    R.rigN = w;
  }

  requestAnimationFrame(step);

  /* ---- interaction ---- */
  api.frame = frame; api.load = load; api.show = show; api.go = go;
  api.setMotion = on => { reduced = !on; }; api.isReduced = () => reduced;
  api.info = () => (gl ? 'WebGL' : 'Basic renderer') + ', ' + Math.round(fps) + ' fps, ' + (reduced ? 'reduced motion' : 'full motion') + ', render scale ' + scale.toFixed(2);
  api.reduced = reduced; api.busy = () => !!tr; api.onFrame = f => frameCbs.push(f);
  api.pointer = (x, y) => { ptrT = [(x - fx0) / vw * 2 - 1, (y - fy0) / vh * 2 - 1]; };
  api.resetPointer = () => { ptrT = [0, 0]; };
  api.pan = (dx, dy) => { if (!cur || tr || !narrow) return; const sx = 2 * camU[2] / vw;
    const d = defaultCam(cur), c = clampCam(cur, { cx: d.cx + pan[0] - dx * sx, cy: d.cy, z: 1 }); pan = [c.cx - d.cx, 0]; };
  api.panTo = (x) => { if (!cur || !narrow) return; const d = defaultCam(cur), c = clampCam(cur, { cx: x / cur.W, cy: d.cy, z: 1 }); pan = [c.cx - d.cx, 0]; };
  api.setHover = hs => {
    if (!hs || !cur || !gl) { hoverT = 0; return; }
    const c = document.createElement('canvas'); c.width = HW; c.height = HH;
    const x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = '#000'; x.fillRect(0, 0, HW, HH); x.fillStyle = '#fff';
    hs.shapes.forEach(s => { x.beginPath(); s.forEach((p, i) => i ? x.lineTo(p[0] / cur.W * HW, p[1] / cur.H * HH) : x.moveTo(p[0] / cur.W * HW, p[1] / cur.H * HH)); x.closePath(); x.fill(); });
    const d = x.getImageData(0, 0, HW, HH).data, ch = new Uint8ClampedArray(HW * HH);
    for (let i = 0; i < ch.length; i++) ch[i] = d[i * 4];
    const b = blurCh(ch, 4, HW, HH), out = new Uint8Array(HW * HH);
    for (let i = 0; i < out.length; i++) out[i] = b[i];
    uploadRaw(hoverTex, out, HW, HH, gl.LUMINANCE);
    hoverT = 1;
  };
  /* image pixels ↔ position inside the photograph's frame */
  api.matrix = () => { if (!cur) return null; const rec = tr ? tr.R : cur, s = vw / (2 * camU[2] * rec.W); return { s, tx: -(camU[0] - camU[2]) * rec.W * s, ty: -(camU[1] - camU[3]) * rec.H * s }; };
  api.project = (x, y) => { const m = api.matrix(); return m ? { x: x * m.s + m.tx, y: y * m.s + m.ty } : { x: -99, y: -99 }; };
  api.unproject = (sx, sy) => { const m = api.matrix(); return m ? [Math.round((sx - fx0 - m.tx) / m.s), Math.round((sy - fy0 - m.ty) / m.s)] : [0, 0]; };
  return api;
};

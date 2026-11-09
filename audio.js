/* SOUND — every sound on the site is generated live in the browser.
   Volumes are in config.js under "sound". Each recipe below describes one scene. */

window.createAudio = function (CFG) {
  const S = CFG.sound;
  const rnd = (a, b) => a + Math.random() * (b - a);
  let ctx, master, wet, white, brown, analyser, on = false, current = null, currentId = null;

  function makeNoise(seconds, isBrown) {
    const n = Math.floor(seconds * ctx.sampleRate), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    let last = 0, peak = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      if (isBrown) { last = (last + .02 * w) / 1.02; d[i] = last; } else d[i] = w;
      peak = Math.max(peak, Math.abs(d[i]));
    }
    const fade = Math.floor(ctx.sampleRate * .25);       // blend the end into the start so loops are seamless
    for (let i = 0; i < fade; i++) { const k = i / fade; d[n - fade + i] = d[n - fade + i] * (1 - k) + d[i] * k; }
    for (let i = 0; i < n; i++) d[i] /= peak;
    return buf;
  }

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    white = makeNoise(5, false); brown = makeNoise(9, true);
    master = ctx.createGain(); master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    analyser = ctx.createAnalyser(); analyser.fftSize = 2048;
    master.connect(comp); comp.connect(analyser); analyser.connect(ctx.destination);
    const n = Math.floor(ctx.sampleRate * 1.5), ir = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.2); }
    const rev = ctx.createConvolver(); rev.buffer = ir;
    wet = ctx.createGain(); wet.gain.value = .55; wet.connect(rev); rev.connect(master);
    document.addEventListener('visibilitychange', () => { if (!on) return; document.hidden ? ctx.suspend() : ctx.resume(); });
  }

  /* ---- building blocks ---- */
  function loopNoise(i, buf) { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(0, rnd(0, 4)); i.nodes.push(s); return s; }
  function lfo(i, rate, depth, param) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = rate; g.gain.value = depth; o.connect(g); g.connect(param); o.start(); i.nodes.push(o); }
  function bed(i, { buf, type = 'bandpass', f, q = .6, level, sway = .35 }) {
    const s = loopNoise(i, buf), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    fl.type = type; fl.frequency.value = f; fl.Q.value = q; g.gain.value = level * S.ambience;
    s.connect(fl); fl.connect(g); g.connect(i.out);
    lfo(i, rnd(.05, .09), f * sway * .8, fl.frequency); lfo(i, rnd(.11, .17), f * sway * .4, fl.frequency);
    lfo(i, rnd(.06, .1), level * S.ambience * sway, g.gain);
  }
  function grain(dest, t, { buf = white, type = 'bandpass', f, q = 1.2, a = .001, d, peak, send = 0 }) {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = buf; fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d);
    s.connect(fl); fl.connect(g); g.connect(dest); if (send) { const w = ctx.createGain(); w.gain.value = send; g.connect(w); w.connect(wet); }
    s.start(t, rnd(0, 4)); s.stop(t + a + d + .05);
    return fl;
  }
  function thud(dest, t, { f0, f1, d, peak, send = 0 }) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(peak, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(dest); if (send) { const w = ctx.createGain(); w.gain.value = send; g.connect(w); w.connect(wet); }
    o.start(t); o.stop(t + d + .05);
  }
  function every(i, min, max, fn) {
    const go = () => { const id = setTimeout(() => { i.timers.delete(id); if (!i.alive) return; if (ctx.state === 'running') fn(ctx.currentTime + .03); go(); }, rnd(min, max) * 1000); i.timers.add(id); };
    go();
  }

  /* ---- details ---- */
  const D = () => S.details;
  function bird(i, t, far) {
    const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = far ? 4200 : 7000;
    let x = t; const base = rnd(2500, 4300), notes = Math.floor(rnd(3, 8)), level = (far ? .1 : .2) * D();
    o.type = 'sine'; g.gain.setValueAtTime(.0001, t);
    for (let n = 0; n < notes; n++) {
      const dur = rnd(.05, .15), a = base * rnd(.85, 1.25), b = base * rnd(.8, 1.35);
      o.frequency.setValueAtTime(a, x); o.frequency.exponentialRampToValueAtTime(b, x + dur);
      g.gain.setValueAtTime(.0001, x); g.gain.linearRampToValueAtTime(level, x + dur * .25); g.gain.linearRampToValueAtTime(.0001, x + dur);
      x += dur + rnd(.03, .13);
    }
    o.connect(lp); lp.connect(g); g.connect(i.out); const w = ctx.createGain(); w.gain.value = .35; g.connect(w); w.connect(wet);
    o.start(t); o.stop(x + .05);
  }
  function crackle(i, t) { const r = Math.pow(Math.random(), 2.4); grain(i.out, t, { f: rnd(1800, 7000), q: 1.5, d: rnd(.004, .03), peak: (.025 + r * .2) * D() }); }
  function pop(i, t) {
    grain(i.out, t, { f: rnd(500, 900), q: 1, d: rnd(.04, .08), peak: .2 * D() });
    const n = Math.floor(rnd(3, 9)); for (let k = 0; k < n; k++) crackle(i, t + rnd(.01, .28));
  }
  function tick(i, t, odd) { grain(i.out, t, { f: odd ? 3100 : 2500, q: 5, d: .012, peak: .05 * D(), send: .25 }); }
  function dogSigh(i, t) {
    const f = grain(i.out, t, { f: 900, q: .8, a: .25, d: 1.1, peak: .06 * D(), send: .3 });
    f.frequency.setValueAtTime(950, t); f.frequency.exponentialRampToValueAtTime(420, t + 1.3);
  }
  function tailThumps(i, t) { const n = Math.floor(rnd(3, 6)); for (let k = 0; k < n; k++) thud(i.out, t + k * rnd(.2, .26), { f0: 88, f1: 50, d: .09, peak: rnd(.16, .26) * D(), send: .3 }); }
  function snort(i, t) {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), env = ctx.createGain(), am = ctx.createGain(), o = ctx.createOscillator(), og = ctx.createGain(), dur = rnd(.6, .95);
    s.buffer = white; fl.type = 'bandpass'; fl.Q.value = 1.1;
    fl.frequency.setValueAtTime(950, t); fl.frequency.exponentialRampToValueAtTime(420, t + dur);
    env.gain.setValueAtTime(.0001, t); env.gain.linearRampToValueAtTime(.16 * D(), t + .05); env.gain.exponentialRampToValueAtTime(.0001, t + dur);
    am.gain.value = .55; o.frequency.value = rnd(22, 32); og.gain.value = .45; o.connect(og); og.connect(am.gain);
    s.connect(fl); fl.connect(am); am.connect(env); env.connect(i.out); const w = ctx.createGain(); w.gain.value = .5; env.connect(w); w.connect(wet);
    s.start(t, rnd(0, 4)); s.stop(t + dur + .05); o.start(t); o.stop(t + dur + .05);
  }
  function hooves(i, t) {
    const n = Math.floor(rnd(2, 4)); let x = t;
    for (let k = 0; k < n; k++) { thud(i.out, x, { f0: 155, f1: 72, d: .08, peak: .24 * D(), send: .5 }); grain(i.out, x, { f: 1400, q: 1, d: .018, peak: .08 * D(), send: .5 }); x += rnd(.24, .52); }
  }
  function creak(i, t) {
    const o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain(), dur = rnd(.5, 1); let x = t, f = rnd(55, 95);
    o.type = 'sawtooth'; fl.type = 'bandpass'; fl.frequency.value = rnd(650, 1050); fl.Q.value = 3;
    while (x < t + dur) { f *= rnd(.9, 1.11); o.frequency.setValueAtTime(f, x); x += rnd(.025, .07); }
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.022 * D(), t + .15); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(fl); fl.connect(g); g.connect(i.out); const w = ctx.createGain(); w.gain.value = .5; g.connect(w); w.connect(wet);
    o.start(t); o.stop(t + dur + .05);
  }

  /* ---- doorway and path effects ---- */
  const FX = {
    latch(t) { const v = S.doorways; grain(master, t, { f: 3000, q: 3, d: .006, peak: .16 * v, send: .25 }); grain(master, t + .09, { f: 1800, q: 3, d: .012, peak: .13 * v, send: .25 }); thud(master, t + .16, { f0: 125, f1: 68, d: .13, peak: .22 * v, send: .35 }); },
    steps(t) { const v = S.doorways; [0, .44].forEach(o => { thud(master, t + o, { f0: 105, f1: 55, d: .1, peak: .2 * v, send: .35 }); grain(master, t + o, { f: 900, q: .9, d: .03, peak: .06 * v, send: .3 }); }); },
    gravel(t) { const v = S.doorways; [0, .45, .9].forEach(o => { for (let n = 0; n < 40; n++) grain(master, t + o + rnd(0, .17), { f: rnd(1800, 5200), q: 2, d: rnd(.003, .012), peak: rnd(.03, .1) * v }); }); }
  };

  /* ---- music for the house: an original, unhurried piano piece in F ----
     Each bar: [left-hand chord, bass root, melody as [beat, note]]         */
  const SONG = [
    [[57,60,64,67], 41, [[0,72],[1,76],[1.5,77],[2,79],[3,76]]],
    [[53,57,60,64], 38, [[0,74],[1.5,72],[2,69]]],
    [[58,62,65,69], 43, [[.5,70],[1,74],[2,77],[3,74]]],
    [[58,64,69],    36, [[0,76],[1,72],[2.5,70]]],
    [[57,60,64,67], 41, [[0,69],[1,72],[2,76],[2.5,77],[3,81]]],
    [[54,60,64,69], 38, [[0,79],[1,76],[2,78],[3,74]]],
    [[58,62,65,69], 43, [[0,77],[1.5,74],[2,70],[3,74]]],
    [[58,64,69],    36, [[0,72],[2,70]]],
    [[57,60,62,65], 46, [[0,74],[1,77],[2,81],[3,79]]],
    [[55,61,65,70], 39, [[0,77],[1.5,75],[2,73],[3,70]]],
    [[55,60,64,69], 45, [[0,72],[1,76],[2,79],[3,76]]],
    [[54,60,64,69], 38, [[0,78],[1,74],[2,72],[3,69]]],
    [[58,62,65,69], 43, [[0,70],[1,74],[2,77],[3.5,76]]],
    [[58,64,69],    36, [[0,76],[1,74],[2,72],[3,70]]],
    [[57,60,64,67], 41, [[0,69],[2,72]]],
    [[58,64,69],    36, [[1,67],[2,70],[3,76]]]
  ];
  const BEAT = 60 / 72, hz = m => 440 * Math.pow(2, (m - 69) / 12);
  let music = null;
  function pianoNote(out, t, m, vel, len) {
    const f = hz(m), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900 + vel * 3200; lp.Q.value = .2; lp.connect(out);
    [[1, 1, 1], [2, .4, .7], [3, .15, .5], [4, .07, .35], [6, .02, .2]].forEach(([n, a, d]) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), end = t + len * d; o.frequency.value = f * n * (1 + .00035 * n * n);
      g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vel * a, t + .007); g.gain.exponentialRampToValueAtTime(.0001, end);
      o.connect(g); g.connect(lp); o.start(t); o.stop(end + .05);
    });
  }
  function bassNote(out, t, m, vel) {
    const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = hz(m); lp.type = 'lowpass'; lp.frequency.value = 340;
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vel, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + BEAT * 2.1);
    o.connect(lp); lp.connect(g); g.connect(out); o.start(t); o.stop(t + BEAT * 2.2);
  }
  const at = (bar, b) => { const w = Math.floor(b), fr = b - w; return bar + (w + (fr ? .58 : 0)) * BEAT; };
  function playBar(mu, t) {
    const [chord, root, tune] = SONG[mu.bar % SONG.length], pass = Math.floor(mu.bar / SONG.length) % 3, soft = rnd(.92, 1.06);
    chord.forEach((m, i) => pianoNote(mu.bus, t + i * .014 + rnd(0, .006), m, .075 * soft, BEAT * 3.6));
    if (mu.bar % 2) chord.slice(1).forEach((m, i) => pianoNote(mu.bus, at(t, 2.5) + i * .01, m, .04 * soft, BEAT * 1.6));
    if (!(pass === 2 && mu.bar % SONG.length < 8)) tune.forEach(([b, m]) => { if (Math.random() < .9) pianoNote(mu.bus, at(t, b) + rnd(-.008, .012), m + (pass === 1 && m < 76 ? 12 : 0), rnd(.1, .135), BEAT * 2.8); });
    mu.bar++;
  }
  function setMusic(id) {
    const want = on && id && (S.musicRooms || []).includes(id);
    if (want && !music) {
      const bus = ctx.createGain(), send = ctx.createGain(), t = ctx.currentTime, mu = music = { bus, bar: 0, next: t + .5 };
      send.gain.value = .32; bus.connect(master); bus.connect(send); send.connect(wet);
      bus.gain.setValueAtTime(.0001, t); bus.gain.exponentialRampToValueAtTime(Math.max(.001, S.music == null ? 1 : S.music), t + 2.4);
      mu.timer = setInterval(() => { const now = ctx.currentTime; if (mu.next < now) mu.next = now + .1; while (mu.next < now + 3) { playBar(mu, mu.next); mu.next += BEAT * 4; } }, 400);
    } else if (!want && music) {
      const mu = music, t = ctx.currentTime, fade = on ? S.fadeSeconds : .3; music = null; clearInterval(mu.timer);
      mu.bus.gain.cancelScheduledValues(t); mu.bus.gain.setValueAtTime(Math.max(.0001, mu.bus.gain.value), t); mu.bus.gain.exponentialRampToValueAtTime(.0001, t + fade);
      setTimeout(() => mu.bus.disconnect(), fade * 1000 + 4000);
    }
  }

  /* quiet wind moving through leaves: soft, high and gusty, never a steady hum */
  function leaves(i) {
    [[2600, .55, 1], [5200, .8, .55]].forEach(([f, q, share]) => {
      const s = loopNoise(i, white), bp = ctx.createBiquadFilter(), g = ctx.createGain(), base = .0016 * share * S.ambience;
      bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q; g.gain.value = base; s.connect(bp); bp.connect(g); g.connect(i.out);
      lfo(i, rnd(.07, .12), f * .12, bp.frequency);
      every(i, 3, 8, t => { const peak = rnd(.006, .014) * share * S.ambience, up = rnd(1.6, 2.8), down = rnd(2.6, 4.2); g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(Math.max(base, g.gain.value), t); g.gain.linearRampToValueAtTime(peak, t + up); g.gain.linearRampToValueAtTime(base, t + up + down); });
    });
  }
  /* a calm hearth: the soft breath of the flames, unhurried crackles, and now and then a log settling */
  function hearth(i) {
    const tick = (t, peak) => grain(i.out, t, { f: rnd(1100, 3000), q: 1.3, a: .0025, d: rnd(.01, .035), peak: peak * D(), send: .15 });
    every(i, .7, 2.4, t => { const n = Math.random() < .55 ? 1 : Math.floor(rnd(2, 4)); let at = t; for (let k = 0; k < n; k++) { tick(at, .05 + Math.pow(Math.random(), 3) * .14); at += rnd(.03, .16); } });
    every(i, .35, 1.1, t => tick(t, rnd(.016, .032)));
    every(i, 11, 26, t => { for (let k = 0; k < 4; k++) tick(t + .05 + k * rnd(.04, .12), rnd(.04, .08)); });
  }
  /* ---- the scenes ---- */
  const RECIPES = {
    exterior(i) { leaves(i); every(i, 1.5, 4.5, t => bird(i, t, true)); every(i, 3, 8, t => bird(i, t, false)); },
    foyer(i) { },
    'living-room'(i) { hearth(i); },
    kitchen(i) { },
    backyard(i) { leaves(i); every(i, 1.8, 5, t => bird(i, t, false)); every(i, 3, 8, t => bird(i, t, true)); },
    stable(i) { every(i, 2.5, 6.5, t => bird(i, t, true)); every(i, 5, 12, t => bird(i, t, false)); }
  };

  function startScene(id) {
    const out = ctx.createGain(); out.gain.value = .0001; out.connect(master);
    const i = { out, nodes: [], timers: new Set(), alive: true };
    (RECIPES[id] || (() => {}))(i);
    const level = S.scenes[id] == null ? 1 : S.scenes[id], t = ctx.currentTime;
    out.gain.setValueAtTime(.0001, t); out.gain.exponentialRampToValueAtTime(Math.max(.001, level), t + S.fadeSeconds);
    return i;
  }
  function stopScene(i, fade) {
    if (!i) return; i.alive = false; i.timers.forEach(clearTimeout); i.timers.clear();
    const t = ctx.currentTime; i.out.gain.cancelScheduledValues(t); i.out.gain.setValueAtTime(Math.max(.0001, i.out.gain.value), t); i.out.gain.exponentialRampToValueAtTime(.0001, t + fade);
    setTimeout(() => { i.nodes.forEach(n => { try { n.stop(); } catch (e) {} }); i.out.disconnect(); }, fade * 1000 + 120);
  }

  return {
    scene(id) { currentId = id; if (!on) return; stopScene(current, S.fadeSeconds); current = startScene(id); setMusic(id); },
    unlock() { if (on && ctx && ctx.state !== 'running') { const p = ctx.resume(); if (p && p.catch) p.catch(() => {}); } },
    sfx(name) { if (on && FX[name]) FX[name](ctx.currentTime + .02); },
    set(enable, id) {
      if (id) currentId = id;
      if (enable === on) return on;
      init(); on = enable;
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t);
      if (on) { const p = ctx.resume(); if (p && p.catch) p.catch(() => {}); master.gain.linearRampToValueAtTime(S.master, t + .4); current = startScene(currentId); setMusic(currentId); }
      else { master.gain.linearRampToValueAtTime(0, t + .3); stopScene(current, .3); current = null; setMusic(null); }
      return on;
    },
    level() { if (!analyser) return { state: 'off' }; const d = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(d); let s = 0, p = 0; for (const x of d) { s += x * x; p = Math.max(p, Math.abs(x)); } return { state: ctx.state, rms: +Math.sqrt(s / d.length).toFixed(4), peak: +p.toFixed(3) }; }
  };
};

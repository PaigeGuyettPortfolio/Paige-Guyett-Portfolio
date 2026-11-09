/* INTERFACE — hotspots, panels, project folios and the discreet navigation.
   Content comes from config.js; visual tokens are at the top of index.html. */
(function () {
  const { useState, useEffect, useRef, useCallback, createContext, useContext } = React;
  const html = htm.bind(React.createElement);
  const CFG = window.PORTFOLIO;

  /* ---- browser-only text edits (Edit mode) ---- */
  const KEY = 'portfolio-edits-v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const store = o => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };
  const setPath = (root, path, v) => { const k = path.split('.'), l = k.pop(); let o = root; for (const p of k) { o = o && o[p]; } if (o) o[l] = v; };
  const getPath = (root, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), root);
  let edits = load();
  Object.entries(edits).forEach(([p, v]) => setPath(CFG, p, v));

  const Edit = createContext(false);
  function T({ p, as = 'span', className, children }) {
    const editing = useContext(Edit);
    const val = p ? getPath(CFG, p) : children;
    const Tag = as;
    if (!editing || !p) return html`<${Tag} className=${className}>${val}<//>`;
    return html`<${Tag} className=${(className || '') + ' editable'} contentEditable suppressContentEditableWarning=${true}
      onClick=${e => e.stopPropagation()}
      onBlur=${e => { const v = e.target.textContent.trim(); if (v !== getPath(CFG, p)) { setPath(CFG, p, v); edits = { ...edits, [p]: v }; store(edits); } }}>${val}<//>`;
  }

  /* ---- images ---- */
  function Fig({ img, className = '', eager }) {
    if (!img) return null;
    if (img.src && !img.crop) return html`<figure className=${'fig ' + className}><img src=${img.src} alt=${img.caption || img.alt || ''} loading=${eager ? 'eager' : 'lazy'} style=${img.ratio ? { aspectRatio: img.ratio, objectFit: 'cover', objectPosition: img.position || '50% 50%' } : null} />${img.caption && html`<figcaption>${img.caption}</figcaption>`}</figure>`;
    if (img.scene || img.crop) {
      const sc = img.scene ? CFG.scenes[img.scene] : { image: img.src, size: img.size, label: "photograph" }, [W, H] = sc.size, [x, y, w, h] = img.crop;
      const style = { aspectRatio: w + ' / ' + h, backgroundImage: `url(${sc.image})`, backgroundSize: (W / w * 100) + '% auto',
        backgroundPosition: (W === w ? 0 : x / (W - w) * 100) + '% ' + (H === h ? 0 : y / (H - h) * 100) + '%' };
      return html`<figure className=${'fig ' + className}><div className="crop" style=${style} role="img" aria-label=${img.alt || 'Detail of the ' + sc.label.toLowerCase()}></div>${img.caption && html`<figcaption>${img.caption}</figcaption>`}</figure>`;
    }
    return html`<figure className=${'fig slot ' + className} style=${img.ratio ? { aspectRatio: img.ratio } : null}><i className="tl"></i><i className="br"></i><span>${img.slot}</span></figure>`;
  }

  /* ---- image cards: hidden until clicked, then they stay turned for the visit ---- */
  const turned = new Set(), natSize = new Map();
  const motionOK = () => !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ratioOf = (img, nat) => {
    if (img.ratio) { const m = String(img.ratio).split('/').map(Number); return m[0] / (m[1] || 1); }
    if (img.crop) return img.crop[2] / img.crop[3];
    return nat || 4 / 3;
  };
  function Flip({ img, id, className = '', onOpen, plain }) {
    const isSlot = !!img.slot;
    const [on, setOn] = useState(isSlot || plain || turned.has(id)), [nat, setNat] = useState(null), [started, setStarted] = useState(false), [fading, setFading] = useState(false);
    const btn = useRef(), stage = useRef(), cover = useRef(), brush = useRef({ cells: new Set(), last: null, done: false, touch: false });
    useEffect(() => { if (img.src && !img.crop) { const i = new Image(); i.decoding = 'async'; i.onload = () => { natSize.set(img.src, { w: i.naturalWidth, h: i.naturalHeight }); setNat(i.naturalWidth / i.naturalHeight); }; i.src = img.src; } }, [img.src]);
    const r = ratioOf(img, nat), label = img.alt || img.caption || img.slot || 'Image', canView = on && !isSlot;
    const MW = 480, MH = Math.max(1, Math.round(MW / r)), GX = 22, GY = Math.max(6, Math.round(GX / r));
    React.useLayoutEffect(() => {
      if (on || brush.current.started) return; const c = cover.current; if (!c) return;
      c.width = MW; c.height = MH; const x = c.getContext('2d'); x.fillStyle = '#FBF7EE'; x.fillRect(0, 0, MW, MH);
    }, [r, on]);
    const finish = () => { const b = brush.current; if (b.done) return; b.done = true; turned.add(id); setFading(true); setTimeout(() => setOn(true), motionOK() ? 1000 : 0); };
    const stamp = (x, px, py) => { const R = MW * .12, g = x.createRadialGradient(px, py, 0, px, py, R); g.addColorStop(0, 'rgba(0,0,0,.95)'); g.addColorStop(.55, 'rgba(0,0,0,.7)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.beginPath(); x.arc(px, py, R, 0, 7); x.fill();
      const b = brush.current, reach = R * .72, cw = MW / GX, ch = MH / GY; for (let i = Math.max(0, Math.floor((px - reach) / cw)); i <= Math.min(GX - 1, Math.floor((px + reach) / cw)); i++) for (let j = Math.max(0, Math.floor((py - reach) / ch)); j <= Math.min(GY - 1, Math.floor((py + reach) / ch)); j++) if (Math.hypot((i + .5) * cw - px, (j + .5) * ch - py) <= reach) b.cells.add(i + ':' + j); };
    const paint = e => { const b = brush.current, c = cover.current; if (!c || b.done) return; const box = btn.current.getBoundingClientRect(), px = (e.clientX - box.left) / box.width * MW, py = (e.clientY - box.top) / box.height * MH, x = c.getContext('2d'); x.globalCompositeOperation = 'destination-out';
      const from = b.last || [px, py], steps = Math.max(1, Math.ceil(Math.hypot(px - from[0], py - from[1]) / (MW * .03))); for (let n = 1; n <= steps; n++) stamp(x, from[0] + (px - from[0]) * n / steps, from[1] + (py - from[1]) * n / steps); b.last = [px, py];
      if (!b.started) { b.started = true; setStarted(true); } if (b.cells.size / (GX * GY) >= .8) finish(); };
    const click = e => { if (!on) { if (e.detail === 0 && !isSlot) finish(); return; } if (canView && onOpen) onOpen(id, btn.current.getBoundingClientRect()); };
    const move = e => { if (img.fx && on && e.pointerType === 'mouse' && motionOK()) { const b = stage.current.getBoundingClientRect(); stage.current.style.setProperty('--px', ((e.clientX - b.left) / b.width - .5).toFixed(3)); stage.current.style.setProperty('--py', ((e.clientY - b.top) / b.height - .5).toFixed(3)); } if (!on && (e.pointerType === 'mouse' || brush.current.touch)) paint(e); };
    const down = e => { if (on) return; brush.current.touch = true; brush.current.last = null; paint(e); };
    const lift = () => { brush.current.touch = false; brush.current.last = null; };
    const leave = () => { lift(); if (stage.current) { stage.current.style.setProperty('--px', 0); stage.current.style.setProperty('--py', 0); } };
    return html`<div className=${'card ' + className + (on ? ' on' : '') + (img.fx ? ' fx-' + img.fx : '') + (img.cutout ? ' cut' : '')} style=${{ '--r': r }}>
      <div className="card-stage" ref=${stage} onPointerMove=${move} onPointerDown=${down} onPointerUp=${lift} onPointerCancel=${lift} onPointerLeave=${leave}>
        <button ref=${btn} className=${'flip' + (canView ? ' viewable' : '')} style=${{ aspectRatio: String(r) }} aria-label=${on ? (canView ? 'View larger: ' + label : label) : 'Reveal image: ' + label} onClick=${click}>
          <span className="flip-in"><span className="face front"><${Fig} img=${{ ...img, caption: undefined, alt: img.alt || img.caption }} eager=${true} /></span></span>
          ${!on && html`<canvas ref=${cover} className=${'cover' + (fading ? ' fading' : '')} aria-hidden="true"></canvas>`}
          ${!on && !started && !fading && html`<span className="reveal-hint" aria-hidden="true"><span className="for-mouse">Move your cursor here</span><span className="for-touch">Drag across to reveal</span></span>`}
          ${canView && html`<span className="expand" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 13 13"><path d="M1 5V1h4M12 8v4H8M1 1l4.2 4.2M12 12 7.8 7.8" stroke="currentColor" fill="none"/></svg></span>`}
        </button>
      </div>
      ${img.caption && on && html`<p className="card-cap">${img.caption}</p>`}
    </div>`;
  }

  /* ---- immersive viewer: opens from the card, zooms only as far as the image stays sharp ---- */
  function Viewer({ items, start, rect, onClose }) {
    const [i, setI] = useState(start), [zoom, setZoom] = useState(1), [cut, setCut] = useState(50), [closing, setClosing] = useState(false);
    const wrap = useRef(), stage = useRef(), root = useRef(), view = useRef({ z: 1, x: 0, y: 0 }), ptrs = useRef(new Map()), gest = useRef(null);
    const item = items[i], img = item.img;
    const dims = img.crop ? { w: img.crop[2], h: img.crop[3] } : natSize.get(img.src) || { w: 4, h: 3 };
    const vw = innerWidth, vh = innerHeight, availW = vw - (vw < 821 ? 16 : 120), availH = vh - (img.compare ? 190 : 150), r = dims.w / dims.h;
    const bw = Math.min(availW, availH * r), bh = bw / r, maxZ = Math.max(1, Math.min(4, dims.w / bw * 2)), canZoom = maxZ > 1.25;
    const apply = () => { const v = view.current, s = stage.current; if (s) s.style.transform = `translate(${v.x}px,${v.y}px) scale(${v.z})`; };
    const limit = () => { const v = view.current, lx = Math.max(0, (bw * v.z - availW) / 2), ly = Math.max(0, (bh * v.z - availH) / 2); v.x = Math.max(-lx, Math.min(lx, v.x)); v.y = Math.max(-ly, Math.min(ly, v.y)); };
    const zoomTo = (nz, cx = vw / 2, cy = vh / 2) => { const v = view.current; nz = Math.max(1, Math.min(maxZ, nz)); const px = cx - vw / 2, py = cy - vh / 2 + 10, f = nz / v.z; v.x = px - (px - v.x) * f; v.y = py - (py - v.y) * f; v.z = nz; limit(); apply(); setZoom(nz); };
    const close = () => { if (closing) return; setClosing(true); setTimeout(onClose, motionOK() ? 260 : 0); };
    const go = d => { const n = (i + d + items.length) % items.length; view.current = { z: 1, x: 0, y: 0 }; setZoom(1); setCut(50); setI(n); };
    useEffect(() => { apply(); }, [i]);
    useEffect(() => {
      const prev = document.activeElement, el = root.current; el.querySelector('.v-close').focus({ preventScroll: true });
      if (motionOK() && rect && wrap.current) { const b = wrap.current.getBoundingClientRect(), s = rect.width / b.width; wrap.current.animate([{ transform: `translate(${rect.left + rect.width / 2 - b.left - b.width / 2}px,${rect.top + rect.height / 2 - b.top - b.height / 2}px) scale(${s})`, opacity: .55 }, { transform: 'none', opacity: 1 }], { duration: 620, easing: 'cubic-bezier(.2,.7,.15,1)' }); }
      const wheel = e => { e.preventDefault(); if (canZoomRef.current) zoomRef.current(view.current.z * Math.exp(-e.deltaY * .0016), e.clientX, e.clientY); };
      el.addEventListener('wheel', wheel, { passive: false });
      return () => { el.removeEventListener('wheel', wheel); prev && prev.focus && prev.focus({ preventScroll: true }); };
    }, []);
    const zoomRef = useRef(zoomTo), canZoomRef = useRef(canZoom), keyRef = useRef(); zoomRef.current = zoomTo; canZoomRef.current = canZoom;
    keyRef.current = e => {
      e.stopImmediatePropagation();
      const v = view.current, k = e.key;
      if (k === 'Escape') { e.preventDefault(); close(); }
      else if (k === 'Tab') { const f = [...root.current.querySelectorAll('button,input')], a = f[0], b = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); } else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); } }
      else if (k === '+' || k === '=') zoomTo(v.z * 1.3); else if (k === '-') zoomTo(v.z / 1.3); else if (k === '0') zoomTo(1);
      else if (k.startsWith('Arrow') && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); if (v.z > 1) { v.x += k === 'ArrowLeft' ? 60 : k === 'ArrowRight' ? -60 : 0; v.y += k === 'ArrowUp' ? 60 : k === 'ArrowDown' ? -60 : 0; limit(); apply(); } else if (items.length > 1 && k === 'ArrowLeft') go(-1); else if (items.length > 1 && k === 'ArrowRight') go(1); }
    };
    useEffect(() => { const f = e => keyRef.current(e); addEventListener('keydown', f, true); return () => removeEventListener('keydown', f, true); }, []);
    const setCutAt = x => { const b = stage.current.getBoundingClientRect(); setCut(Math.max(0, Math.min(100, (x - b.left) / b.width * 100))); };
    const down = e => { ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); e.currentTarget.setPointerCapture(e.pointerId); stage.current.classList.add('live'); gest.current = { moved: false, sx: e.clientX, sy: e.clientY, onBack: e.target === e.currentTarget, d: 0 }; if (ptrs.current.size === 1 && img.compare && view.current.z === 1 && !gest.current.onBack) setCutAt(e.clientX); };
    const moveP = e => { const P = ptrs.current; if (!P.has(e.pointerId)) return; const old = P.get(e.pointerId), v = view.current, g = gest.current; P.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (Math.hypot(e.clientX - g.sx, e.clientY - g.sy) > 6) g.moved = true;
      if (P.size === 2) { const [a, b] = [...P.values()], dist = Math.hypot(a.x - b.x, a.y - b.y); if (g.d) zoomTo(v.z * dist / g.d, (a.x + b.x) / 2, (a.y + b.y) / 2); g.d = dist; g.moved = true; return; }
      if (v.z > 1) { v.x += e.clientX - old.x; v.y += e.clientY - old.y; limit(); apply(); } else if (img.compare && !g.onBack) setCutAt(e.clientX); };
    const up = e => { const g = gest.current; ptrs.current.delete(e.pointerId); if (!ptrs.current.size) { stage.current && stage.current.classList.remove('live'); if (g && g.onBack && !g.moved) close(); } };
    const fitImg = { ...img, ratio: undefined, caption: undefined, position: undefined, alt: img.alt || img.caption };
    return ReactDOM.createPortal(html`<div ref=${root} className=${'viewer' + (closing ? ' out' : '')} role="dialog" aria-modal="true" aria-label=${img.alt || img.caption || 'Image viewer'}>
      <div className="v-area" onPointerDown=${down} onPointerMove=${moveP} onPointerUp=${up} onPointerCancel=${up} onDoubleClick=${e => { if (canZoom && !img.compare) zoomTo(view.current.z > 1.05 ? 1 : Math.min(2.2, maxZ), e.clientX, e.clientY); }}>
        <div ref=${wrap} className=${'v-wrap' + (img.cutout ? ' cut' : '')} style=${{ width: bw, height: bh, marginTop: img.compare ? -30 : -10 }}>
          <div ref=${stage} className=${'v-stage' + (zoom > 1 ? ' zoomed' : '')} key=${i}>
            <${Fig} img=${fitImg} eager=${true} />
            ${img.compare && html`<div className="v-before" style=${{ clipPath: `inset(0 ${100 - cut}% 0 0)` }}><img src=${img.compare} alt=${img.compareAlt || ''} draggable=${false} /></div>
              <div className="v-line" style=${{ left: cut + '%' }} aria-hidden="true"><i></i></div>`}
          </div>
        </div>
      </div>
      <div className="v-bar">
        <div className="v-info">${items.length > 1 && html`<span className="v-count">${i + 1} / ${items.length}</span>`}${img.caption && html`<span className="v-cap">${img.caption}</span>`}</div>
        ${img.compare && html`<label className="v-compare"><span>${img.compareLabels[0]}</span><input type="range" min="0" max="100" value=${Math.round(cut)} aria-label="Compare the two plans" onInput=${e => setCut(+e.target.value)} onChange=${e => setCut(+e.target.value)} /><span>${img.compareLabels[1]}</span></label>`}
        <div className="v-ctl">
          ${items.length > 1 && html`<button aria-label="Previous image" onClick=${() => go(-1)}>←</button><button aria-label="Next image" onClick=${() => go(1)}>→</button>`}
          ${canZoom && html`<button aria-label="Zoom out" disabled=${zoom <= 1} onClick=${() => zoomTo(zoom / 1.45)}>−</button><button aria-label="Zoom in" disabled=${zoom >= maxZ} onClick=${() => zoomTo(zoom * 1.45)}>+</button>`}
        </div>
      </div>
      <button className="close v-close" onClick=${close}>Close<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none"/></svg></button>
    </div>`, document.body);
  }

  /* ---- biophilic design: branches, trees and sunlight drawn around the words ---- */
  const LEAF = ['#5F6B3F', '#74804C', '#8A9460', '#4E5A36', '#A3A66B', '#B79A4E'];
  function Bough({ a, c, b, n, size, seed }) {
    let s = seed; const R = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }, out = [];
    const pt = t => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
    for (let i = 0; i < n; i++) { const t = .05 + i / n * .95, [x, y] = pt(t), [x2, y2] = pt(Math.min(1, t + .02)), side = i % 2 ? 1 : -1, ang = Math.atan2(y2 - y, x2 - x) * 57.3 + side * (32 + R() * 30), L = size * (1 - t * .42) * (.8 + R() * .4), w = L * (.24 + R() * .08);
      out.push(html`<path key=${i} d=${`M0 0C${L * .3} ${-w} ${L * .72} ${-w} ${L} 0C${L * .72} ${w} ${L * .3} ${w} 0 0Z`} fill=${LEAF[Math.floor(R() * R() * LEAF.length)]} opacity=${(.82 + R() * .18).toFixed(2)} transform=${`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})`} />`); }
    return html`<g><path d=${`M${a[0]} ${a[1]}Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`} fill="none" stroke="#5B4A36" stroke-width="3.2" stroke-linecap="round" />${out}</g>`;
  }
  const CANOPY = [
    { a: [-20, 40], c: [260, 60], b: [560, 230], n: 34, size: 62, seed: 11 }, { a: [-20, 150], c: [170, 210], b: [370, 400], n: 26, size: 56, seed: 29 },
    { a: [90, -20], c: [240, 110], b: [430, 110], n: 20, size: 48, seed: 47 }, { a: [-20, 280], c: [70, 330], b: [160, 480], n: 16, size: 48, seed: 67 }
  ];
  const Canopy = () => html`<svg viewBox="0 0 600 500" aria-hidden="true">${CANOPY.map((b, i) => html`<${Bough} key=${i} ...${b} />`)}</svg>`;
  const Trunks = () => html`<svg viewBox="0 0 300 1000" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="bk" x1="0" x2="1"><stop offset="0" stop-color="#4F4032" /><stop offset=".6" stop-color="#6F5C47" /><stop offset="1" stop-color="#8B765B" /></linearGradient></defs>
    <path d="M0 0H118C110 260 150 620 126 1000H0Z" fill="url(#bk)" />
    <path d="M166 0H212C206 240 244 660 226 1000H176C192 620 158 300 166 0Z" fill="url(#bk)" opacity=".62" />
    <g fill="none" stroke="#3F3327" stroke-opacity=".38" stroke-width="2"><path d="M34 0C24 300 60 650 40 1000" /><path d="M72 0C66 280 100 640 86 1000" /><path d="M16 120C22 360 8 720 18 1000" /></g>
  </svg>`;
  function NatureScene() {
    return html`<div className="bio-scene" aria-hidden="true">
      <div className="bio-sun"></div>
      ${[8, 26, 46, 66, 84].map((l, i) => html`<i key=${i} className="ray" style=${{ left: l + '%', animationDelay: i * -2.3 + 's' }}></i>`)}
      <div className="bio-trees left"><${Trunks} /></div><div className="bio-trees right"><${Trunks} /></div>
      <div className="bio-veil"></div>
      <div className="bough tl"><div className="sway"><${Canopy} /></div></div>
      <div className="bough tr"><div className="sway slow"><${Canopy} /></div></div>
      <div className="bough bl"><div className="sway slow"><${Canopy} /></div></div>
      <div className="bough br"><div className="sway"><${Canopy} /></div></div>
    </div>`;
  }

  /* ---- Looking Ahead: a forged horseshoe turning slowly ---- */
  const NAILS = [[40, 58, 90], [40, 86, 90], [45.6, 135.4, 245], [65.6, 159.1, 215], [160, 58, 90], [160, 86, 90], [154.4, 135.4, 115], [134.4, 159.1, 145]];
  const Horseshoe = () => html`<div className="shoe" role="img" aria-label="A horseshoe turning slowly">
    <div className="shoe-spin"><svg viewBox="0 0 200 210" aria-hidden="true">
      <defs>
        <linearGradient id="iron" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8E877D" /><stop offset=".35" stop-color="#C9C1B3" /><stop offset=".55" stop-color="#6E685F" /><stop offset="1" stop-color="#3C3833" /></linearGradient>
        <linearGradient id="ironEdge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F2B27" /><stop offset="1" stop-color="#1D1A17" /></linearGradient>
      </defs>
      <path d="M40 28V110A60 60 0 0 0 160 110V28" fill="none" stroke="url(#ironEdge)" stroke-width="38" />
      <path d="M40 30V110A60 60 0 0 0 160 110V30" fill="none" stroke="url(#iron)" stroke-width="33" />
      <path d="M40 40V110A60 60 0 0 0 160 110V40" fill="none" stroke="#3A3530" stroke-opacity=".55" stroke-width="5" />
      <rect x="20" y="22" width="40" height="11" rx="2" fill="#4A453F" /><rect x="140" y="22" width="40" height="11" rx="2" fill="#4A453F" />
      ${NAILS.map(([x, y, r], i) => html`<rect key=${i} x="-4.5" y="-2.4" width="9" height="4.8" rx="1" fill="#1F1C19" transform=${`translate(${x} ${y}) rotate(${r})`} />`)}
    </svg></div>
    <i className="shoe-shadow"></i>
  </div>`;

  /* ---- philosophy: one thought at a time, every thought one click away ---- */
  function Leaves({ body, base }) {
    const editing = useContext(Edit), [at, setAt] = useState(0);
    return html`<div className="leaves r4">
      <div className="leaf-stack">${body.map((t, i) => html`<div key=${i} className=${'leaf' + (i === at || editing ? ' on' : '')} aria-hidden=${i !== at && !editing}><${T} p=${`${base}.body.${i}`} as="p" /></div>`)}</div>
      <div className="leaf-nav">
        <div className="leaf-nums">${body.map((t, i) => html`<button key=${i} className=${i === at ? 'on' : ''} aria-current=${i === at} aria-label=${'Passage ' + (i + 1) + ' of ' + body.length} onClick=${() => setAt(i)}>${String(i + 1).padStart(2, '0')}</button>`)}</div>
        <button className="leaf-next" onClick=${() => setAt((at + 1) % body.length)}>${at === body.length - 1 ? 'Start again' : 'Continue'}<span aria-hidden="true"> →</span></button>
      </div>
    </div>`;
  }

  /* ---- contact: tap to call or write, or copy with one click ---- */
  function CopyRow({ label, value, href }) {
    const [done, setDone] = useState(false);
    const copy = () => { const ok = () => { setDone(true); setTimeout(() => setDone(false), 1800); }; if (navigator.clipboard) navigator.clipboard.writeText(value).then(ok, () => {}); };
    return html`<div className="copy-row"><dt>${label}</dt><dd><a href=${href}>${value}</a><button className="copy-btn" onClick=${copy} aria-label=${'Copy ' + label.toLowerCase()}>${done ? 'Copied' : 'Copy'}</button></dd></div>`;
  }

  /* ---- modal behaviour: focus, Escape, tab trap ---- */
  function useModal(ref, onClose) {
    useEffect(() => {
      const prev = document.activeElement, el = ref.current;
      const q = el && el.querySelector('.close'); q && q.focus({ preventScroll: true });
      const onKey = e => {
        if (document.querySelector('.viewer')) return;
        if (e.key === 'Escape') { if (document.activeElement && document.activeElement.isContentEditable) { document.activeElement.blur(); return; } onClose(); }
        if (e.key === 'Tab' && el) {
          const f = [...el.querySelectorAll('button,a[href],[contenteditable]')]; if (!f.length) return;
          const a = f[0], b = f[f.length - 1];
          if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
          else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
        }
      };
      addEventListener('keydown', onKey);
      return () => { removeEventListener('keydown', onKey); prev && prev.focus && prev.focus({ preventScroll: true }); };
    }, []);
  }

  /* ---- information panel: a page from a publication ---- */
  function Panel({ id, closing, onClose }) {
    const ref = useRef(); useModal(ref, onClose);
    const isContact = CFG.panels[id].kind === 'contact';
    const P = isContact ? CFG.contact : CFG.panels[id], base = isContact ? 'contact' : 'panels.' + id;
    const gallery = [P.image, P.portrait, ...(P.uploads || [])].filter(Boolean).map((img, i) => ({ img, id: id + '-' + i }));
    const steps = (P.steps || []).map((st, i) => ({ img: st.image, id: id + '-step-' + i }));
    const all = steps.length ? steps : gallery;
    const [view, setView] = useState(null), [active, setActive] = useState(0);
    const open = (cid, rect) => { const items = all.filter(x => (P.plain || turned.has(x.id)) && !x.img.slot), start = items.findIndex(x => x.id === cid); if (start >= 0) setView({ items, start, rect }); };
    useEffect(() => {
      const root = ref.current;
      const rows = [...root.querySelectorAll('.step')];
      const track = rows.length && window.IntersectionObserver && new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActive(rows.indexOf(e.target)); }), { root, rootMargin: '-45% 0px -45% 0px' });
      if (track) rows.forEach(r => track.observe(r));
      return () => { track && track.disconnect(); };
    }, []);
    const jump = i => { const row = ref.current.querySelectorAll('.step')[i]; row && row.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'center' }); };
    const head = html`<${T} p=${base + '.eyebrow'} as="p" className="eyebrow r1" />
      <h2 id="pt" className="r2"><${T} p=${base + '.title'} /></h2>
      ${P.lede && html`<${T} p=${base + '.lede'} as="p" className="lede r3" />`}`;
    const closingText = P.closing && html`<div className="page-text rv"><${T} p=${`${base}.closing.0`} as="p" /></div>`;
    const bodyEl = P.body && (P.mode === 'leaves' ? html`<${Leaves} body=${P.body} base=${base} />` :
      html`<div className=${'page-text r4' + (P.mode ? ' ' + P.mode : '')}>${P.body.map((t, i) => html`<${T} key=${i} p=${`${base}.body.${i}`} as="p" />`)}</div>`);
    return html`<div className=${'scrim' + (closing ? ' out' : '')}>
      <article ref=${ref} className=${'page' + (P.nature ? ' nature' : '')} role="dialog" aria-modal="true" aria-labelledby="pt">
        <button className="close" onClick=${onClose}>Close<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none"/></svg></button>
        ${P.nature && html`<${NatureScene} />`}
        ${P.steps ? html`<div className="page-steps">
          <header className="copy">${head}</header>
          <nav className="rail" aria-label="Design process steps">${P.steps.map((st, i) => html`<button key=${i} className=${active === i ? 'on' : ''} aria-current=${active === i ? 'step' : null} onClick=${() => jump(i)}><b>${String(i + 1).padStart(2, '0')}</b><span>${st.title}</span></button>`)}</nav>
          <ol className="steps">${P.steps.map((st, i) => html`<li key=${i} className="step rv">
            <div className="step-text"><span className="step-num">${String(i + 1).padStart(2, '0')}</span>
              <${T} p=${`${base}.steps.${i}.title`} as="h3" /><${T} p=${`${base}.steps.${i}.text`} as="p" /></div>
            <${Flip} img=${st.image} id=${steps[i].id} onOpen=${open} plain=${P.plain} /></li>`)}</ol>
          ${closingText}
        </div>` : html`<div className=${'spread-page' + (gallery.length === 1 || P.horseshoe ? ' single' : '') + (!gallery.length && !P.horseshoe ? ' solo' : '')}>
          <div className="copy">
            ${head}
            ${bodyEl}
            ${P.sections && html`<div className="sects r4">${P.sections.map((x, i) => html`<section key=${i} className="sect"><h3>${x.label}</h3><${T} p=${`${base}.sections.${i}.text`} as="p" /></section>`)}</div>`}
            ${closingText}
            ${P.facts && html`<dl className="details stagger r4">${P.facts.map((f, i) => html`<div key=${i}><dt>${f[0]}</dt><${T} p=${`${base}.facts.${i}.1`} as="dd" /></div>`)}</dl>`}
            ${isContact && html`<dl className="details stagger r4">
              <div><dt>Name</dt><${T} p="contact.name" as="dd" /></div>
              <${CopyRow} label="Phone" value=${P.phone} href=${'tel:' + P.phoneLink} />
              <${CopyRow} label="Email" value=${P.email} href=${'mailto:' + P.email} />
              <div><dt>Based in</dt><${T} p="contact.location" as="dd" /></div>
            </dl>`}
          </div>
          ${P.horseshoe && html`<div className="gallery one shoe-wrap"><${Horseshoe} /></div>`}
          ${gallery.length > 0 && html`<div className=${'gallery' + (gallery.length === 1 ? ' one' : '')}>${gallery.map(x => html`<div key=${x.id} className=${'rv g-item' + (x.img.wide ? ' wide' : '')}><${Flip} img=${x.img} id=${x.id} onOpen=${open} plain=${P.plain} /></div>`)}</div>`}
        </div>`}
        ${view && html`<${Viewer} items=${view.items} start=${view.start} rect=${view.rect} onClose=${() => setView(null)} />`}
      </article>
    </div>`;
  }

  /* ---- project folio: an architectural editorial spread ---- */
  const FIGS = [['researchImages', 'Research'], ['floorPlans', 'Floor plans'], ['elevations', 'Elevations'], ['moodBoards', 'Mood boards'], ['renderings', 'Renderings'], ['technical', 'Technical drawings'], ['finalImages', 'Final presentation']];
  function Figures({ list }) {
    return html`<div className="figs">${list.map((f, i) => html`<${Fig} key=${i} img=${f} className=${f.wide ? 'wide' : ''} />`)}</div>`;
  }
  function Folio({ index, backTo, onClose, onOpen }) {
    const ref = useRef(), P = CFG.projects[index], base = 'projects.' + index, scroller = useRef();
    useModal(ref, onClose);
    useEffect(() => { scroller.current && (scroller.current.scrollTop = 0); }, [index]);
    const has = k => P[k] && P[k].length;
    const sec = (k, n) => has(k) && html`<section className="spread" id=${'s-' + k}><h3 className="sec">${n}</h3><${Figures} list=${P[k]} /></section>`;
    const toc = [['description', 'Description'], ['concept', 'Concept'], ['research', 'Research'], ['floorPlans', 'Floor plans'], ['elevations', 'Elevations'], ['materials', 'Materials'], ['moodBoards', 'Mood boards'], ['renderings', 'Renderings'], ['technical', 'Technical'], ['finalImages', 'Final images'], ['process', 'Process'], ['reflection', 'Reflection']].filter(([k]) => P[k] && P[k].length);
    const jump = k => { const el = ref.current.querySelector('#s-' + k); el && el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); };
    const next = (index + 1) % CFG.projects.length;
    return html`<div ref=${ref} className="folio" role="dialog" aria-modal="true" aria-labelledby="ft">
      <button className="close" onClick=${onClose}>Back to the ${backTo}<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" fill="none"/></svg></button>
      <div className="folio-scroll" ref=${scroller}>
        <header className="folio-hero">
          <${Fig} img=${P.hero} className="hero-img" eager=${true} />
          <div className="folio-title">
            <p className="eyebrow">Project ${index + 1} of ${CFG.projects.length} · ${P.object}</p>
            <h2 id="ft"><${T} p=${base + '.title'} /></h2>
            <${T} p=${base + '.subtitle'} as="p" className="lede" />
            <dl className="facts">${P.facts.map((f, i) => html`<div key=${i}><dt>${f[0]}</dt><${T} p=${`${base}.facts.${i}.1`} as="dd" /></div>`)}</dl>
          </div>
        </header>
        <div className="folio-grid">
          <nav className="toc" aria-label="Project sections">${toc.map(([k, n]) => html`<button key=${k} onClick=${() => jump(k)}>${n}</button>`)}</nav>
          <div className="folio-main">
            <section className="spread text" id="s-description"><h3 className="sec">Description</h3><${T} p=${base + '.description'} as="p" className="big" /></section>
            <section className="spread text" id="s-concept"><h3 className="sec">Design concept</h3><${T} p=${base + '.conceptQuote'} as="blockquote" /><${T} p=${base + '.concept'} as="p" /></section>
            <section className="spread text" id="s-research"><h3 className="sec">Research</h3><${T} p=${base + '.research'} as="p" />${has('researchImages') && html`<${Figures} list=${P.researchImages} />`}</section>
            ${sec('floorPlans', 'Floor plans')}
            ${sec('elevations', 'Elevations')}
            <section className="spread" id="s-materials"><h3 className="sec">Material selections</h3>
              <div className="swatches">${P.materials.map((m, i) => html`<div key=${i} className="swatch">
                <div className="chip" style=${m.src ? { backgroundImage: `url(${m.src})`, backgroundSize: 'cover' } : { background: m.color }}></div>
                <${T} p=${`${base}.materials.${i}.name`} as="h4" /><${T} p=${`${base}.materials.${i}.note`} as="p" /></div>`)}</div>
            </section>
            ${sec('moodBoards', 'Mood boards')}
            ${sec('renderings', 'Renderings')}
            ${sec('technical', 'Technical drawings')}
            ${sec('finalImages', 'Final presentation')}
            <section className="spread" id="s-process"><h3 className="sec">Design process</h3>
              <ol className="process">${P.process.map((s, i) => html`<li key=${i}><${T} p=${`${base}.process.${i}.stage`} as="h4" /><${T} p=${`${base}.process.${i}.text`} as="p" /></li>`)}</ol>
            </section>
            <section className="spread text" id="s-reflection"><h3 className="sec">Reflection</h3><${T} p=${base + '.reflection'} as="p" className="big" /></section>
            <button className="next-proj" onClick=${() => onOpen(next)}><span className="eyebrow">Next project</span><span className="np">${CFG.projects[next].title}</span></button>
          </div>
        </div>
      </div>
    </div>`;
  }

  /* ---- hotspot layer: outlines in photo space + small markers ---- */
  function Hotspots({ scene, engine, editing, onHover, hover, onAct, moved, tour }) {
    /* keep a showing label inside the window */
    useEffect(() => { if (!wrapRef.current) return; [...wrapRef.current.querySelectorAll(".mk")].forEach(m => { const s = m.querySelector("span"); s.style.setProperty("--nx", "0px"); if (!m.classList.contains("tell") && !m.classList.contains("on")) return; const b = s.getBoundingClientRect(), half = b.width / 2, cx = m.getBoundingClientRect().left + m.offsetWidth / 2, left = cx - half, right = cx + half; s.style.setProperty("--nx", (left < 10 ? 10 - left : right > innerWidth - 10 ? innerWidth - 10 - right : 0) + "px"); }); }, [tour, hover]);
    const svg = useRef(), wrap = useRef(), wrapRef = wrap, sc = CFG.scenes[scene];
    useEffect(() => {
      let on = true;
      engine.onFrame(() => { if (!on) return;
        const m = engine.matrix(); if (m && svg.current) svg.current.style.transform = `matrix(${m.s},0,0,${m.s},${m.tx},${m.ty})`;
        if (wrap.current) [...wrap.current.children].forEach((el, i) => { const h = sc.hotspots[i]; if (!h) return; const p = engine.project(h.marker[0], h.marker[1]); el.style.transform = `translate3d(${p.x}px,${p.y}px,0)`; });
      });
      return () => { on = false; };
    }, [scene]);
    return html`<div className="hot">
      <svg ref=${svg} className=${'poly' + (editing ? ' show' : '')} width=${sc.size[0]} height=${sc.size[1]} aria-hidden="true">
        ${sc.hotspots.map(h => h.shapes.map((s, i) => html`<polygon key=${h.id + i} points=${s.map(p => p.join(',')).join(' ')}
          onPointerEnter=${e => e.pointerType !== 'touch' && onHover(h)} onPointerLeave=${() => onHover(null)}
          onClick=${() => { if (!moved.current) onAct(h); }} />`))}
      </svg>
      <div ref=${wrap} className="markers">
        ${sc.hotspots.map((h, hi) => html`<button key=${h.id} className=${'mk' + (h.exit ? ' exit' : '') + (hover === h.id ? ' on' : '') + (tour === hi ? ' tell' : '')} aria-label=${h.label}
          onClick=${() => onAct(h)} onFocus=${e => { if (e.target.matches(':focus-visible')) { onHover(h); engine.panTo(h.marker[0], h.marker[1]); } }} onBlur=${() => onHover(null)}
          onPointerEnter=${() => onHover(h)} onPointerLeave=${() => onHover(null)}>
          <i></i><span>${h.label}</span></button>`)}
      </div>
    </div>`;
  }

  /* ---- future project horses: only those given a project and an outline appear ---- */
  (CFG.scenes.stable.projectHorses || []).forEach(h => {
    if (h.project != null && h.shapes && h.shapes.length) CFG.scenes.stable.hotspots.push({ ...h, action: { project: h.project } });
  });

  /* ---- application ---- */
  function App() {
    const order = CFG.order, fromHash = () => { const h = location.hash.slice(1); return order.includes(h) ? h : null; };
    const [scene, setScene] = useState(fromHash() || order[0]);
    const [ready, setReady] = useState(false), [busy, setBusy] = useState(false), [failed, setFailed] = useState(false);
    const [panel, setPanel] = useState(null), [project, setProject] = useState(null);
    const [hover, setHover] = useState(null), [room, setRoom] = useState(false);
    const [editing, setEditing] = useState(location.hash === '#edit');
    const [coords, setCoords] = useState([0, 0]), [copied, setCopied] = useState(''), [resetAsk, setResetAsk] = useState(false);
    const [welcome, setWelcome] = useState(false); const osReduced = matchMedia('(prefers-reduced-motion: reduce)').matches; const [motionOff, setMotionOff] = useState(osReduced); const [info, setInfo] = useState('');
    useEffect(() => { if (!editing) return; const t = setInterval(() => engine.current && setInfo(engine.current.info()), 1000); return () => clearInterval(t); }, [editing]);
    const engine = useRef(null), canvas = useRef(null), moved = useRef(false), drag = useRef(null), sceneRef = useRef(scene), busyRef = useRef(false);
    sceneRef.current = scene;
    const audio = useRef(null); if (!audio.current) audio.current = window.__audio = window.createAudio(CFG);
    const [soundOn, setSoundOn] = useState(true);
    /* sound is on from the start; browsers only allow it to begin at the first click, tap or key */
    useEffect(() => { audio.current.set(true, sceneRef.current); const go = () => audio.current.unlock(), ev = ['pointerdown', 'keydown', 'touchend']; ev.forEach(n => addEventListener(n, go, true)); return () => ev.forEach(n => removeEventListener(n, go, true)); }, []);
    const [closing, setClosing] = useState(false), [introOpen, setIntroOpen] = useState(false);
    const closeTimer = useRef(null), panelRef = useRef(null); panelRef.current = panel;

    useEffect(() => {
      const e = engine.current = window.createEngine(canvas.current, CFG, window.ATMOSPHERE);
      window.__engine = e;
      e.show(scene).then(() => {
        setReady(true);
        setTimeout(() => setWelcome(true), e.reduced ? 0 : 900);
        order.reduce((p, id) => p.then(() => e.load(id)).catch(() => {}), Promise.resolve());
      }).catch(() => setFailed(true));
    }, []);

    const travel = useCallback((to, exit) => {
      const e = engine.current;
      if (!e || busyRef.current || to === sceneRef.current) return;
      if (!exit) { const h = CFG.scenes[sceneRef.current].hotspots.find(x => x.action.go === to); if (h) exit = { focus: h.marker }; }
      busyRef.current = true; setBusy(true); audio.current.scene(to); clearTimeout(closeTimer.current); closeTimer.current = null; setClosing(false); setIntroOpen(false); setPanel(null); setProject(null); setRoom(false); setHover(null); setWelcome(false);
      e.setHover(null);
      e.go(to, exit).then(() => { setScene(to); sceneRef.current = to; busyRef.current = false; setBusy(false);
        if (to === order[0]) setTimeout(() => setWelcome(true), 700);
        try { history.replaceState(null, '', '#' + to); } catch (err) {} });
    }, []);

    useEffect(() => { const f = () => { const h = fromHash(); if (location.hash === '#edit') setEditing(true); if (h && h !== sceneRef.current) travel(h); };
      addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);

    const act = useCallback(h => {
      const a = h.action, e = engine.current;
      if (busyRef.current) return;
      setExplored(true);
      if (a.go) { audio.current.sfx(h.sound); return travel(a.go, { focus: h.marker }); }
      setRoom(false); setHover(null);
      e.setHover(null);
      if (a.panel) setPanel(a.panel); else if (a.project != null) setProject(a.project);
    }, []);
    const closeAll = useCallback(() => {
      setProject(null);
      if (!panelRef.current || closeTimer.current) return;
      setClosing(true);
      closeTimer.current = setTimeout(() => { closeTimer.current = null; setPanel(null); setClosing(false); }, osReduced ? 0 : 1000);
    }, []);
    const hov = useCallback(h => { setHover(h ? h.id : null); engine.current && engine.current.setHover(h); }, []);

    /* keyboard: E toggles Edit mode when allowed, arrows walk the sequence */
    useEffect(() => { const f = e => {
      const t = e.target; if (t.isContentEditable || panelOpenRef.current) return;
      const i = order.indexOf(sceneRef.current);
      if (e.key === 'ArrowRight' && i < order.length - 1) travel(order[i + 1]);
      if (e.key === 'ArrowLeft' && i > 0) travel(order[i - 1]);
    }; addEventListener('keydown', f); return () => removeEventListener('keydown', f); }, []);
    /* hold the room still under an open popup so the fade stays smooth */
    useEffect(() => { if (engine.current) engine.current.paused = !!panel && !closing; }, [panel, closing]);
    /* decode popup photographs ahead of time so they never stall a fade */
    useEffect(() => { if (!ready) return; const list = []; Object.values(CFG.panels).forEach(p => [p.image, p.portrait, ...(p.uploads || []), ...(p.steps || []).map(s => s.image)].forEach(i => { if (i && i.src) list.push(i.src); }));
      let n = 0, on = true; const next = () => { if (!on || n >= list.length) return; const i = new Image(); i.src = list[n++]; (i.decode ? i.decode() : Promise.resolve()).catch(() => {}).then(() => setTimeout(next, 120)); }; const t = setTimeout(next, 2500); return () => { on = false; clearTimeout(t); }; }, [ready]);
    /* on a first visit to a room, each spot names itself in turn */
    const [tour, setTour] = useState(-1), [explored, setExplored] = useState(false), toured = useRef(new Set());
    useEffect(() => { if (!ready || busy || toured.current.has(scene)) return; toured.current.add(scene); const n = CFG.scenes[scene].hotspots.length; let i = 0, tick; const start = setTimeout(() => { setTour(0); tick = setInterval(() => { i++; if (i >= n) { clearInterval(tick); setTour(-1); } else setTour(i); }, 1900); }, 1100); return () => { clearTimeout(start); clearInterval(tick); setTour(-1); }; }, [ready, busy, scene]);
    const panelOpenRef = useRef(false); panelOpenRef.current = !!(panel || project != null);

    const onDown = e => { moved.current = false; drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId }; };
    const onMove = e => {
      const E = engine.current; if (!E) return;
      if (e.pointerType !== 'touch') E.pointer(e.clientX, e.clientY);
      if (editing) setCoords(E.unproject(e.clientX, e.clientY));
      const d = drag.current;
      if (d && e.pointerType === 'touch') { const dx = e.clientX - d.x, dy = e.clientY - d.y; if (moved.current || Math.hypot(dx, dy) > 8) { moved.current = true; E.pan(dx, dy); d.x = e.clientX; d.y = e.clientY; } }
    };
    const onUp = () => { drag.current = null; };

    const copyEdits = () => { const txt = JSON.stringify(edits, null, 2), ok = () => { setCopied('Copied. Paste this into our chat to make it permanent.'); setTimeout(() => setCopied(''), 5000); };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(ok, () => setCopied(txt)); else setCopied(txt); };
    const resetEdits = () => { if (!resetAsk) { setResetAsk(true); return; } edits = {}; store({}); try { location.reload(); } catch (e) {} };

    const sc = CFG.scenes[scene], idx = order.indexOf(scene);
    const goNext = () => { if (busyRef.current) return; const to = order[idx + 1] || order[0], h = sc.hotspots.find(x => x.action.go === to); if (h) { audio.current.sfx(h.sound); travel(to, { focus: h.marker }); } else travel(to); };
    const uiOn = ready && !busy;
    return html`<${Edit.Provider} value=${editing}>
      <main className=${'stage' + (ready ? ' ready' : '')} onPointerDown=${onDown} onPointerMove=${onMove} onPointerUp=${onUp} onPointerCancel=${onUp}
        onPointerLeave=${() => engine.current && engine.current.resetPointer()}>
        <div className="frame"><canvas ref=${canvas} aria-label=${sc.label + ' of the Western farmhouse'}></canvas>
        <div className="scrim-b" aria-hidden="true"></div>
        ${uiOn && html`<${Hotspots} key=${scene} scene=${scene} engine=${engine.current} editing=${editing} hover=${hover} onHover=${hov} onAct=${act} moved=${moved} tour=${tour} />`}
        </div>
      </main>

      <div className=${'chrome' + (uiOn && (!panel || closing) && project == null ? ' on' : '')}>
        ${scene === order[0] && sc.welcome && html`<div className=${'welcome' + (welcome && !busy ? ' in' : '')}>
          <h1><${T} p=${`scenes.${scene}.welcome.title`} /></h1><${T} p=${`scenes.${scene}.welcome.line`} as="p" /></div>`}
        <button className="contact-corner" onClick=${() => setPanel('contact')}>Contact Me</button>
        <div className=${'caption' + (sc.captionTop ? ' top' : '') + (sc.introText || sc.introPanel || sc.shade ? ' rich' : '')} key=${scene}>
          <${T} p=${`scenes.${scene}.caption`} as="h2" />
          ${!explored && html`<p className="way-hint"><span className="for-mouse">Click a dot to explore</span><span className="for-touch">Tap a dot to explore</span></p>`}
          <button className="link next-room" onClick=${goNext}>${idx < order.length - 1 ? "Next: " + CFG.scenes[order[idx + 1]].label : "Back to the start"}<span aria-hidden="true"> →</span></button>
        </div>
        <nav className="prog" aria-label="Rooms">
          <span className="count" aria-hidden="true">${String(idx + 1).padStart(2, '0')}<em> / ${String(order.length).padStart(2, '0')}</em></span>
          <ol>${order.map((id, i) => html`<li key=${id}><button aria-label=${CFG.scenes[id].label} aria-current=${id === scene ? 'page' : null} className=${i <= idx ? 'past' : ''} onClick=${() => travel(id)}><i></i><span>${CFG.scenes[id].label}</span></button></li>`)}</ol>
          <button className="edit-t" aria-pressed=${soundOn} onClick=${() => setSoundOn(audio.current.set(!soundOn, sceneRef.current))}>${soundOn ? 'Sound on' : 'Sound off'}</button>
          ${osReduced && html`<button className="edit-t" onClick=${() => { engine.current.setMotion(motionOff); setMotionOff(!motionOff); }}>${motionOff ? 'Turn on motion' : 'Reduce motion'}</button>`}
          ${CFG.site.showEditButton && html`<button className="edit-t" aria-pressed=${editing} onClick=${() => setEditing(!editing)}>${editing ? 'Done' : 'Edit'}</button>`}
        </nav>
      </div>

      ${editing && html`<div className="editbar" role="status">
        <span>Edit mode. Click any text to rewrite it. Hotspot outlines shown. Cursor at ${coords[0]}, ${coords[1]}. ${info}</span>
        <button onClick=${copyEdits}>Copy my edits</button><button onClick=${resetEdits}>${resetAsk ? 'Confirm reset' : 'Reset'}</button>
        ${copied && html`<span className="copied">${copied}</span>`}
      </div>`}

      ${panel && html`<${Panel} key=${panel} id=${panel} closing=${closing} onClose=${closeAll} onReturn=${() => travel(order[0])} />`}
      ${project != null && html`<${Folio} index=${project} backTo=${sc.label.toLowerCase()} onClose=${closeAll} onOpen=${setProject} />`}

      <div className=${'loader' + (ready ? ' done' : '')} aria-hidden=${ready}>
        ${failed ? html`<p>A photograph did not load. Please refresh the page.</p>` : html`<p className="l-name">${CFG.site.name}</p><i></i>`}
      </div>
    <//>`;
  }

  ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
})();

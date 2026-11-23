/* Shiyao Wu — personal logo (shīyao wu)
   Live type in ABC Monument Grotesk Medium (falls back to Inter). The i's mark is drawn as one
   rectangle so it can change between the font's i-dot and the first-tone bar of shī.
   Static: shīyao wu.
   Motion: only after the visitor leaves the mouse still for a while — the name hops as a wave,
   the tone bar jumps and lands as a dot (shiyao), then jumps again and lands back as the bar (shīyao).
   Usage: any <a class="bar-name"> in the header is replaced by the logo. */
(function () {
  const IDLE_MS = 6000;        // how long the page must be still before the logo plays
  const REPEAT_MS = 12000;     // if it stays still, play again this often
  const L = { s: 0, h: 49.6, i: 106.8, y: 131.2, a: 180.0, o: 233.5, w: 310.8, u: 386.4 };
  const ORDER = ['s', 'h', 'i', 'y', 'a', 'o', 'w', 'u'], TRACK = -1;
  const ADV = { s: 49.6, h: 57.2, i: 24.4, y: 50.3, a: 53.5, o: 57.7, w: 75.6, u: 57.1 };   // advance widths
  // transform origins are given in the SVG's own units (view-box), which Safari, Chrome and Firefox all read the same way
  const DOT = { x: 111.1, y: -70.6, w: 11.8, h: 12.8 };     // Monument Grotesk Medium i-dot
  function DOT_CX() { return DOT.x + DOT.w / 2; }
  function DOT_CY() { return DOT.y + DOT.h / 2; }
  const SHAPE = { dot: { sx: 1, sy: 1, dy: 0 }, bar: { sx: 27.2 / 11.8, sy: 8.7 / 12.8, dy: 1.05 } };
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tf = (s, y = 0, kx = 1, ky = 1) => `translateY(${s.dy + y}px) scale(${s.sx * kx},${s.sy * ky})`;
  const logos = [];
  let busy = false;

  function el(tag, attrs, text) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }

  // The letter positions are measured from Monument Grotesk. If the font isn't available
  // (e.g. a visitor before the web licence is installed), keep the plain text name instead.
  const FONT = '500 100px "Monument Grotesk"';
  const ready = document.fonts && document.fonts.load ? document.fonts.load(FONT).then(() => document.fonts.check(FONT)).catch(() => false) : Promise.resolve(false);
  ready.then(ok => { if (ok) init(); });

  function init() {
  // one clip for the i's stem, shared by every logo on the page
  const defs = el('svg', { width: 0, height: 0, 'aria-hidden': 'true' });
  defs.style.position = 'absolute';
  defs.innerHTML = '<defs><clipPath id="sw-cut-stem" clipPathUnits="userSpaceOnUse"><rect x="-50" y="-53" width="200" height="120"/></clipPath></defs>';
  document.body.appendChild(defs);

  document.querySelectorAll('a.bar-name').forEach(a => {
    const svg = el('svg', { viewBox: '-2 -80 440 104', class: 'sw-logo', 'aria-hidden': 'true' });
    svg.style.cssText = "display:block;width:104px;height:auto;overflow:visible;fill:currentColor;font-family:'Monument Grotesk','Inter',-apple-system,sans-serif;font-weight:500";
    const letters = [];
    ORDER.forEach((ch, k) => {
      const x = L[ch] + k * TRACK;
      const t = el('text', { x, y: 0, 'font-size': 100, style: 'font-kerning:none' }, ch);
      if (ch === 'i') t.setAttribute('clip-path', 'url(#sw-cut-stem)');
      t.style.transformBox = 'view-box'; t.style.transformOrigin = `${x + ADV[ch] / 2}px 0px`;   // bottom centre of the letter
      svg.appendChild(t); letters.push(t);
    });
    const mark = el('rect', { x: DOT.x, y: DOT.y, width: DOT.w, height: DOT.h });
    mark.style.transformBox = 'view-box'; mark.style.transformOrigin = `${DOT_CX()}px ${DOT_CY()}px`;   // centre of the i-dot
    mark.style.transform = tf(SHAPE.bar);
    svg.appendChild(mark);
    a.textContent = ''; a.appendChild(svg);
    a.setAttribute('aria-label', 'Shiyao Wu — home');
    logos.push({ letters, mark });
  });
  if (!logos.length) return;

  function hop(h) {
    return [
      { offset: 0, transform: 'translateY(0px) scale(1,1)' },
      { offset: .14, transform: 'translateY(0px) scale(1.05,.93)', easing: 'cubic-bezier(.2,.6,.4,1)' },
      { offset: .45, transform: `translateY(${-h}px) scale(.97,1.05)`, easing: 'cubic-bezier(.5,0,.8,.6)' },
      { offset: .76, transform: 'translateY(0px) scale(1.06,.92)', easing: 'cubic-bezier(.2,.6,.4,1)' },
      { offset: .88, transform: `translateY(${-h * .14}px) scale(1,1)` },
      { offset: 1, transform: 'translateY(0px) scale(1,1)' }
    ];
  }
  function markJump(from, to) {
    const A = SHAPE[from], B = SHAPE[to];
    const mid = { sx: (A.sx + B.sx) / 2, sy: (A.sy + B.sy) / 2, dy: (A.dy + B.dy) / 2 };
    return [
      { offset: 0, transform: tf(A) },
      { offset: .12, transform: tf(A, 0, 1.12, .82), easing: 'cubic-bezier(.2,.6,.4,1)' },
      { offset: .4, transform: tf(A, -38, .9, 1.22), easing: 'cubic-bezier(.4,0,.7,.5)' },
      { offset: .56, transform: tf(mid, -26), easing: 'cubic-bezier(.4,0,.85,.6)' },
      { offset: .72, transform: tf(B, 0, 1.16, .72), easing: 'cubic-bezier(.2,.6,.4,1)' },
      { offset: .82, transform: tf(B, -5), easing: 'cubic-bezier(.5,0,.8,.6)' },
      { offset: .91, transform: tf(B, 0, 1.04, .94) },
      { offset: 1, transform: tf(B) }
    ];
  }
  // one jump of the whole name; resolves when it has landed
  function jump(from, to) {
    const all = [];
    logos.forEach(({ letters, mark }) => {
      letters.forEach((t, k) => {
        const delay = k * 55 + (k > 5 ? 70 : 0);
        all.push(t.animate(hop(k < 3 ? 12 : 10), { duration: 540, delay, fill: 'none' }));
      });
      all.push(mark.animate(markJump(from, to), { duration: 1150, delay: 80, fill: 'forwards' }));
    });
    return Promise.all(all.map(a => a.finished)).then(() => logos.forEach(({ mark }) => {
      mark.style.transform = tf(SHAPE[to]);
      mark.getAnimations().forEach(a => a.cancel());
    }));
  }
  function play() {
    if (busy || reduce || document.hidden) return;
    busy = true;
    jump('bar', 'dot')                                   // shīyao → shiyao
      .then(() => new Promise(r => setTimeout(r, 650)))
      .then(() => jump('dot', 'bar'))                    // shiyao → shīyao
      .finally(() => { busy = false; });
  }

  // play only when the page has been left still
  let idle = null;
  function arm(delay) { clearTimeout(idle); idle = setTimeout(() => { play(); arm(REPEAT_MS); }, delay); }
  ['mousemove', 'pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart'].forEach(ev =>
    addEventListener(ev, () => arm(IDLE_MS), { passive: true }));
  arm(IDLE_MS);
  }
})();

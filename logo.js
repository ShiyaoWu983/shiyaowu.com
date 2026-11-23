/* Shiyao Wu — personal logo (shīyao wu)
   Live type in Hanken Grotesk Medium (falls back to Inter). The i's mark is drawn as one
   rectangle so it can change between the font's i-dot and the first-tone bar of shī.
   Static: Shīyao Wu.
   Motion: hops as a wave on the same 8.4s beat as the intro text; the tone bar lands as a dot (shiyao)
   on one beat and back as the bar (shīyao) on the next.
   Usage: any <a class="bar-name"> in the header is replaced by the logo. */
(function () {
  const L = { s: 0, h: 49.6, i: 106.8, y: 131.2, a: 180.0, o: 233.5, w: 310.8, u: 386.4 };
  const ORDER = ['S', 'h', 'i', 'y', 'a', 'o', 'W', 'u'], TRACK = -1, WORD_GAP = 19.6;   // capital S and W; letters are measured and placed at run time
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

  // Letters are measured from the loaded font, so spacing always fits.
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(init);

  function init() {
  // one clip for the i's stem, shared by every logo on the page
  const defs = el('svg', { width: 0, height: 0, 'aria-hidden': 'true' });
  defs.style.position = 'absolute';
  defs.innerHTML = '<defs><clipPath id="sw-cut-stem" clipPathUnits="userSpaceOnUse"><rect x="-50" y="-53" width="60" height="120"/></clipPath></defs>';
  document.body.appendChild(defs);

  document.querySelectorAll('a.bar-name').forEach(a => {
    const svg = el('svg', { viewBox: '-2 -80 440 104', class: 'sw-logo', 'aria-hidden': 'true' });
    svg.style.cssText = "display:inline-block;vertical-align:-0.24em;height:1.04em;width:auto;overflow:visible;fill:currentColor;font-family:'Hanken Grotesk','Inter',-apple-system,sans-serif;font-weight:500";
    a.textContent = ''; a.appendChild(svg);
    // set each letter, measure its width in the real font, then place them one after another
    const letters = ORDER.map(ch => {
      const t = el('text', { x: 0, y: 0, 'font-size': 100, style: 'font-kerning:none' }, ch);
      if (ch === 'i') t.setAttribute('clip-path', 'url(#sw-cut-stem)');
      svg.appendChild(t); return t;
    });
    let x = 0, iX = 0, iW = 0;
    letters.forEach((t, k) => {
      const ch = ORDER[k], w = t.getComputedTextLength();
      if (ch === 'W') x += WORD_GAP;
      t.setAttribute('x', x);
      if (ch === 'i') { iX = x; iW = w; }
      t.style.transformBox = 'view-box'; t.style.transformOrigin = `${x + w / 2}px 0px`;   // bottom centre of the letter
      x += w + TRACK;
    });
    svg.setAttribute('viewBox', `-2 -80 ${x + 4} 104`);
    svg.style.width = ((x + 4) / 100).toFixed(3) + 'em';   // 100 units = 1em: the logo is set at exactly the header's type size, on its baseline
    document.getElementById('sw-cut-stem').firstChild.setAttribute('x', iX - 20);
    const dx = iX + iW / 2 - DOT.w / 2;   // the dot/bar is centred on the i (as in the font)
    const mark = el('rect', { x: dx, y: DOT.y, width: DOT.w, height: DOT.h });
    mark.style.transformBox = 'view-box'; mark.style.transformOrigin = `${dx + DOT.w / 2}px ${DOT_CY()}px`;   // centre of the i-dot
    mark.style.transform = tf(SHAPE.bar);
    svg.appendChild(mark);
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
        const delay = k * 45 + (k > 5 ? 45 : 0);   // same 45ms wave step as the intro text
        all.push(t.animate(hop(k < 3 ? 12 : 10), { duration: 504, delay, fill: 'none' }));
      });
      all.push(mark.animate(markJump(from, to), { duration: 1150, delay: 80, fill: 'forwards' }));
    });
    return Promise.all(all.map(a => a.finished)).then(() => logos.forEach(({ mark }) => {
      mark.style.transform = tf(SHAPE[to]);
      mark.getAnimations().forEach(a => a.cancel());
    }));
  }
  // Same rhythm as the hopping intro text (an 8.4s loop that starts with the page):
  // one jump per beat, the tone bar turning into the dot and back on alternate beats.
  const BEAT = 8400;
  let state = 'bar';
  function play() {
    if (busy || reduce || document.hidden) return;
    busy = true;
    const to = state === 'bar' ? 'dot' : 'bar';
    jump(state, to).then(() => { state = to; }).finally(() => { busy = false; });
  }
  const EVERY = 1;   // one jump per beat, together with the text
  const P = BEAT * EVERY;
  setTimeout(() => { play(); setInterval(play, P); }, P - (performance.now() % P));
  }
})();

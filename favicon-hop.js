/* Tab icon motion: the ī tile hops like the avatar — i jumps and lands as ī, pauses, then hops back to i.
   5-second loop. Browsers don't animate SVG tab icons, so the tile is redrawn on a canvas and swapped in
   frame by frame (Chrome, Edge, Firefox; Safari keeps the still icon). Light tile in dark mode.
   Reduced motion: the still favicon.svg stays. */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const SZ = 64, S = 50 / 2048, OX = 32 - 259 * S, BASE = 51.5, LOOP = 5000, H1 = 500, H2 = 3000;
  const STEM = new Path2D('M148 0V1118H368V0Z');
  const BAR = new Path2D('M540 1498V1340H-22V1498Z');
  const DOT = new Path2D('M259 1289Q202 1289 161.5 1327.0Q121 1365 121 1419Q121 1474 161.5 1512.0Q202 1550 259 1550Q316 1550 357.0 1512.0Q398 1474 398 1419Q398 1365 357.0 1327.0Q316 1289 259 1289Z');
  const dark = matchMedia('(prefers-color-scheme: dark)');
  const cv = document.createElement('canvas'); cv.width = cv.height = SZ;
  const cx = cv.getContext('2d');
  // one link the script drives; the still icons are removed so the browser uses this one
  document.querySelectorAll('link[rel="icon"]').forEach(l => l.remove());
  const link = document.createElement('link'); link.rel = 'icon'; link.type = 'image/png';
  document.head.appendChild(link);

  const clamp = t => Math.max(0, Math.min(1, t));
  const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  function hop(t) {                       // t in seconds from the start of a hop
    let y = 0, sx = 1, sy = 1;
    if (t >= 0 && t < .18) { const k = t / .18; sy = lerp(1, .86, smooth(k)); sx = lerp(1, 1.08, smooth(k)); }
    else if (t >= .18 && t < .48) { const k = (t - .18) / .3; y = lerp(0, -6, 1 - Math.pow(1 - k, 3)); const q = smooth(Math.min(1, k * 2)); sy = lerp(.86, 1.06, q); sx = lerp(1.08, .96, q); }
    else if (t >= .48 && t < .76) { const k = (t - .48) / .28; y = lerp(-6, 0, k * k * k); sy = lerp(1.06, 1.02, smooth(k)); sx = lerp(.96, 1, smooth(k)); }
    else if (t >= .76 && t < .96) { const k = (t - .76) / .2; sy = 1 - .09 * Math.sin(Math.PI * k); sx = 1 + .06 * Math.sin(Math.PI * k); }
    return { y, sx, sy, sw: smooth((t - .38) / .18) };
  }
  function state(ms) {
    const t = ms / 1000;
    if (ms < H2 - 100) { const h = hop(t - H1 / 1000); return { ...h, bar: h.sw }; }   // i → ī
    const h = hop(t - H2 / 1000); return { ...h, bar: 1 - h.sw };                       // ī → i
  }
  let last = '';
  function draw() {
    const s = state(Date.now() % LOOP);
    const key = [s.y, s.sx, s.sy, s.bar, dark.matches].map(v => typeof v === 'number' ? v.toFixed(3) : v).join();
    if (key === last) return; last = key;
    const ink = dark.matches ? '#F3F3F3' : '#111111', ground = dark.matches ? '#111111' : '#F3F3F3';
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, SZ, SZ);
    cx.fillStyle = ink; cx.beginPath(); cx.roundRect(0, 0, SZ, SZ, 14); cx.fill();
    // letter: squash and hop around the bottom centre, then the font's own coordinates
    cx.translate(32, BASE + s.y); cx.scale(s.sx, s.sy); cx.translate(-32, -BASE);
    cx.translate(OX, BASE); cx.scale(S, -S);
    cx.fillStyle = ground; cx.fill(STEM);
    const d = 1 - s.bar;
    if (d > 0.001) { cx.save(); cx.globalAlpha = d; cx.translate(259, 1419); cx.scale(.4 + .6 * d, .4 + .6 * d); cx.translate(-259, -1419); cx.fill(DOT); cx.restore(); }
    if (s.bar > 0.001) { cx.save(); cx.globalAlpha = s.bar; cx.translate(259, 0); cx.scale(.2 + .8 * s.bar, 1); cx.translate(-259, 0); cx.fill(BAR); cx.restore(); }
    link.href = cv.toDataURL('image/png');
  }
  draw(); setInterval(draw, 50);
})();

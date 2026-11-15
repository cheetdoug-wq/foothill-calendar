/* Cheet's Press scene engine (from Alison's Foothill Calendar). scene(i) uses Alison's weeks; scene(def) draws any week def {id:kind 1-8, seed, title, sub, ...palette} */
(function (root) {
  const W = 1600, H = 900;
  function rng(seed) { let a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const f = n => Math.round(n * 10) / 10;

  function ridgeFn(r, base, amp, k, peaky) {
    const p = [r() * 6.3, r() * 6.3, r() * 6.3, r() * 6.3];
    return x => {
      const main = peaky ? (1 - Math.abs(Math.sin(x * .0024 * k + p[0]))) * 1.5 - .5 : Math.sin(x * .0019 * k + p[0]);
      return base - amp * (main + .5 * Math.sin(x * .0043 * k + p[1]) + .22 * Math.sin(x * .011 * k + p[2]) + .09 * Math.sin(x * .027 * k + p[3])) / 1.2;
    };
  }
  function ridgePath(fn) { let d = 'M-20,' + H; for (let x = -20; x <= W + 20; x += 8) d += ' L' + x + ',' + f(fn(x)); return d + ' L' + (W + 20) + ',' + H + 'Z'; }
  function treeLine(fn, r, lo, hi, step) { let d = ''; for (let x = -10; x < W + 10; x += step * (.7 + r() * .7)) { const y = fn(x), h = lo + r() * (hi - lo), w = h * .32; d += `M${f(x - w)},${f(y + 3)} L${f(x)},${f(y - h)} L${f(x + w)},${f(y + 3)}Z`; } return d; }

  /* ---------- plants ---------- */
  function pine(x, y, h, col, snow, lights, r) {
    let s = `<rect x="${f(x - h * .03)}" y="${f(y - h * .14)}" width="${f(h * .06)}" height="${f(h * .14)}" fill="#3a2a1c"/>`;
    const tiers = 5; let lightPts = [];
    for (let i = 0; i < tiers; i++) {
      const top = y - h + i * h * .16, th = h * .3, hw = h * (.1 + .058 * i);
      s += `<polygon points="${f(x)},${f(top)} ${f(x - hw)},${f(top + th)} ${f(x - hw * .35)},${f(top + th * .86)} ${f(x)},${f(top + th)} ${f(x + hw * .4)},${f(top + th * .86)} ${f(x + hw)},${f(top + th)}" fill="${col}"/>`;
      if (snow) s += `<polygon points="${f(x)},${f(top)} ${f(x - hw * .5)},${f(top + th * .5)} ${f(x - hw * .15)},${f(top + th * .4)} ${f(x + hw * .2)},${f(top + th * .52)} ${f(x + hw * .5)},${f(top + th * .5)}" fill="${snow}" opacity=".92"/>`;
      if (lights) for (let k = 0; k < 3 + i; k++) { const t = (k + .5) / (3 + i); lightPts.push([x - hw * .85 + t * hw * 1.7, top + th * (.72 + .2 * Math.sin(t * 3.14))]); }
    }
    if (lights) {
      const cols = ['#ffd24a', '#ff5a5a', '#58c8ff', '#7dff8a', '#ff8ad8'];
      lightPts.forEach((p, i) => { s += `<circle class="glow" style="animation-delay:-${f(r() * 2)}s;animation-duration:${f(1.2 + r() * 1.4)}s" cx="${f(p[0])}" cy="${f(p[1])}" r="${f(h * .017)}" fill="${cols[i % 5]}"/>`; });
      s += `<polygon class="glow" points="${star(x, y - h - h * .02, h * .055)}" fill="#ffe27a"/>`;
    }
    return s;
  }
  function star(cx, cy, R) { let p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? R * .45 : R; p.push(f(cx + Math.cos(a) * rr) + ',' + f(cy + Math.sin(a) * rr)); } return p.join(' '); }
  function oak(x, y, s, pal, r) {
    let o = `<path d="M${f(x - 8 * s)},${f(y)} C${f(x - 5 * s)},${f(y - 28 * s)} ${f(x - 9 * s)},${f(y - 50 * s)} ${f(x - 4 * s)},${f(y - 74 * s)} L${f(x + 4 * s)},${f(y - 74 * s)} C${f(x + 9 * s)},${f(y - 50 * s)} ${f(x + 5 * s)},${f(y - 28 * s)} ${f(x + 9 * s)},${f(y)}Z" fill="#3b2a1d"/>`;
    o += `<path d="M${f(x)},${f(y - 50 * s)} L${f(x - 30 * s)},${f(y - 82 * s)} M${f(x)},${f(y - 56 * s)} L${f(x + 28 * s)},${f(y - 86 * s)}" stroke="#3b2a1d" stroke-width="${f(4 * s)}" stroke-linecap="round"/>`;
    const blobs = [];
    for (let i = 0; i < 16; i++) { const a = r() * 6.28, d = Math.sqrt(r()); blobs.push([x + Math.cos(a) * d * 52 * s, y - 100 * s + Math.sin(a) * d * 30 * s, (17 + r() * 13) * s]); }
    blobs.forEach(b => o += `<circle cx="${f(b[0])}" cy="${f(b[1] + 9 * s)}" r="${f(b[2])}" fill="${pal[0]}"/>`);
    blobs.forEach(b => o += `<circle cx="${f(b[0])}" cy="${f(b[1])}" r="${f(b[2] * .9)}" fill="${pal[1]}"/>`);
    blobs.forEach((b, i) => { if (i % 2 === 0) o += `<circle cx="${f(b[0] - 7 * s)}" cy="${f(b[1] - 9 * s)}" r="${f(b[2] * .55)}" fill="${pal[2]}"/>`; });
    return o;
  }
  function bare(x, y, len, w, depth, r, col, out, ang) {
    ang = ang === undefined ? -Math.PI / 2 : ang;
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    out.push(`<line x1="${f(x)}" y1="${f(y)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${col}" stroke-width="${f(w)}" stroke-linecap="round"/>`);
    if (depth > 0) { bare(x2, y2, len * (.68 + r() * .1), w * .64, depth - 1, r, col, out, ang - .28 - r() * .45); bare(x2, y2, len * (.68 + r() * .1), w * .64, depth - 1, r, col, out, ang + .28 + r() * .45); }
  }
  function cloud(x, y, s, col, op) { return `<g class="drift" style="animation-duration:${f(30 + s * 20)}s" opacity="${op}"><g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="0" rx="90" ry="26" fill="${col}"/><ellipse cx="-50" cy="-14" rx="46" ry="24" fill="${col}"/><ellipse cx="10" cy="-26" rx="56" ry="30" fill="${col}"/><ellipse cx="62" cy="-10" rx="44" ry="22" fill="${col}"/></g></g>`; }
  function rock(x, y, s) { return `<ellipse cx="${x}" cy="${y}" rx="${26 * s}" ry="${15 * s}" fill="#6f6a66"/><ellipse cx="${x - 6 * s}" cy="${y - 5 * s}" rx="${14 * s}" ry="${6 * s}" fill="#9a948d" opacity=".7"/>`; }
  function fence(fn, x1, x2, col) { let s = ''; for (let x = x1; x <= x2; x += 74) { const y = fn(x) + 26; s += `<rect x="${x - 4}" y="${f(y - 46)}" width="8" height="48" rx="2" fill="${col}"/>`; if (x + 74 <= x2) { const y2 = fn(x + 74) + 26; s += `<line x1="${x}" y1="${f(y - 34)}" x2="${x + 74}" y2="${f(y2 - 34)}" stroke="${col}" stroke-width="5"/><line x1="${x}" y1="${f(y - 16)}" x2="${x + 74}" y2="${f(y2 - 16)}" stroke="${col}" stroke-width="5"/>`; } } return s; }

  /* ---------- animals (origin at feet, facing right) ---------- */
  const leg = (hx, hy, len, w, col, moving, alt) => `<g transform="translate(${hx},${hy})"><rect class="${moving ? 'leg' + (alt ? ' alt' : '') : ''}" x="${-w / 2}" y="0" width="${w}" height="${len}" rx="${w / 2}" fill="${col}"/></g>`;
  function cheet(o) {
    o = o || {}; const K = '#17140f', WH = '#f6f1e7', m = o.moving;
    let s = `<g transform="translate(-26,-32)"><path class="wag" d="M0,0 Q-14,-12 -8,-28" stroke="${K}" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
    s += leg(-21, -22, 22, 6, '#0d0b08', m, 0) + leg(18, -22, 22, 6, '#0d0b08', m, 1);
    s += `<ellipse cx="0" cy="-31" rx="28" ry="14" fill="${K}" stroke="#57524a" stroke-width=".8"/>`;
    s += leg(-15, -22, 22, 6, K, m, 1) + leg(24, -22, 22, 6, K, m, 0);
    s += `<ellipse cx="23" cy="-27" rx="8" ry="11" fill="${WH}"/>`;
    if (o.sweater) s += `<path d="M-18,-44 Q0,-49 16,-43 L15,-19 Q0,-15 -17,-19Z" fill="${o.sweater}"/><path d="M-17,-37 Q0,-42 16,-36 M-17,-28 Q0,-33 15,-27" stroke="#fff" stroke-width="2.4" fill="none" opacity=".85"/>`;
    s += `<polygon points="22,-60 15,-88 32,-66" fill="${K}" stroke="#57524a" stroke-width=".8"/><polygon points="22,-64 18,-82 28,-68" fill="#8a5a5a"/>`;
    s += `<circle cx="32" cy="-52" r="13" fill="${K}" stroke="#57524a" stroke-width=".8"/>`;
    s += `<polygon points="33,-64 41,-90 46,-60" fill="${K}" stroke="#57524a" stroke-width=".8"/><polygon points="36,-66 41,-84 43,-64" fill="#8a5a5a"/>`;
    s += `<ellipse cx="44" cy="-47" rx="8.5" ry="5.6" fill="${K}"/><ellipse cx="47" cy="-44.2" rx="4.6" ry="2.6" fill="${WH}"/><circle cx="52" cy="-48.5" r="2.1" fill="#000"/>`;
    s += `<circle cx="37" cy="-55" r="2.9" fill="#4a2e16"/><circle cx="37.9" cy="-55.9" r="1" fill="#fff"/>`;
    s += `<path d="M23,-43 Q30,-38 38,-40" stroke="#a45cff" stroke-width="3.2" fill="none" stroke-linecap="round"/><circle cx="31" cy="-37.5" r="2" fill="#ffd24a"/>`;
    if (o.hat) s += `<polygon points="26,-64 39,-66 36,-92" fill="#ff5ab0"/><path d="M28,-70 L38,-72 M30,-78 L37,-80" stroke="#ffe27a" stroke-width="2"/><circle cx="36" cy="-93" r="3.4" fill="#ffe27a"/>`;
    return s;
  }
  function deer(o) {
    o = o || {}; const C = o.col || '#9a6a44', D = '#6d4a2f', m = o.moving;
    let s = leg(-27, -40, 40, 5, D, m, 0) + leg(20, -40, 40, 5, D, m, 1);
    s += `<ellipse cx="-34" cy="-52" rx="5" ry="8" fill="#f5eee2"/><ellipse cx="0" cy="-46" rx="34" ry="16" fill="${C}"/><ellipse cx="2" cy="-38" rx="25" ry="7" fill="#d7b48c" opacity=".55"/>`;
    s += leg(-20, -40, 40, 5, C, m, 1) + leg(26, -40, 40, 5, C, m, 0);
    s += `<g transform="translate(26,-50)"><g class="${o.graze ? 'graze' : 'bob'}" style="animation-delay:-${o.delay || 0}s"><polygon points="-6,2 6,-34 18,-30 10,10" fill="${C}"/><ellipse cx="18" cy="-36" rx="11" ry="7.5" fill="${C}"/><ellipse cx="27" cy="-34" rx="6.5" ry="4.8" fill="#b98a62"/><circle cx="32.5" cy="-34.5" r="2" fill="#1a1410"/><polygon points="10,-40 3,-56 16,-44" fill="${C}"/><polygon points="10,-42 6,-52 14,-45" fill="#e0b9a0"/><circle cx="20" cy="-38.5" r="1.7" fill="#1a1410"/>`;
    if (o.buck) s += `<path d="M14,-42 Q10,-62 22,-72 M15,-54 L25,-58 M13,-48 L5,-58 M18,-66 L12,-74" stroke="#efe3c8" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    return s + '</g></g>';
  }
  function quail() {
    return `<g transform="translate(-2,-6)"><line class="leg" x1="0" y1="0" x2="0" y2="6" stroke="#4a3a2a" stroke-width="1.6"/></g><g transform="translate(4,-6)"><line class="leg alt" x1="0" y1="0" x2="0" y2="6" stroke="#4a3a2a" stroke-width="1.6"/></g><polygon points="-11,-17 -24,-21 -12,-9" fill="#56636e"/><ellipse cx="0" cy="-14" rx="14" ry="10" fill="#70808d"/><ellipse cx="3" cy="-10" rx="9" ry="6" fill="#dcc79d"/><path d="M-3,-10 q3,3 6,0 M1,-7 q3,3 6,0" stroke="#7a5a3a" stroke-width="1" fill="none"/><circle cx="12" cy="-24" r="6.2" fill="#26262a"/><path d="M6.5,-26.5 Q12,-32 17.5,-26" stroke="#fff" stroke-width="1.4" fill="none"/><path d="M8,-28 Q12,-33 16,-28Z" fill="#7a4a2a"/><polygon points="17.5,-24.5 22,-23 17.5,-21.8" fill="#2a2a2a"/><path d="M12,-30 Q12,-41 20,-40 Q17,-36 15,-30Z" fill="#141416"/><circle cx="13.5" cy="-24.5" r="1" fill="#fff"/>`;
  }
  function turkey() {
    let s = '';
    for (let i = 0; i < 9; i++) { const a = (-165 + i * 18.75) * Math.PI / 180, x = -6 + Math.cos(a) * 44, y = -26 + Math.sin(a) * 44; s += `<line x1="-6" y1="-26" x2="${f(x)}" y2="${f(y)}" stroke="${i % 2 ? '#6b4426' : '#4e3018'}" stroke-width="15" stroke-linecap="round"/><circle cx="${f(x)}" cy="${f(y)}" r="6.5" fill="#e6cf9f"/>`; }
    s += `<g transform="translate(-4,-8)"><line class="leg" x1="0" y1="0" x2="0" y2="9" stroke="#b5722f" stroke-width="2.4"/></g><g transform="translate(6,-8)"><line class="leg alt" x1="0" y1="0" x2="0" y2="9" stroke="#b5722f" stroke-width="2.4"/></g>`;
    s += `<ellipse cx="0" cy="-23" rx="19" ry="16" fill="#33221a"/><ellipse cx="-3" cy="-21" rx="12" ry="8.5" fill="#6b4a2d"/><path d="M-10,-21 h14 M-9,-17 h12" stroke="#e6cf9f" stroke-width="1.2"/>`;
    s += `<g transform="translate(12,-32)"><g class="bob" style="--a:10deg;animation-duration:.9s"><path d="M0,0 Q8,-8 9,-20" stroke="#8a3030" stroke-width="5.5" fill="none" stroke-linecap="round"/><circle cx="10" cy="-22" r="5.4" fill="#6a8fb8"/><ellipse cx="13.5" cy="-15.5" rx="2.4" ry="5.5" fill="#cf3b2e"/><polygon points="14.5,-23 20,-21.5 14.5,-20" fill="#e3b04b"/><circle cx="11" cy="-23.5" r="1" fill="#111"/></g></g>`;
    return s;
  }
  function hawk() { return `<g class="flap"><path d="M0,0 C-20,-15 -52,-18 -70,-4 C-52,-7 -30,-2 -10,7 L-7,14 L7,14 L10,7 C30,-2 52,-7 70,-4 C52,-18 20,-15 0,0Z" fill="#3a2a22"/><path d="M-62,-6 L-70,-4 M-56,-8 L-63,-2" stroke="#3a2a22" stroke-width="2"/></g><polygon points="-8,11 0,30 8,11" fill="#b0492b"/><circle cx="0" cy="-3" r="4.6" fill="#4a362b"/>`; }
  function otter() {
    return `<g transform="translate(0,2)"><ellipse class="ripple" cx="0" cy="0" rx="70" ry="9" fill="none" stroke="#fff" stroke-width="1.6"/><ellipse class="ripple" style="animation-delay:-1.2s" cx="0" cy="0" rx="70" ry="9" fill="none" stroke="#fff" stroke-width="1.6"/></g><path d="M-44,2 Q-58,-10 -68,0" stroke="#5a3d2b" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M-42,2 Q-8,-18 28,-4 L28,3 L-42,3Z" fill="#5a3d2b"/><circle cx="29" cy="-17" r="3" fill="#4a3122"/><ellipse cx="36" cy="-9" rx="12" ry="9" fill="#6b4a35"/><ellipse cx="44" cy="-6.5" rx="6.5" ry="5.2" fill="#c7a988"/><circle cx="49" cy="-8" r="2" fill="#1a1410"/><circle cx="38" cy="-12" r="1.6" fill="#111"/><path d="M45,-5 l10,-2 M45,-4 l10,2" stroke="#fff" stroke-width=".7" opacity=".8"/>`;
  }
  function owl() {
    const lid = x => `<g transform="translate(${x},-57.5)"><rect class="blink" x="-5.4" y="0" width="10.8" height="10.6" fill="#c9ad80"/></g>`;
    return `<ellipse cx="0" cy="-28" rx="18" ry="27" fill="#6b5137"/><ellipse cx="0" cy="-22" rx="12" ry="18" fill="#a88d64"/><path d="M-7,-30 h14 M-8,-24 h16 M-7,-18 h14 M-6,-12 h12" stroke="#6b5137" stroke-width="1.6"/><g class="bob" style="--a:9deg;animation-duration:7s"><polygon points="-15,-58 -19,-78 -5,-63" fill="#5a4530"/><polygon points="15,-58 19,-78 5,-63" fill="#5a4530"/><ellipse cx="0" cy="-52" rx="17.5" ry="14" fill="#6b5137"/><circle cx="-7.5" cy="-52" r="8" fill="#c9ad80"/><circle cx="7.5" cy="-52" r="8" fill="#c9ad80"/><circle cx="-7.5" cy="-52" r="5" fill="#f7c52e"/><circle cx="7.5" cy="-52" r="5" fill="#f7c52e"/><circle cx="-7.5" cy="-52" r="2.4" fill="#111"/><circle cx="7.5" cy="-52" r="2.4" fill="#111"/>${lid(-7.5)}${lid(7.5)}<polygon points="-2.4,-48 2.4,-48 0,-42" fill="#33291d"/></g><path d="M-7,0 v-4 M-3,0 v-4 M3,0 v-4 M7,0 v-4" stroke="#d9b24a" stroke-width="2" stroke-linecap="round"/>`;
  }
  function fox(o) {
    const G = '#8f929a', R = '#c7773a', m = o && o.moving;
    return `<path d="M-26,-32 Q-66,-46 -76,-22 Q-54,-12 -26,-22Z" fill="${G}"/><path d="M-76,-22 Q-70,-34 -60,-36 Q-66,-24 -62,-17Z" fill="#2c2c30"/>` + leg(-20, -24, 24, 5.5, '#9a5a28', m, 0) + leg(18, -24, 24, 5.5, '#9a5a28', m, 1) + `<ellipse cx="0" cy="-31" rx="30" ry="12" fill="${G}"/><ellipse cx="2" cy="-24" rx="22" ry="6" fill="${R}"/>` + leg(-14, -24, 24, 5.5, R, m, 1) + leg(24, -24, 24, 5.5, R, m, 0) + `<polygon points="20,-38 34,-52 40,-34 26,-24" fill="${G}"/><polygon points="27,-50 25,-70 37,-55" fill="${G}"/><polygon points="29,-54 28,-66 34,-56" fill="#2c2c30"/><polygon points="37,-53 42,-70 46,-50" fill="${G}"/><ellipse cx="37" cy="-45" rx="12" ry="9.5" fill="${G}"/><polygon points="42,-50 62,-40 42,-36" fill="#a4a7ae"/><path d="M34,-40 Q42,-34 50,-38 L44,-36Z" fill="#fff"/><ellipse cx="38" cy="-38" rx="7" ry="3.4" fill="#f4f1ea"/><circle cx="61.5" cy="-40" r="2.2" fill="#111"/><circle cx="40" cy="-47" r="1.9" fill="#111"/>`;
  }
  const at = (x, y, s, inner, flip) => `<g transform="translate(${f(x)},${f(y)}) scale(${flip ? -s : s},${s})">${inner}</g>`;
  const pace = (inner, d, dur, delay) => `<g class="pace" style="--d:${d}px;animation-duration:${dur}s;animation-delay:-${delay || 0}s">${inner}</g>`;
  const hop = (inner, dur) => `<g class="hop" style="animation-duration:${dur || .7}s">${inner}</g>`;

  /* ---------- week data ---------- */
  const WEEKS = [
    { id: 1, start: [2026, 10, 14], end: [2026, 10, 21], title: 'Acorn Week', sub: 'Leaves are dropping and Cheet has the zoomies.', ink: '#fff',
      sky: ['#2f6fb5', '#86bfe6', '#fde6b6'], orb: { t: 'sun', x: 820, y: 215, r: 46, c: '#fff6cf' }, ridges: ['#93adc8', '#7f9f95', '#6f8d58', '#84893f', '#c2a444', '#5c4a20'], pines: '#2f4d35', oaks: [['#7c3410', '#cf661c', '#f2ab34'], ['#8a4a12', '#e08a22', '#f6c64a'], ['#2f4a22', '#496b2c', '#6f923c']], grass: '#8a7428', bigOak: 0,
      days: { 14: ['Calendar Kickoff Day', 'fun', 'Hang this up where you will see it every day. Then scan the code on the front and watch Cheet run her first lap.'], 17: ['Acorn Count Day', 'fun', 'Pick one oak and count the acorns under it. Everybody guesses first. The worst guess makes the snacks.'], 20: ['Cheet Zoomies Day', 'fun', 'Find an open patch of grass and run one full-speed lap, Cheet style. Ears up the whole way.'] } },
    { id: 2, start: [2026, 10, 22], end: [2026, 10, 28], title: 'Turkey Trot Week', sub: 'Golden hour, and the wild turkeys own the meadow.', ink: '#fff',
      sky: ['#4c62a8', '#f29a52', '#ffe2a2'], orb: { t: 'sun', x: 1040, y: 372, r: 70, c: '#fff1b8', rays: 1 }, ridges: ['#b78fa4', '#a87562', '#8f5f3e', '#7f5f2e', '#c8912f', '#49331a'], pines: '#3d3a22', oaks: [['#6e2c0e', '#b8551a', '#e7922c'], ['#7a3f10', '#d0781e', '#f0b23e'], ['#3a4420', '#59652a', '#84903a']], grass: '#8a6420', bigOak: 1,
      days: { 22: ['Hug an Oak Day', 'fun', 'Find the biggest oak around and see if your arms reach all the way. They will not. Hug it anyway.'], 26: ['Thanksgiving', 'real', 'Before anybody touches the pie, say one thing you are thankful for about living in the foothills.'], 27: ['Leftover Hike Day', 'fun', 'Pack a leftover sandwich and eat it somewhere with a big view.'] } },
    { id: 3, start: [2026, 10, 29], end: [2026, 10, 30], title: 'Last Light of November', sub: 'A red-tailed hawk rides the wind over the river.', ink: '#fff',
      sky: ['#262760', '#b0508c', '#ffb37c'], orb: { t: 'sun', x: 560, y: 420, r: 60, c: '#ffd9a0' }, ridges: ['#75509a', '#5d3f80', '#4a3468', '#3d2c54', '#56405c', '#1e152a'], pines: '#241a36', oaks: [['#2a1c38', '#3a2648', '#55365c'], ['#30203c', '#472c50', '#643e62'], ['#2a1c38', '#3a2648', '#55365c']], grass: '#3a2a46', river: ['#ffb37c', '#b0508c'], bigOak: 1,
      days: { 29: ['Hawk Watch Sunday', 'fun', 'Look up for ten whole minutes. Count every hawk you see riding the wind over the ridge.'], 30: ['Goodbye November Sunset', 'fun', 'Step outside at sunset and wave November off. December starts tomorrow.'] } },
    { id: 4, start: [2026, 11, 1], end: [2026, 11, 7], title: 'Frost Week', sub: 'Fog in the low spots, deer at breakfast, quail on parade.', ink: '#1f3344',
      sky: ['#93bbdb', '#d6e6f0', '#fdf2e2'], orb: { t: 'sun', x: 1180, y: 250, r: 40, c: '#fffbe8' }, ridges: ['#bccddb', '#a0b6c5', '#8099a3', '#6f8d85', '#cddacb', '#587362'], pines: '#35554a', oaks: [['#39523a', '#557455', '#8fae8a'], ['#39523a', '#557455', '#8fae8a'], ['#39523a', '#557455', '#8fae8a']], grass: '#dfe9e2', fog: 1, bigOak: 2,
      days: { 1: ['Cheet’s First Sweater Day', 'fun', 'It is finally cold enough for the tiny sweater. Put on your own favorite sweater so you match.'], 4: ['Hanukkah begins at sundown', 'real', 'First night. Light a candle, or just enjoy an early, cozy evening inside.'], 5: ['Deer Track Detective Day', 'fun', 'Look for heart-shaped hoofprints in the frost or mud and follow them as far as they go.'], 7: ['Quail Parade Day', 'fun', 'Watch for a line of quail crossing the road. If you spot one, you have to wait and let the whole parade through.'] } },
    { id: 5, start: [2026, 11, 8], end: [2026, 11, 14], title: 'River & Stars Week', sub: 'An otter in the river and meteors over the ridge.', ink: '#fff',
      sky: ['#050a22', '#0f234e', '#2a4a80'], orb: { t: 'crescent', x: 1240, y: 190, r: 44, c: '#f4f0d8' }, stars: 150, ridges: ['#1e3460', '#182c52', '#132443', '#0f1d36', '#16293e', '#070d18'], pines: '#0b1626', oaks: [['#0c1828', '#122236', '#1a3048'], ['#0c1828', '#122236', '#1a3048'], ['#0c1828', '#122236', '#1a3048']], grass: '#0f1d2e', river: ['#2a4a80', '#0f234e'], bigOak: 2, meteors: 1,
      days: { 10: ['River Otter Appreciation Day', 'fun', 'Go to the river and stand still for five quiet minutes. Otters only show up for patient people.'], 11: ['Araya’s Birthday', 'real', 'Happy birthday, Araya! The birthday kid picks the snack, the game, and the animal everybody has to act like at dinner.'], 12: ['Family Cocoa Night', 'fun', 'Everybody gets cocoa. Extra marshmallows go to whoever tells the best animal story.'], 13: ['Geminid Meteor Shower', 'real', 'Tonight is the peak. Bundle up after dark, look up, and make a wish on the first one you see.'] } },
    { id: 6, start: [2026, 11, 15], end: [2026, 11, 21], title: 'Solstice Snow Week', sub: 'Snow on the pines and the shortest day of the year.', ink: '#fff',
      sky: ['#4f6594', '#c9a4b0', '#ffd09c'], orb: { t: 'sun', x: 420, y: 430, r: 58, c: '#fff0c8' }, ridges: ['#aebbd4', '#98a8c5', '#8497b6', '#7086a6', '#f0f4fb', '#cbd6e8'], pines: '#23433c', oaks: [['#23433c', '#2f574c', '#e9eff8'], ['#23433c', '#2f574c', '#e9eff8'], ['#23433c', '#2f574c', '#e9eff8']], grass: '#ffffff', snow: 70, bigOak: 2, snowy: 1,
      days: { 15: ['Bammy’s Birthday', 'real', 'Happy birthday, Bammy! Give Bammy a big hug, sing loud, and save the biggest slice of cake for the birthday star.'], 16: ['Thank a Tree Day', 'fun', 'Pick a tree you walk past all the time and tell it thanks. Out loud.'], 19: ['Tiny Dog, Big Hike Day', 'fun', 'Take the longest walk a chihuahua will agree to. Carrying her for part of it still counts.'], 21: ['Winter Solstice', 'real', 'Shortest day of the year. Watch the early sunset. Starting tomorrow the days get longer.'] } },
    { id: 7, start: [2026, 11, 22], end: [2026, 11, 28], title: 'Cold Moon Week', sub: 'A full moon, a great horned owl, and lights on the pine.', ink: '#fff',
      sky: ['#080e2c', '#18285a', '#3c5088'], orb: { t: 'moon', x: 1010, y: 230, r: 84, c: '#fbf7e2' }, stars: 110, ridges: ['#3b4b7a', '#30406e', '#27355e', '#1f2b4e', '#bcc9e8', '#93a1c8'], pines: '#12233a', oaks: [['#12233a', '#1a3050', '#dfe7f6'], ['#12233a', '#1a3050', '#dfe7f6'], ['#12233a', '#1a3050', '#dfe7f6']], grass: '#e8eefb', snow: 40, bigOak: 2, snowy: 1,
      days: { 23: ['Full Cold Moon & Owl Listening Night', 'real', 'Step outside after dark, stay quiet, and listen for a great horned owl. Five hoots means hello.', 'Cold Moon & Owl Night'], 24: ['Christmas Eve', 'real', 'Count the lights on the way home and pick your favorite house.'], 25: ['Christmas', 'real', 'Merry Christmas, Alison. Open the good present first.'], 27: ['Pajama Bird Watch', 'fun', 'Stay in pajamas, get something warm, and watch the birds from the window until at least ten.'] } },
    { id: 8, start: [2026, 11, 29], end: [2026, 11, 31], title: 'Countdown Week', sub: 'Fireworks over the foothills and a fox out for a trot.', ink: '#fff',
      sky: ['#0a071e', '#221244', '#4c2462'], orb: { t: 'crescent', x: 250, y: 200, r: 34, c: '#f4f0d8' }, stars: 120, ridges: ['#301e58', '#28194a', '#21143d', '#1a1031', '#261c42', '#0c0716'], pines: '#0e0920', oaks: [['#120b26', '#1c1136', '#2a1a4c'], ['#120b26', '#1c1136', '#2a1a4c'], ['#120b26', '#1c1136', '#2a1a4c']], grass: '#1a1230', bigOak: 2, fireworks: 1,
      days: { 29: ['Fox Sock Day', 'fun', 'Wear your wildest socks. Gray foxes approve.'], 31: ['New Year’s Eve & Cheet’s Countdown', 'real', 'Count down from ten at midnight. Or at nine, which is Cheet’s bedtime.', 'New Year’s Eve'] } }
  ];
  const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  WEEKS.forEach(w => {
    w.list = []; const d = new Date(w.start[0], w.start[1], w.start[2]), e = new Date(w.end[0], w.end[1], w.end[2]);
    while (d <= e) { const sp = w.days[d.getDate()]; w.list.push({ n: d.getDate(), dow: DOW[d.getDay()], mon: MON[d.getMonth()], name: sp && sp[0], short: sp && (sp[3] || sp[0]), kind: sp && sp[1], todo: sp && sp[2] }); d.setDate(d.getDate() + 1); }
    const m = MON[w.start[1]].slice(0, 3);
    w.range = m + ' ' + w.start[2] + ' to ' + w.end[2] + ', 2026';
  });

  /* ---------- scene ---------- */
  function scene(idx, opt) {
    opt = opt || {}; let w; if (typeof idx === 'object') { w = idx; idx = w.id - 1; } else w = WEEKS[idx]; const r = rng(w.seed || (1000 + idx * 77)), id = 'w' + w.id + (opt.uid || '');
    const R = w.ridges, night = !!w.stars; let s = '';
    s += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${opt.viewBox || '0 0 1600 900'}" preserveAspectRatio="${opt.par || 'xMidYMid meet'}" class="scene${opt.still ? ' still' : ''}" role="img" aria-label="${w.title}: ${w.sub}">`;
    s += `<defs><linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${w.sky[0]}"/><stop offset=".55" stop-color="${w.sky[1]}"/><stop offset="1" stop-color="${w.sky[2]}"/></linearGradient><radialGradient id="${id}glow"><stop offset="0" stop-color="${w.orb.c}" stop-opacity=".85"/><stop offset=".35" stop-color="${w.orb.c}" stop-opacity=".28"/><stop offset="1" stop-color="${w.orb.c}" stop-opacity="0"/></radialGradient><linearGradient id="${id}cap" gradientUnits="userSpaceOnUse" x1="0" y1="250" x2="0" y2="372"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
    if (w.river) s += `<linearGradient id="${id}riv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${w.river[0]}"/><stop offset="1" stop-color="${w.river[1]}"/></linearGradient>`;
    s += `<linearGradient id="${id}haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${w.sky[2]}" stop-opacity="0"/><stop offset="1" stop-color="${w.sky[2]}" stop-opacity=".5"/></linearGradient></defs>`;
    s += `<rect width="1600" height="640" fill="url(#${id}sky)"/><rect y="630" width="1600" height="270" fill="${R[4]}"/>`;
    if (w.stars) for (let i = 0; i < w.stars; i++) s += `<circle class="tw" style="animation-delay:-${f(r() * 4)}s;animation-duration:${f(2 + r() * 3)}s" cx="${f(r() * 1600)}" cy="${f(r() * 470)}" r="${f(.7 + r() * 1.7)}" fill="#fff"/>`;
    // sun / moon
    const o = w.orb;
    s += `<circle class="pulse" cx="${o.x}" cy="${o.y}" r="${o.r * 4.2}" fill="url(#${id}glow)"/>`;
    if (o.rays) { s += `<g transform="translate(${o.x},${o.y})"><g class="spin" opacity=".22">`; for (let i = 0; i < 12; i++) s += `<polygon points="0,0 ${f(Math.cos(i * .5236) * 900)},${f(Math.sin(i * .5236) * 900)} ${f(Math.cos(i * .5236 + .11) * 900)},${f(Math.sin(i * .5236 + .11) * 900)}" fill="${o.c}"/>`; s += '</g></g>'; }
    if (o.t === 'crescent') s += `<path d="M${o.x},${o.y - o.r} A${o.r},${o.r} 0 1 1 ${o.x},${o.y + o.r} A${o.r * .72},${o.r} 0 1 0 ${o.x},${o.y - o.r}Z" fill="${o.c}"/>`;
    else { s += `<circle cx="${o.x}" cy="${o.y}" r="${o.r}" fill="${o.c}"/>`; if (o.t === 'moon') s += `<circle cx="${o.x - 26}" cy="${o.y - 18}" r="15" fill="#d9d4bc" opacity=".6"/><circle cx="${o.x + 22}" cy="${o.y + 12}" r="21" fill="#d9d4bc" opacity=".5"/><circle cx="${o.x - 8}" cy="${o.y + 36}" r="10" fill="#d9d4bc" opacity=".55"/><circle cx="${o.x + 30}" cy="${o.y - 34}" r="8" fill="#d9d4bc" opacity=".5"/>`; }
    if (w.meteors) [[980, 80, 0.35], [520, 140, 2.3], [1380, 60, 4.1], [760, 40, 5.6]].forEach((m, i) => s += `<g transform="translate(${m[0]},${m[1]})"><g class="meteor" style="animation-delay:-${m[2]}s;animation-duration:${6 + i}s"><line x1="0" y1="0" x2="120" y2="-74" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".9"/><line x1="0" y1="0" x2="46" y2="-28" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/><circle r="4.2" fill="#fff"/></g></g>`);
    if (w.fireworks) [[420, 210, '#ff5ab0', 110, 1.3, 3.2], [840, 150, '#ffd24a', 140, 1.75, 4.1], [1130, 250, '#58c8ff', 100, 1.1, 2.7], [640, 320, '#7dff8a', 80, 1.5, 3.6], [1010, 110, '#ff8a4a', 90, 2.0, 4.6], [260, 330, '#c79bff', 70, .8, 3.0]].forEach(b => { s += `<g transform="translate(${b[0]},${b[1]})"><g class="fw" style="animation-delay:-${b[4]}s;animation-duration:${b[5]}s">`; for (let i = 0; i < 16; i++) { const a = i * .3927, c = Math.cos(a), sn = Math.sin(a); s += `<line x1="${f(c * b[3] * .28)}" y1="${f(sn * b[3] * .28)}" x2="${f(c * b[3])}" y2="${f(sn * b[3])}" stroke="${b[2]}" stroke-width="4" stroke-linecap="round"/><circle cx="${f(c * b[3] * 1.12)}" cy="${f(sn * b[3] * 1.12)}" r="3.6" fill="#fff"/>`; } s += '</g></g>'; });
    if (!night) { const cc = idx === 2 ? '#ffb7c8' : idx === 1 ? '#ffd7a8' : '#ffffff'; s += cloud(250, 150, 1.2, cc, .8) + cloud(900, 110, .9, cc, .7) + cloud(1380, 190, 1.05, cc, .75) + cloud(640, 240, .6, cc, .55); }
    if (idx === 1) { s += `<g class="cross" style="--d:-1900px;animation-duration:70s;animation-delay:-22s"><g transform="translate(1700,170)">`; for (let i = 0; i < 9; i++) { const k = Math.abs(i - 4); s += `<path d="M${k * 30},${(i < 4 ? -1 : 1) * k * 16} q8,-9 16,0 q8,-9 16,0" stroke="#3a2a2a" stroke-width="2.6" fill="none"/>`; } s += '</g></g>'; }
    // ridges
    const f0 = ridgeFn(r, 400, 105, 1, true), f1 = ridgeFn(r, 470, 62, 1.25), f2 = ridgeFn(r, 545, 48, 1.5), f3 = ridgeFn(r, 618, 40, 1.15), fm = ridgeFn(r, 702, 13, .9), ff = ridgeFn(r, 838, 11, 1.4);
    s += `<path d="${ridgePath(f0)}" fill="${R[0]}"/>`;
    if (w.id >= 4) s += `<path d="${ridgePath(f0)}" fill="url(#${id}cap)" opacity="${night ? .55 : .95}"/>`;
    s += `<path d="${ridgePath(f1)}" fill="${R[1]}"/><path d="${treeLine(f1, r, 5, 11, 11)}" fill="${R[1]}"/>`;
    s += `<rect y="380" width="1600" height="180" fill="url(#${id}haze)"/>`;
    s += `<path d="${ridgePath(f2)}" fill="${R[2]}"/><path d="${treeLine(f2, r, 10, 24, 13)}" fill="${R[2]}"/>`;
    if (idx === 2) s += at(1010, f2(1010) + 2, .42, deer({ buck: 1, col: '#2a1c38' }));
    s += `<path d="${ridgePath(f3)}" fill="${R[3]}"/>`;
    for (let x = 20; x < 1600; x += 40 + r() * 70) { const y = f3(x) + 4; s += r() < .6 ? pine(x, y, 40 + r() * 34, w.pines, w.snowy ? '#eef3fb' : null) : oak(x, y, .34 + r() * .2, w.oaks[Math.floor(r() * 3)], r); }
    if (w.fog) s += `<g class="drift" style="animation-duration:26s"><ellipse cx="500" cy="640" rx="520" ry="26" fill="#fff" opacity=".6"/><ellipse cx="1250" cy="620" rx="420" ry="20" fill="#fff" opacity=".5"/></g>`;
    // meadow
    s += `<path d="${ridgePath(fm)}" fill="${R[4]}"/>`;
    const my = x => fm(x);
    // mid trees on the meadow edge
    const spots = [[90, .95], [330, .7], [600, .8], [1180, .75]];
    spots.forEach((p, i) => { const y = my(p[0]) + 14; if (w.river && p[0] > 700 && p[0] < 1100) return; if (w.id >= 4 && i % 2 === 0) { s += pine(p[0], y, 150 * p[1], w.pines, w.snowy ? '#f3f7fd' : null); } else if (w.id >= 6) { const out = []; bare(p[0], y, 44 * p[1], 9 * p[1], 5, r, night ? '#0d1626' : '#4a3a30', out); s += out.join(''); } else s += oak(p[0], y, p[1], w.oaks[i % 3], r); });
    if (w.id <= 2 || w.id === 4) s += fence(my, 380, 380 + 74 * 5, w.id === 4 ? '#7d8c86' : '#6a4a2a');
    // week 7 cabin + lit pine
    if (w.id === 7) {
      const cy = my(250) + 40;
      s += `<g transform="translate(250,${f(cy)})"><rect x="-70" y="-74" width="140" height="74" fill="#4a3324"/><path d="M-70,-56 h140 M-70,-38 h140 M-70,-20 h140" stroke="#38261a" stroke-width="3"/><polygon points="-86,-72 0,-128 86,-72" fill="#f3f7fd"/><polygon points="-86,-72 0,-118 86,-72 70,-72 0,-108 -70,-72" fill="#c8d4ea"/><rect x="36" y="-132" width="18" height="40" fill="#5a4030"/><rect x="33" y="-137" width="24" height="8" fill="#f3f7fd"/><rect class="pulse" x="-50" y="-58" width="36" height="32" fill="#ffd66a"/><path d="M-32,-58 v32 M-50,-42 h36" stroke="#4a3324" stroke-width="3"/><rect x="12" y="-52" width="28" height="52" fill="#2e1e14"/><circle cx="34" cy="-26" r="2.4" fill="#ffd66a"/><g transform="translate(45,-140)">${[0, 1, 2, 3].map(i => `<circle class="smoke" style="animation-delay:-${i * 1.1}s" r="11" fill="#cfd8ee"/>`).join('')}</g></g>`;
      s += pine(560, my(560) + 60, 270, '#143a30', '#f3f7fd', true, r);
    }
    // river
    if (w.river) {
      const ty = f(my(880) + 6);
      s += `<path d="M850,${ty} C800,742 900,772 780,812 C700,842 620,872 560,900 L1120,900 C1100,862 1012,832 1000,802 C990,766 930,742 905,${ty}Z" fill="url(#${id}riv)" opacity=".92"/>`;
      [[860, 722, 30], [850, 760, 46], [810, 800, 70], [900, 830, 60], [760, 858, 90], [960, 876, 80], [870, 742, 22], [700, 884, 60]].forEach((l, i) => s += `<line class="glow" style="animation-delay:-${f(i * .37)}s;animation-duration:2.6s" x1="${l[0]}" y1="${l[1]}" x2="${l[0] + l[2]}" y2="${l[1]}" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>`);
    }
    // deer tracks in snow
    if (w.id === 6) for (let i = 0; i < 16; i++) s += `<ellipse cx="${520 + i * 34}" cy="${f(my(520 + i * 34) + 66 + (i % 2) * 7)}" rx="4" ry="2.4" fill="#aebbd4"/>`;
    // animals
    const A = [];
    if (w.id === 1) { A.push(at(520, my(520) + 96, 1.5, pace(cheet({ moving: 1 }), 330, 6.5, 1.4))); A.push(at(1090, my(1090) + 50, 1, quail())); A.push(at(1150, my(1150) + 62, 1.1, `<g class="bob" style="--a:14deg;animation-duration:1.1s">${quail()}</g>`, true)); A.push(at(260, my(260) + 84, .8, deer({ graze: 1 }))); }
    if (w.id === 2) { [[420, 70, 1.25, 0], [560, 86, 1.45, 1.2], [720, 74, 1.3, 2.1]].forEach(t => A.push(at(t[0], my(t[0]) + t[1], t[2], pace(`<g class="hop" style="animation-duration:.8s;animation-delay:-${t[3]}s">${turkey()}</g>`, 110, 16, t[3] * 2)))); A.push(at(1020, my(1020) + 100, 1.5, cheet({}), true)); }
    if (w.id === 3) { A.push(`<g><animateMotion dur="26s" repeatCount="indefinite" path="M1050,250 C1250,170 1420,260 1300,350 C1150,440 780,420 760,300 C750,220 900,300 1050,250Z"/><g transform="scale(1.25)">${hawk()}</g></g>`); A.push(`<g opacity=".8"><animateMotion dur="34s" repeatCount="indefinite" path="M400,200 C520,140 640,190 600,260 C540,330 300,300 400,200Z"/><g transform="scale(.55)">${hawk()}</g></g>`); A.push(at(380, my(380) + 92, 1.5, cheet({}))); A.push(at(1230, my(1230) + 60, .95, deer({ graze: 1, col: '#3a2648' }), true)); }
    if (w.id === 4) { A.push(at(250, my(250) + 70, 1.15, deer({ graze: 1 }))); A.push(at(1010, my(1010) + 54, 1.05, deer({ buck: 1, delay: 2 }), true)); let q = ''; for (let i = 0; i < 6; i++) q += at(-i * 46, (i % 2) * 5, i === 0 ? 1.1 : .85 + (i % 3) * .06, quail()); A.push(`<g class="cross" style="--d:2100px;animation-duration:38s;animation-delay:-19s"><g transform="translate(-60,${f(my(700) + 122)}) scale(1.25)">${q}</g></g>`); A.push(at(1200, my(1200) + 100, 1.5, cheet({ sweater: '#d6402c' }) + `<circle class="smoke" cx="58" cy="-50" r="5" fill="#fff"/>`)); }
    if (w.id === 5) { A.push(at(430, my(430) + 96, 1.5, cheet({}))); A.push(at(1240, my(1240) + 46, .8, deer({ buck: 1, col: '#1a2c44' }), true)); }
    if (w.id === 6) { A.push(at(700, my(700) + 60, 1.15, pace(deer({ buck: 1, moving: 1 }), 300, 30, 6))); A.push(at(300, my(300) + 98, 1.5, hop(cheet({ sweater: '#2f7a5a' }), .8))); A.push(at(1120, my(1120) + 48, .9, deer({ graze: 1 }), true)); }
    if (w.id === 7) { A.push(at(390, my(390) + 78, 1.35, cheet({ sweater: '#d6402c' }))); A.push(at(940, my(940) + 54, 1, deer({ graze: 1, col: '#5a4a4a' }), true)); }
    if (w.id === 8) { A.push(at(620, my(620) + 70, 1.4, pace(`<g class="hop" style="animation-duration:.5s">${fox({ moving: 1 })}</g>`, 330, 11, 2))); A.push(at(330, my(330) + 104, 1.6, hop(cheet({ hat: 1 }), .6))); }
    s += A.join('');
    // foreground
    s += `<path d="${ridgePath(ff)}" fill="${R[5]}"/>`;
    if (w.river) s += `<path d="M705,820 C660,850 610,880 560,900 L1120,900 C1105,870 1040,845 1008,820Z" fill="url(#${id}riv)" opacity=".92"/><line class="glow" x1="760" y1="858" x2="850" y2="858" stroke="#fff" stroke-width="2.4" opacity=".7"/><line class="glow" style="animation-delay:-1s" x1="930" y1="878" x2="1010" y2="878" stroke="#fff" stroke-width="2.4" opacity=".7"/>`;
    if (w.id === 5) s += at(840, 866, 1.3, pace(otter(), 130, 15, 3));
    let g = ''; for (let x = 0; x < 1600; x += 12 + r() * 12) { if (w.river && x > 560 && x < 1120) continue; const y = ff(x) + 4, h = 12 + r() * 16; g += `M${f(x)},${f(y)} q-3,${f(-h * .6)} -6,${f(-h)} M${f(x)},${f(y)} q1,${f(-h * .7)} 2,${f(-h * 1.15)} M${f(x)},${f(y)} q4,${f(-h * .5)} 8,${f(-h * .8)}`; }
    s += `<path d="${g}" stroke="${w.grass}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="${w.snowy ? .9 : .8}"/>`;
    s += rock(120, 868, 1.3) + rock(1190, 880, 1) + rock(470, 884, .8);
    if (w.snowy) s += `<ellipse cx="114" cy="855" rx="24" ry="7" fill="#fff"/><ellipse cx="1186" cy="870" rx="18" ry="5" fill="#fff"/>`;
    // framing tree
    if (w.bigOak === 0 || w.bigOak === 1) s += oak(1440, 884, 3.3, w.oaks[w.bigOak], r);
    else { const out = [], col = night ? '#05080f' : w.id === 6 ? '#3c2f2a' : '#4c4038'; bare(1450, 890, 150, 34, 7, r, col, out); out.push(`<path d="M1452,700 C1400,640 1330,610 1215,600" stroke="${col}" stroke-width="15" fill="none" stroke-linecap="round"/>`); if (w.snowy) out.push(`<path d="M1430,668 C1390,634 1320,606 1222,594" stroke="#f3f7fd" stroke-width="6" fill="none" stroke-linecap="round"/>`); s += out.join(''); if (w.id === 7) s += at(1290, 596, 1.55, owl()); }
    // particles
    if ((w.id === 1 || w.id === 2) && !w.noLeaves) { const lc = w.leafCols || ['#d2691e', '#f0a830', '#b8401a', '#f6c64a', '#8a3b12']; for (let i = 0; i < (w.id === 1 ? 36 : 14); i++) { const x = r() * 1600, d = 9 + r() * 8; s += `<g transform="translate(${f(x)},0)"><path class="leaf" style="--dx:${f(-160 + r() * 320)}px;--rot:${f(360 + r() * 720)}deg;animation-duration:${f(d)}s;animation-delay:-${f(r() * d)}s" d="M0,-9 Q8,-4 0,9 Q-8,-4 0,-9Z" fill="${lc[i % 5]}"/></g>`; } }
    if (w.snow) for (let i = 0; i < w.snow; i++) { const x = r() * 1600, d = 8 + r() * 9; s += `<g transform="translate(${f(x)},0)"><circle class="snowf" style="--dx:${f(-50 + r() * 100)}px;animation-duration:${f(d)}s;animation-delay:-${f(r() * d)}s" r="${f(2 + r() * 3.2)}" fill="#fff" opacity="${f(.6 + r() * .4)}"/></g>`; }
    return s + '</svg>';
  }

  const CSS = `
.scene{display:block;width:100%;height:100%}
.scene .tw{animation:tw 3s ease-in-out infinite}
.scene .drift{animation:drift 40s ease-in-out infinite alternate}
.scene .leaf{animation:fall 12s linear infinite}
.scene .snowf{animation:snowf 12s linear infinite}
.scene .pace{animation:pace 9s linear infinite}
.scene .leg{animation:leg .22s ease-in-out infinite alternate}
.scene .leg.alt{animation-delay:-.22s}
.scene .hop{animation:hop .7s ease-in-out infinite}
.scene .bob{animation:bob 4s ease-in-out infinite}
.scene .graze{animation:graze 9s ease-in-out infinite}
.scene .wag{animation:wag .28s ease-in-out infinite alternate}
.scene .cross{animation:cross 40s linear infinite}
.scene .meteor{animation:meteor 6s linear infinite}
.scene .fw{animation:fw 3.2s ease-out infinite}
.scene .blink{animation:blink 5s linear infinite}
.scene .glow{animation:glow 1.8s ease-in-out infinite}
.scene .smoke{animation:smoke 4.4s ease-out infinite}
.scene .spin{animation:spin 120s linear infinite}
.scene .flap{animation:flap 2.2s ease-in-out infinite}
.scene .ripple{animation:ripple 2.4s ease-out infinite}
.scene .pulse{animation:pulse 4s ease-in-out infinite}
.scene.still *{animation-play-state:paused!important}
@media (prefers-reduced-motion:reduce){.scene *{animation-play-state:paused!important}}
@keyframes tw{0%,100%{opacity:.25}50%{opacity:1}}
@keyframes drift{from{transform:translateX(-60px)}to{transform:translateX(60px)}}
@keyframes fall{from{transform:translate(0,-60px) rotate(0)}to{transform:translate(var(--dx),980px) rotate(var(--rot))}}
@keyframes snowf{0%{transform:translate(0,-30px)}50%{transform:translate(var(--dx),450px)}100%{transform:translate(0,940px)}}
@keyframes pace{0%{transform:translateX(0) scaleX(1)}47%{transform:translateX(var(--d)) scaleX(1)}50%{transform:translateX(var(--d)) scaleX(-1)}97%{transform:translateX(0) scaleX(-1)}100%{transform:translateX(0) scaleX(1)}}
@keyframes leg{from{transform:rotate(30deg)}to{transform:rotate(-30deg)}}
@keyframes hop{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
@keyframes bob{0%,100%{transform:rotate(0)}50%{transform:rotate(var(--a,7deg))}}
@keyframes graze{0%,12%{transform:rotate(0)}28%,72%{transform:rotate(58deg)}88%,100%{transform:rotate(0)}}
@keyframes wag{from{transform:rotate(-16deg)}to{transform:rotate(16deg)}}
@keyframes cross{from{transform:translateX(0)}to{transform:translateX(var(--d))}}
@keyframes meteor{0%{transform:translate(0,0);opacity:0}3%{opacity:1}22%{transform:translate(-480px,296px);opacity:0}100%{transform:translate(-480px,296px);opacity:0}}
@keyframes fw{0%{transform:scale(.05);opacity:1}45%{transform:scale(1);opacity:1}80%,100%{transform:scale(1.14);opacity:0}}
@keyframes blink{0%,90%,100%{transform:scaleY(0)}93%,97%{transform:scaleY(1)}}
@keyframes glow{0%,100%{opacity:.3}50%{opacity:1}}
@keyframes smoke{from{transform:translate(0,0) scale(.5);opacity:.75}to{transform:translate(34px,-120px) scale(1.9);opacity:0}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes flap{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.7)}}
@keyframes ripple{from{transform:scale(.4);opacity:.8}to{transform:scale(1.5);opacity:0}}
@keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}`;
  root.CAL = { WEEKS, scene, CSS };
})(typeof window !== 'undefined' ? window : globalThis);

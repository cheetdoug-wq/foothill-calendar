// Cheet's Press calendar maker.
//   node make.js orders/CP-1234.json
// Writes:
//   ../o/<slug>/index.html      the online animation pages the QR codes open (commit + push this)
//   out/<slug>/print.html       the printable calendar (then run render.py to get the PDF)
// Order file format: see README.md in this folder.
const fs = require('fs'), path = require('path');
const QR = require('qrcode');
require('./engine.js');
const C = globalThis.CAL, B = require('./bank.js');
const SITE = 'https://cheetspress.store';
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const file = process.argv[2]; if (!file) { console.error('usage: node make.js orders/CP-1234.json'); process.exit(1); }
const O = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!O.slug) { O.slug = Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6); fs.writeFileSync(file, JSON.stringify(O, null, 2)); }
const slug = O.slug, URL = `${SITE}/o/${slug}/`;
let seed = 0; for (const ch of slug) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
function rnd() { seed = (seed + 0x6D2B79F5) >>> 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
const pick = a => a[Math.floor(rnd() * a.length)];

/* ---------- build the weeks ---------- */
const months = O.months.map(s => { const [y, m] = s.split('-').map(Number); return { key: s, y, m: m - 1, nd: new Date(y, m, 0).getDate() }; });
const funPerWeek = O.funPerWeek || (months.length <= 4 ? 2 : 1);
const usedFun = new Set(), usedTitles = new Set();
const weeks = []; // global list
months.forEach(M => {
  const season = B.SEASON(M.m), ov = (O.overrides || {})[M.key] || {};
  const H = B.holidays(M.y, M.m);
  const mine = {}; (O.dates || []).filter(d => d.month === M.key).forEach(d => { mine[d.day] = d.label; });
  M.weeks = [];
  for (let r = 0; r * 7 < M.nd; r++) {
    const a = r * 7 + 1, b = Math.min(r * 7 + 7, M.nd);
    let style = String(B.SETS[season][r % 5]), nameKey = style;
    if (M.m === 11 && b === M.nd) { style = '8'; nameKey = '8'; }
    if (M.m === 0 && r === 0) { style = '8'; nameKey = '8ny'; }
    if (M.m === 6 && r === 0) { style = '8'; nameKey = '8j'; }
    const wo = (ov.weeks || [])[r] || {};
    if (wo.style) { style = String(wo.style); nameKey = style; }
    const v = B.VARIANTS[style] || { kind: Number(style) };
    const preset = C.WEEKS[v.kind - 1];
    const choices = B.NAMES[nameKey] || B.NAMES[String(v.kind)];
    let nm = choices.find(c => !usedTitles.has(c[0])) || pick(choices); usedTitles.add(nm[0]);
    const def = Object.assign({}, preset, v, { id: v.kind, seed: Math.floor(rnd() * 1e9), title: wo.title || nm[0], sub: wo.sub || nm[1] });
    delete def.days; delete def.list; delete def.kind;
    // days
    const list = [];
    for (let d = a; d <= b; d++) list.push({ n: d, dow: DOW[new Date(M.y, M.m, d).getDay()], mon: MON[M.m] });
    const set = (d, name, kind, todo, short) => { const x = list.find(q => q.n === d); Object.assign(x, { name, kind, todo, short: short || name }); };
    for (const d in H) if (+d >= a && +d <= b) set(+d, H[d][0], 'real', H[d][1]);
    for (const d in mine) if (+d >= a && +d <= b) set(+d, mine[d], 'real', B.todoForCustomer(mine[d]));
    for (const d in (ov.fun || {})) if (+d >= a && +d <= b) set(+d, ov.fun[d][0], 'fun', ov.fun[d][1]);
    if (O.funDays !== false && !(ov.fun && Object.keys(ov.fun).length)) {
      const n = (b - a + 1) >= 5 ? funPerWeek : 1;
      const open = list.filter(q => !q.name);
      for (let k = 0; k < n && open.length; k++) {
        const pool = B.FUN.filter(f => !usedFun.has(f[0]) && (f[2] === '*' || f[2].split(',').includes(season)));
        const f = pool.length ? pick(pool) : pick(B.FUN); usedFun.add(f[0]);
        const spot = open.splice(Math.floor(rnd() * open.length), 1)[0];
        set(spot.n, f[0], 'fun', f[1]);
      }
    }
    const w = { def, list, num: weeks.length + 1, month: M, range: `${MON[M.m].slice(0, 3)} ${a}${b > a ? ' to ' + b : ''}` };
    weeks.push(w); M.weeks.push(w);
  }
});

/* ---------- online animation page ---------- */
const hide = !!O.hideNamesOnline;
const pubName = hide ? 'Your calendar' : O.forName;
const pubWeeks = weeks.map(w => ({ def: w.def, range: w.range + ', ' + w.month.y, list: w.list.map(d => (hide && d.kind === 'real' && (O.dates || []).some(x => x.month === w.month.key && x.day === d.n)) ? Object.assign({}, d, { name: 'Special day', short: 'Special day', todo: 'A day that matters to the people on this calendar.' }) : d) }));
const engineSrc = fs.readFileSync(path.join(__dirname, 'engine.js'), 'utf8');
const anim = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${esc(pubName)} · Cheet's Press calendar</title>
<style>
@font-face{font-family:"Figtree";src:url(/fonts/figtree-400.woff2) format("woff2");font-weight:400}
@font-face{font-family:"Figtree";src:url(/fonts/figtree-700.woff2) format("woff2");font-weight:700}
@font-face{font-family:"Bowlby One";src:url(/fonts/bowlby-one.woff2) format("woff2")}
:root{--bg:#0e1512;--panel:#17221c;--line:#2a3a31;--ink:#f3efe4;--muted:#a8b5a8;--gold:#f2bb4e;--leaf:#86c97f;color-scheme:dark}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--ink);font-family:Figtree,system-ui,sans-serif;line-height:1.45}
main{max-width:1040px;margin:0 auto;padding:18px 16px 40px;display:flex;flex-direction:column;gap:16px}
.eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);font-weight:700}
h1{font-family:"Bowlby One",Impact,sans-serif;font-weight:400;font-size:clamp(28px,6vw,48px);line-height:1.05;margin:4px 0 6px}
.sub{color:var(--muted);margin:0;max-width:60ch}
.stage{aspect-ratio:16/9;border-radius:16px;overflow:hidden;background:#000;box-shadow:0 12px 40px rgba(0,0,0,.5)}
nav{display:flex;align-items:center;justify-content:space-between;gap:10px}
nav a{color:var(--ink);text-decoration:none;font-weight:700;padding:10px 14px;border:1.5px solid var(--line);border-radius:999px;background:var(--panel)}
nav a:hover,nav a:focus-visible{border-color:var(--gold);outline:none}nav a[aria-disabled=true]{opacity:.3;pointer-events:none}
.dots{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}.dots a{padding:0;width:30px;height:30px;display:grid;place-items:center;font-size:12px}
.dots a[aria-current=true]{background:var(--gold);color:#1b1405;border-color:var(--gold)}
.days{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:8px;list-style:none;margin:0;padding:0}
.days li{background:var(--panel);border:1.5px solid var(--line);border-radius:12px;padding:10px;min-height:92px;display:flex;flex-direction:column;gap:2px}
.days .dow{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:700}.days .n{font-size:30px;line-height:1;font-weight:700}
.days .nm{font-size:13px;font-weight:700;line-height:1.2;margin-top:4px}.fun .nm{color:var(--leaf)}.real .nm{color:var(--gold)}
.days li.fun{border-color:#3d6a45}.days li.real{border-color:#7a6230}
h2{font-size:22px;margin:8px 0 0}
.todo{display:grid;gap:10px;margin:0;padding:0;list-style:none}.todo li{background:var(--panel);border-left:5px solid var(--leaf);border-radius:10px;padding:12px 14px}.todo li.real{border-left-color:var(--gold)}
.todo b{display:block;font-size:16px}.todo .when{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700}.todo p{margin:4px 0 0;color:#d9dfd3;max-width:65ch}
footer{color:var(--muted);font-size:13px}footer a{color:var(--gold)}
${C.CSS}
</style></head><body><main>
<header><div class="eyebrow">${esc(pubName)} · <span id="range"></span></div><h1 id="title"></h1><p class="sub" id="sub"></p></header>
<div class="stage" id="stage"></div>
<nav aria-label="Weeks"><a id="prev" href="#week-1">Back</a><div class="dots" id="dots"></div><a id="next" href="#week-2">Next</a></nav>
<ul class="days" id="days"></ul>
<h2>What to do this week</h2><ul class="todo" id="todo"></ul>
<footer>Green days are made up for fun. Gold days are birthdays, holidays and special days. Made by <a href="/">Cheet's Press</a>.</footer>
</main>
<script>${engineSrc}</script>
<script>
(function(){
  var W=${JSON.stringify(pubWeeks)}, $=function(i){return document.getElementById(i)};
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
  function pick(){ var m=/^#week-(\\d+)$/.exec(location.hash); if(m&&W[m[1]-1]) return m[1]-1; return 0; }
  function show(){
    var i=pick(), w=W[i];
    $('range').textContent=w.range; $('title').textContent=w.def.title; $('sub').textContent=w.def.sub;
    $('stage').innerHTML=CAL.scene(w.def,{par:'xMidYMid slice',uid:'s'+i});
    $('prev').href='#week-'+Math.max(1,i); $('prev').setAttribute('aria-disabled',i===0);
    $('next').href='#week-'+Math.min(W.length,i+2); $('next').setAttribute('aria-disabled',i===W.length-1);
    $('dots').innerHTML=W.map(function(x,j){return '<a href="#week-'+(j+1)+'" aria-label="Week '+(j+1)+': '+esc(x.def.title)+'" aria-current="'+(j===i)+'">'+(j+1)+'</a>'}).join('');
    $('days').innerHTML=w.list.map(function(d){return '<li class="'+(d.kind||'')+'"><span class="dow">'+d.dow.slice(0,3)+' · '+d.mon.slice(0,3)+'</span><span class="n">'+d.n+'</span>'+(d.name?'<span class="nm">'+esc(d.short)+'</span>':'')+'</li>'}).join('');
    var t=w.list.filter(function(d){return d.name});
    $('todo').innerHTML=t.length?t.map(function(d){return '<li class="'+d.kind+'"><span class="when">'+d.dow+', '+d.mon+' '+d.n+'</span><b>'+esc(d.name)+'</b><p>'+esc(d.todo)+'</p></li>'}).join(''):'<li><b>A quiet week.</b><p>Get outside once and look around.</p></li>';
  }
  window.addEventListener('hashchange',function(){show();window.scrollTo(0,0)}); show();
})();
</script></body></html>`;
const siteDir = path.join(__dirname, '..', 'o', slug); fs.mkdirSync(siteDir, { recursive: true });
fs.writeFileSync(path.join(siteDir, 'index.html'), anim);

/* ---------- printable calendar ---------- */
const qrSvg = text => { const q = QR.create(text, { errorCorrectionLevel: 'M' }); const n = q.modules.size, data = q.modules.data; let d = ''; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (data[y * n + x]) d += `M${x},${y}h1v1h-1z`; return `<svg viewBox="-2 -2 ${n + 4} ${n + 4}" class="qr"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${d}" fill="#111"/></svg>`; };
const font = p => fs.readFileSync(path.join(__dirname, 'node_modules/@fontsource-variable', p)).toString('base64');
const HERO = { 1: '0 525 1600 300', 2: '0 520 1600 300', 3: '0 300 1600 300', 4: '0 500 1600 300', 5: '0 560 1600 300', 6: '0 500 1600 300', 7: '0 470 1600 300', 8: '0 120 1600 300' };
let pages = ''; const usedHero = new Set();
months.forEach(M => {
  const first = new Date(M.y, M.m, 1).getDay();
  const heads = Array.from({ length: 7 }, (_, k) => DOW[(first + k) % 7]);
  const order = [7, 6, 1, 4, 2, 5, 3, 8], cands = order.map(k => M.weeks.find(w => w.def.id === k)).filter(Boolean);
  const heroW = cands.find(w => !usedHero.has(w.def.id)) || cands[0]; usedHero.add(heroW.def.id);
  let rows = '';
  M.weeks.forEach((w, r) => {
    const cells = [];
    for (let k = 0; k < 7; k++) { const d = w.list[k]; if (!d) { cells.push('<div class="cell off"></div>'); continue; }
      cells.push(`<div class="cell ${d.kind || ''}"><div class="num">${d.n}</div>${d.name ? `<div class="nm">${esc(d.short)}</div>` : ''}</div>`); }
    rows += `<div class="wrow"><div class="thumb">${C.scene(w.def, { still: true, par: 'xMidYMid slice', uid: 'g' + w.num })}<div class="tag">Week ${w.num} · ${esc(w.def.title)}</div></div>${cells.join('')}</div>`;
  });
  pages += `<section class="page front">
  <div class="top"><h1>${MON[M.m]} <span>${M.y}</span></h1><div class="who"><b>${esc(O.forName)}</b><br>Cheet's Press calendar</div></div>
  <div class="hero">${C.scene(heroW.def, { still: true, par: 'xMidYMid slice', viewBox: HERO[heroW.def.id], uid: 'h' + M.key })}</div>
  <div class="heads"><div class="hnote">Picture of the week</div>${heads.map(h => `<div>${h}</div>`).join('')}</div>
  <div class="grid">${rows}</div>
  <div class="foot"><span><i class="k fun"></i>Made-up fun day <i class="k real"></i>Birthday, holiday or special day</span><span>Each row is one week, starting on the 1st. Turn over for the animations and what to do.</span></div>
</section>
<section class="page back n${M.weeks.length}">
  <div class="top"><h1>${MON[M.m]} <span>animations and what to do</span></h1><div class="who">Scan a code with a phone camera<br>to watch that week move</div></div>
  <div class="blocks">${M.weeks.map(w => { const sp = w.list.filter(d => d.name); return `<div class="block">
    <div class="qrbox">${qrSvg(URL + '#week-' + w.num)}</div>
    <div class="binfo"><div class="bt"><b>Week ${w.num} · ${esc(w.def.title)}</b><span>${w.range} · ${esc(w.def.sub)}</span></div>
    <div class="tds">${sp.length ? sp.map(d => `<div class="td ${d.kind}"><b>${d.dow.slice(0, 3)} ${d.n} · ${esc(d.name)}</b> ${esc(d.todo)}</div>`).join('') : '<div class="td">A quiet week. Get outside once and look around.</div>'}</div></div>
  </div>`; }).join('')}</div>
  <div class="foot"><span>Made for ${esc(O.forName)} by Cheet's Press · cheetspress.store</span><span><i class="k fun"></i>Made-up fun day <i class="k real"></i>Birthday, holiday or special day</span></div>
</section>`;
});
const print = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${esc(O.forName)} calendar</title><style>
@font-face{font-family:Fraunces;src:url(data:font/woff2;base64,${font('fraunces/files/fraunces-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:Figtree;src:url(data:font/woff2;base64,${font('figtree/files/figtree-latin-wght-normal.woff2')}) format('woff2');font-weight:300 900}
@page{size:11in 8.5in;margin:0}
:root{--paper:#fbf8f0;--ink:#1e2a22;--muted:#66736a;--line:#d8d1bf;--gold:#b8791a;--goldbg:#fbeccb;--leaf:#2f7a43;--leafbg:#dff0dc}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
html,body{margin:0;background:var(--paper);color:var(--ink);font-family:Figtree,sans-serif}
.page{width:11in;height:8.5in;padding:.32in .34in;display:flex;flex-direction:column;gap:.09in;break-after:page;overflow:hidden;background:var(--paper)}
.top{display:flex;justify-content:space-between;align-items:flex-end;flex:none}
h1{font-family:Fraunces,serif;font-weight:700;font-size:34pt;line-height:1;margin:0}h1 span{font-weight:500;color:var(--gold);font-size:20pt}
.who{text-align:right;font-size:10pt;line-height:1.25;color:var(--muted)}.who b{color:var(--ink);font-size:12pt}
.hero{height:1.72in;border-radius:.14in;overflow:hidden;flex:none}
.heads,.wrow{display:grid;grid-template-columns:1.66in repeat(7,1fr);gap:.07in}
.heads{flex:none;font-size:8pt;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:var(--muted)}.heads div{padding-left:.06in}.hnote{color:var(--gold)}
.grid{flex:1;display:grid;grid-auto-rows:1fr;gap:.07in;min-height:0}.wrow{min-height:0}
.thumb{border-radius:.09in;overflow:hidden;position:relative;min-height:0}
.thumb .tag{position:absolute;left:0;right:0;bottom:0;background:rgba(20,28,22,.82);color:#fff;font-size:7.4pt;font-weight:700;padding:.03in .07in;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cell{border:1.3pt solid var(--line);border-radius:.09in;background:#fff;padding:.05in .08in;min-width:0;min-height:0;overflow:hidden}.cell.off{border:none;background:none}
.cell.fun{border-color:var(--leaf);background:var(--leafbg)}.cell.real{border-color:var(--gold);background:var(--goldbg)}
.num{font-family:Fraunces,serif;font-size:19pt;line-height:1;font-weight:600}.nm{font-size:8.6pt;font-weight:700;line-height:1.12;margin-top:.035in}
.fun .nm{color:var(--leaf)}.real .nm{color:#7d4f08}
.foot{flex:none;display:flex;justify-content:space-between;gap:.3in;font-size:8.5pt;color:var(--muted);font-weight:600;align-items:center}
.k{width:.13in;height:.13in;border-radius:50%;display:inline-block;margin:0 .05in 0 .12in;vertical-align:-.02in}.k.fun{background:var(--leaf)}.k.real{background:var(--gold)}.foot span:first-child .k:first-child{margin-left:0}
.blocks{flex:1;display:grid;grid-auto-rows:1fr;gap:.1in;min-height:0}
.block{display:flex;gap:.16in;border:1.3pt solid var(--line);border-radius:.12in;background:#fff;padding:.1in .14in;min-height:0;align-items:center}
.qrbox{flex:none;height:100%;aspect-ratio:1;max-height:1.9in;display:grid;place-items:center}.qr{width:100%;height:100%;display:block}
.binfo{flex:1;min-width:0;display:flex;flex-direction:column;gap:.06in}
.bt b{font-family:Fraunces,serif;font-size:15pt;font-weight:700;margin-right:.12in}.bt span{font-size:9pt;color:var(--muted);font-weight:600}
.tds{display:grid;grid-template-columns:1fr 1fr;gap:.05in .22in}
.td{font-size:8.8pt;line-height:1.26;border-left:3.5pt solid var(--leaf);padding-left:.08in;color:#34423a}.td.real{border-left-color:var(--gold)}.td b{color:var(--ink)}
.n4 .td{font-size:10pt}.n4 .bt b{font-size:17pt}
${C.CSS}
</style></head><body>${pages}</body></html>`;
const outDir = path.join(__dirname, 'out', slug); fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'print.html'), print);
console.log(JSON.stringify({ slug, url: URL, weeks: weeks.length, pages: months.length * 2, print: path.join(outDir, 'print.html'), site: path.join(siteDir, 'index.html') }, null, 1));

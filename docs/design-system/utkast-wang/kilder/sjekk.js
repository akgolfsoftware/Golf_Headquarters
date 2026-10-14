// Bruk: NODE_PATH=<hovedrepo>/node_modules node sjekk.js <fil.html> <ut-prefiks>
// Gir skjermbilder (mobil, PC, sportssjef-meny), måler sidelengs rulling i 390 og 360 px,
// samler JS-feil og måler kontrast for all tekst i skjermen (krav 4,5:1, stor tekst 3:1).
const { chromium } = require('playwright');

const KONTRAST = () => {
  const les = (s) => {
    let m = s.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    if (m) return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
    m = s.match(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/);
    if (m) return [m[1] * 255, m[2] * 255, m[3] * 255, m[4] === undefined ? 1 : +m[4]];
    return null;
  };
  const bland = (o, u) => [0, 1, 2].map((i) => o[i] * o[3] + u[i] * (1 - o[3])).concat(1);
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const app = document.querySelector('.app');
  const ut = [], manuelt = new Set();
  app.querySelectorAll('*').forEach((e) => {
    const egen = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!egen) return;
    const r = e.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const cs = getComputedStyle(e);
    if (cs.visibility === 'hidden' || +cs.opacity === 0) return;
    // Bakgrunnslag oppover til første helt tette lag
    const lag = []; let n = e, bilde = false;
    while (n && n.nodeType === 1) {
      const s = getComputedStyle(n);
      if (s.backgroundImage !== 'none') { bilde = true; break; }
      const b = les(s.backgroundColor);
      if (b && b[3] > 0) { lag.push(b); if (b[3] >= 1) break; }
      n = n.parentElement;
    }
    if (bilde && !lag.some((l) => l[3] >= 1)) { manuelt.add((e.className.baseVal ?? e.className) || e.tagName); return; }
    let bg = [255, 255, 255, 1];
    for (let i = lag.length - 1; i >= 0; i--) bg = bland(lag[i], bg);
    const fg = bland(les(cs.color) || [0, 0, 0, 1], bg);
    const a = lum(fg), b = lum(bg), k = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const px = parseFloat(cs.fontSize), vekt = parseInt(cs.fontWeight, 10);
    const stor = px >= 24 || (px >= 18.66 && vekt >= 700);
    if (k < (stor ? 3 : 4.5)) ut.push(`${k.toFixed(2)} «${e.textContent.trim().slice(0, 30)}» ${cs.color} på rgb(${bg.slice(0, 3).map(Math.round)})`);
  });
  return { under: ut.slice(0, 20), antallUnder: ut.length, manuelt: [...manuelt].slice(0, 10) };
};

(async () => {
  const [fil, ut] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1300, height: 2400 } });
  const fe = [];
  p.on('pageerror', (e) => fe.push(e.message));
  p.on('requestfailed', (r) => fe.push('mangler ' + r.url()));
  await p.goto('file://' + fil);
  await p.waitForTimeout(1800);
  const mal = () => p.evaluate(() => {
    const a = document.querySelector('.app'); if (!a) return 'ingen app';
    const q = a.getBoundingClientRect();
    return { sidelengs: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      utenfor: [...a.querySelectorAll('*')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.right > q.right + 1; }).map((e) => e.className.baseVal ?? e.className).slice(0, 5) };
  });
  await (await p.$('#ramme')).screenshot({ path: ut + '-mob.png' });
  console.log('390', JSON.stringify(await mal()));
  console.log('kontrast mob', JSON.stringify(await p.evaluate(KONTRAST)));
  await p.click('[data-bredde=pc]'); await p.waitForTimeout(1800);
  await (await p.$('#ramme')).screenshot({ path: ut + '-pc.png' });
  console.log('kontrast pc', JSON.stringify(await p.evaluate(KONTRAST)));
  if (await p.$('[data-rolle=sportssjef]')) {
    await p.click('[data-rolle=sportssjef]'); await p.waitForTimeout(1200);
    await p.screenshot({ path: ut + '-sportssjef-pc.png', clip: { x: 0, y: 0, width: 1300, height: 1100 } });
    await p.click('[data-bredde=mob]'); await p.waitForTimeout(800);
    const mer = await p.$('.bunnmeny [data-mer]');
    if (mer) { await mer.click(); await p.waitForTimeout(300); await (await p.$('#ramme')).screenshot({ path: ut + '-mer-mob.png' }); }
    await p.click('[data-rolle=trener]');
  }
  for (const t of ['tom', 'laster', 'feil']) {
    if (!(await p.$(`[data-tilstand=${t}]`))) continue;
    await p.click(`[data-tilstand=${t}]`); await p.waitForTimeout(500);
    console.log(t, JSON.stringify(await mal()), JSON.stringify((await p.evaluate(KONTRAST)).under));
  }
  await p.click('[data-tilstand=data]');
  await p.setViewportSize({ width: 360, height: 900 });
  await p.click('[data-bredde=mob]'); await p.waitForTimeout(900);
  console.log('360', JSON.stringify(await mal()));
  console.log('feil', fe);
  await b.close();
})();

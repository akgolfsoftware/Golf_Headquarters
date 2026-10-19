// Lager src/styles/flater-ny*.css fra utkastene i docs/design-system/utkast-flater.
// Alt avgrenses til .fln. Keyframes får prefiks fln-. Kjør fra reporoten: node scripts/lag-flater-ny-css.mjs
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
const rot = process.argv[2] ?? process.cwd();
const u = (f) => fs.readFileSync(path.join(rot, 'docs/design-system/utkast-flater', f), 'utf8');
const stil = (html) => html.match(/<style>([\s\S]*?)<\/style>/)[1];

const DROPP = /^(\.ytre|\.hode|\.kontroller|\.velger|\.scene|\.ramme|\.skala|\.for-bilde|\.notater|\.endringer|\.meta-s|\.skjermvalg|body|\*$|:root\[data-theme|\.app\.natt)/;
const KF = ['skjelett', 'tegn', 'vokse', 'inn', 'opp'];

function prefiks(sel) {
  return sel.split(',').map((s) => {
    s = s.trim();
    if (s.startsWith('.app')) return s.replace(/^\.app/, '.fln');
    if (s === '*') return '.fln *';
    return '.fln ' + s;
  }).join(',');
}

/* Felles tokens (src/styles/ak-tokens.css, forslag 1 i analysen 20.10.2026): hex som har en
   token blir var(--ak-*), så .fln-laget er alias og ikke en tredje kopi av fargene. */
const TOKEN = {
  '#faf8f3': '--ak-sand-100', '#f1eee8': '--ak-sand-150', '#ddd9d1': '--ak-sand-300', '#ffffff': '--ak-hvit',
  '#141413': '--ak-g900', '#2a2926': '--ak-g800', '#46443f': '--ak-g600', '#686560': '--ak-g500',
  '#9b2415': '--ak-rust-600', '#fbe9e7': '--ak-rust-100', '#8a2a1c': '--ak-rust-tekst',
  '#2f6b3a': '--ak-green-700', '#eaf3e9': '--ak-green-50', '#7e6110': '--ak-amber-700', '#fbf4e4': '--ak-amber-50', '#1d3557': '--ak-blue-800',
  '#788c5d': '--ak-fys', '#556740': '--ak-fys-ink-fylt', '#b8852a': '--ak-tek', '#825d15': '--ak-tek-ink-fylt',
  '#2563eb': '--ak-slag', '#1d4fd0': '--ak-slag-ink', '#c46686': '--ak-spill', '#954661': '--ak-spill-ink-fylt', '#a32d2d': '--ak-turn',
};
const tilToken = (v) => v.replace(/#[0-9a-fA-F]{6}\b/g, (m) => (TOKEN[m.toLowerCase()] ? `var(${TOKEN[m.toLowerCase()]})` : m));

function lag(css, medTokens) {
  const root = postcss.parse(css);
  root.walkDecls((d) => { d.value = tilToken(d.value); });
  root.walkAtRules('keyframes', (a) => { if (KF.includes(a.params)) a.params = 'fln-' + a.params; });
  root.walkDecls(/^animation/, (d) => { for (const k of KF) d.value = d.value.replace(new RegExp('(^|\\s)' + k + '(\\s|$)'), '$1fln-' + k + '$2'); });
  root.walkAtRules('media', (a) => { if (/prefers-color-scheme/.test(a.params)) a.remove(); });
  root.walkRules((r) => {
    if (r.parent.type === 'atrule' && r.parent.name === 'keyframes') return;
    if (r.selector === ':root') {
      if (!medTokens) { r.remove(); return; }
      r.selector = '.fln';
      r.walkDecls((d) => {
        if (d.prop.startsWith('--side')) d.remove();
        if (d.prop === '--sans') d.value = 'var(--ak-font-sans)';
        if (d.prop === '--mono') d.value = 'var(--ak-font-mono)';
      });
      return;
    }
    const deler = r.selector.split(',').map((s) => s.trim()).filter((s) => !DROPP.test(s));
    if (!deler.length) { r.remove(); return; }
    r.selector = prefiks(deler.join(','));
  });
  return root.toString().replace(/\n{3,}/g, '\n\n');
}

const felles = fs.readFileSync(path.join(rot, 'docs/design-system/utkast-playerhq/felles/felles.css'), 'utf8');
const flater = u('felles/flater.css');
const sys = stil(u('gfgk-system.html')).split('\n').filter((l) => /^\.sys/.test(l)).join('\n');
const sysPc = '@container (min-width:900px){' + stil(u('gfgk-system.html')).split('\n').filter((l) => /^\s+\.sys/.test(l)).join('\n') + '}';

const hode = (t) => `/*\n * ${t}\n * GENERERT av scripts/lag-flater-ny-css.mjs fra docs/design-system/utkast-flater (utkast 1, 15.10.2026),\n * avgrenset til .fln. Klassenavnene er utkastets, så skjermene kan porteres linje for linje.\n * Rett i utkastet eller i skriptet, ikke her. PC fra 900 px containerbredde.\n */\n`;

const EKSTRA = `
/* ---------- Tillegg i appen (ikke i utkastet) ---------- */
/* Treffmål minst 44 px for logo og lenker i topplinja. */
.fln .fl-konto-topp > a{display:inline-flex;align-items:center;min-height:44px;min-width:44px}
.fln .fl-tilbake{min-height:44px}
/* Valg, brikker og områdeknapper: 44 px på berøringsskjerm (utkastet har 40). Avkrysningen er hele raden. */
.fln.fln .valg button,.fln.fln .chips button,.fln.fln .omr button{min-height:44px}
.fln .pakke{align-content:start}
`;

const ut = path.join(rot, 'src/styles');
fs.writeFileSync(path.join(ut, 'flater-ny.css'),
  hode('Øvrige flater i nytt design: grunnmur (tokens, byggeklosser, skall for konto, system og forelder).') +
  `.fln{container-type:inline-size;min-height:100dvh;display:flex;flex-direction:column}\n.fln *,.fln *::before,.fln *::after{box-sizing:border-box}\n.fln .innhold{flex:1 0 auto;width:100%}\n` +
  lag(felles, true) + '\n' + lag(flater, false) + '\n/* SY-01 systemsider (gfgk-system.html) */\n' + lag(sys + '\n' + sysPc, false) + EKSTRA);
fs.writeFileSync(path.join(ut, 'flater-ny-konto.css'), hode('Innlogging og oppstart (AU-01 til AU-06), fra innlogging.html.') + lag(stil(u('innlogging.html')), false) + '\n');
fs.writeFileSync(path.join(ut, 'flater-ny-forelder.css'), hode('Forelder (FO-01 til FO-06), fra forelder.html.') + lag(stil(u('forelder.html')), false) + '\n');
console.log('ok');

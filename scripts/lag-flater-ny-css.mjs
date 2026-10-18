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

function lag(css, medTokens) {
  const root = postcss.parse(css);
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
        if (d.prop === '--sans') d.value = 'var(--font-ibm-plex-sans, "IBM Plex Sans"), system-ui, -apple-system, sans-serif';
        if (d.prop === '--mono') d.value = 'var(--font-ibm-plex-mono, "IBM Plex Mono"), ui-monospace, Menlo, monospace';
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

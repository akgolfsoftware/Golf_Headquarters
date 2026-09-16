#!/usr/bin/env node
// Bygger det Claude Design-synken trenger, fra appens egne kilder (cfg.buildCmd):
//   1. typer   — tsc skriver .d.ts for eksportlista (pkg/index.ts) til pkg/types/
//   2. stier   — «@/…» i de genererte .d.ts skrives om til relative stier (ts-morph kjenner ikke aliaset)
//   3. CSS     — Tailwind v4 kompilerer src/app/globals.css flatt til pkg/css/app.css
//   4. fonter  — Google Fonts-CSS-en hentes med curl (via proxy), woff2-filene lastes ned til
//                pkg/fonts/ og @font-face skrives om til lokale stier (pkg/fonts/fonts-local.css).
//                Feiler nettet, beholdes den fjerne @import-en som reserve.
//   5. entry   — pkg/css/entry.css = fonts.css (--font-*-variabler) + app.css
// Skriver aldri til src/. pkg/types/, pkg/css/ og pkg/fonts/ er maskinstate (gitignored).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const PKG = join(HERE, 'pkg');
const walk = (d, out = []) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
};

// 1. typer
const typesDir = join(PKG, 'types');
rmSync(typesDir, { recursive: true, force: true });
let tscOut = '';
try {
  tscOut = execFileSync(join(ROOT, 'node_modules/.bin/tsc'), ['-p', join(PKG, 'tsconfig.types.json')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
} catch (e) { tscOut = String(e.stdout ?? '') + String(e.stderr ?? ''); }
const tscErrs = tscOut.split('\n').filter((l) => /error TS\d+/.test(l));
if (!existsSync(join(typesDir, '.design-sync/pkg/index.d.ts'))) { console.error(tscOut); throw new Error('tsc skrev ingen index.d.ts'); }
const dts = walk(typesDir).filter((p) => p.endsWith('.d.ts'));
console.error(`  typer: ${dts.length} .d.ts${tscErrs.length ? ` (${tscErrs.length} tsc-feil, deklarasjonene er skrevet likevel — se .design-sync/.cache/tsc.log)` : ''}`);
mkdirSync(join(HERE, '.cache'), { recursive: true });
writeFileSync(join(HERE, '.cache/tsc.log'), tscOut);

// 2. @/ → relative
let rewritten = 0;
for (const f of dts) {
  const before = readFileSync(f, 'utf8');
  const after = before.replace(/(from\s+|import\(\s*)(["'])@\/([^"']+)\2/g, (_m, pre, q, p) => {
    let rel = relative(dirname(f), join(typesDir, 'src', p)).split(sep).join('/');
    if (!rel.startsWith('.')) rel = './' + rel;
    return `${pre}${q}${rel}${q}`;
  });
  if (after !== before) { writeFileSync(f, after); rewritten++; }
}
console.error(`  stier: @/ skrevet om i ${rewritten} filer`);

// 3. CSS
const tw = join(ROOT, '.ds-sync/node_modules/.bin/tailwindcss');
if (!existsSync(tw)) throw new Error('Mangler .ds-sync/node_modules/.bin/tailwindcss — stage synk-skriptene først (design-sync SKILL.md steg 7)');
mkdirSync(join(PKG, 'css'), { recursive: true });
execFileSync(tw, ['-i', join(ROOT, 'src/app/globals.css'), '-o', join(PKG, 'css/app.css')], { cwd: ROOT, stdio: ['ignore', 'ignore', 'pipe'] });
const app = readFileSync(join(PKG, 'css/app.css'), 'utf8');
console.error(`  css: app.css ${(app.length / 1024).toFixed(0)} KB`);

// 4. fonter — samme familier og vekter som src/app/layout.tsx laster via next/font/google.
const FONT_QUERY = 'family=Archivo:wght@400;500;600&family=Geist:wght@300..700&family=Geist+Mono:wght@400..600&family=IBM+Plex+Mono:wght@400;500;600&family=Lora:ital,wght@0,400..700;1,400..700&family=Oswald:wght@500;600;700&family=Poppins:wght@400;500;600;700&display=swap';
const FONT_URL = `https://fonts.googleapis.com/css2?${FONT_QUERY}`;
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36';
const fontsDir = join(PKG, 'fonts');
mkdirSync(fontsDir, { recursive: true });
let fontsLocal = false;
try {
  const css = execFileSync('curl', ['-sS', '-L', '--max-time', '30', '-A', UA, FONT_URL], { encoding: 'utf8' });
  // Google skriver subsettet som kommentar FORAN hver blokk: /* latin */ @font-face { … }
  const blocks = [...css.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*(@font-face\s*\{[\s\S]*?\})/g)].map((m) => ({ sub: m[1], b: m[2] }));
  if (!blocks.length) throw new Error('fant ingen @font-face-blokker i svaret fra Google Fonts');
  rmSync(fontsDir, { recursive: true, force: true });
  mkdirSync(fontsDir, { recursive: true });
  let files = 0;
  const out = [];
  for (const { sub, b } of blocks) {
    if (sub !== 'latin' && sub !== 'latin-ext') continue; // norsk (æøå) ligger i latin
    const family = /font-family:\s*'([^']+)'/.exec(b)?.[1] ?? 'font';
    const style = /font-style:\s*(\w+)/.exec(b)?.[1] ?? 'normal';
    const weight = (/font-weight:\s*([\d ]+)/.exec(b)?.[1] ?? '400').trim().replace(' ', '-');
    const url = /url\((https:[^)]+\.woff2)\)/.exec(b)?.[1];
    if (!url) continue;
    const name = `${family.replace(/\s+/g, '')}-${weight}-${style}-${sub}.woff2`;
    const target = join(fontsDir, name);
    if (!existsSync(target)) { execFileSync('curl', ['-sS', '-L', '--max-time', '60', '-A', UA, '-o', target, url]); files++; }
    out.push(b.replace(url, `./${name}`).trim());
  }
  if (!out.length) throw new Error('ingen @font-face i svaret fra Google Fonts');
  writeFileSync(join(fontsDir, 'fonts-local.css'), `/* GENERERT av build.mjs fra Google Fonts (OFL-lisensierte familier). */\n${out.join('\n')}\n`);
  fontsLocal = true;
  console.error(`  fonter: ${out.length} @font-face lokalt (${files} nye filer lastet ned) → pkg/fonts/fonts-local.css`);
} catch (e) {
  console.error(`  ! fonter: klarte ikke hente Google Fonts (${String(e.message ?? e).split('\n')[0]}) — bruker fjern @import som reserve`);
}

// 5. entry — variablene fra fonts.css; fjern-importen bare når lokale filer mangler.
const prelude = readFileSync(join(HERE, 'fonts.css'), 'utf8');
const preludeUtenImport = prelude.replace(/^@import url\([^)]*\);\s*$/m, '');
writeFileSync(join(PKG, 'css/entry.css'), (fontsLocal ? preludeUtenImport : prelude) + '\n' + app);
console.error(`  entry: pkg/css/entry.css skrevet (${fontsLocal ? 'lokale fonter via extraFonts' : 'fjern font-import'})`);

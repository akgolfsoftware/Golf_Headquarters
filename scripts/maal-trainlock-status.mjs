// Måler faktisk Train-lock-status per skjerm-rute (grunnlaget for docs/natt/SKJERM-STATUS-*.md).
// Filer brukt av >50 % av rutene regnes som felles-chrome og holdes utenfor klassifiseringen
// (T1-skallet er TL og importeres overalt — uten filteret ser alt «blandet» ut).
// Kjør: node scripts/maal-trainlock-status.mjs
// Følger lokale imports (@/ og relative) fra page.tsx, maks dybde 3.
import fs from "node:fs";
import path from "node:path";

const ROOT = "/Users/anderskristiansen/Developer/akgolf-hq";
const SRC = path.join(ROOT, "src");
const exts = [".tsx", ".ts"];

function resolveImport(spec, fromFile) {
  let base;
  if (spec.startsWith("@/")) base = path.join(SRC, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(fromFile), spec);
  else return null;
  for (const e of exts) {
    if (fs.existsSync(base + e)) return base + e;
    if (fs.existsSync(path.join(base, "index" + e))) return path.join(base, "index" + e);
  }
  return null;
}

const fileCache = new Map();
function analyzeFile(f) {
  if (fileCache.has(f)) return fileCache.get(f);
  const src = fs.readFileSync(f, "utf8");
  const res = {
    tl: /from "@\/lib\/v2\/train-lock"|--tl-/.test(src),
    paper: /from "@\/lib\/v2\/tokens"/.test(src),
    hex: (src.match(/#[0-9A-Fa-f]{6}\b/g) || []).length,
    redirect: /permanentRedirect\(|redirect\(/.test(src) && src.length < 1500,
    imports: [...src.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]),
  };
  fileCache.set(f, res);
  return res;
}

function closure(entry, depth = 3) {
  const seen = new Set();
  const stack = [[entry, 0]];
  while (stack.length) {
    const [f, d] = stack.pop();
    if (seen.has(f) || d > depth) continue;
    seen.add(f);
    const a = analyzeFile(f);
    for (const spec of a.imports) {
      const r = resolveImport(spec, f);
      if (r && !seen.has(r)) stack.push([r, d + 1]);
    }
  }
  return [...seen];
}

const pages = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === "page.tsx") pages.push(p);
  }
}
for (const d of ["app/admin", "app/portal", "app/forelder"]) walk(path.join(SRC, d));

const rows = [];
for (const p of pages.sort()) {
  const route =
    "/" +
    path
      .relative(path.join(SRC, "app"), path.dirname(p))
      .replace(/\((legacy|marketing|internal)\)\//g, "(legacy)/");
  const pageA = analyzeFile(p);
  if (pageA.redirect) {
    rows.push({ route, klasse: "REDIRECT", tlF: [], paperF: [], total: 0 });
    continue;
  }
  const files = closure(p);
  const tlF = [], paperF = [];
  for (const f of files) {
    const a = analyzeFile(f);
    if (a.tl) tlF.push(path.relative(ROOT, f));
    if (a.paper) paperF.push(path.relative(ROOT, f));
  }
  rows.push({ route, tlF, paperF, total: files.length });
}

// Chrome-filter: filer i >50 % av skjerm-rutene er felles-chrome, ikke skjermens egne.
const skjermer = rows.filter((r) => !r.klasse);
const forekomst = new Map();
for (const r of skjermer)
  for (const f of new Set([...r.tlF, ...r.paperF]))
    forekomst.set(f, (forekomst.get(f) || 0) + 1);
const chrome = new Set([...forekomst].filter(([, c]) => c > skjermer.length / 2).map(([f]) => f));

for (const r of skjermer) {
  const tl = r.tlF.filter((f) => !chrome.has(f));
  const paper = r.paperF.filter((f) => !chrome.has(f));
  if (tl.length && !paper.length) r.klasse = "PORTET";
  else if (tl.length && paper.length) r.klasse = "BLANDET";
  else if (paper.length) r.klasse = "PAPER";
  else r.klasse = "CHROME-ONLY";
  r.tlF = tl;
  r.paperF = paper;
}

const summary = {};
for (const r of rows) summary[r.klasse] = (summary[r.klasse] || 0) + 1;
console.log(JSON.stringify({ summary, chrome: [...chrome].sort(), rows }, null, 1));

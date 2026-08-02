// Midlertidig måleskript (fase 4) — slettes før PR.
// Trekker ut hvert style={{ … }}-uttrykk med brace-matching, finner fargeliteraler.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const files = execSync("git ls-files 'src/**/*.tsx'", { encoding: "utf8" })
  .trim().split("\n").filter(Boolean);

const MARK = "style={{";

function extractStyleExprs(src) {
  const out = [];
  let i = 0;
  while (true) {
    const at = src.indexOf(MARK, i);
    if (at === -1) break;
    // start etter "style={" -> pos på den ytre {
    let p = at + "style={".length;
    let depth = 0, inStr = null, esc = false;
    let start = p;
    for (; p < src.length; p++) {
      const c = src[p];
      if (esc) { esc = false; continue; }
      if (inStr) {
        if (c === "\\") { esc = true; continue; }
        if (c === inStr) inStr = null;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
      if (c === "{") depth++;
      else if (c === "}") { depth--; if (depth === 0) { p++; break; } }
    }
    out.push({ index: at, text: src.slice(start, p) });
    i = p;
  }
  return out;
}

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const FUNC = /\b(?:rgba?|hsla?)\(\s*[0-9][^)]*\)/g;

function norm(v) {
  v = v.trim();
  if (v.startsWith("#")) {
    let h = v.slice(1).toLowerCase();
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    if (h.length === 4) h = h.split("").map((c) => c + c).join("");
    return "#" + h;
  }
  const m = v.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)\s*(?:[,/]\s*([\d.%]+)\s*)?\)$/i);
  if (m) {
    const [r, g, b] = [m[1], m[2], m[3]].map((x) => Number(x));
    const hex = "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
    if (m[4] === undefined || m[4] === "1" || m[4] === "1.0" || m[4] === "100%") return hex;
    return `${hex} @a=${m[4].endsWith("%")?Number(m[4].slice(0,-1))/100:Number(m[4])}`;
  }
  return v.toLowerCase().replace(/\s+/g, " ");
}

const perValue = new Map();   // normalisert -> {count, files:Map(file->n), raws:Set}
let occWithHard = 0, totalExprs = 0, filesWithHard = new Set();
const perFile = new Map();

for (const f of files) {
  const src = readFileSync(f, "utf8");
  if (!src.includes(MARK)) continue;
  for (const e of extractStyleExprs(src)) {
    totalExprs++;
    const lits = [...(e.text.match(HEX) || []), ...(e.text.match(FUNC) || [])];
    if (!lits.length) continue;
    occWithHard++;
    filesWithHard.add(f);
    perFile.set(f, (perFile.get(f) || 0) + lits.length);
    for (const raw of lits) {
      const n = norm(raw);
      if (!perValue.has(n)) perValue.set(n, { count: 0, files: new Map(), raws: new Set() });
      const rec = perValue.get(n);
      rec.count++;
      rec.raws.add(raw);
      rec.files.set(f, (rec.files.get(f) || 0) + 1);
    }
  }
}

const totalLits = [...perValue.values()].reduce((a, b) => a + b.count, 0);
const out = {
  totalStyleExprs: totalExprs,
  occurrencesWithHardcodedColor: occWithHard,
  totalLiterals: totalLits,
  uniqueValues: perValue.size,
  filesWithHardcoded: filesWithHard.size,
  perFile: [...perFile.entries()].sort((a, b) => b[1] - a[1]),
  values: [...perValue.entries()]
    .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
    .map(([v, r]) => ({ value: v, count: r.count, raws: [...r.raws], files: [...r.files.entries()].sort((a, b) => b[1] - a[1]) })),
};
writeFileSync("/tmp/gap-colors.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify({ totalExprs, occWithHard, totalLits, unique: perValue.size, files: filesWithHard.size }));

// Fase 4 — matcher fargeliteraler mot CSS-variabler og T. Midlertidig.
import { readFileSync, writeFileSync } from "node:fs";

const CSS = [
  "src/app/globals.css",
  "src/styles/golfdata-tokens.css",
  "src/styles/wang-tokens.css",
  "src/styles/gfgk-junior-tokens.css",
  "src/components/athletic/golfdata/golfdata.css",
  "src/styles/v2/patterns.css",
  "src/styles/v2/motion.css",
];

function norm(v) {
  v = v.trim();
  if (v.startsWith("#")) {
    let h = v.slice(1).toLowerCase();
    if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("");
    return "#" + h;
  }
  const m = v.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)\s*(?:[,/]\s*([\d.%]+)\s*)?\)$/i);
  if (m) {
    const hex = "#" + [m[1], m[2], m[3]].map((x) => Math.round(Number(x)).toString(16).padStart(2, "0")).join("");
    if (m[4] === undefined || m[4] === "1" || m[4] === "1.0" || m[4] === "100%") return hex;
    return `${hex} @a=${m[4].endsWith("%")?Number(m[4].slice(0,-1))/100:Number(m[4])}`;
  }
  return v.toLowerCase().replace(/\s+/g, " ");
}

// Indeks: normalisert verdi -> [{var,file,line,scope}]
const index = new Map();
const declStats = {};
for (const f of CSS) {
  let src;
  try { src = readFileSync(f, "utf8"); } catch { continue; }
  const lines = src.split("\n");
  let scope = ":root";
  let n = 0;
  lines.forEach((ln, i) => {
    const sel = ln.match(/^\s*([^{}/]+)\{\s*$/);
    if (sel && !ln.trim().startsWith("--")) scope = sel[1].trim();
    const d = ln.match(/^\s*(--[A-Za-z0-9-]+)\s*:\s*([^;]+);/);
    if (!d) return;
    n++;
    const val = d[2].trim();
    const lits = val.match(/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(\s*[0-9][^)]*\)/g) || [];
    // ren farge-deklarasjon: hele verdien er én literal
    for (const lit of lits) {
      const k = norm(lit);
      if (!index.has(k)) index.set(k, []);
      index.get(k).push({ name: d[1], file: f, line: i + 1, scope, whole: val === lit, raw: val });
    }
  });
  declStats[f] = n;
}

const T_HEX = {
  onForest: "#FFFFFF", "tee.hvit": "#F5F5F5", "tee.gul": "#FFD600", "tee.rod": "#E53935",
  "milepael.topp10": "#2EA66B", "milepael.proDebut": "#7B61FF", chartFaint: "#B8B5AC",
  tierCollegeBg: "#E8F5F0", "wrapped.textOnDark": "#F7F7F4", "wrapped.textOnLight": "#101613",
  "wrapped.bgForest[0]": "#005840", "wrapped.bgForest[1]": "#003D2C",
  "wrapped.bgForestDark[0]": "#002A1A", "wrapped.bgForestDark[1]": "#001510",
  "wrapped.bgLime[0]": "#D1F843", "wrapped.bgLime[1]": "#B8E020",
  "wrapped.bgOffwhite[0]": "#FAFAF7", "wrapped.bgOffwhite[1]": "#F1EEE5",
};
const tIndex = new Map();
for (const [k, v] of Object.entries(T_HEX)) {
  const n = norm(v);
  if (!tIndex.has(n)) tIndex.set(n, []);
  tIndex.get(n).push(k);
}

const colors = JSON.parse(readFileSync("/tmp/gap-colors.json", "utf8"));
const result = colors.values.map((v) => ({
  value: v.value,
  count: v.count,
  files: v.files,
  cssMatches: (index.get(v.value) || []).filter((m) => m.whole),
  cssPartial: (index.get(v.value) || []).filter((m) => !m.whole).length,
  tMatches: tIndex.get(v.value) || [],
}));
const utenMatch = result.filter((r) => !r.cssMatches.length && !r.tMatches.length);
writeFileSync("/tmp/gap-match.json", JSON.stringify({ declStats, result }, null, 2));
console.log("deklarasjoner:", JSON.stringify(declStats, null, 1));
console.log("unike:", result.length,
  "| med CSS-var:", result.filter((r) => r.cssMatches.length).length,
  "| med T-treff:", result.filter((r) => r.tMatches.length).length,
  "| uten match:", utenMatch.length,
  "| forekomster uten match:", utenMatch.reduce((a, b) => a + b.count, 0));

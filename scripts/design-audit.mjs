#!/usr/bin/env node
/**
 * design-audit.mjs — mekanisk designaudit per skjermfamilie (03.09.2026).
 *
 * Bakgrunn: impeccable-audit av tre tilfeldige skjermer 03.09 fant at
 * skjermene taper på det samme overalt (halve tekststørrelser, skjult fokus,
 * alert()-bokser, gammelt tier-språk, Paper-rester). Denne riggen måler
 * nøyaktig de tingene over HELE PlayerHQ, AgencyOS og Forelder, per familie,
 * så den manuelle auditen (fem dimensjoner, 0–4) kan starte fra tall i
 * stedet for fra gjetning.
 *
 * Familie = første katalog under flaten (portal/meg, admin/plan, forelder/okonomi).
 * Filsett per familie = alle page.tsx + layout.tsx i familien, pluss komponentene
 * de importerer direkte fra @/components (ett nivå). Redirect-sider telles ikke
 * som skjermer.
 *
 * Bruk:
 *   node scripts/design-audit.mjs                 → skriver docs/design-audit/<dato>/scoreboard.{md,json}
 *   node scripts/design-audit.mjs --familie portal/meg   → én familie, til stdout
 *   node scripts/design-audit.mjs --uten-detektor  → hopper over impeccable-detektoren (raskere)
 *
 * Det mekaniske poenget (0–10) er et UTGANGSPUNKT for den manuelle auditen,
 * ikke en dom. Formelen står i `mekaniskPoeng()`.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";

const rot = resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const kunFamilie = args.includes("--familie") ? args[args.indexOf("--familie") + 1] : null;
const utenDetektor = args.includes("--uten-detektor");

const DETEKTOR = [
  join(rot, ".claude/skills/impeccable/scripts/detect.mjs"),
  join(homedir(), ".claude/skills/impeccable/scripts/detect.mjs"),
].find((p) => existsSync(p));

const FLATER = ["portal", "admin", "forelder"];

/* ── filsystem ─────────────────────────────────────────────────────── */
function walk(dir, ut = []) {
  for (const navn of readdirSync(dir)) {
    const p = join(dir, navn);
    if (statSync(p).isDirectory()) walk(p, ut);
    else ut.push(p);
  }
  return ut;
}
const les = (p) => readFileSync(p, "utf8");

function erRedirectSide(kilde) {
  return /\b(permanentRedirect|redirect)\(/.test(kilde) && !/return\s*\(\s*</.test(kilde);
}

function losImport(spec) {
  if (!spec.startsWith("@/components/")) return null;
  const base = join(rot, "src", spec.slice(2));
  for (const k of ["", ".tsx", ".ts", "/index.tsx", "/index.ts"]) {
    const p = base + k;
    if (existsSync(p) && statSync(p).isFile()) return p;
  }
  return null;
}

function komponenterFor(filer) {
  const ut = new Set();
  for (const f of filer) {
    for (const m of les(f).matchAll(/from\s+"(@\/components\/[^"]+)"/g)) {
      const p = losImport(m[1]);
      if (p) ut.add(p);
    }
  }
  return [...ut];
}

/* ── familier ──────────────────────────────────────────────────────── */
function familier() {
  const ut = [];
  for (const flate of FLATER) {
    const base = join(rot, "src/app", flate);
    const rotSider = ["page.tsx", "layout.tsx"].map((n) => join(base, n)).filter(existsSync);
    if (rotSider.length) ut.push({ id: `${flate}/(rot)`, dir: base, filer: rotSider });
    for (const navn of readdirSync(base)) {
      const dir = join(base, navn);
      if (!statSync(dir).isDirectory() || navn === "(legacy)") continue;
      const filer = walk(dir).filter((p) => /\/(page|layout)\.tsx$/.test(p) && !p.includes("/(legacy)/"));
      if (filer.length) ut.push({ id: `${flate}/${navn}`, dir, filer });
    }
  }
  return ut;
}

/* ── målinger ──────────────────────────────────────────────────────── */
function tell(kilde, re) {
  return (kilde.match(re) ?? []).length;
}

function maalFil(p) {
  const k = les(p);
  const utenKommentar = k.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const harFokus = /v2-focus|focus-visible|ak-felt/.test(k);
  return {
    halveFont: tell(k, /fontSize:\s*\d+\.5\b/g),
    fokusHull: /outline:\s*"none"/.test(k) && !harFokus ? 1 : 0,
    alert: tell(utenKommentar, /(^|[^.\w])alert\(/gm),
    hexInline: p.endsWith(".tsx") && !p.includes("/lib/") ? tell(utenKommentar, /#[0-9A-Fa-f]{6}\b/g) : 0,
    divOnClick: tell(k, /<div(?![^>]*\brole=)[^>]*\bonClick=/g),
    paperRester: tell(k, /data-paper/g),
    eliteTier: tell(k, /"ELITE"/g),
  };
}

function detektor(filer) {
  if (utenDetektor || !DETEKTOR || !filer.length) return { error: 0, warning: 0, advisory: 0 };
  const r = spawnSync("node", [DETEKTOR, "--json", "--quiet", "--no-advisory", ...filer], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  let funn = [];
  try { funn = JSON.parse(r.stdout || "[]"); } catch { /* detektoren skrev ikke JSON */ }
  const ut = { error: 0, warning: 0, advisory: 0 };
  for (const f of funn) ut[f.severity] = (ut[f.severity] ?? 0) + 1;
  return ut;
}

function fasitStatus(id) {
  const mapping = join(rot, "tests/visual/skjerm-mapping.ts");
  if (!existsSync(mapping)) return "ukjent";
  const k = les(mapping);
  const rute = "/" + id.replace("/(rot)", "");
  if (!k.includes(`"${rute}`)) return "ingen";
  return new RegExp(`"${rute.replace(/[/]/g, "\\/")}[^}]*status:\\s*"kalibrert"`, "s").test(k) ? "kalibrert" : "ukalibrert";
}

/* Mekanisk poeng 0–10: 10 minus straff per fil. Vektene speiler alvoret fra
   auditen 03.09: fokus-hull og alert() er P1, hex og div-onClick P2, halve
   tekststørrelser P2 men mange, Paper-rester P3. */
function mekaniskPoeng(m, antallFiler) {
  const straff =
    m.detektor.error * 2 + m.detektor.warning * 0.5 +
    m.fokusHull * 2 + m.alert * 2 + m.eliteTier * 2 +
    m.hexInline * 0.5 + m.divOnClick * 1 + m.halveFont * 0.1 + m.paperRester * 0.05;
  return Math.max(0, Math.round((10 - (straff / Math.max(1, antallFiler)) * 3) * 10) / 10);
}

/* ── kjør ──────────────────────────────────────────────────────────── */
const alle = familier().filter((f) => !kunFamilie || f.id === kunFamilie);
const rader = [];
for (const fam of alle) {
  const sider = fam.filer.filter((p) => p.endsWith("page.tsx"));
  const ekteSider = sider.filter((p) => !erRedirectSide(les(p)));
  const komponenter = komponenterFor(fam.filer);
  const sett = [...new Set([...fam.filer, ...komponenter])];
  const sum = { halveFont: 0, fokusHull: 0, alert: 0, hexInline: 0, divOnClick: 0, paperRester: 0, eliteTier: 0 };
  for (const p of sett) for (const [k, v] of Object.entries(maalFil(p))) sum[k] += v;
  const m = { ...sum, detektor: detektor(sett) };
  rader.push({
    familie: fam.id,
    skjermer: ekteSider.length,
    redirects: sider.length - ekteSider.length,
    filer: sett.length,
    fasit: fasitStatus(fam.id),
    ...m,
    poeng: mekaniskPoeng(m, sett.length),
  });
}
rader.sort((a, b) => a.poeng - b.poeng || b.skjermer - a.skjermer);

const dato = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date()); // YYYY-MM-DD i Oslo-tid
const md = [
  `# Design-audit — mekanisk scoreboard ${dato}`,
  "",
  `Kjørt av \`scripts/design-audit.mjs\`. ${rader.length} familier, ${rader.reduce((s, r) => s + r.skjermer, 0)} skjermer (redirect-sider ikke medregnet). Poeng 0–10 er et mekanisk utgangspunkt; den manuelle auditen (fem dimensjoner, 0–4) kommer i tillegg per familie.`,
  "",
  "Kolonner: **fokus** = filer med `outline: none` uten fokus-erstatning · **alert** = `alert()`-kall · **hex** = hardkodede farger i tsx · **div-klikk** = `<div onClick>` uten rolle · **halve** = tekststørrelser på ,5 · **paper** = `data-paper`-rester · **elite** = `\"ELITE\"` i UI · **det.** = impeccable-detektor (feil/advarsler) · **fasit** = status i `tests/visual/skjerm-mapping.ts`.",
  "",
  "| Familie | Skjermer | Filer | Poeng | fokus | alert | hex | div-klikk | halve | paper | elite | det. | fasit |",
  "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|",
  ...rader.map((r) => `| \`${r.familie}\` | ${r.skjermer} | ${r.filer} | **${String(r.poeng).replace(".", ",")}** | ${r.fokusHull} | ${r.alert} | ${r.hexInline} | ${r.divOnClick} | ${r.halveFont} | ${r.paperRester} | ${r.eliteTier} | ${r.detektor.error}/${r.detektor.warning} | ${r.fasit} |`),
  "",
  "## Sum",
  "",
  ...Object.entries({ fokusHull: "fokus-hull", alert: "alert()", hexInline: "hex i tsx", divOnClick: "div onClick", halveFont: "halve tekststørrelser", paperRester: "Paper-rester", eliteTier: "ELITE i UI" })
    .map(([k, n]) => `- ${n}: **${rader.reduce((s, r) => s + r[k], 0)}**`),
  "",
].join("\n");

if (kunFamilie) {
  console.log(md);
} else {
  const ut = join(rot, "docs/design-audit", dato);
  mkdirSync(ut, { recursive: true });
  writeFileSync(join(ut, "scoreboard.md"), md);
  writeFileSync(join(ut, "scoreboard.json"), JSON.stringify(rader, null, 2));
  console.log(`design-audit: ${rader.length} familier → ${ut}/scoreboard.md`);
  console.log(`laveste: ${rader.slice(0, 5).map((r) => `${r.familie} (${r.poeng})`).join(" · ")}`);
}

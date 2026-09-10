#!/usr/bin/env node
/**
 * check-tl-kontrast.mjs — måler kontrast i Train-lock-tokene (03.09.2026).
 *
 * AK Golf-masteren (designsystem/ak-golf/tokens/kontrast.md) måler alle
 * tekst/flate-par og feiler på brudd. Train-lock hadde ingen tilsvarende
 * tabell. Dette er prinsippet «kontrast måles, aldri anslås» tatt inn i
 * produktet — UTEN å røre en eneste --tl-*-verdi (CLAUDE.md invariant 2 og
 * masterens egen 10-forbudt.md: AK Golf-tokens skal aldri inn i en produktskjerm).
 *
 * Skriver docs/design-audit/train-lock-kontrast.md. Brudd rapporteres, men
 * stopper ikke verify: Train-lock er fasit, og en verdi endres kun etter
 * beslutning fra Anders. `--streng` gjør brudd til exit 1 når den dagen kommer.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";

const rot = resolve(import.meta.dirname, "..");
const css = readFileSync(join(rot, "src/styles/train-lock-tokens.css"), "utf8");
const valgtCss = readFileSync(join(rot, "src/styles/train-lock-valgt.css"), "utf8");
const streng = process.argv.includes("--streng");

/* Selektoren med krøllparentes, ikke omtalen i filhodet — ellers splittes
   fila på kommentaren og «lys» blir tom. */
const MORK = /html\[data-v2-tema="dark"\]\s*\{/g;
let sisteStart = -1;
for (const m of css.matchAll(MORK)) sisteStart = m.index;
const lysDel = sisteStart >= 0 ? css.slice(0, sisteStart) : css;
const morkDel = sisteStart >= 0 ? css.slice(sisteStart) : "";
function tokens(del) {
  const ut = {};
  for (const m of del.matchAll(/--tl-([a-z-]+):\s*(#[0-9A-Fa-f]{6})\b/g)) ut[m[1]] ??= m[2];
  return ut;
}
const lys = tokens(lysDel);
const mork = { ...lys, ...tokens(morkDel ?? "") };
const valgtMorkStart = valgtCss.indexOf('html[data-train-lock="4"][data-v2-tema="dark"] {');
if (valgtMorkStart < 0) throw new Error("Mangler mørk valgt Train-lock-variant");
const valgtLys = { ...lys, ...tokens(valgtCss.slice(0, valgtMorkStart)) };
valgtLys["warm-text"] = valgtLys.text;
const valgtMork = { ...mork, ...tokens(valgtCss.slice(valgtMorkStart)) };
const profiler = [["lys", lys], ["mork", mork], ["valgt-lys", valgtLys], ["valgt-mork", valgtMork]];

function lum(h) {
  const n = h.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
const kontrast = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
const fmt = (x) => x.toFixed(1).replace(".", ",");

/* Parene er de kombinasjonene skjermene faktisk bruker (målt i auditen 03.09):
   tekst/mute på scene, elev og dock; on-fill på fill; signalfarger som TEKST
   på scene og elev (StatusPill, feilmeldinger, PUBLISERT-merke). Krav: 4,5:1
   for normal tekst, 3,0:1 for stor tekst og grafikk. */
const PAR = [
  ["text", "scene", 4.5], ["text", "elev", 4.5], ["text", "dock", 4.5],
  ["mute", "scene", 4.5, "sekundærtekst · caps-etikett"], ["mute", "elev", 4.5], ["mute", "dock", 4.5],
  ["on-fill", "fill", 4.5, "primær CTA"],
  ["on-danger", "danger", 4.5, "Kø-badge"],
  ["danger", "scene", 4.5, "feilmelding som tekst"], ["danger", "elev", 4.5],
  ["ok", "scene", 4.5, "PUBLISERT / Godta som tekst"], ["ok", "elev", 4.5],
  ["warm-text", "scene", 4.5, "v3 liten tekst"], ["warm-text", "elev", 4.5],
  ["warm-ink", "scene", 4.5, "v3 kilde: bare stor tekst på papir"], ["warm-ink", "elev", 4.5],
  ["warm", "scene", 4.5, "fullført-hake som tekst"], ["warm", "elev", 3.0, "hake er grafikk"],
  ["warn", "scene", 3.0, "warn-pille — grafikk"], ["warn", "elev", 3.0],
  ["viz-target", "scene", 4.5, "StatusPill tone=info som tekst"], ["viz-target", "elev", 4.5],
  ["on-avatar", "avatar", 4.5, "initialer i ØR-sirkelen"],
  ["dim", "scene", 1.5, "spor/skjelett — skal bare synes"],
];

const rader = [];
let brudd = 0;
for (const [modus, t] of profiler) {
  for (const [tekst, flate, krav, note = ""] of PAR) {
    if (!t[tekst] || !t[flate]) continue;
    const k = kontrast(t[tekst], t[flate]);
    const ok = k >= krav;
    if (!ok) brudd++;
    rader.push({ modus, tekst, flate, ht: t[tekst], hf: t[flate], k, krav, ok, note });
  }
}

const tabell = (modus) => [
  "| Tekst | Flate | Målt | Krav | | Merknad |",
  "|---|---|---:|---:|---|---|",
  ...rader.filter((r) => r.modus === modus).map((r) =>
    `| \`${r.tekst}\` ${r.ht} | \`${r.flate}\` ${r.hf} | **${fmt(r.k)}:1** | ${fmt(r.krav)}:1 | ${r.ok ? "holder" : "**BRUDD**"} | ${r.note} |`),
];

const md = [
  "# Train-lock — kontrast, målt",
  "",
  `GENERERT av \`scripts/check-tl-kontrast.mjs\` fra \`src/styles/train-lock-tokens.css\` og \`src/styles/train-lock-valgt.css\`. Ikke rediger. Datoen står i git-loggen, ikke her — ellers ville hver \`npm run verify\` skitnet til arbeidstreet. ${rader.length} par, ${brudd} brudd.`,
  "",
  "Tabellene skiller det eldre laget fra ZIP (4), valgt av Anders 10.09.2026. Brudd betyr at fargeparet ikke skal brukes som vanlig tekst. Fargene kan brukes i grafikk eller stor tekst når det aktuelle kontrastkravet holder; liten tekst bruker et målt lesbart par. Tintede flater og faktisk skjermbruk krever egen nettleserkontroll.",
  "",
  "## Eldre lag — lys",
  "",
  ...tabell("lys"),
  "",
  "## Eldre lag — mørk",
  "",
  ...tabell("mork"),
  "",
  "## Valgt ZIP (4) — lys PlayerHQ/AgencyOS",
  "",
  ...tabell("valgt-lys"),
  "",
  "## Valgt ZIP (4) — mørk PlayerHQ/AgencyOS",
  "",
  ...tabell("valgt-mork"),
  "",
].join("\n");

mkdirSync(join(rot, "docs/design-audit"), { recursive: true });
writeFileSync(join(rot, "docs/design-audit/train-lock-kontrast.md"), md);
console.log(`check-tl-kontrast: ${rader.length} par, ${brudd} brudd → docs/design-audit/train-lock-kontrast.md`);
for (const r of rader.filter((r) => !r.ok)) console.log(`  BRUDD ${r.modus}: ${r.tekst} på ${r.flate} = ${fmt(r.k)}:1 (krav ${fmt(r.krav)})`);
if (streng && brudd) process.exit(1);

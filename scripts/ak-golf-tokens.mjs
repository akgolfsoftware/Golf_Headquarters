#!/usr/bin/env node
// AK Golf — tokens som data.
// Kilde: designsystem/ak-golf/tokens.json (W3C Design Tokens-format).
// Genererer: tokens/{farge,type,rom,bevegelse,instrument}.css,
//            tokens/tailwind-theme.css, ak-golf-tokens.ts, tokens/kontrast.md.
// Kjør:  node scripts/ak-golf-tokens.mjs --write   (regenerer alt)
//        node scripts/ak-golf-tokens.mjs           (--check: feiler hvis noe har sklidd
//                                                   eller et kontrastpar er under kravet)
// Regel: de genererte filene redigeres ALDRI for hånd. Endre tokens.json, kjør --write.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const ROT = "designsystem/ak-golf";
const KILDE = path.join(ROT, "tokens.json");
const write = process.argv.includes("--write");
const data = JSON.parse(readFileSync(KILDE, "utf8"));

// ---- oppslag ------------------------------------------------------------
const alle = {};
(function walk(node, sti) {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith("$")) continue;
    const p = [...sti, k];
    if (v && typeof v === "object" && "$value" in v) alle[p.join(".")] = v;
    else if (v && typeof v === "object") walk(v, p);
  }
})(data.ak, ["ak"]);

const erRef = (v) => typeof v === "string" && /^\{[^}]+\}$/.test(v);
const refNavn = (v) => v.slice(1, -1);
function verdi(tok, modus = "lys") {
  let v = modus === "mork" && tok.$extensions?.mork !== undefined ? tok.$extensions.mork
        : modus === "redusert" && tok.$extensions?.redusert !== undefined ? tok.$extensions.redusert
        : tok.$value;
  // Fontnavn med mellomrom får anførselstegn; generiske familier (sans-serif, monospace,
  // ui-monospace) og nøkkelord med bindestrek (-apple-system) skal stå uten.
  if (Array.isArray(v)) return v.map((f) => (/\s/.test(f) ? `'${f}'` : f)).join(", ");
  return v;
}
function cssVerdi(tok, modus) {
  const v = verdi(tok, modus);
  if (erRef(v)) { const m = alle[refNavn(v)]; if (!m) throw new Error("ukjent referanse " + v); return `var(${m.$extensions.css})`; }
  return String(v);
}
function hex(tok, modus) {
  let v = verdi(tok, modus);
  let hopp = 0;
  while (erRef(v)) { v = verdi(alle[refNavn(v)], modus); if (++hopp > 5) throw new Error("referansesløyfe"); }
  return v;
}

// ---- kontrast (WCAG 2.x) -------------------------------------------------
function lum(h) {
  const n = h.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function kontrast(a, b) {
  const la = lum(a), lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
const fmt = (x) => x.toFixed(1).replace(".", ",");

const maalinger = [];
let brudd = 0;
for (const modus of ["lys", "mork"]) {
  for (const par of data.kontrast.par) {
    if (par.kunLys && modus === "mork") continue;
    if (par.kunMork && modus === "lys") continue;
    const t = alle["ak.farge." + par.tekst], f = alle["ak.farge." + par.flate];
    if (!t || !f) throw new Error("kontrastpar peker på ukjent token: " + JSON.stringify(par));
    const ht = hex(t, modus), hf = hex(f, modus);
    if (!/^#/.test(ht) || !/^#/.test(hf)) continue;
    const k = kontrast(ht, hf);
    const ok = k >= par.krav;
    if (!ok) brudd++;
    maalinger.push({ modus, ...par, ht, hf, k, ok });
  }
}
const kontrastAv = (navn, flate, modus) => {
  const m = maalinger.find((x) => x.tekst === navn && x.flate === flate && x.modus === modus);
  return m ? fmt(m.k) + ":1" : null;
};

// ---- CSS-generering -------------------------------------------------------
const filer = {};
for (const [sti, tok] of Object.entries(alle)) {
  const fil = tok.$extensions?.fil;
  if (!fil) continue;
  (filer[fil] ??= []).push([sti, tok]);
}
function linje(tok, modus) {
  const navn = tok.$extensions.css;
  const v = cssVerdi(tok, modus);
  const kind = tok.$extensions.kind ? ` /* @kind ${tok.$extensions.kind} */` : "";
  let kom = "";
  if (modus !== "redusert") {
    const biter = [];
    if (tok.$type === "color" && fil_er_farge(tok)) {
      const kort = tok.$extensions.css.replace("--ak-", "");
      const kg = kontrastAv(kort, "grunn", modus), ka = kontrastAv(kort, "ark", modus);
      const kf = kort === "signal-tekst" ? kontrastAv("signal-tekst", "signal-fyll", modus) : null;
      if (kg) biter.push(`${kg} på grunn`);
      if (ka) biter.push(`${ka} på ark`);
      if (kf) biter.push(`${kf} på fyllet`);
    }
    if (modus === "lys" && tok.$description) biter.push(tok.$description);
    if (biter.length) kom = `  /* ${biter.join(" · ")} */`;
  }
  return `  ${navn}: ${v};${kind}${kom}`;
}
function fil_er_farge(tok) { return tok.$extensions.fil === "farge.css"; }
function blokk(topp) { return `/* ${topp} */\n`; }

const ut = {};
for (const [fil, toks] of Object.entries(filer)) {
  let s = blokk(data.filer[fil] ?? fil.replace(".css", ""));
  s += "\n:root {\n" + toks.map(([, t]) => linje(t, "lys")).join("\n") + "\n}\n";
  if (fil === "farge.css") {
    s += "\n/* Verkstedet om kvelden. Varm mørk grå — ikke sort, ikke premium.\n   Samme temperatur som betongen, bare skrudd ned. */\n:root[data-ak-flate=\"mork\"] {\n"
      + toks.filter(([, t]) => t.$extensions.mork !== undefined).map(([, t]) => linje(t, "mork")).join("\n") + "\n}\n";
  }
  if (fil === "bevegelse.css") {
    s += "\n@media (prefers-reduced-motion: reduce) {\n  :root {\n"
      + toks.filter(([, t]) => t.$extensions.redusert !== undefined).map(([, t]) => "  " + linje(t, "redusert")).join("\n") + "\n  }\n}\n";
  }
  if (fil === "instrument.css") {
    s += `
/* Rutenett som bakgrunn. Legg på en seksjon, aldri på brødtekst. */
.ak-rutenett {
  background-image:
    linear-gradient(var(--ak-rute-lys) var(--ak-rute-linje), transparent var(--ak-rute-linje)),
    linear-gradient(90deg, var(--ak-rute-lys) var(--ak-rute-linje), transparent var(--ak-rute-linje));
  background-size: var(--ak-rute) var(--ak-rute);
}
.ak-rutenett[data-flate="mork"],
[data-ak-flate="mork"] .ak-rutenett {
  background-image:
    linear-gradient(var(--ak-rute-mork) var(--ak-rute-linje), transparent var(--ak-rute-linje)),
    linear-gradient(90deg, var(--ak-rute-mork) var(--ak-rute-linje), transparent var(--ak-rute-linje));
}

/* Målestokk langs en kant. */
.ak-maalestokk {
  height: var(--ak-maal-hel);
  background-image: repeating-linear-gradient(
    90deg,
    currentColor 0, currentColor var(--ak-maal-tykk),
    transparent var(--ak-maal-tykk), transparent var(--ak-maal-steg)
  );
  background-size: 100% var(--ak-maal-merke);
  background-repeat: no-repeat;
  background-position: 0 100%;
  opacity: 0.42;
}

@media (prefers-reduced-motion: reduce) {
  .ak-rutenett { background-attachment: scroll; }
}
`;
  }
  ut[path.join(ROT, "tokens", fil)] = s;
}

// Tailwind v4 @theme — utilities som bg-ak-grunn, text-ak-signal, font-ak-mono, rounded-ak-md.
{
  let s = "/* AK Golf — Tailwind v4 @theme. GENERERT fra tokens.json — ikke rediger.\n   Importer ETTER tokens/farge.css m.fl.: verdiene peker på --ak-* så lys/mørk\n   følger data-ak-flate. Gjelder MERKET (marked, materiell) — aldri produktskjermer. */\n\n@theme inline {\n";
  const rad = (n, v) => (s += `  ${n}: ${v};\n`);
  for (const [, t] of filer["farge.css"]) rad(`--color-ak-${t.$extensions.css.replace("--ak-", "")}`, `var(${t.$extensions.css})`);
  for (const n of ["display", "sans", "mono"]) rad(`--font-ak-${n}`, `var(--ak-${n})`);
  for (const [, t] of filer["type.css"]) if (t.$extensions.css.startsWith("--ak-t-")) rad(`--text-ak-${t.$extensions.css.replace("--ak-t-", "")}`, `var(${t.$extensions.css})`);
  for (const [, t] of filer["rom.css"]) {
    const c = t.$extensions.css;
    if (c.startsWith("--ak-r-")) rad(`--spacing-ak-${c.replace("--ak-r-", "")}`, `var(${c})`);
    if (c.startsWith("--ak-hjorne-")) rad(`--radius-ak-${c.replace("--ak-hjorne-", "")}`, `var(${c})`);
    if (c.startsWith("--ak-loft-")) rad(`--shadow-ak-${c.replace("--ak-loft-", "")}`, `var(${c})`);
  }
  for (const n of ["mobil", "tablet", "mac"]) rad(`--breakpoint-ak-${n}`, hex(alle["ak.rom.bp-" + n]));
  for (const [, t] of filer["bevegelse.css"]) {
    const c = t.$extensions.css;
    if (c.startsWith("--ak-fart-")) rad(`--duration-ak-${c.replace("--ak-fart-", "")}`, `var(${c})`);
    if (c.startsWith("--ak-kurve")) rad(`--ease-ak-${c.replace("--ak-kurve", "kurve")}`, `var(${c})`);
  }
  s += "}\n";
  ut[path.join(ROT, "tokens", "tailwind-theme.css")] = s;
}

// TS-speil — peker på var(--ak-*), dupliserer ingen hex (samme prinsipp som src/lib/v2/train-lock.ts).
{
  let s = "/**\n * AK Golf — TS-speil av --ak-*. GENERERT fra tokens.json — ikke rediger.\n * Peker BARE på var(--ak-*), så lys/mørk følger data-ak-flate og ingen hex\n * dupliseres. Gjelder merket (marked, materiell, presentasjon), aldri\n * produktskjermer — de bruker TL fra src/lib/v2/train-lock.ts.\n */\n\nexport const AK_GOLF = {\n";
  const grupper = { farge: "farge.css", type: "type.css", rom: "rom.css", bevegelse: "bevegelse.css", instrument: "instrument.css" };
  for (const [g, fil] of Object.entries(grupper)) {
    s += `  ${g}: {\n`;
    for (const [, t] of filer[fil]) {
      const key = t.$extensions.css.replace("--ak-", "").replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
      s += `    ${key}: "var(${t.$extensions.css})",\n`;
    }
    s += "  },\n";
  }
  s += "} as const;\n\nexport type AkGolfTokens = typeof AK_GOLF;\n";
  ut[path.join(ROT, "ak-golf-tokens.ts")] = s;
}

// Kontrastrapport.
{
  let s = "# Kontrast — målt av `scripts/ak-golf-tokens.mjs`\n\nGENERERT fra `tokens.json`. Ikke rediger. Krav: 4,5:1 normal tekst · 3,0:1 stor tekst (fra 21 px) og grafikk.\n\n";
  for (const modus of ["lys", "mork"]) {
    s += `## ${modus === "lys" ? "Lys (standard)" : "Mørk"}\n\n| Tekst | Flate | Målt | Krav | | Merknad |\n|---|---|---:|---:|---|---|\n`;
    for (const m of maalinger.filter((x) => x.modus === modus)) {
      s += `| \`${m.tekst}\` ${m.ht} | \`${m.flate}\` ${m.hf} | **${fmt(m.k)}:1** | ${fmt(m.krav)}:1 | ${m.ok ? "holder" : "BRUDD"} | ${m.merk ?? ""} |\n`;
    }
    s += "\n";
  }
  s += `Målt ${new Date().toISOString().slice(0, 10)}. ${maalinger.length} par, ${brudd} brudd.\n`;
  ut[path.join(ROT, "tokens", "kontrast.md")] = s;
}

// ---- skriv eller sjekk -------------------------------------------------------
let avvik = 0;
for (const [fil, innhold] of Object.entries(ut)) {
  if (write) { writeFileSync(fil, innhold); console.log("skrev", fil); continue; }
  const paaDisk = existsSync(fil) ? readFileSync(fil, "utf8") : null;
  // Datolinja i kontrast.md endres hver dag — sammenlign uten den.
  const strip = (s) => s?.replace(/^Målt \d{4}-\d{2}-\d{2}\./m, "Målt.");
  if (strip(paaDisk) !== strip(innhold)) { avvik++; console.error("SKLIDD:", fil, "— kjør node scripts/ak-golf-tokens.mjs --write"); }
}
for (const m of maalinger.filter((x) => !x.ok)) console.error(`KONTRASTBRUDD (${m.modus}): ${m.tekst} ${m.ht} på ${m.flate} ${m.hf} = ${fmt(m.k)}:1, krav ${fmt(m.krav)}:1`);
if (!write) console.log(`ak-golf-tokens: ${Object.keys(ut).length} filer sjekket, ${avvik} sklidd, ${maalinger.length} kontrastpar, ${brudd} brudd`);
if (avvik || brudd) process.exit(1);

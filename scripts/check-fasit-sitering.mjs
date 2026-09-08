#!/usr/bin/env node
/**
 * Vakt mot fasit-drift (designport fase 1, økt 5 — 05.09.2026).
 *
 * Hver «Fasit:»-sitering i src/ skal peke på en tegning som faktisk finnes i
 * designsystem/train-lock/, som ikke står som utgått i SCREEN-INDEX.md
 * §Kjente hull, og hver skjermfil (.tsx) med Fasit skal enten ha en riggrad
 * (` * Rigg: <label>`) eller en avviksliste (` * Avvik:` + punkter).
 * Konvensjonen: designsystem/train-lock/PORTING.md §0b.
 *
 * Feiler (exit 1) på:
 *   - sitert .dc.html som ikke finnes i designsystem/train-lock/
 *   - sitert .dc.html som står som utgått i SCREEN-INDEX «Kjente hull»
 *   - ` * Rigg:`-label som ikke finnes i tests/visual/skjerm-mapping.ts
 *   - ` * Avvik:` uten minst ett «- »-punkt på linjen under
 *   - .tsx-fil ENDRET mot origin/main (eller oppgitt med --endret) som har
 *     Fasit uten Rigg/Avvik (baseline-vakt)
 * Rapporterer (exit 0):
 *   - antall .tsx-filer med Fasit uten Rigg/Avvik (--liste viser dem)
 *   - antall filer som fortsatt siterer Paper (slettet 30.08.2026)
 *
 * Bruk: node scripts/check-fasit-sitering.mjs [--liste] [--endret <sti …>]
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const FASIT_MAPPE = "designsystem/train-lock";
const SCREEN_INDEX = `${FASIT_MAPPE}/SCREEN-INDEX.md`;
const RIGG_MAPPING = "tests/visual/skjerm-mapping.ts";

const nfc = (s) => s.normalize("NFC");

/** Linje som åpner en fasit-sitering: ` * Fasit:`, `// Fasit:`, `Fasit (kanon …):`. */
export const FASIT_LINJE = /^\s*(?:\*|\/\/|\/\*)?\s*Fasit(?:\s*\([^)]*\))?:/m;

/**
 * Alle Train-lock-siteringer i en fil: full sti (designsystem/train-lock/…)
 * eller bare filnavn i backticks når navnet starter med en Train-lock-kode
 * (AG-04, S3-03, GAP-1, B3 …). Bare-navn uten kode (`Analyse.dc.html` fra
 * canvas-mappen) telles ikke.
 */
export function finnTrainLockSiteringer(kilde) {
  const funn = new Set();
  const medSti = /designsystem\/train-lock\/([^\n`'"«»()]+?\.dc\.html)/g;
  for (const m of kilde.matchAll(medSti)) funn.add(nfc(m[1].trim()));
  const bare = /`((?:[A-Z]{1,4}\d?-\d[^`\n/]*?|B[1-5] [^`\n/]*?)\.dc\.html)`/g;
  for (const m of kilde.matchAll(bare)) funn.add(nfc(m[1].trim()));
  return [...funn];
}

/** Siteringer av Paper-filer (designsystem/paper/…, slettet 30.08.2026). */
export function finnPaperSiteringer(kilde) {
  const funn = new Set();
  for (const m of kilde.matchAll(/designsystem\/paper\/[^\s`'"«»()]+\.(?:html|css)/g)) funn.add(m[0]);
  return [...funn];
}

/** ` * Rigg: <label>` — én label per linje. */
export function finnRiggLabels(kilde) {
  const funn = [];
  for (const m of kilde.matchAll(/^\s*(?:\*|\/\/)\s*Rigg:\s*(.+?)\s*$/gm)) funn.push(m[1]);
  return funn;
}

/** ` * Avvik:` alene på linjen, med minst ett ` *   - …`-punkt på neste linje. */
export function finnAvvik(kilde) {
  const linjer = kilde.split("\n");
  for (let i = 0; i < linjer.length; i++) {
    if (/^\s*(?:\*|\/\/)\s*Avvik:\s*$/.test(linjer[i])) {
      const neste = linjer[i + 1] ?? "";
      return { finnes: true, harPunkter: /^\s*(?:\*|\/\/)\s+-\s+\S/.test(neste) };
    }
  }
  return { finnes: false, harPunkter: false };
}

/**
 * Utgåtte tegninger fra SCREEN-INDEX §Kjente hull: på hvert kulepunkt teller
 * de `.dc.html`-navnene som står FØR ordet «utgått».
 */
export function lesUtgaatte(screenIndexTekst) {
  const start = screenIndexTekst.indexOf("## Kjente hull");
  if (start < 0) return [];
  const seksjon = screenIndexTekst.slice(start);
  const utgaatte = [];
  for (const linje of seksjon.split("\n")) {
    if (!linje.startsWith("- ")) continue;
    const idx = linje.search(/utgått/i);
    if (idx < 0) continue;
    for (const m of linje.slice(0, idx).matchAll(/`([^`]+?\.dc\.html)`/g)) utgaatte.push(nfc(m[1]));
  }
  return utgaatte;
}

/** Labels i tests/visual/skjerm-mapping.ts (`label: "…"`). */
export function lesRiggLabels(mappingTekst) {
  return [...mappingTekst.matchAll(/^\s*label:\s*"([^"]+)"/gm)].map((m) => m[1]);
}

export function vurderFil({ sti, kilde, fasitFiler, utgaatte, riggLabels, endret }) {
  const feil = [];
  const rapport = [];
  const siteringer = finnTrainLockSiteringer(kilde);
  for (const s of siteringer) {
    if (!fasitFiler.has(s)) feil.push(`${sti} — siterer «${s}», som ikke finnes i ${FASIT_MAPPE}/`);
    else if (utgaatte.has(s)) feil.push(`${sti} — siterer «${s}», som står som utgått i SCREEN-INDEX §Kjente hull`);
  }
  const paper = finnPaperSiteringer(kilde);
  const harFasit = FASIT_LINJE.test(kilde);
  const rigg = finnRiggLabels(kilde);
  for (const r of rigg) {
    if (!riggLabels.has(r)) feil.push(`${sti} — Rigg: «${r}» finnes ikke som label i ${RIGG_MAPPING}`);
  }
  const avvik = finnAvvik(kilde);
  if (avvik.finnes && !avvik.harPunkter) feil.push(`${sti} — Avvik:-blokk uten «- »-punkt på linjen under`);
  const erSkjermfil = sti.endsWith(".tsx");
  const manglerRiggAvvik = erSkjermfil && harFasit && rigg.length === 0 && !avvik.finnes;
  if (manglerRiggAvvik) {
    if (endret) feil.push(`${sti} — endret mot origin/main og har Fasit uten Rigg/Avvik (PORTING.md §0b)`);
    else rapport.push(sti);
  }
  return { feil, rapport, paper: paper.length > 0, harFasit, siteringer };
}

/**
 * Egen testfil unntas: den siterer fiktive filnavn (PH-99 Finnes ikke,
 * P-05 som utgått) som fixture-data for å teste vurderFil() selv — ikke
 * ekte Train-lock-siteringer som skal valideres.
 */
const EGEN_TESTFIL = "check-fasit-sitering.test.ts";

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts)$/.test(e.name) && e.name !== EGEN_TESTFIL) acc.push(p);
  }
  return acc;
}

/** Filer under src/ endret mot origin/main, eller null hvis git/origin/main ikke er tilgjengelig. */
export function endredeMotOriginMain(rot) {
  try {
    const ut = execFileSync("git", ["diff", "--name-only", "origin/main", "--", "src"], {
      cwd: rot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return new Set(ut.split("\n").filter(Boolean));
  } catch {
    return null;
  }
}

export function kjoer({ rot, endredeFiler }) {
  const fasitFiler = new Set(
    fs.readdirSync(path.join(rot, FASIT_MAPPE)).filter((f) => f.endsWith(".dc.html")).map(nfc),
  );
  const utgaatte = new Set(lesUtgaatte(fs.readFileSync(path.join(rot, SCREEN_INDEX), "utf8")));
  const riggLabels = new Set(lesRiggLabels(fs.readFileSync(path.join(rot, RIGG_MAPPING), "utf8")));
  const feil = [];
  const utenRiggAvvik = [];
  let paperFiler = 0;
  let fasitFilerTsx = 0;
  let siteringerTotalt = 0;
  for (const abs of walk(path.join(rot, "src"))) {
    const sti = path.relative(rot, abs);
    const kilde = fs.readFileSync(abs, "utf8");
    const v = vurderFil({ sti, kilde, fasitFiler, utgaatte, riggLabels, endret: endredeFiler.has(sti) });
    feil.push(...v.feil);
    utenRiggAvvik.push(...v.rapport);
    if (v.paper) paperFiler++;
    if (v.harFasit && sti.endsWith(".tsx")) fasitFilerTsx++;
    siteringerTotalt += v.siteringer.length;
  }
  return { feil, utenRiggAvvik, paperFiler, fasitFilerTsx, siteringerTotalt, utgaatte: [...utgaatte] };
}

const erHovedmodul = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (erHovedmodul) {
  const rot = path.resolve(import.meta.dirname, "..");
  const arg = process.argv.indexOf("--endret");
  let endrede;
  if (arg >= 0) {
    endrede = new Set(process.argv.slice(arg + 1).filter((a) => !a.startsWith("--")));
  } else {
    endrede = endredeMotOriginMain(rot);
    if (endrede === null) {
      console.warn("ADVARSEL: fant ikke origin/main — baseline-vakten er av i denne kjøringen (git fetch origin main).");
      endrede = new Set();
    }
  }
  const r = kjoer({ rot, endredeFiler: endrede });
  console.log(
    `Fasit-sitering: ${r.siteringerTotalt} Train-lock-siteringer · utgått-liste: ${r.utgaatte.join(", ") || "(tom)"}`,
  );
  console.log(
    `  .tsx med Fasit: ${r.fasitFilerTsx} · uten Rigg/Avvik: ${r.utenRiggAvvik.length} · siterer Paper: ${r.paperFiler}`,
  );
  if (process.argv.includes("--liste")) for (const f of r.utenRiggAvvik) console.log(`    ${f}`);
  if (r.feil.length) {
    console.error("\nFEIL — fasit-drift:\n");
    for (const f of r.feil) console.error(`  ${f}`);
    console.error(`\n${r.feil.length} feil. Se designsystem/train-lock/PORTING.md §0b.`);
    process.exit(1);
  }
  console.log("OK: alle Train-lock-siteringer finnes og er gyldige.");
}

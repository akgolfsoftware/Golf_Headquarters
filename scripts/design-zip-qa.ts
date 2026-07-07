/**
 * Design-zip-QA — kvalitetssjekk av en utpakket Claude Design-handoff.
 *
 * Bruk: npx tsx scripts/design-zip-qa.ts <sti-til-utpakket-handoff>
 *   (default: public/design-handover)
 *
 * FEIL (exit 1):
 *   - Forbudte termer i .html/.md/.json: elev, session, workout, kortspill/«kort spill»,
 *     ELITE, CoachHQ, gamle demo-navn (Markus Berg / Anders Berg / Andreas Kragerud), >Error<.
 *   - Emoji i HTML (U+1F300–U+1FAFF og U+2700–U+27BF).
 *   - Skjerm-.html under skjermer/ uten .png eller manifest.json ved siden av.
 *
 * ADVARSEL (ikke exit-feil):
 *   - Hex-farger i HTML som ikke finnes i handoffens egen tokens/-mappe
 *     (allowlist parses fra tokens-css-filene — aldri hardkodet her).
 *
 * UNNTAK (presisert 2026-07-07 etter v14-testkjøring): term-sjekken jakter
 * PRODUKT-innhold, ikke regellaget som må navngi forbudsordene for å forby dem:
 *   - META-filer hoppes helt over i term-sjekken (regeldokumenter, terminologi-
 *     skill/ordbok, lint-config, interne plan-/audit-ark).
 *   - Backtick-spans i .md strippes før matching (`sessions` = API-feltnavn, ikke UI-tekst).
 *   - Treff med negasjonsord i kontekstvinduet («aldri», «forbudt», «utfaset»,
 *     «finnes ikke», «→») regnes som meta-omtale og frikjennes.
 *   - Emoji-sjekken hopper over interne plan-ark (skjerm-plan/skjerm-inventar) —
 *     de er prosjektstyring, ikke produkt-HTML.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, basename, relative } from "node:path";

const ROT = process.argv[2] ?? "public/design-handover";
if (!existsSync(ROT)) {
  console.error(`FEIL: finner ikke handoff-mappe: ${ROT}`);
  process.exit(1);
}

// ── Rekursiv fil-listing ────────────────────────────────────────────
function alleFiler(dir: string): string[] {
  const ut: string[] = [];
  for (const navn of readdirSync(dir)) {
    const sti = join(dir, navn);
    if (statSync(sti).isDirectory()) ut.push(...alleFiler(sti));
    else ut.push(sti);
  }
  return ut;
}
const filer = alleFiler(ROT);

// ── Forbudte termer (ordbok-/kanon-brudd) ───────────────────────────
// Ordgrenser der det trengs så «sessionStorage» o.l. ikke treffer «session» feilaktig,
// men «elev» skal også ta «eleven»/«elever» (norsk bøying) — derfor prefiks-match der.
const FORBUDT: Array<{ navn: string; re: RegExp }> = [
  { navn: "elev", re: /\belev(?:en|er|ene|s)?\b/iu },
  { navn: "session", re: /\bsessions?\b/iu },
  { navn: "workout", re: /\bworkouts?\b/iu },
  { navn: "kortspill / «kort spill»", re: /kort\s?spill/iu },
  { navn: "ELITE", re: /\bELITE\b/u },
  { navn: "CoachHQ", re: /CoachHQ/u },
  { navn: "Markus Berg (gammelt demo-navn)", re: /Markus Berg/u },
  { navn: "Anders Berg (gammelt demo-navn)", re: /Anders Berg/u },
  { navn: "Andreas Kragerud (gammelt demo-navn)", re: /Andreas Kragerud/u },
  { navn: ">Error< (engelsk feiltekst)", re: />Error</u },
];

// ── META-filer: regellag som MÅ navngi forbudsordene — term-sjekk hoppes ──
const META_TERM_SKIP: RegExp[] = [
  /(^|\/)(CLAUDE|PORTING|DEKNINGSKART|SKILL|VERDENSKLASSE-PLAN|WORKBENCH-SAMLING)\.md$/,
  /(^|\/)readme\.md$/i,
  /(^|\/)skills\//, // terminologi-skill + ordbok definerer ordene
  /(^|\/)handover\//, // README + adherence-lint-config lister forbudsord
  /(^|\/)guidelines\/beslutninger\.md$/,
  /(^|\/)guidelines\/skjerm-(plan|batch)[^/]*\.md$/,
  /(^|\/)guidelines\/component-research\.md$/,
];
// Interne plan-/statusark — prosjektstyring, ikke produkt-HTML (emoji-sjekk hoppes)
const META_EMOJI_SKIP: RegExp[] = [/(^|\/)guidelines\/skjerm-(plan|inventar)\.html$/];

// Negasjonsord i kontekstvindu rundt et treff = meta-omtale (regel som forbyr ordet)
const NEGASJON = /aldri|forbudt|utfaset|finnes ikke|ikke besluttet|skal bort|→|erstattet|stale|gammelt navn|migrert/i;
const VINDU = 120;

// ── Emoji-områder ───────────────────────────────────────────────────
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2700}-\u{27BF}]/u;

// ── Allowlist: alle hex-farger definert i handoffens tokens/-mappe ──
const tokensCss = filer.filter((f) => f.includes(`${join(ROT, "tokens")}`) && f.endsWith(".css"));
const allow = new Set<string>();
for (const f of tokensCss) {
  for (const m of readFileSync(f, "utf-8").matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    allow.add(m[0].toLowerCase());
  }
}

type Funn = { fil: string; melding: string };
const feil: Funn[] = [];
const advarsler: Funn[] = [];
const rel = (f: string) => relative(process.cwd(), f);

// ── Sjekk 1+2: forbudte termer + emoji ─────────────────────────────
for (const fil of filer) {
  const erTekst = /\.(html|md|json)$/.test(fil);
  if (!erTekst) continue;
  const relSti = relative(ROT, fil);
  const innhold = readFileSync(fil, "utf-8");

  const erMetaTerm = META_TERM_SKIP.some((re) => re.test(relSti));
  if (!erMetaTerm) {
    // Backtick-spans i .md er kode-identifikatorer (API-feltnavn), ikke UI-tekst.
    const soekbar = fil.endsWith(".md") ? innhold.replace(/`[^`\n]*`/g, "``") : innhold;
    for (const { navn, re } of FORBUDT) {
      const m = soekbar.match(re);
      if (m && m.index !== undefined) {
        const start = Math.max(0, m.index - VINDU);
        const kontekst = soekbar.slice(start, m.index + VINDU);
        if (NEGASJON.test(kontekst)) continue; // meta-omtale («aldri ELITE» o.l.)
        const linje = soekbar.slice(0, m.index).split("\n").length;
        feil.push({ fil: rel(fil), melding: `forbudt term «${navn}» (linje ${linje})` });
      }
    }
  }

  if (fil.endsWith(".html") && !META_EMOJI_SKIP.some((re) => re.test(relSti))) {
    const m = innhold.match(EMOJI);
    if (m) {
      const linje = innhold.slice(0, m.index).split("\n").length;
      feil.push({ fil: rel(fil), melding: `emoji i HTML: «${m[0]}» (linje ${linje})` });
    }
  }
}

// ── Sjekk 3: skjerm-.html under skjermer/ må ha .png eller manifest.json ved siden av ──
for (const fil of filer) {
  if (!fil.endsWith(".html")) continue;
  if (!fil.split("/").includes("skjermer")) continue;
  const mappe = dirname(fil);
  const navn = basename(fil, ".html");
  const harPng = existsSync(join(mappe, `${navn}.png`));
  const harManifest = existsSync(join(mappe, "manifest.json"));
  if (!harPng && !harManifest) {
    feil.push({ fil: rel(fil), melding: "skjerm-HTML uten .png eller manifest.json ved siden av" });
  }
}

// ── Sjekk 4 (advarsel): hex i HTML som ikke er i tokens-allowlisten ──
if (allow.size === 0) {
  advarsler.push({ fil: rel(ROT), melding: "ingen tokens/-css funnet — hex-sjekk hoppet over" });
} else {
  for (const fil of filer) {
    if (!fil.endsWith(".html")) continue;
    const innhold = readFileSync(fil, "utf-8");
    const ukjente = new Set<string>();
    for (const m of innhold.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      const hex = m[0].toLowerCase();
      if (!allow.has(hex)) ukjente.add(hex);
    }
    if (ukjente.size > 0) {
      advarsler.push({
        fil: rel(fil),
        melding: `hex utenfor tokens-allowlist: ${[...ukjente].slice(0, 8).join(", ")}${ukjente.size > 8 ? ` (+${ukjente.size - 8} til)` : ""}`,
      });
    }
  }
}

// ── Rapport ─────────────────────────────────────────────────────────
for (const a of advarsler) console.warn(`ADVARSEL: ${a.fil} — ${a.melding}`);
if (feil.length > 0) {
  console.error(`\nDesign-zip-QA: ${feil.length} FEIL i ${ROT}:`);
  for (const f of feil) console.error(` - ${f.fil} — ${f.melding}`);
  process.exit(1);
}
console.log(
  `OK: design-zip-QA — ${filer.length} filer sjekket i ${ROT}, 0 feil, ${advarsler.length} advarsler (allowlist: ${allow.size} token-farger).`,
);

#!/usr/bin/env node
// Genererer src/styles/ak-golf-ds-tokens.generert.css fra speilet
// designsystem/ak-golf-ds/tokens/.
//
// Hvorfor: masterens token-filer setter alt på `:root`. I Next er all CSS
// global, så `:root` ville truffet /portal og /admin også. 36 variabelnavn
// kolliderer med produktets egne (målt 21.09.2026: --text-primary, --space-4,
// --radius, --primary, --font-display m.fl.). Derfor scopes hele settet til
// `.ak-ds`, som markedsflaten setter på sin ytterste wrapper.
//
// Speilet redigeres ALDRI. Denne filen er avledet, og `npm run verify` feiler
// hvis den har sklidd fra speilet.
//
// Bruk:  node scripts/ak-golf-ds-tokens.mjs          (skriv)
//        node scripts/ak-golf-ds-tokens.mjs --sjekk  (vakt: feil ved avvik)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROT = resolve(import.meta.dirname, "..");
const SPEIL = resolve(ROT, "designsystem/ak-golf-ds/tokens");
const UT = resolve(ROT, "src/styles/ak-golf-ds-tokens.generert.css");
const SCOPE = ".ak-ds";

// fonts.css er utelatt med vilje: den @import-er Google Fonts, mens vi laster
// fontene med next/font i markedslayouten. base.css er utelatt fordi den setter
// html/body/a globalt — den er gjenskapt scopet i ak-golf-ds-grunnlag.css.
const FILER = [
  "colors.css",
  "typography.css",
  "spacing.css",
  "layout.css",
  "motion.css",
  "marketing.css",
];

const deler = [
  `/* GENERERT av scripts/ak-golf-ds-tokens.mjs fra designsystem/ak-golf-ds/tokens/.`,
  `   IKKE REDIGER — kjør skriptet på nytt. Masterens \`:root\` er byttet til`,
  `   \`${SCOPE}\` så tokenene ikke lekker inn i /portal og /admin. */`,
  "",
];

for (const fil of FILER) {
  const sti = resolve(SPEIL, fil);
  if (!existsSync(sti)) {
    console.error(`mangler i speilet: tokens/${fil} — kjør scripts/speil-ak-golf-ds.mjs`);
    process.exit(1);
  }
  const tekst = readFileSync(sti, "utf8");
  // Masteren bruker `:root{` og `:root {`. Alt annet står urørt — også
  // scope-blokker som [data-surface="live"], som skal virke inne i .ak-ds.
  const scopet = tekst.replace(/:root\s*\{/g, `${SCOPE} {`);
  if (scopet === tekst && /:root/.test(tekst)) {
    console.error(`fant :root i tokens/${fil}, men klarte ikke bytte den`);
    process.exit(1);
  }
  deler.push(`/* ---- tokens/${fil} ---- */`, scopet.trimEnd(), "");
}

const ny = deler.join("\n") + "\n";

if (process.argv.includes("--sjekk")) {
  const gammel = existsSync(UT) ? readFileSync(UT, "utf8") : "";
  if (gammel !== ny) {
    console.error(
      "ak-golf-ds-tokens.generert.css er ikke i takt med speilet.\n" +
        "Kjør: node scripts/ak-golf-ds-tokens.mjs"
    );
    process.exit(1);
  }
  console.log("ak-golf-ds-tokens: i takt med speilet");
} else {
  writeFileSync(UT, ny);
  const antall = (ny.match(/--[a-zA-Z][a-zA-Z0-9-]*\s*:/g) || []).length;
  console.log(`skrev src/styles/ak-golf-ds-tokens.generert.css — ${antall} tokens, scopet til ${SCOPE}`);
}

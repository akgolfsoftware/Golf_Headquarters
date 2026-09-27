#!/usr/bin/env node
// Speiler Claude Design-masteren «AK Golf Design System»
// (87aa23fb-8eac-4ca4-aaa0-7a636f4318ff, prosjektet «App design») ned til
// designsystem/ak-golf-ds/. Masteren er fasit; repoet er speilet koden leser.
//
// Dette er IKKE det samme som scripts/speil-ak-golf.mjs, som speiler det eldre
// merkesystemet (3e5c851c) til designsystem/ak-golf/. Det gamle speilet er
// merket historisk 21.09.2026, men lever til alle markedssidene er portert —
// slett det ikke før da.
//
// Bruk:  AKHQ_SERVE_BASE=<fil> node scripts/speil-ak-golf-ds.mjs
//        Fila har to linjer: URL-prefiks (…/serve/) og ?query med token.
//        Hent den med claude-design render_preview. Den er kortlevd og
//        prosjekt-scopet — skal ALDRI committes eller skrives i logg/dok.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const baseFil = process.env.AKHQ_SERVE_BASE;
if (!baseFil) {
  console.error("Sett AKHQ_SERVE_BASE til fila med serve-URL.");
  process.exit(1);
}
const [base, query] = readFileSync(baseFil, "utf8").trim().split("\n");
const rot = resolve("designsystem/ak-golf-ds");
const url = (sti) => base + sti.split("/").map(encodeURIComponent).join("/") + query;

// Kjeden ds-web faktisk trenger, utledet av web.css og styles.css i masteren:
//   web.css → styles.css + tokens/marketing.css + components/marketing/marketing.css
//   styles.css → sju token-filer + components/components.css
//   components.css → ni komponent-CSS-filer
// App-komponentene følger med fordi components.css importerer dem. De er
// ufarlige på markedsflaten (klassene er `aos-`-prefikset og brukes ikke der),
// og de trengs uansett når app-laget skal portes.
const FILER = [
  "tokens.json",
  "styles.css",
  "web.css",
  "tokens/fonts.css",
  "tokens/colors.css",
  "tokens/typography.css",
  "tokens/spacing.css",
  "tokens/layout.css",
  "tokens/motion.css",
  "tokens/base.css",
  "tokens/marketing.css",
  "components/components.css",
  "components/instrument.css",
  "components/buttons/buttons.css",
  "components/typography/typography.css",
  "components/surfaces/surfaces.css",
  "components/navigation/navigation.css",
  "components/states/states.css",
  "components/app/app.css",
  "components/measurement/measurement.css",
  "components/measurement/datagolf.css",
  "components/marketing/marketing.css",
];

let hentet = 0;
const feil = [];

for (const sti of FILER) {
  const r = await fetch(url(sti));
  if (!r.ok) {
    feil.push(`${r.status} ${sti}`);
    continue;
  }
  const ut = resolve(rot, sti);
  mkdirSync(dirname(ut), { recursive: true });
  writeFileSync(ut, Buffer.from(await r.arrayBuffer()));
  hentet += 1;
}

console.log(`speilet ${hentet}/${FILER.length} filer til designsystem/ak-golf-ds/`);
if (feil.length) {
  console.error("MANGLER:");
  for (const f of feil) console.error("  " + f);
  process.exit(1);
}

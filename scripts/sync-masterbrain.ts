#!/usr/bin/env tsx
/**
 * Sync-masterbrain — kopierer CANON/MORAD/LTAD-fasiten fra den lokale
 * masterbrain-klonen inn i src/lib/masterbrain/knowledge/ i denne appen.
 *
 * Masterbrain (akgolfsoftware/masterbrain) er kunnskapskilden Anders
 * videreutvikler i; agentene her leser en lokal, versjonert kopi (raskt,
 * ingen nettverkskall i produksjon). Kjør denne etter at masterbrain er
 * oppdatert, for å hente endringene inn:
 *
 *   npx tsx scripts/sync-masterbrain.ts
 *   npm run sync:masterbrain
 *
 * Sti til masterbrain-klonen overstyres med MASTERBRAIN_PATH, ellers
 * antas søsken-mappen ../masterbrain (samme mønster som andre prosjekter
 * under ~/Developer/).
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const MASTERBRAIN_PATH = process.env.MASTERBRAIN_PATH ?? resolve(__dirname, "..", "..", "masterbrain");
const KILDER = ["knowledge/concepts", "knowledge/entities"];
const MAAL_ROOT = resolve(__dirname, "..", "src", "lib", "masterbrain", "knowledge");

function main() {
  if (!existsSync(MASTERBRAIN_PATH)) {
    console.error(`Fant ikke masterbrain-klonen: ${MASTERBRAIN_PATH}`);
    console.error("Sett MASTERBRAIN_PATH hvis den ligger et annet sted.");
    process.exit(1);
  }

  let kopiert = 0;
  for (const rel of KILDER) {
    const kildeMappe = join(MASTERBRAIN_PATH, rel);
    if (!existsSync(kildeMappe)) continue;
    const maalMappe = join(MAAL_ROOT, rel.replace("knowledge/", ""));
    mkdirSync(maalMappe, { recursive: true });
    for (const fil of readdirSync(kildeMappe)) {
      if (!fil.endsWith(".json")) continue;
      copyFileSync(join(kildeMappe, fil), join(maalMappe, fil));
      console.log(`  ${rel}/${fil}`);
      kopiert++;
    }
  }

  console.log(`\nSynket ${kopiert} filer fra ${MASTERBRAIN_PATH}`);
}

main();

/**
 * Kunnskapsbro til masterbrain (akgolfsoftware/masterbrain) — lokal,
 * versjonert kopi av CANON/MORAD/LTAD-fasiten under ./knowledge/, synket inn
 * med `npm run sync:masterbrain`. Ingen nettverkskall i produksjon: agenter
 * som genererer øvelser/tester importerer herfra for å sjekke forslag mot
 * fasiten (pyramidefordeling, læringstrinn, sving-posisjoner, svingfeil).
 *
 * Dette er appens ENESTE fasit for golfmetodikk. `src/lib/ai-coach/kunnskap/`
 * og `src/lib/domain/rules/` var parallelle kopier og er fjernet 2026-08-02 —
 * prosatekstene lever nå i ./rag-corpus/, synket fra samme kilde.
 *
 * Oppdater ALDRI filene under knowledge/, rag-corpus/ eller training-data/
 * direkte i denne appen — endre kilden i masterbrain-repoet og kjør
 * sync-scriptet på nytt. Kopien overskrives.
 *
 * Les ./MANIFEST.md først: den sier hva som er fasit, hva som er råmateriale,
 * og hvilke kunnskapshull som er bevisste (blant annet at drill-banken er tom
 * og at SG→feil er hypotese, ikke diagnose).
 */

import canonMethodology from "./knowledge/concepts/canon-methodology.json";
import ltadFramework from "./knowledge/concepts/ltad-framework.json";
import mikroperiodisering from "./knowledge/concepts/mikroperiodisering-og-tidsdimensjon.json";
import sgPrinciples from "./knowledge/concepts/sg-principles.json";
import upgameDimensions from "./knowledge/concepts/upgame-dimensions.json";
import drills from "./knowledge/entities/drills.json";
import faults from "./knowledge/entities/faults.json";
import ordbok from "./knowledge/entities/ordbok.json";
import positions from "./knowledge/entities/positions.json";

export const masterbrain = {
  canonMethodology,
  ltadFramework,
  mikroperiodisering,
  sgPrinciples,
  upgameDimensions,
  drills,
  faults,
  ordbok,
  positions,
};

/**
 * SG→feil-kandidater fra fasiten (`sg-principles.json`).
 *
 * Dette er den ENESTE gyldige kopien av koblingen. Den er en **hypotese, ikke
 * en diagnose**: et SG-tall alene identifiserer ikke en svingfeil. Rekkefølgen
 * i listene er ikke en rangering — kandidatene er likestilte inntil de er
 * bekreftet med videoanalyse, kontroll av sikte og gjennomgang av køllevalg.
 * (Beslutning: Anders Kristiansen, 2026-07-31.)
 *
 * `putt` er tom med vilje — MORAD er et posisjonssystem for fullsving og
 * dekker ikke putting.
 */
export const sgTilMoradKandidater = (
  sgPrinciples as { sg_to_morad_faults?: Record<string, string[]> }
).sg_to_morad_faults ?? {};

/** Er drill-banken fylt? Tom bank betyr: beskriv hva som bør trenes, ikke hvilken drill. */
export function harDrillBank(): boolean {
  const entities = (drills as { entities?: Record<string, unknown> }).entities;
  return Boolean(entities && Object.keys(entities).length > 0);
}

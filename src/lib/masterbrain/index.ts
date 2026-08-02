/**
 * Kunnskapsbro til masterbrain (akgolfsoftware/masterbrain) — lokal,
 * versjonert kopi av CANON/MORAD/LTAD-fasiten under ./knowledge/, synket inn
 * med `npm run sync:masterbrain`. Ingen nettverkskall i produksjon: agenter
 * som genererer øvelser/tester importerer herfra for å sjekke forslag mot
 * fasiten (pyramidefordeling, læringstrinn, sving-posisjoner, svingfeil).
 *
 * Oppdater ALDRI JSON-filene under knowledge/ direkte i denne appen — endre
 * kilden i masterbrain-repoet og kjør sync-scriptet på nytt.
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
 * Periodenavnet i CANON er ikke det samme som enum-verdien i databasen
 * (CANON: GRUNN/SPES/TURN — Prisma: GRUNN/SPESIAL(ISERING)/TURNERING).
 * Slå alltid opp her før et periodenavn skrives til databasen; skriv aldri
 * CANON-strengen rått. Kilde: MANIFEST.md i masterbrain.
 */
export const periodenavnOversettelse =
  mikroperiodisering.periodenavn_oversettelsestabell;

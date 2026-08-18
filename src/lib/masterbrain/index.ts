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

/**
 * Foretrukket inngang for agenter. Velger riktig del av fasiten ut fra hva
 * agenten faktisk skal gjøre, i stedet for at hver kaller plukker felt fra
 * `masterbrain`-objektet over og selv må huske reglene fra MANIFEST.
 *
 * Utfyller `selectKnowledgeFiles` i ai-coach/rag-select.ts — den henter
 * fritekst fra rag-corpus per SG-område, denne henter det strukturerte
 * fagstoffet (pyramide, L-faser, hypotese-regel) per oppgavetype.
 */
export {
  hentMasterbrainKunnskap,
  oppgavetypeForAksjon,
  formatMasterbrainBlokk,
  type Oppgavetype,
  type MasterbrainKunnskap,
  type HentOptions,
  type Kilde,
} from "./hent-kunnskap";

/** Drill-bank invent-guards — se drill-bank.ts og MANIFEST (bank TOM). */
export {
  DRILL_BANK_EMPTY_CODE,
  DRILL_BANK_EMPTY_MELDING_NO,
  erMasterbrainDrillBankTom,
  masterbrainDrillAntall,
  masterbrainDrillBankStatus,
} from "./drill-bank";

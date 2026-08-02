import type { SgCategory } from "@/generated/prisma/client";
import { masterbrain } from "@/lib/masterbrain";

// Fasiten ligger i masterbrain (knowledge/concepts/sg-principles.json). Den
// lokale kopien under domain/rules/ er arkivert — én kilde, ikke to.
const sgToMoradFaults = masterbrain.sgPrinciples.sg_to_morad_faults as Record<
  string,
  string[]
>;

const SG_TO_KEY: Record<SgCategory, string> = {
  OTT: "ott",
  APP: "app",
  ARG: "arg",
  PUTT: "putt",
};

/**
 * Svingfeil som et svakt SG-område *kan* peke mot.
 *
 * Dette er hypoteser, ikke en diagnose, og listen er ikke rangert — et SG-tall
 * alene identifiserer ingen svingfeil. Før noe presenteres som funn må det
 * bekreftes med videoanalyse, kontroll av hvor spilleren sikter, og gjennomgang
 * av taktiske køllevalg. (MANIFEST.md i masterbrain, besluttet 31. juli 2026.)
 *
 * PUTT gir alltid tom liste: MORAD er et posisjonssystem for fullsving og
 * dekker ikke putting.
 */
export function sgBandFaultKandidater(sgArea: SgCategory): string[] {
  return sgToMoradFaults[SG_TO_KEY[sgArea]] ?? [];
}

/**
 * Én vilkårlig kandidat fra listen over. Brukes kun der ett enkelt felt skal
 * fylles internt (signal-payload). Skal aldri vises til spiller eller coach
 * som «feilen er X» — bruk `sgBandFaultKandidater` og hypotese-formuleringen.
 */
export function mapSgBandToFault(sgArea: SgCategory): string | null {
  return sgBandFaultKandidater(sgArea)[0] ?? null;
}

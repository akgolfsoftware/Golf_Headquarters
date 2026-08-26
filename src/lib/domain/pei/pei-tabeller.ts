/**
 * pei-tabeller.ts — PEI-referanser, høstet fra ak-golf-talenthq
 * (shared/protocols/sg-reference.js, Referens!J1:S6).
 *
 * PEI-FORMELEN (avklart med produkteier, 2026-08-26): PEI er en prosent der
 * LAVERE er bedre — resultat ÷ lengde. Se pei-beregning.ts for selve
 * utregningen. Denne fila har KUN Hovland-turneringsbenchmarken (et
 * referansepunkt å sammenligne egen PEI mot), ikke Broadie-SG — de bor i
 * broadie-sg-tabeller.ts og blandes aldri sammen i én funksjon (jf.
 * CLAUDE.md-invarianten om at PEI, SG og DataGolf er tre separate motorer).
 */

/** Hovland inspill-PEI i turnering (Referens!J1:S6) — benchmark per lengdeintervall. */
export const HOVLAND_INSPILL_PEI: ReadonlyArray<{ fra: number; til: number; pei: number }> = [
  { fra: 50, til: 100, pei: 0.0736 },
  { fra: 100, til: 150, pei: 0.0536 },
  { fra: 150, til: 200, pei: 0.0511 },
  { fra: 200, til: 999, pei: 0.0597 },
];

/** Hovland-benchmark-PEI for en gitt mål-avstand (inspill i turnering). */
export function hovlandPei(malMeter: number): number | null {
  const rad = HOVLAND_INSPILL_PEI.find(r => malMeter >= r.fra && malMeter < r.til);
  return rad ? rad.pei : null;
}

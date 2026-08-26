/**
 * vlookup.ts — delt oppslagshjelper for referansetabellene i denne mappen.
 *
 * Alle tabeller er par av [nedreGrense, verdi], sortert stigende på nedre
 * grense. Oppslaget følger Excels VLOOKUP(..., TRUE)-semantikk: finn raden
 * med størst nedre grense som er <= x.
 */
export type Oppslagstabell = ReadonlyArray<readonly [number, number]>;

export function slaOpp(tabell: Oppslagstabell, x: number | null): number | null {
  if (x == null || Number.isNaN(x)) return null;
  let ut: number | null = null;
  for (const [nedreGrense, verdi] of tabell) {
    if (x >= nedreGrense) ut = verdi;
    else break;
  }
  return ut;
}

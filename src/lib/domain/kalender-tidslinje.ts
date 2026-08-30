/**
 * Kalender dag-tidslinje — layout for AG-11 (PX-6, 29.08.2026).
 *
 * Fasit: `designsystem/train-lock/AG-11 Kalender dag.dc.html` — time-akse
 * 07–21, nå-linje, overlappende hendelser side om side («overlapp side om
 * side», ikke stablet). Brukt av `DagTidslinje` i `KalenderLagUkeV2.tsx`.
 *
 * Rene funksjoner, ingen Prisma/Date — kalleren gir minutter siden midnatt.
 */

export const TIDSLINJE_START_MIN = 7 * 60;
export const TIDSLINJE_SLUTT_MIN = 21 * 60;
export const TIDSLINJE_PX_PER_MIN = 64 / 60;

/** Piksel-avstand fra toppen av tidslinjen for et gitt klokkeslett (minutter siden midnatt), klemt til [start, slutt]. */
export function tidslinjeTopp(min: number): number {
  return (
    (Math.max(TIDSLINJE_START_MIN, Math.min(TIDSLINJE_SLUTT_MIN, min)) - TIDSLINJE_START_MIN) *
    TIDSLINJE_PX_PER_MIN
  );
}

export interface TidslinjeHendelse {
  id: string;
  startMin: number | null;
  sluttMin: number | null;
}

export interface TidslinjePlassering<T extends TidslinjeHendelse> {
  h: T;
  kolonne: number;
  avKolonner: number;
}

/**
 * Fordeler overlappende hendelser i kolonner side om side. Hendelser som
 * ikke overlapper noen andre får `avKolonner: 1` (full bredde). Innenfor en
 * overlapp-gruppe fylles laveste ledige kolonne først (samme mønster som en
 * enkel intervall-partisjonering) — rekkefølgen er stabil for samme input.
 */
export function tidslinjeKolonner<T extends TidslinjeHendelse>(
  hendelser: readonly T[],
): TidslinjePlassering<T>[] {
  const sortert = [...hendelser].sort((a, b) => (a.startMin ?? 0) - (b.startMin ?? 0));
  const grupper: T[][] = [];
  let aktivSlutt = -1;
  let gruppe: T[] = [];
  for (const h of sortert) {
    const start = h.startMin ?? 0;
    if (gruppe.length > 0 && start >= aktivSlutt) {
      grupper.push(gruppe);
      gruppe = [];
      aktivSlutt = -1;
    }
    gruppe.push(h);
    aktivSlutt = Math.max(aktivSlutt, h.sluttMin ?? start + 30);
  }
  if (gruppe.length > 0) grupper.push(gruppe);

  const resultat: TidslinjePlassering<T>[] = [];
  for (const g of grupper) {
    const kolonneSlutt: number[] = [];
    const tildelt = g.map((h) => {
      const start = h.startMin ?? 0;
      let kolonne = kolonneSlutt.findIndex((slutt) => slutt <= start);
      if (kolonne === -1) {
        kolonne = kolonneSlutt.length;
        kolonneSlutt.push(0);
      }
      kolonneSlutt[kolonne] = h.sluttMin ?? start + 30;
      return { h, kolonne };
    });
    const avKolonner = kolonneSlutt.length;
    for (const t of tildelt) resultat.push({ ...t, avKolonner });
  }
  return resultat;
}

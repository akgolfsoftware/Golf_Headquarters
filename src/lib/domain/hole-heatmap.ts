/**
 * Hull-varmekart: aggregerer snitt avvik-fra-par per hull over spillerens
 * registrerte runder (HoleScore), til bruk i varmekartet på hull-analysen
 * (`/portal/analysere/hull`, v2 `VarmeKart`-primitiven i
 * `src/components/v2/datavis.tsx`).
 *
 * Aggregeringsvalg (domenebeslutninger — dokumentert her, ikke i UI-laget):
 *  - Intensitet bruker en FAST skala, ikke spillerens egen min/maks, slik at
 *    fargen betyr det samme uansett spillernivå: hull spilt i snitt på/under
 *    par gir intensitet 0 (ingen risiko — vises tomt/track, ALDRI en egen
 *    "gevinst"-farge). Ved RISK_CEILING slag over par i snitt (konsekvent
 *    bogey på et par-hull) er intensiteten 1. Lineært imellom.
 *  - Dette er bevisst et RISIKO-kart («hvor du taper slag»), ikke et
 *    aktivitetskart — én kategorisk farge (error-token) i UI-laget, aldri
 *    blandet med en "opp"-farge (designkontrakt: én farge per grid).
 *  - Krever minst MIN_RUNDER distinkte runder med hulldata før varmekartet
 *    vises. Under det ville én enkelt dårlig runde dominere et hull og gi et
 *    misvisende bilde — se `harNokData` i resultatet.
 */

export const MIN_RUNDER = 3;
const RISK_CEILING = 1.0;

export type HoleScoreRad = {
  holeNumber: number;
  par: number;
  strokes: number;
  roundId: string;
};

export type HullVarmeCelle = {
  holeNumber: number;
  /** Gjennomsnittlig (slag − par) over runder med data på dette hullet. */
  snittDiff: number;
  /** Antall runder som bidrar til snittet på dette hullet. */
  rundeAntall: number;
  /** Normalisert 0..1 til bruk i VarmeKart (0 = ingen risiko). */
  intensitet: number;
};

export type HullVarmeResultat = {
  /** True når det finnes nok distinkte runder til å vise varmekartet. */
  harNokData: boolean;
  /** Antall distinkte runder datagrunnlaget bygger på. */
  rundeAntall: number;
  /** Én rad per hull med data, sortert etter holeNumber. Tom når harNokData er false. */
  celler: HullVarmeCelle[];
};

/**
 * Aggregerer rå HoleScore-rader (på tvers av alle spillerens runder) til
 * varmekart-celler per hull. Ren funksjon — ingen Prisma/IO her, kallerens
 * (server-siden i `page.tsx`) ansvar å hente radene.
 */
export function aggregerHullVarme(rader: HoleScoreRad[]): HullVarmeResultat {
  const rundeIder = new Set(rader.map((r) => r.roundId));

  if (rundeIder.size < MIN_RUNDER) {
    return { harNokData: false, rundeAntall: rundeIder.size, celler: [] };
  }

  const perHull = new Map<number, { sumDiff: number; runder: Set<string> }>();
  for (const r of rader) {
    const eksisterende = perHull.get(r.holeNumber) ?? { sumDiff: 0, runder: new Set<string>() };
    eksisterende.sumDiff += r.strokes - r.par;
    eksisterende.runder.add(r.roundId);
    perHull.set(r.holeNumber, eksisterende);
  }

  const celler: HullVarmeCelle[] = [...perHull.entries()]
    .map(([holeNumber, { sumDiff, runder }]) => {
      const snittDiff = sumDiff / runder.size;
      const intensitet = Math.max(0, Math.min(1, snittDiff / RISK_CEILING));
      return { holeNumber, snittDiff, rundeAntall: runder.size, intensitet };
    })
    .sort((a, b) => a.holeNumber - b.holeNumber);

  return { harNokData: true, rundeAntall: rundeIder.size, celler };
}

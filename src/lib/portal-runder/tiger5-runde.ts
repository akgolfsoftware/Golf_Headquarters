/**
 * Tiger 5 for én runde (PH-RD-08). Ren telling over hullscore og slag, ingen golfmatte.
 *
 * Reglene som brukes (vedtak 28.09, ordet rettet 14.10; de tre første er de samme som i
 * src/lib/min-golf/load-min-golf.ts):
 *   1. Dobbeltbogey eller verre
 *   2. Tre putt (bare hull der putter er ført)
 *   3. Bogey på par 5
 *   4. Bogey fra innenfor 130 m: et slag mot green i regulering (slagnummer ≤ par − 2) fra 130 m
 *      eller nærmere, utenfor green, og hullet endte på bogey eller verre. Krever ført slag.
 *   5. Bom på enkel up and down: hva som er «enkel» er ikke vedtatt, så den regnes ikke (null → «—»).
 *
 * null betyr at runden mangler data for regelen, ikke null feil.
 */

export type Tiger5Hull = { holeNumber: number; par: number; strokes: number; putts: number | null };
export type Tiger5Slag = { holeNumber: number; shotNumber: number; lie: string; distanceToPin: number | null; isPenalty: boolean };

export type Tiger5Regel = { navn: string; antall: number | null; hull: number[] };

const unike = (xs: number[]) => [...new Set(xs)].sort((a, b) => a - b);

export function tiger5ForRunde(hull: Tiger5Hull[], slag: Tiger5Slag[]): Tiger5Regel[] {
  const harHull = hull.length > 0;
  const medPutter = hull.filter((h) => h.putts != null);
  const dobbel = hull.filter((h) => h.strokes - h.par >= 2).map((h) => h.holeNumber);
  const trePutt = medPutter.filter((h) => (h.putts ?? 0) >= 3).map((h) => h.holeNumber);
  const par5 = hull.filter((h) => h.par === 5 && h.strokes > h.par).map((h) => h.holeNumber);

  const bogeyHull = new Map(hull.filter((h) => h.strokes > h.par).map((h) => [h.holeNumber, h]));
  const innenfor130 = unike(
    slag
      .filter((s) => {
        const h = bogeyHull.get(s.holeNumber);
        return h != null && !s.isPenalty && s.lie !== "GREEN" && s.distanceToPin != null &&
          s.distanceToPin <= 130 && s.shotNumber <= h.par - 2;
      })
      .map((s) => s.holeNumber),
  );

  return [
    { navn: "Dobbeltbogey eller verre", antall: harHull ? dobbel.length : null, hull: dobbel },
    { navn: "Tre putt", antall: medPutter.length ? trePutt.length : null, hull: trePutt },
    { navn: "Bogey på par 5", antall: hull.some((h) => h.par === 5) ? par5.length : null, hull: par5 },
    { navn: "Bogey fra innenfor 130 m", antall: harHull && slag.length ? innenfor130.length : null, hull: innenfor130 },
    { navn: "Bom på enkel up and down", antall: null, hull: [] },
  ];
}

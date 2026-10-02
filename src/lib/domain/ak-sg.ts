/** AK Golf SG based only on one approved, versioned expected-to-hole curve. */

export const AK_SG_LIES = ["tee", "fairway", "rough", "bunker", "recovery", "green"] as const;
export type AkSgLie = (typeof AK_SG_LIES)[number];

export type AkSgBaselinePoint = {
  lie: AkSgLie;
  distanceM: number;
  expectedStrokes: number;
};

export type AkSgShot = {
  startLie: AkSgLie;
  startDistanceM: number;
  end: { holed: true } | { holed: false; lie: AkSgLie; distanceM: number };
  penaltyStrokes?: number;
};

function validDistance(distanceM: number): boolean {
  return Number.isFinite(distanceM) && distanceM > 0 && distanceM <= 700;
}

export class AkSgCalculator {
  private readonly byLie = new Map<AkSgLie, ReadonlyArray<AkSgBaselinePoint>>();

  constructor(readonly versionId: string, points: ReadonlyArray<AkSgBaselinePoint>) {
    if (!versionId || points.length === 0) throw new Error("SG-modell mangler");
    for (const lie of AK_SG_LIES) {
      const rows = points.filter((point) => point.lie === lie)
        .sort((left, right) => left.distanceM - right.distanceM);
      if (rows.length < 2) throw new Error(`SG-kurve mangler for ${lie}`);
      for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        if (!validDistance(row.distanceM) || !Number.isFinite(row.expectedStrokes) ||
            row.expectedStrokes < 0.8 || row.expectedStrokes > 8) {
          throw new Error(`Ugyldig SG-punkt for ${lie}`);
        }
        if (index > 0 && (row.distanceM <= rows[index - 1].distanceM ||
            row.expectedStrokes < rows[index - 1].expectedStrokes)) {
          throw new Error(`SG-kurven er ikke stigende for ${lie}`);
        }
      }
      this.byLie.set(lie, rows);
    }
    if (points.length !== [...this.byLie.values()].reduce((sum, rows) => sum + rows.length, 0)) {
      throw new Error("Ukjent SG-underlag");
    }
  }

  /** Returns null outside observed model coverage; zero is only for a holed end. */
  expectedStrokes(lie: AkSgLie, distanceM: number): number | null {
    if (!validDistance(distanceM)) throw new RangeError("Ugyldig avstand til hull");
    const rows = this.byLie.get(lie);
    if (!rows) throw new TypeError("Ukjent underlag");
    if (distanceM < rows[0].distanceM || distanceM > rows[rows.length - 1].distanceM) return null;

    let low = 0;
    let high = rows.length - 1;
    while (low <= high) {
      const middle = (low + high) >>> 1;
      if (rows[middle].distanceM === distanceM) return rows[middle].expectedStrokes;
      if (rows[middle].distanceM < distanceM) low = middle + 1;
      else high = middle - 1;
    }
    const left = rows[high];
    const right = rows[low];
    const share = (distanceM - left.distanceM) / (right.distanceM - left.distanceM);
    return left.expectedStrokes + share * (right.expectedStrokes - left.expectedStrokes);
  }

  /** SG = expected start − expected end − physical shot − penalties. */
  calculateShot(shot: AkSgShot): number | null {
    const penalty = shot.penaltyStrokes ?? 0;
    if (!Number.isInteger(penalty) || penalty < 0 || penalty > 2) {
      throw new RangeError("Ugyldig antall straffeslag");
    }
    const start = this.expectedStrokes(shot.startLie, shot.startDistanceM);
    const end = shot.end.holed ? 0 : this.expectedStrokes(shot.end.lie, shot.end.distanceM);
    if (start === null || end === null) return null;
    return start - end - 1 - penalty;
  }
}

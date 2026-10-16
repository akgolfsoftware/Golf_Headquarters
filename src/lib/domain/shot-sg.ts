import {
  generateSgBaselineSeed,
  SG_LIE_TYPES,
  type SgBaselinePoint,
  type SgLieType,
} from "./sg-baseline-seed";

/** SG for ett faktisk slag mot en versjonert PGA-referanse. Ingen mellomavrunding. */
export class StrokesGainedCalculator {
  private readonly byLie = new Map<SgLieType, ReadonlyArray<SgBaselinePoint>>();

  constructor(points: ReadonlyArray<SgBaselinePoint>) {
    for (const lie of SG_LIE_TYPES) {
      const rows = points.filter((point) => point.lieType === lie).sort((a, b) => a.distanceMeters - b.distanceMeters);
      if (rows.length < 2 || rows[0].distanceMeters !== 0 || rows[0].expectedStrokes !== 0) {
        throw new Error(`Ufullstendig SG-kurve for ${lie}`);
      }
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].distanceMeters <= rows[i - 1].distanceMeters) {
          throw new Error(`Duplisert eller usortert SG-distanse for ${lie}`);
        }
        if (rows[i].isSupported && rows[i].expectedStrokes == null) {
          throw new Error(`Manglende SG-verdi for ${lie} ved ${rows[i].distanceMeters} m`);
        }
      }
      const present = new Set(rows.map((row) => row.distanceMeters));
      for (let distance = 0; distance <= 500; distance += 10) {
        if (!present.has(distance)) {
          throw new Error(`Manglende SG-punkt for ${lie} ved ${distance} m`);
        }
      }
      this.byLie.set(lie, rows);
    }
  }

  expectedStrokes(distanceMeters: number, lie: SgLieType): number {
    if (!Number.isFinite(distanceMeters) || distanceMeters < 0 || distanceMeters > 500) {
      throw new RangeError("Avstand til hull må være mellom 0 og 500 meter");
    }
    if (!this.byLie.has(lie)) throw new TypeError(`Ukjent lie: ${lie}`);
    if (distanceMeters === 0) return 0; // Ballen er i hullet, uansett lie.

    const rows = this.byLie.get(lie)!;
    const firstPositive = rows[1];
    // Nullpunktet betyr hull og er diskontinuerlig. En ball 0,1 m fra hullet
    // har fremdeles minst ett slag igjen; aldri interpoler fra (0, 0).
    if (distanceMeters <= firstPositive.distanceMeters) {
      if (firstPositive.expectedStrokes == null || !firstPositive.isSupported) {
        throw new RangeError(`Ingen validert SG-kurve for ${lie} ved ${distanceMeters} m`);
      }
      return firstPositive.expectedStrokes;
    }

    for (let i = 2; i < rows.length; i++) {
      const right = rows[i];
      if (distanceMeters <= right.distanceMeters) {
        const left = rows[i - 1];
        if (!left.isSupported || !right.isSupported || left.expectedStrokes == null || right.expectedStrokes == null) {
          throw new RangeError(`Ingen validert SG-kurve for ${lie} ved ${distanceMeters} m`);
        }
        const share = (distanceMeters - left.distanceMeters) / (right.distanceMeters - left.distanceMeters);
        return left.expectedStrokes + share * (right.expectedStrokes - left.expectedStrokes);
      }
    }
    throw new RangeError(`Ingen SG-kurve for ${lie} ved ${distanceMeters} m`);
  }

  calculateShotSG(
    startDistance: number,
    startLie: SgLieType,
    endDistance: number,
    endLie: SgLieType,
    penaltyStrokes = 0,
  ): number {
    if (!Number.isInteger(penaltyStrokes) || penaltyStrokes < 0) {
      throw new RangeError("Straffeslag må være et ikke-negativt heltall");
    }
    const start = this.expectedStrokes(startDistance, startLie);
    const end = this.expectedStrokes(endDistance, endLie);
    if (startDistance === 0) throw new RangeError("Et slag kan ikke starte i hullet");
    return start - end - 1 - penaltyStrokes;
  }
}

const defaultCalculator = new StrokesGainedCalculator(generateSgBaselineSeed());

/** SG = E(start) − E(slutt) − 1 − straffeslag. Sluttavstand 0 betyr hull. */
export function calculateShotSG(
  startDistance: number,
  startLie: SgLieType,
  endDistance: number,
  endLie: SgLieType,
  penaltyStrokes = 0,
): number {
  return defaultCalculator.calculateShotSG(startDistance, startLie, endDistance, endLie, penaltyStrokes);
}

export function expectedStrokesAt(distanceMeters: number, lie: SgLieType): number {
  return defaultCalculator.expectedStrokes(distanceMeters, lie);
}

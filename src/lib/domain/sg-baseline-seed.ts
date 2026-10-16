/**
 * Versjonert startkurve for forventede slag TIL HULL. Dette er PGA Tour 2003–2010,
 * ikke en scratch-, junior- eller DataGolf-kurve.
 *
 * Tee/Fairway/Rough/Sand/Recovery: Broadie, "Assessing Golfer Performance on the
 * PGA TOUR", Appendix A, Table 9 (yards). Verdiene nedenfor er kildeankere;
 * 10-meterspunktene interpoleres etter omregning fra meter til yards.
 * https://www.columbia.edu/~mnb2/broadie/Assets/strokes_gained_pga_broadie_20110408.pdf
 *
 * Green: prosjektets allerede kalibrerte Team Norway IUP Ref-ankere (meter),
 * formet etter Broadies puttemodell. Over 18 m er kurven en foreløpig
 * ekstrapolasjon; over 30 m lagres punkter for komplett rutenett, men de er
 * eksplisitt sperret for SG-beregning.
 */

export const SG_BASELINE_VERSION = "broadie-pga-2011-seed-v1";

export const SG_LIE_TYPES = ["Tee", "Fairway", "Rough", "Sand", "Recovery", "Green"] as const;
export type SgLieType = (typeof SG_LIE_TYPES)[number];
export type SgBaselineQuality = "boundary" | "published" | "interpolated" | "extrapolated" | "unsupported";

export type SgBaselinePoint = {
  distanceMeters: number;
  lieType: SgLieType;
  expectedStrokes: number | null;
  sourceReference: string;
  quality: SgBaselineQuality;
  isSupported: boolean;
};

const BROADIE_SOURCE =
  "Broadie 2011 Appendix A Table 9, PGA Tour ShotLink 2003-2010";
const GREEN_SOURCE = "AK Golf Team Norway IUP 2025 Ref; Broadie 2011 putting model";
const METERS_PER_YARD = 0.9144;

// yards, Tee, Fairway, Rough, Sand, Recovery. Tee <100 yards mangler i kilden.
const BROADIE_TABLE_YARDS: ReadonlyArray<readonly [number, number | null, number, number, number, number]> = [
  [10, null, 2.18, 2.34, 2.43, 3.45],
  [20, null, 2.40, 2.59, 2.53, 3.51],
  [30, null, 2.52, 2.70, 2.66, 3.57],
  [40, null, 2.60, 2.78, 2.82, 3.71],
  [50, null, 2.66, 2.87, 2.92, 3.79],
  [60, null, 2.70, 2.91, 3.15, 3.83],
  [70, null, 2.72, 2.93, 3.21, 3.84],
  [80, null, 2.75, 2.96, 3.24, 3.84],
  [90, null, 2.77, 2.99, 3.24, 3.82],
  [100, 2.92, 2.80, 3.02, 3.23, 3.80],
  [120, 2.99, 2.85, 3.08, 3.21, 3.78],
  [140, 2.97, 2.91, 3.15, 3.22, 3.80],
  [160, 2.99, 2.98, 3.23, 3.28, 3.81],
  [180, 3.05, 3.08, 3.31, 3.40, 3.82],
  [200, 3.12, 3.19, 3.42, 3.55, 3.87],
  [220, 3.17, 3.32, 3.53, 3.70, 3.92],
  [240, 3.25, 3.45, 3.64, 3.84, 3.97],
  [260, 3.45, 3.58, 3.74, 3.93, 4.03],
  [280, 3.65, 3.69, 3.83, 4.00, 4.10],
  [300, 3.71, 3.78, 3.90, 4.04, 4.20],
  [320, 3.79, 3.84, 3.95, 4.12, 4.31],
  [340, 3.86, 3.88, 4.02, 4.26, 4.44],
  [360, 3.92, 3.95, 4.11, 4.41, 4.56],
  [380, 3.96, 4.03, 4.21, 4.55, 4.66],
  [400, 3.99, 4.11, 4.30, 4.69, 4.75],
  [420, 4.02, 4.19, 4.40, 4.83, 4.84],
  [440, 4.08, 4.27, 4.49, 4.97, 4.94],
  [460, 4.17, 4.34, 4.58, 5.11, 5.03],
  [480, 4.28, 4.42, 4.68, 5.25, 5.13],
  [500, 4.41, 4.50, 4.77, 5.40, 5.22],
  [520, 4.54, 4.58, 4.87, 5.54, 5.32],
  [540, 4.65, 4.66, 4.96, 5.68, 5.41],
  [560, 4.74, 4.74, 5.06, 5.82, 5.51],
];

const GREEN_ANCHORS: ReadonlyArray<readonly [number, number]> = [
  [0.3, 1.00], [0.9, 1.04], [1.2, 1.13], [1.5, 1.23],
  [1.8, 1.34], [2.1, 1.42], [2.4, 1.50], [2.7, 1.56],
  [3, 1.61], [4.5, 1.78], [6, 1.87], [9, 1.98],
  [12, 2.06], [15, 2.14], [18, 2.21],
];

function linear(anchors: ReadonlyArray<readonly [number, number]>, distance: number): number {
  if (distance <= anchors[0][0]) return anchors[0][1];
  for (let i = 1; i < anchors.length; i++) {
    const [rightDistance, rightValue] = anchors[i];
    if (distance <= rightDistance) {
      const [leftDistance, leftValue] = anchors[i - 1];
      return leftValue + ((distance - leftDistance) / (rightDistance - leftDistance)) * (rightValue - leftValue);
    }
  }
  return anchors[anchors.length - 1][1];
}

function broadieAnchors(lie: Exclude<SgLieType, "Green">): ReadonlyArray<readonly [number, number]> {
  const column = ({ Tee: 1, Fairway: 2, Rough: 3, Sand: 4, Recovery: 5 } as const)[lie];
  return BROADIE_TABLE_YARDS.flatMap((row) => {
    const value = row[column];
    return value == null ? [] : [[row[0] * METERS_PER_YARD, value] as const];
  });
}

function seedValue(distanceMeters: number, lieType: SgLieType): Omit<SgBaselinePoint, "distanceMeters" | "lieType"> {
  if (distanceMeters === 0) {
    return { expectedStrokes: 0, sourceReference: lieType === "Green" ? GREEN_SOURCE : BROADIE_SOURCE, quality: "boundary", isSupported: true };
  }

  if (lieType === "Green") {
    const extrapolated = distanceMeters > 18;
    const expectedStrokes = distanceMeters > 30 ? null : extrapolated
      ? 2.21 + 0.01 * (distanceMeters - 18)
      : linear(GREEN_ANCHORS, distanceMeters);
    const supported = distanceMeters <= 30;
    return {
      expectedStrokes,
      sourceReference: GREEN_SOURCE,
      quality: supported ? (extrapolated ? "extrapolated" : "interpolated") : "unsupported",
      isSupported: supported,
    };
  }

  const anchors = broadieAnchors(lieType);
  // Broadie gir ingen tee-tall under 100 yards. Foreløpig estimat bruker
  // fairway-kurven + 0,12 (forskjellen ved 100 yards), merket ekstrapolert.
  if (lieType === "Tee" && distanceMeters < anchors[0][0]) {
    return {
      expectedStrokes: linear(broadieAnchors("Fairway"), distanceMeters) + 0.12,
      sourceReference: BROADIE_SOURCE,
      quality: "extrapolated",
      isSupported: true,
    };
  }
  const published = anchors.some(([distance]) => Math.abs(distance - distanceMeters) < 0.000001);
  return {
    expectedStrokes: linear(anchors, distanceMeters),
    sourceReference: BROADIE_SOURCE,
    quality: distanceMeters < anchors[0][0] ? "extrapolated" : published ? "published" : "interpolated",
    isSupported: true,
  };
}

const roundFour = (value: number): number => Math.round(value * 10_000) / 10_000;

export function generateSgBaselineSeed(): SgBaselinePoint[] {
  const distances = Array.from({ length: 51 }, (_, index) => index * 10);
  // Puttene trenger langt tettere ankerpunkter enn ti meter.
  const greenDistances = [...new Set([...distances, ...GREEN_ANCHORS.map(([distance]) => distance)])].sort((a, b) => a - b);
  return SG_LIE_TYPES.flatMap((lieType) =>
    (lieType === "Green" ? greenDistances : distances).map((distanceMeters) => {
      const value = seedValue(distanceMeters, lieType);
      return { distanceMeters, lieType, ...value, expectedStrokes: value.expectedStrokes == null ? null : roundFour(value.expectedStrokes) };
    }),
  );
}

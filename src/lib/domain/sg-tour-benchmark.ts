import { SG_BASELINE_VERSION } from "./sg-baseline-seed";

export type SgTour = "pga" | "dp_world" | "korn_ferry";
export type SgTourCategory = "OTT" | "APP" | "ARG" | "PUTT";
export type TourRoundCoverage = {
  totalGrossRounds: number;
  categoryRounds: number;
  atOrBelowPlayer: number | null;
};

export type TourBenchmarkResult =
  | { status: "missing_reference" | "restricted" | "uncalibrated_scale" | "wrong_sg_version" | "invalid_round"; sampleSize: number }
  | { status: "ready"; sampleSize: number; percentile: number; top20Percent: boolean };

/** DataGolf-rundens SG er målt mot feltet; vår SG er målt mot PGA-tee-kurven. */
export function assessTourRoundBenchmark(input: {
  playerSg: number;
  playerBaselineVersion: string;
  coverage: TourRoundCoverage;
  licenseAllowsPlayerDisplay: boolean;
  /** Kalibrert PGA-baseline-SG → tourens felt-sentrerte DataGolf-skala. */
  playerToFieldOffset?: number;
}): TourBenchmarkResult {
  const { playerSg, playerBaselineVersion, coverage } = input;
  const sampleSize = coverage.categoryRounds;
  if (!Number.isFinite(playerSg)) return { status: "invalid_round", sampleSize };
  if (playerBaselineVersion !== SG_BASELINE_VERSION) return { status: "wrong_sg_version", sampleSize };
  if (!Number.isInteger(coverage.totalGrossRounds) || !Number.isInteger(sampleSize) ||
      coverage.totalGrossRounds < 0 || sampleSize < 0 || sampleSize > coverage.totalGrossRounds ||
      sampleSize < 100 || sampleSize / coverage.totalGrossRounds < 0.8) {
    return { status: "missing_reference", sampleSize: Math.max(0, sampleSize) };
  }
  if (!input.licenseAllowsPlayerDisplay) return { status: "restricted", sampleSize };
  if (input.playerToFieldOffset == null || !Number.isFinite(input.playerToFieldOffset)) {
    return { status: "uncalibrated_scale", sampleSize };
  }
  const atOrBelow = coverage.atOrBelowPlayer;
  if (!Number.isInteger(atOrBelow) || atOrBelow == null || atOrBelow < 0 || atOrBelow > sampleSize) {
    return { status: "missing_reference", sampleSize };
  }
  const percentile = Math.round((1000 * atOrBelow) / sampleSize) / 10;
  return { status: "ready", sampleSize, percentile, top20Percent: percentile >= 80 };
}

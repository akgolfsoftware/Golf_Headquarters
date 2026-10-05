/** 100-runders demonstrasjon basert på komplette brutto-runder og én SG-versjon. */
export const SG_SIMULATION_VERSION = "sg-bootstrap-100-v1";

export type HistoricalSgRound = {
  courseId: string;
  par: number;
  grossScore: number;
  sgOtt: number;
  sgApp: number;
  sgArg: number;
  sgPutt: number;
  sgTotal: number;
  sgVersion: string;
};

export type SimulationResult =
  | { status: "insufficient_data" | "missing_course_calibration" | "inconsistent_data"; historicalRounds: number }
  | {
      status: "demo_only";
      modelVersion: typeof SG_SIMULATION_VERSION;
      historicalRounds: number;
      draws: 100;
      targetPar: number;
      probabilityBelowPar: number;
      belowParCount: number;
      averageGrossScore: number;
      p10GrossScore: number;
      p90GrossScore: number;
      historicalGrossDispersion: number;
      simulatedGrossScores: number[];
    };

function random(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return (value >>> 0) / 0x1_0000_0000;
  };
}

function mean(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sampleDeviation(values: readonly number[]): number {
  const average = mean(values);
  return Math.sqrt(values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1));
}

/**
 * Trekker hele observerte SG-runder med tilbakelegging. Det bevarer samvariasjon
 * mellom OTT/APP/ARG/PUTT og halene i observert score-spredning. Bane-baseline
 * er E(tee) summert over 18 hull, estimert som brutto score + SG-total når alle
 * historiske runder er fra samme bane; en annen bane krever eksplisitt kalibrering.
 */
export function simulateSgGrossRounds(input: {
  historicalRounds: readonly HistoricalSgRound[];
  targetCourseId: string;
  targetPar: number;
  targetBaselineGross?: number;
  seed?: number;
}): SimulationResult {
  const { historicalRounds: rounds, targetCourseId, targetPar } = input;
  if (rounds.length < 10) return { status: "insufficient_data", historicalRounds: rounds.length };
  const version = rounds[0].sgVersion;
  if (!Number.isInteger(targetPar) || targetPar < 18 || targetPar > 90 ||
      !version || rounds.some((round) =>
        !round.courseId || !Number.isInteger(round.par) || round.par < 18 ||
        !Number.isInteger(round.grossScore) || round.grossScore < 18 ||
        round.sgVersion !== version ||
        [round.sgOtt, round.sgApp, round.sgArg, round.sgPutt, round.sgTotal].some((value) => !Number.isFinite(value)) ||
        Math.abs(round.sgOtt + round.sgApp + round.sgArg + round.sgPutt - round.sgTotal) > 0.01)) {
    return { status: "inconsistent_data", historicalRounds: rounds.length };
  }

  const sameCourse = rounds.every((round) => round.courseId === targetCourseId && round.par === targetPar);
  if (!sameCourse && input.targetBaselineGross == null) {
    return { status: "missing_course_calibration", historicalRounds: rounds.length };
  }
  const baseline = input.targetBaselineGross ?? mean(rounds.map((round) => round.grossScore + round.sgTotal));
  if (!Number.isFinite(baseline) || baseline < 18) {
    return { status: "inconsistent_data", historicalRounds: rounds.length };
  }

  const next = random(input.seed ?? 20261002);
  const simulatedGrossScores = Array.from({ length: 100 }, () => {
    const sampled = rounds[Math.floor(next() * rounds.length)];
    return Math.max(18, Math.round(baseline - sampled.sgTotal));
  });
  const sorted = [...simulatedGrossScores].sort((a, b) => a - b);
  const belowParCount = simulatedGrossScores.filter((score) => score < targetPar).length;
  return {
    status: "demo_only", modelVersion: SG_SIMULATION_VERSION,
    historicalRounds: rounds.length, draws: 100, targetPar,
    probabilityBelowPar: belowParCount / 100, belowParCount,
    averageGrossScore: Math.round(mean(simulatedGrossScores) * 10) / 10,
    p10GrossScore: sorted[9], p90GrossScore: sorted[89],
    historicalGrossDispersion: Math.round(sampleDeviation(rounds.map((round) => round.grossScore)) * 100) / 100,
    simulatedGrossScores,
  };
}

import assert from "node:assert/strict";
import { test } from "node:test";
import { generateSgMockRounds, SG_MOCK_VERSION } from "./sg-mock-rounds";
import { simulateSgGrossRounds, type HistoricalSgRound } from "./sg-round-simulation";

const rounds: HistoricalSgRound[] = generateSgMockRounds().map((round) => ({
  courseId: "synthetic-course", par: round.par, grossScore: round.score,
  sgOtt: round.sg.OTT, sgApp: round.sg.APP, sgArg: round.sg.ARG,
  sgPutt: round.sg.PUTT, sgTotal: round.sg.total, sgVersion: SG_MOCK_VERSION,
}));

test("100 simulerte bruttorunder er reproduserbare; bare under par telles", () => {
  const input = { historicalRounds: rounds, targetCourseId: "synthetic-course", targetPar: 72, seed: 42 };
  const result = simulateSgGrossRounds(input);
  assert.equal(result.status, "demo_only");
  if (result.status !== "demo_only") return;
  assert.equal(result.simulatedGrossScores.length, 100);
  assert.equal(result.belowParCount, result.simulatedGrossScores.filter((score) => score < 72).length);
  assert.equal(result.probabilityBelowPar, result.belowParCount / 100);
  assert.deepEqual(result, simulateSgGrossRounds(input));
  assert.ok(result.p10GrossScore <= result.averageGrossScore);
  assert.ok(result.p90GrossScore >= result.averageGrossScore);
  assert.ok(result.historicalGrossDispersion > 0);
});

test("to runder og ukalibrert ny bane får ingen sannsynlighet", () => {
  assert.deepEqual(simulateSgGrossRounds({
    historicalRounds: rounds.slice(0, 2), targetCourseId: "synthetic-course", targetPar: 72,
  }), { status: "insufficient_data", historicalRounds: 2 });
  assert.deepEqual(simulateSgGrossRounds({
    historicalRounds: rounds, targetCourseId: "another-course", targetPar: 72,
  }), { status: "missing_course_calibration", historicalRounds: 13 });
  assert.equal(simulateSgGrossRounds({
    historicalRounds: [{ ...rounds[0], sgVersion: "other" }, ...rounds.slice(1)],
    targetCourseId: "synthetic-course", targetPar: 72,
  }).status, "inconsistent_data");
});

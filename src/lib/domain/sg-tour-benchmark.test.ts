import assert from "node:assert/strict";
import { test } from "node:test";
import { SG_BASELINE_VERSION } from "./sg-baseline-seed";
import { assessTourRoundBenchmark } from "./sg-tour-benchmark";

const base = {
  playerSg: 0.4,
  playerBaselineVersion: SG_BASELINE_VERSION,
  licenseAllowsPlayerDisplay: true,
  playerToFieldOffset: -0.3,
};

test("DP World Tour uten kategori-SG gir ingen falsk topp 20-påstand", () => {
  const result = assessTourRoundBenchmark({
    ...base, coverage: { totalGrossRounds: 40323, categoryRounds: 0, atOrBelowPlayer: null },
  });
  assert.deepEqual(result, { status: "missing_reference", sampleSize: 0 });
});

test("lisens, måleskala og datadekning må være på plass før prosentil", () => {
  const coverage = { totalGrossRounds: 1000, categoryRounds: 900, atOrBelowPlayer: 738 };
  assert.equal(assessTourRoundBenchmark({ ...base, coverage, licenseAllowsPlayerDisplay: false }).status, "restricted");
  assert.equal(assessTourRoundBenchmark({ ...base, coverage, playerToFieldOffset: undefined }).status, "uncalibrated_scale");
  assert.equal(assessTourRoundBenchmark({ ...base, coverage, playerBaselineVersion: "other" }).status, "wrong_sg_version");
  assert.equal(assessTourRoundBenchmark({ ...base, coverage: { ...coverage, categoryRounds: 50 } }).status, "missing_reference");
  assert.deepEqual(assessTourRoundBenchmark({ ...base, coverage }), {
    status: "ready", sampleSize: 900, percentile: 82, top20Percent: true,
  });
});

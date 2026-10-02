import assert from "node:assert/strict";
import { test } from "node:test";
import { generateSgBaselineSeed, SG_BASELINE_VERSION } from "./sg-baseline-seed";
import { calculateShotSG } from "./shot-sg";
import { beregnSgPerSlag, interpolerForventedeSlag, type SgShot } from "./sg";
import { mapExistingBaselines, type ExistingExpectedRow } from "./sg-reference-import";

function rows(): ExistingExpectedRow[] {
  return generateSgBaselineSeed().map((row, index) => ({
    id: `synthetic-${index}`, baselineKind: "expected_to_hole",
    baselineVersion: SG_BASELINE_VERSION, lieType: row.lieType,
    distanceMeters: row.distanceMeters, expectedStrokesToHole: row.expectedStrokes,
    sourceReference: row.sourceReference, quality: row.quality,
    isSupported: row.isSupported,
  }));
}

test("importen krever alle 321 kildepunkter med samme verdier og kvalitet", () => {
  assert.throws(() => mapExistingBaselines(rows().slice(1)), /ufullstendig/);
  const changed = rows();
  changed[10].expectedStrokesToHole = 99;
  assert.throws(() => mapExistingBaselines(changed), /avviker/);
});

test("importen bruker dokumenterte lies og ekskluderer usikre avstander", () => {
  const points = mapExistingBaselines(rows());
  assert.equal(points.length, 333);
  assert.ok(points.every((point) => point.sourceQuality === "published" || point.sourceQuality === "interpolated"));
  assert.ok(points.every((point) => !["TREES", "SEMI_ROUGH", "DEEP_ROUGH"].includes(point.lie)));
  assert.equal(interpolerForventedeSlag(points, { phase: "OTT", lie: "TEE", teePar: 4, distanceM: 85 }), null);
  assert.equal(interpolerForventedeSlag(points, { phase: "PUTT", lie: "GREEN", teePar: 0, distanceM: 20 }), null);
  assert.equal(interpolerForventedeSlag(points, { phase: "APP", lie: "SEMI_ROUGH", teePar: 0, distanceM: 150 }), null);
  assert.equal(interpolerForventedeSlag(points, { phase: "PUTT", lie: "GREEN", teePar: 0, distanceM: 0.1 }), 1);
});

test("V1-SG stemmer med kildekalkulatoren når begge har dokumentert dekning", () => {
  const points = mapExistingBaselines(rows());
  const shot: SgShot = {
    category: "OTT", startLie: "TEE", startDistanceM: 350,
    endLie: "FAIRWAY", endDistanceM: 150, holed: false,
    penaltyStrokes: 1, teePar: 4,
  };
  const actual = beregnSgPerSlag(shot, points);
  const source = calculateShotSG(350, "Tee", 150, "Fairway", 1);
  assert.ok(actual != null && Math.abs(actual - source) < 1e-10);
});

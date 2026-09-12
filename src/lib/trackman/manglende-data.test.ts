/**
 * G06/G08: manglende TrackMan-felt og ukjent enhet blir null, aldri gjettet.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { csvShotsToCanonical, distanceToMeters, speedToMph } from "./canonical";
import type { TrackManShot } from "./parse-csv";

function slag(overstyr: Partial<TrackManShot> = {}): TrackManShot {
  return {
    club: "7 Iron",
    clubSpeedMps: null,
    ballSpeedMps: null,
    smashFactor: null,
    carryMeters: null,
    totalMeters: null,
    launchAngleDeg: null,
    spinRateRpm: null,
    sideMeters: null,
    notes: null,
    ...overstyr,
  };
}

test("ukjent enhet gir null, ikke et gjettet tall", () => {
  assert.equal(speedToMph(90, "unknown"), null);
  assert.equal(distanceToMeters(250, "unknown"), null);
});

test("manglende felt forblir null gjennom kanonisk mapping", () => {
  const [out] = csvShotsToCanonical([slag()]);
  assert.equal(out?.clubSpeedMph, null);
  assert.equal(out?.ballSpeedMph, null);
  assert.equal(out?.carryMeters, null);
  assert.equal(out?.totalMeters, null);
  assert.equal(out?.smashFactor, null);
});

test("eksplisitt yards og mph brukes, uten å fylle inn tomme felt", () => {
  const [out] = csvShotsToCanonical([
    slag({
      clubSpeedMps: 90,
      carryMeters: 250,
      sourceUnits: {
        clubSpeed: "mph",
        ballSpeed: "unknown",
        carry: "yd",
        total: "unknown",
        side: "unknown",
      },
    }),
  ]);
  assert.equal(out?.clubSpeedMph, 90);
  assert.equal(out?.ballSpeedMph, null);
  assert.ok(out?.carryMeters != null && out.carryMeters < 250);
  assert.equal(out?.totalMeters, null);
});

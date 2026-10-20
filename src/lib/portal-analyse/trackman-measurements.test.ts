import assert from "node:assert/strict";
import { test } from "node:test";
import { beregnTrackManKoller, type TrackManMeasurement } from "./trackman-measurements";
const shot = (values: Partial<TrackManMeasurement> = {}): TrackManMeasurement => ({
  club: "7i", side: null, carryDistance: null, clubSpeed: null, ballSpeed: null, smashFactor: null,
  launchAngle: null, clubPath: null, faceToPath: null, spinRate: null, ...values,
});
test("manglende data gir tomt grunnlag, ingen eksempelklubber eller gapping", () => {
  assert.deepEqual(beregnTrackManKoller([]), { shots: {}, clubStats: {}, gapping: [] });
});
test("umålte parametre er null og målte nullverdier bevares som 0", () => {
  const d = beregnTrackManKoller([shot({ carryDistance: 140, side: 0, clubPath: 0 })]);
  assert.equal(d.clubStats["7i"].clubPath, 0); assert.equal(d.clubStats["7i"].clubSpeed, null);
  assert.equal(d.clubStats["7i"].spinRate, null); assert.deepEqual(d.shots["7i"], [[0, 140]]);
});
test("snitt bruker bare målte verdier i riktig kølle", () => {
  const d = beregnTrackManKoller([shot({ clubSpeed: 90, carryDistance: 140 }), shot({ clubSpeed: null, carryDistance: 150 }), shot({ club: "Driver", clubSpeed: 110, carryDistance: 240 })]);
  assert.equal(d.clubStats["7i"].clubSpeed, 90); assert.equal(d.clubStats["7i"].carry, 145);
  assert.equal(d.clubStats.Driver.clubSpeed, 110); assert.equal(d.gapping.length, 2);
});
test("et slag uten sideverdi blir ikke et konstruert spredningspunkt", () => {
  const d = beregnTrackManKoller([shot({ carryDistance: 140 })]);
  assert.deepEqual(d.shots["7i"], []); assert.equal(d.clubStats["7i"].carry, 140);
});

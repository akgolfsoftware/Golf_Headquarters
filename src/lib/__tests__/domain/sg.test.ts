import test from "node:test";
import assert from "node:assert/strict";
import {
  beregnSg, beregnShotSg, beregnTrueRoundSg, formaterSg,
  interpolerForventedeSlag, kategoriForPosisjon, type SgShot,
} from "../../domain/sg";
import { SG_TEST_POINTS } from "../fixtures/sg-points";

test("lineær interpolasjon bruker kun riktig fase, lie og tee-par", () => {
  const value = interpolerForventedeSlag(SG_TEST_POINTS, {
    phase: "APP", lie: "FAIRWAY", teePar: 0, distanceM: 75,
  });
  assert.equal(value, 2.45);
  assert.equal(interpolerForventedeSlag(SG_TEST_POINTS, {
    phase: "OTT", lie: "TEE", teePar: 4, distanceM: 75,
  }), 2.875);
  assert.equal(interpolerForventedeSlag(SG_TEST_POINTS, {
    phase: "OTT", lie: "TEE", teePar: 6, distanceM: 75,
  }), null);
});

test("ingen ekstrapolasjon eller lån fra en annen underlagskurve", () => {
  assert.equal(interpolerForventedeSlag(SG_TEST_POINTS, {
    phase: "PUTT", lie: "GREEN", teePar: 0, distanceM: 501,
  }), null);
  assert.equal(interpolerForventedeSlag(SG_TEST_POINTS, {
    phase: "ARG", lie: "WATER", teePar: 0, distanceM: 5,
  }), null);
});

test("slag-SG = forventet start minus forventet slutt minus slag og straff", () => {
  const shot: SgShot = {
    category: "OTT", startLie: "TEE", startDistanceM: 350,
    endLie: "FAIRWAY", endDistanceM: 100, holed: false,
    penaltyStrokes: 1, teePar: 4,
  };
  const result = beregnShotSg(shot, SG_TEST_POINTS);
  assert.ok(result);
  assert.equal(result.expectedStart, 4.25);
  assert.equal(result.expectedEnd, 2.6);
  assert.ok(Math.abs(result.sgValue - (-0.35)) < 1e-10);
  assert.ok(Math.abs((beregnShotSg({ ...shot, penaltyStrokes: 0 }, SG_TEST_POINTS)?.sgValue ?? NaN) - 0.65) < 1e-10);
});

test("hole-out setter forventet slutt til null; ufullstendig slag gir ingen SG", () => {
  const putt: SgShot = {
    category: "PUTT", startLie: "GREEN", startDistanceM: 3,
    endLie: null, endDistanceM: 0, holed: true, penaltyStrokes: 0, teePar: 4,
  };
  assert.ok(Math.abs((beregnShotSg(putt, SG_TEST_POINTS)?.sgValue ?? NaN) - 0.6) < 1e-10);
  assert.equal(beregnShotSg({ ...putt, holed: false }, SG_TEST_POINTS), null);
  assert.equal(beregnShotSg({ ...putt, penaltyStrokes: 3 }, SG_TEST_POINTS), null);
});

test("hele runden summerer uavrundede slag i riktig fase", () => {
  const shots: SgShot[] = [
    { category: "OTT", startLie: "TEE", startDistanceM: 350, endLie: "FAIRWAY", endDistanceM: 100, holed: false, penaltyStrokes: 0, teePar: 4 },
    { category: "APP", startLie: "FAIRWAY", startDistanceM: 100, endLie: "GREEN", endDistanceM: 3, holed: false, penaltyStrokes: 0, teePar: 4 },
    { category: "PUTT", startLie: "GREEN", startDistanceM: 3, endLie: null, endDistanceM: 0, holed: true, penaltyStrokes: 0, teePar: 4 },
  ];
  const result = beregnSg(shots, SG_TEST_POINTS);
  assert.ok(result);
  assert.ok(Math.abs(result.total - 1.25) < 1e-10);
  assert.equal(result.arg, 0);
  assert.equal(beregnSg(shots, []), null);
  assert.equal(beregnSg([], SG_TEST_POINTS), null);
});

test("kategori følger startposisjonen; OTT bare tee par 4/5", () => {
  assert.equal(kategoriForPosisjon("TEE", 140, 3), "APP");
  assert.equal(kategoriForPosisjon("TEE", 350, 4), "OTT");
  assert.equal(kategoriForPosisjon("FAIRWAY", 220, 4), "APP");
  assert.equal(kategoriForPosisjon("BUNKER", 20, 4), "ARG");
  assert.equal(kategoriForPosisjon("GREEN", 5, 4), "PUTT");
});

test("True SG bruker avtalt Course Rating-formel kun for 18 hull", () => {
  assert.equal(beregnTrueRoundSg(2, 74, 18), -0.5);
  assert.equal(beregnTrueRoundSg(2, 74), -0.5);
  assert.equal(beregnTrueRoundSg(2, 76.5, 18), 2);
  assert.equal(beregnTrueRoundSg(2, 74, 9), null);
  assert.equal(beregnTrueRoundSg(2, null, 18), null);
});

test("norsk SG-format beholder fortegn", () => {
  assert.equal(formaterSg(1.234), "+1,2");
  assert.equal(formaterSg(-0.78), "−0,8");
  assert.equal(formaterSg(0), "0,0");
});

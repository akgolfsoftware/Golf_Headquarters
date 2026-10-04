import test from "node:test";
import assert from "node:assert/strict";
import { beregnSg } from "../../domain/sg";
import { hullTilSgShots, rundeTilSgShots, startKategori } from "../../runde-logg/til-sg-shots";
import { deriverHullScore, deriverRundeScore } from "../../runde-logg/deriver-hullscore";
import { beregnGranulaerSg } from "../../runde-logg/granulaer-sg";
import { SG_TEST_POINTS } from "../fixtures/sg-points";
import type { LoggetHull } from "../../runde-logg/types";

const PAR4_BIRDIE: LoggetHull = {
  holeNumber: 1, par: 4, lengdeMeter: 350,
  slag: [
    { resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: 100 } },
    { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 3 } },
    { resultat: { iHull: true } },
  ],
};

test("par 4 og par 5 starter OTT, par 3 APP", () => {
  assert.equal(startKategori(4), "OTT");
  assert.equal(startKategori(5), "OTT");
  assert.equal(startKategori(3), "APP");
});

test("slagkjeden beholder faktisk start- og sluttlie", () => {
  const shots = hullTilSgShots(PAR4_BIRDIE);
  assert.equal(shots.length, 3);
  assert.deepEqual(shots.map((s) => [s.category, s.startLie, s.startDistanceM, s.endLie, s.endDistanceM]), [
    ["OTT", "TEE", 350, "FAIRWAY", 100],
    ["APP", "FAIRWAY", 100, "GREEN", 3],
    ["PUTT", "GREEN", 3, null, 0],
  ]);
  assert.equal(beregnSg(shots, SG_TEST_POINTS)?.total, 1.25);
});

test("ett fysisk slag med straff gir nøyaktig ett ekstra tapt slag", () => {
  const withPenalty: LoggetHull = { ...PAR4_BIRDIE,
    slag: [{ ...PAR4_BIRDIE.slag[0], straffe: true }, ...PAR4_BIRDIE.slag.slice(1)] };
  const shots = hullTilSgShots(withPenalty);
  assert.equal(shots.length, 3);
  assert.equal(shots[0].penaltyStrokes, 1);
  assert.ok(Math.abs((beregnSg(shots, SG_TEST_POINTS)?.total ?? NaN) - 0.25) < 1e-10);
  assert.equal(deriverHullScore(withPenalty).strokes, 4);
});

test("slag etter hole-out og hull uten hole-out avvises", () => {
  assert.throws(() => hullTilSgShots({ ...PAR4_BIRDIE,
    slag: [...PAR4_BIRDIE.slag, { resultat: { iHull: true } }] }), /etter ball i hull/);
  assert.throws(() => hullTilSgShots({ ...PAR4_BIRDIE,
    slag: PAR4_BIRDIE.slag.slice(0, 2) }), /ikke i hull/);
});

test("brutto score, putter, fairway og GIR avledes fra slagene", () => {
  const score = deriverHullScore(PAR4_BIRDIE);
  assert.deepEqual([score.strokes, score.putts, score.fairway, score.gir], [3, 1, true, true]);
  const par3: LoggetHull = { holeNumber: 2, par: 3, lengdeMeter: 150,
    slag: [{ resultat: { iHull: false, lie: "GREEN", avstandTilHull: 3 } }, { resultat: { iHull: true } }] };
  assert.equal(deriverHullScore(par3).fairway, null);
  assert.equal(deriverRundeScore([PAR4_BIRDIE, par3]).totalScore, 5);
});

test("rapportbøtter summerer beregnet SG uten syntetiske strafferader", () => {
  const shots = rundeTilSgShots([PAR4_BIRDIE]);
  const gran = beregnGranulaerSg([PAR4_BIRDIE], shots, SG_TEST_POINTS);
  assert.ok(gran);
  const total = Object.values(gran).reduce<number>((sum, value) => sum + (value ?? 0), 0);
  assert.ok(Math.abs(total - (beregnSg(shots, SG_TEST_POINTS)?.total ?? NaN)) < 0.02);
  assert.equal(gran.sgTee, 0.65);
  assert.equal(gran.sgPutt5_10, 0.6);
});

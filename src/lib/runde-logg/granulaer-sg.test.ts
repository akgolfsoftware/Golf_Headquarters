/**
 * SG-FASIT-TEST — håndregnet 3-hulls runde mot benchmark-tabellene i
 * src/lib/domain/sg.ts (verdiene i kommentarene ER regnestykkene; endres
 * tabellene, skal denne testen feile og fasiten regnes på nytt).
 *
 * Runden:
 *  Hull 1 · par 4 · 310 m — drive i vann (straffe), redning til green, to putter (score 5)
 *  Hull 2 · par 3 · 150 m — tee i bunker, bunker-save til 1 m, én putt (score 3)
 *  Hull 3 · par 5 · 480 m — fairway×2, innspill, TRE putter (score 6)
 *
 * Benchmark-oppslag brukt (fra sg.ts):
 *  OTT: 310→3,9 · 480→4,7 · 220→3,36    APP: 120→2,9 · 150→2,99 · 90→2,79
 *  ARG: 8→2,36                            PUTT: 4→1,78 · 0,8→1,04 · 1,0→1,13 ·
 *                                               12→2,06 · 2,0→1,42 · 0,7→1,04
 *
 * Per-slag-SG (forventet_start − forventet_etter − 1; hole-out: −1 utelates etter):
 *  H1: tee 3,9−2,9−1=0,00 · straffe 3,9−3,9−1=−1,00 · innspill 2,9−1,78−1=0,12
 *      putt4m 1,78−1,04−1=−0,26 · putt0,8 1,04−1=0,04                  (hull: −1,10)
 *  H2: tee(APP par3) 2,99−2,36−1=−0,37 · bunker 2,36−1,13−1=0,23
 *      putt1,0 1,13−1=0,13                                              (hull: −0,01)
 *  H3: tee 4,7−3,36−1=0,34 · OTT2 3,36−2,79−1=−0,43 · innspill 2,79−2,06−1=−0,27
 *      putt12 2,06−1,42−1=−0,36 · putt2,0 1,42−1,04−1=−0,62 · putt0,7 1,04−1=0,04 (hull: −1,30)
 *
 * Kategorier: OTT 0−1+0,34−0,43=−1,09 · APP 0,12−0,37−0,27=−0,52 ·
 *             ARG 0,23 · PUTT −0,26+0,04+0,13−0,36−0,62+0,04=−1,03 · TOTAL −2,41
 * Buckets:    sgTee 0−1−0,37+0,34=−1,03 · sgApp100 0,12−0,27=−0,15 · sgBunker 0,23 ·
 *             sgPutt10_15 −0,26 (4 m=13,1 ft) · sgPutt0_3 0,04+0,04=0,08 ·
 *             sgPutt3_5 0,13 · sgPutt25_40 −0,36 (12 m=39,4 ft) · sgPutt5_10 −0,62 (2 m=6,6 ft)
 *             OTT-slag nr. 2 på hull 3 (−0,43) har BEVISST ingen bucket (velgBucket → null).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { beregnSg } from "@/lib/domain/sg";
import { rundeTilSgShots } from "@/lib/runde-logg/til-sg-shots";
import { beregnGranulaerSg } from "@/lib/runde-logg/granulaer-sg";
import { deriverRundeScore } from "@/lib/runde-logg/deriver-hullscore";
import {
  beregnSgFraShots,
  beregnGranulaerSgFraShots,
  type DbShotRad,
} from "@/lib/runde-logg/shots-til-sg";
import type { LoggetHull } from "@/lib/runde-logg/types";

const naer = (faktisk: number | null, forventet: number, felt: string) => {
  assert.ok(faktisk !== null, `${felt}: forventet ${forventet}, fikk null`);
  assert.ok(
    Math.abs(faktisk - forventet) < 0.005,
    `${felt}: forventet ${forventet}, fikk ${faktisk}`,
  );
};

/* Logg-representasjonen (posisjonskjedet) */
const HULL: LoggetHull[] = [
  {
    holeNumber: 1,
    par: 4,
    lengdeMeter: 310,
    slag: [
      { resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: 120 }, straffe: true },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 4 } },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 0.8 } },
      { resultat: { iHull: true } },
    ],
  },
  {
    holeNumber: 2,
    par: 3,
    lengdeMeter: 150,
    slag: [
      { resultat: { iHull: false, lie: "BUNKER", avstandTilHull: 8 } },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 1.0 } },
      { resultat: { iHull: true } },
    ],
  },
  {
    holeNumber: 3,
    par: 5,
    lengdeMeter: 480,
    slag: [
      { resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: 220 } },
      { resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: 90 } },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 12 } },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 2.0 } },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 0.7 } },
      { resultat: { iHull: true } },
    ],
  },
];

/* DB-representasjonen av SAMME runde (lie = spilt fra, distanceToPin = start) */
const DB_SHOTS: DbShotRad[] = [
  { holeNumber: 1, holePar: 4, shotNumber: 1, lie: "TEE", distanceToPin: 310, isPenalty: true },
  { holeNumber: 1, holePar: 4, shotNumber: 2, lie: "FAIRWAY", distanceToPin: 120, isPenalty: false },
  { holeNumber: 1, holePar: 4, shotNumber: 3, lie: "GREEN", distanceToPin: 4, isPenalty: false },
  { holeNumber: 1, holePar: 4, shotNumber: 4, lie: "GREEN", distanceToPin: 0.8, isPenalty: false },
  { holeNumber: 2, holePar: 3, shotNumber: 1, lie: "TEE", distanceToPin: 150, isPenalty: false },
  { holeNumber: 2, holePar: 3, shotNumber: 2, lie: "BUNKER", distanceToPin: 8, isPenalty: false },
  { holeNumber: 2, holePar: 3, shotNumber: 3, lie: "GREEN", distanceToPin: 1.0, isPenalty: false },
  { holeNumber: 3, holePar: 5, shotNumber: 1, lie: "TEE", distanceToPin: 480, isPenalty: false },
  { holeNumber: 3, holePar: 5, shotNumber: 2, lie: "FAIRWAY", distanceToPin: 220, isPenalty: false },
  { holeNumber: 3, holePar: 5, shotNumber: 3, lie: "FAIRWAY", distanceToPin: 90, isPenalty: false },
  { holeNumber: 3, holePar: 5, shotNumber: 4, lie: "GREEN", distanceToPin: 12, isPenalty: false },
  { holeNumber: 3, holePar: 5, shotNumber: 5, lie: "GREEN", distanceToPin: 2.0, isPenalty: false },
  { holeNumber: 3, holePar: 5, shotNumber: 6, lie: "GREEN", distanceToPin: 0.7, isPenalty: false },
];
const DB_SCORES = [
  { holeNumber: 1, strokes: 5 }, // 4 slag + 1 straffe
  { holeNumber: 2, strokes: 3 },
  { holeNumber: 3, strokes: 6 },
];

describe("SG-fasit: håndregnet 3-hulls runde", () => {
  it("logg-representasjonen gir fasit-kategoriene", () => {
    const sg = beregnSg(rundeTilSgShots(HULL));
    naer(sg.ott, -1.09, "ott");
    naer(sg.app, -0.52, "app");
    naer(sg.arg, 0.23, "arg");
    naer(sg.putt, -1.03, "putt");
    naer(sg.total, -2.41, "total");
  });

  it("logg-representasjonen gir fasit-bucketene", () => {
    const g = beregnGranulaerSg(HULL, rundeTilSgShots(HULL));
    naer(g.sgTee, -1.03, "sgTee");
    naer(g.sgApp100, -0.15, "sgApp100");
    naer(g.sgBunker, 0.23, "sgBunker");
    naer(g.sgPutt10_15, -0.26, "sgPutt10_15");
    naer(g.sgPutt0_3, 0.08, "sgPutt0_3");
    naer(g.sgPutt3_5, 0.13, "sgPutt3_5");
    naer(g.sgPutt25_40, -0.36, "sgPutt25_40");
    naer(g.sgPutt5_10, -0.62, "sgPutt5_10");
    // Ingen slag i disse bucketsene — og OTT-slag nr. 2 (h3) har bevisst ingen bucket:
    for (const k of ["sgApp200", "sgApp150", "sgApp50", "sgChip", "sgPitch", "sgPutt15_25", "sgPutt40plus"] as const) {
      assert.equal(g[k], null, `${k} skal være null`);
    }
  });

  it("scorekortet deriveres riktig (strokes = slag + straffer, putter, fairway, gir)", () => {
    const { hullScores, totalScore } = deriverRundeScore(HULL);
    assert.equal(totalScore, 14);
    assert.deepEqual(
      hullScores.map((h) => ({ n: h.holeNumber, s: h.strokes, p: h.putts })),
      [
        { n: 1, s: 5, p: 2 },
        { n: 2, s: 3, p: 1 },
        { n: 3, s: 6, p: 3 },
      ],
    );
  });

  it("RUNDTUR-INVARIANT: DB-representasjonen gir identiske tall", () => {
    const sg = beregnSgFraShots(DB_SHOTS, DB_SCORES);
    assert.ok(sg, "kjeden skal være komplett");
    naer(sg.ott, -1.09, "db ott");
    naer(sg.app, -0.52, "db app");
    naer(sg.arg, 0.23, "db arg");
    naer(sg.putt, -1.03, "db putt");
    naer(sg.total, -2.41, "db total");

    const g = beregnGranulaerSgFraShots(DB_SHOTS, DB_SCORES);
    assert.ok(g, "granulær kjede skal være komplett");
    naer(g.sgTee, -1.03, "db sgTee");
    naer(g.sgApp100, -0.15, "db sgApp100");
    naer(g.sgBunker, 0.23, "db sgBunker");
    naer(g.sgPutt10_15, -0.26, "db sgPutt10_15");
    naer(g.sgPutt0_3, 0.08, "db sgPutt0_3");
    naer(g.sgPutt3_5, 0.13, "db sgPutt3_5");
    naer(g.sgPutt25_40, -0.36, "db sgPutt25_40");
    naer(g.sgPutt5_10, -0.62, "db sgPutt5_10");
  });

  it("granulær DB-beregning er ærlig: ufullstendig kjede → null", () => {
    // 17 av 18 «hull»: fjern hull 3 sitt scorekort → hele runden avvises.
    assert.equal(beregnGranulaerSgFraShots(DB_SHOTS, DB_SCORES.slice(0, 2)), null);
    // Manglende avstand på ett slag → null.
    const utenAvstand = DB_SHOTS.map((s, i) => (i === 2 ? { ...s, distanceToPin: null } : s));
    assert.equal(beregnGranulaerSgFraShots(utenAvstand, DB_SCORES), null);
  });
});

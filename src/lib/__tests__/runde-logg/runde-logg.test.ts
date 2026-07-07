/**
 * Tester for runde-logg-domenet: posisjonskjede → SgShot-mapping,
 * hullscore-avledning og granulære SG-buckets.
 *
 * Kjøres med:
 *   npx tsx --test src/lib/__tests__/runde-logg/runde-logg.test.ts
 *
 * Håndregnede fasit-verdier mot benchmark-tabellene i src/lib/domain/sg.ts
 * (Broadie PGA Top 40 + Team Norway IUP Ref-ark).
 */

import test from "node:test";
import assert from "node:assert/strict";

import { beregnSg } from "../../domain/sg";
import {
  hullTilSgShots,
  rundeTilSgShots,
  startKategori,
  lieTilOutcome,
} from "../../runde-logg/til-sg-shots";
import { deriverHullScore, deriverRundeScore } from "../../runde-logg/deriver-hullscore";
import { beregnGranulaerSg } from "../../runde-logg/granulaer-sg";
import type { LoggetHull } from "../../runde-logg/types";

// ---------------------------------------------------------------------------
// Hjelpere
// ---------------------------------------------------------------------------

/** Par 4, 350 m: drive til fairway 100 m, innspill til green 3 m, putt i hull. */
const PAR4_BIRDIE: LoggetHull = {
  holeNumber: 1,
  par: 4,
  lengdeMeter: 350,
  slag: [
    { resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: 100 } },
    { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 3 } },
    { resultat: { iHull: true } },
  ],
};

// ---------------------------------------------------------------------------
// startKategori + lieTilOutcome
// ---------------------------------------------------------------------------

test("startKategori: par 4/5 → OTT, par 3 → APP", () => {
  assert.equal(startKategori(4), "OTT");
  assert.equal(startKategori(5), "OTT");
  assert.equal(startKategori(3), "APP");
});

test("lieTilOutcome mapper alle hvileposisjoner", () => {
  assert.equal(lieTilOutcome("FAIRWAY"), "FAIRWAY");
  assert.equal(lieTilOutcome("GREEN"), "GREEN");
  assert.equal(lieTilOutcome("BUNKER"), "SAND");
  assert.equal(lieTilOutcome("TREES"), "RECOVERY");
  assert.equal(lieTilOutcome("SEMI_ROUGH"), "ROUGH");
  assert.equal(lieTilOutcome("ROUGH"), "ROUGH");
  assert.equal(lieTilOutcome("DEEP_ROUGH"), "ROUGH");
});

// ---------------------------------------------------------------------------
// hullTilSgShots — kjeding
// ---------------------------------------------------------------------------

test("par 4-birdie kjeder posisjonene riktig", () => {
  const shots = hullTilSgShots(PAR4_BIRDIE);
  assert.equal(shots.length, 3);

  // Drive: OTT fra 350, ender 100
  assert.deepEqual(
    { c: shots[0].category, d: shots[0].distance, o: shots[0].outcome, a: shots[0].distanceAfter },
    { c: "OTT", d: 350, o: "FAIRWAY", a: 100 },
  );
  // Innspill: APP fra 100 (≤180), ender green 3 m
  assert.deepEqual(
    { c: shots[1].category, d: shots[1].distance, o: shots[1].outcome, a: shots[1].distanceAfter },
    { c: "APP", d: 100, o: "GREEN", a: 3 },
  );
  // Putt: PUTT fra 3 (green → PUTT), holed
  assert.equal(shots[2].category, "PUTT");
  assert.equal(shots[2].outcome, "HOLED");
});

test("SG for par 4-birdie matcher håndregning", () => {
  // Håndregnet mot benchmark-tabellene (gruppegrenser er inklusive oppover):
  //  Drive:    E(OTT,350)=4.06 (gruppe ≤380) − E(APP,100)=2.85 − 1 = +0.21
  //  Innspill: E(APP,100)=2.85 − E(PUTT,3)=1.61  − 1 = +0.24
  //  Putt:     E(PUTT,3)=1.61  − 1               = +0.61
  const res = beregnSg(hullTilSgShots(PAR4_BIRDIE));
  assert.equal(res.ott, 0.21);
  assert.equal(res.app, 0.24);
  assert.equal(res.putt, 0.61);
  assert.equal(res.arg, 0);
  assert.equal(res.total, 1.06); // 3 slag på par 4 mot forventet 4.06
});

test("slag etter hole-out kaster", () => {
  const ugyldig: LoggetHull = {
    ...PAR4_BIRDIE,
    slag: [...PAR4_BIRDIE.slag, { resultat: { iHull: true } }],
  };
  assert.throws(() => hullTilSgShots(ugyldig), /etter at ballen er i hull/);
});

test("hull uten hole-out kaster", () => {
  const ugyldig: LoggetHull = {
    ...PAR4_BIRDIE,
    slag: PAR4_BIRDIE.slag.slice(0, 2),
  };
  assert.throws(() => hullTilSgShots(ugyldig), /ikke «i hull»/);
});

test("straffeslag gir nøyaktig −1 ekstra i slagets kategori", () => {
  // Par 4: drive i vann (straffe), drop fairway 150 m, innspill green 5 m, 2 putt.
  const hull: LoggetHull = {
    holeNumber: 2,
    par: 4,
    lengdeMeter: 350,
    slag: [
      { resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: 150 }, straffe: true },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 5 } },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 1 } },
      { resultat: { iHull: true } },
    ],
  };
  const utenStraffe: LoggetHull = {
    ...hull,
    slag: hull.slag.map((s) => ({ ...s, straffe: false })),
  };
  const med = beregnSg(hullTilSgShots(hull));
  const uten = beregnSg(hullTilSgShots(utenStraffe));
  assert.equal(med.ott, Math.round((uten.ott - 1) * 100) / 100);
  assert.equal(med.app, uten.app);
  assert.equal(med.putt, uten.putt);
});

test("straffe på green (4-putt-scenario med penalty) holder PUTT-kategorien", () => {
  const hull: LoggetHull = {
    holeNumber: 3,
    par: 3,
    lengdeMeter: 140,
    slag: [
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 4 } },
      // flyttet ball / straffe på green — sjeldent, men skal være eksakt −1
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 4 }, straffe: true },
      { resultat: { iHull: true } },
    ],
  };
  const shots = hullTilSgShots(hull);
  const straffeRad = shots.find((s) => s.erStraffeRad);
  assert.ok(straffeRad);
  assert.equal(straffeRad.category, "PUTT");
});

// ---------------------------------------------------------------------------
// deriverHullScore
// ---------------------------------------------------------------------------

test("par 4-birdie: strokes 3, 1 putt, fairway, GIR", () => {
  const hs = deriverHullScore(PAR4_BIRDIE);
  assert.equal(hs.strokes, 3);
  assert.equal(hs.putts, 1);
  assert.equal(hs.fairway, true);
  assert.equal(hs.gir, true);
});

test("par 3: fairway er null", () => {
  const hull: LoggetHull = {
    holeNumber: 4,
    par: 3,
    lengdeMeter: 150,
    slag: [
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 6 } },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 1 } },
      { resultat: { iHull: true } },
    ],
  };
  const hs = deriverHullScore(hull);
  assert.equal(hs.fairway, null);
  assert.equal(hs.strokes, 3);
  assert.equal(hs.putts, 2);
  assert.equal(hs.gir, true); // på green etter 1 slag ≤ par−2
});

test("straffe teller i strokes og ødelegger GIR", () => {
  const hull: LoggetHull = {
    holeNumber: 5,
    par: 4,
    lengdeMeter: 300,
    slag: [
      { resultat: { iHull: false, lie: "ROUGH", avstandTilHull: 120 }, straffe: true },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 3 } },
      { resultat: { iHull: true } },
    ],
  };
  const hs = deriverHullScore(hull);
  assert.equal(hs.strokes, 4); // 3 slag + 1 straffe
  assert.equal(hs.fairway, false);
  assert.equal(hs.gir, false); // på green etter 3 forbrukte (straffen teller), par−2=2
  assert.equal(hs.putts, 1);
});

test("hole-out fra utenfor green: 0 putts, GIR hvis tidlig nok", () => {
  const hull: LoggetHull = {
    holeNumber: 6,
    par: 4,
    lengdeMeter: 280,
    slag: [
      { resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: 60 } },
      { resultat: { iHull: true } }, // holet innspill
    ],
  };
  const hs = deriverHullScore(hull);
  assert.equal(hs.strokes, 2);
  assert.equal(hs.putts, 0);
  assert.equal(hs.gir, true); // i hull på slag 2 = par−2
});

test("deriverRundeScore summerer", () => {
  const { totalScore, hullScores } = deriverRundeScore([PAR4_BIRDIE, PAR4_BIRDIE]);
  assert.equal(totalScore, 6);
  assert.equal(hullScores.length, 2);
});

// ---------------------------------------------------------------------------
// beregnGranulaerSg
// ---------------------------------------------------------------------------

test("buckets: tee, app100, putt-fot-bucket — og summen matcher kategoritotalene", () => {
  const shots = rundeTilSgShots([PAR4_BIRDIE]);
  const g = beregnGranulaerSg([PAR4_BIRDIE], shots);

  assert.equal(g.sgTee, 0.21); // drive (E(OTT,350)=4.06-gruppen)
  assert.equal(g.sgApp100, 0.24); // innspill fra 100 m
  // Putt fra 3 m = 9.8 fot → bucket 5–10 fot
  assert.equal(g.sgPutt5_10, 0.61);
  assert.equal(g.sgChip, null);
  assert.equal(g.sgBunker, null);
});

test("bunker-slag går i sgBunker, kort ARG i sgChip", () => {
  const hull: LoggetHull = {
    holeNumber: 7,
    par: 4,
    lengdeMeter: 320,
    slag: [
      { resultat: { iHull: false, lie: "BUNKER", avstandTilHull: 20 } },
      { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 2 } }, // fra bunker → sgBunker
      { resultat: { iHull: true } },
    ],
  };
  const shots = rundeTilSgShots([hull]);
  const g = beregnGranulaerSg([hull], shots);
  assert.notEqual(g.sgBunker, null);
  assert.equal(g.sgChip, null);
});

test("granulære buckets summerer til kategoritotalene (uavrundet konsistens)", () => {
  const runde = [PAR4_BIRDIE];
  const shots = rundeTilSgShots(runde);
  const g = beregnGranulaerSg(runde, shots);
  const totals = beregnSg(shots);

  const bucketSum = [
    g.sgTee, g.sgApp200, g.sgApp150, g.sgApp100, g.sgApp50,
    g.sgChip, g.sgPitch, g.sgBunker,
    g.sgPutt0_3, g.sgPutt3_5, g.sgPutt5_10, g.sgPutt10_15,
    g.sgPutt15_25, g.sgPutt25_40, g.sgPutt40plus,
  ].reduce<number>((sum, v) => sum + (v ?? 0), 0);

  assert.ok(Math.abs(bucketSum - totals.total) < 0.02);
});

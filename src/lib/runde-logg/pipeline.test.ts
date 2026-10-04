import test from "node:test";
import assert from "node:assert/strict";
import { SG_TEST_POINTS } from "../__tests__/fixtures/sg-points";
import { beregnSg } from "../domain/sg";
import { byggShotRader } from "./bygg-shot-rader";
import { deriverRundeScore } from "./deriver-hullscore";
import { beregnGranulaerSg } from "./granulaer-sg";
import { beregnGranulaerSgFraShots, beregnSgFraShots } from "./shots-til-sg";
import { rundeTilSgShots } from "./til-sg-shots";
import type { LoggetHull } from "./types";

const HULL: LoggetHull = {
  holeNumber: 1, par: 4, lengdeMeter: 350,
  slag: [
    { resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: 100 } },
    { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 3 } },
    { resultat: { iHull: true } },
  ],
};

test("live-kjede og lagrede Shot-rader gir samme SG og rapportfordeling", () => {
  const liveShots = rundeTilSgShots([HULL]);
  const direkte = beregnSg(liveShots, SG_TEST_POINTS);
  const direkteGran = beregnGranulaerSg([HULL], liveShots, SG_TEST_POINTS);
  const rows = byggShotRader(HULL);
  const score = deriverRundeScore([HULL]).hullScores;
  const lagret = beregnSgFraShots(rows, score, SG_TEST_POINTS);
  const lagretGran = beregnGranulaerSgFraShots(rows, score, SG_TEST_POINTS);
  assert.ok(direkte && direkteGran && lagret && lagretGran);
  assert.equal(lagret.total, direkte.total);
  assert.deepEqual(lagretGran, direkteGran);
});

test("retting av sluttavstand som bryter kjeden avviser SG", () => {
  const rows = byggShotRader(HULL);
  const score = deriverRundeScore([HULL]).hullScores;
  rows[0].endDistanceToPinM = 110;
  assert.equal(beregnSgFraShots(rows, score, SG_TEST_POINTS), null);
});

test("manglende scorekort eller baseline gir ikke oppdiktet SG", () => {
  const rows = byggShotRader(HULL);
  const score = deriverRundeScore([HULL]).hullScores;
  assert.equal(beregnSgFraShots(rows, [], SG_TEST_POINTS), null);
  assert.equal(beregnSgFraShots(rows, score, []), null);
});

test("målt startavstand retter forrige sluttavstand i begge representasjoner", () => {
  const corrected: LoggetHull = { ...HULL,
    slag: [HULL.slag[0], { ...HULL.slag[1], pinAvstand: 105 }, HULL.slag[2]] };
  const live = rundeTilSgShots([corrected]);
  const rows = byggShotRader(corrected);
  assert.equal(live[0].endDistanceM, 105);
  assert.equal(rows[0].endDistanceToPinM, 105);
  assert.equal(rows[1].distanceToPin, 105);
  const score = deriverRundeScore([corrected]).hullScores;
  assert.equal(beregnSgFraShots(rows, score, SG_TEST_POINTS)?.total,
    beregnSg(live, SG_TEST_POINTS)?.total);
});

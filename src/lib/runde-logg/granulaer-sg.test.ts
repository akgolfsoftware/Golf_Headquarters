import test from "node:test";
import assert from "node:assert/strict";
import { SG_TEST_POINTS } from "../__tests__/fixtures/sg-points";
import { beregnSg } from "../domain/sg";
import { beregnGranulaerSg } from "./granulaer-sg";
import { hullTilSgShots } from "./til-sg-shots";
import type { LoggetHull } from "./types";

const HULL: LoggetHull = {
  holeNumber: 1, par: 4, lengdeMeter: 320,
  slag: [
    { resultat: { iHull: false, lie: "BUNKER", avstandTilHull: 20 } },
    { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 2 } },
    { resultat: { iHull: true } },
  ],
};

test("bunker-SG og putting fordeles på rapportfelter uten å endre SG-motoren", () => {
  const shots = hullTilSgShots(HULL);
  const gran = beregnGranulaerSg([HULL], shots, SG_TEST_POINTS);
  assert.ok(gran);
  assert.notEqual(gran.sgBunker, null);
  assert.notEqual(gran.sgPutt5_10, null);
  assert.equal(gran.sgChip, null);
  const total = Object.values(gran).reduce<number>((sum, value) => sum + (value ?? 0), 0);
  assert.ok(Math.abs(total - (beregnSg(shots, SG_TEST_POINTS)?.total ?? NaN)) < 0.02);
});

test("rapporterer ikke tall når referansekurven mangler", () => {
  assert.equal(beregnGranulaerSg([HULL], hullTilSgShots(HULL), []), null);
});

/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/domain/hole-heatmap.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";
import { aggregerHullVarme, MIN_RUNDER, type HoleScoreRad } from "./hole-heatmap";

function hull(roundId: string, holeNumber: number, par: number, strokes: number): HoleScoreRad {
  return { roundId, holeNumber, par, strokes };
}

test("under MIN_RUNDER distinkte runder gir harNokData=false og tom celleliste", () => {
  const rader: HoleScoreRad[] = [
    hull("r1", 1, 4, 5),
    hull("r2", 1, 4, 4),
  ];
  const out = aggregerHullVarme(rader);
  assert.equal(out.harNokData, false);
  assert.equal(out.rundeAntall, 2);
  assert.deepEqual(out.celler, []);
});

test("MIN_RUNDER distinkte runder slår på varmekartet", () => {
  const rader: HoleScoreRad[] = [
    hull("r1", 1, 4, 5),
    hull("r2", 1, 4, 4),
    hull("r3", 1, 4, 6),
  ];
  const out = aggregerHullVarme(rader);
  assert.equal(out.harNokData, true);
  assert.equal(out.rundeAntall, MIN_RUNDER);
  assert.equal(out.celler.length, 1);
  // (5-4) + (4-4) + (6-4) = 1 + 0 + 2 = 3 / 3 runder = snitt 1.0
  assert.equal(out.celler[0].snittDiff, 1);
  assert.equal(out.celler[0].rundeAntall, 3);
});

test("snitt på/under par gir intensitet 0 (aldri negativ, aldri en egen gevinstfarge)", () => {
  const rader: HoleScoreRad[] = [
    hull("r1", 5, 5, 4), // birdie
    hull("r2", 5, 5, 5), // par
    hull("r3", 5, 5, 3), // eagle
  ];
  const out = aggregerHullVarme(rader);
  const celle = out.celler.find((c) => c.holeNumber === 5);
  assert.ok(celle);
  assert.ok(celle!.snittDiff < 0);
  assert.equal(celle!.intensitet, 0);
});

test("snitt langt over par-ceiling klippes til intensitet 1", () => {
  const rader: HoleScoreRad[] = [
    hull("r1", 3, 3, 8),
    hull("r2", 3, 3, 9),
    hull("r3", 3, 3, 10),
  ];
  const out = aggregerHullVarme(rader);
  const celle = out.celler.find((c) => c.holeNumber === 3);
  assert.ok(celle);
  assert.equal(celle!.intensitet, 1);
});

test("celler sorteres etter holeNumber og dekker flere hull uavhengig", () => {
  const rader: HoleScoreRad[] = [
    hull("r1", 9, 4, 4), hull("r1", 1, 4, 5),
    hull("r2", 9, 4, 4), hull("r2", 1, 4, 4),
    hull("r3", 9, 4, 4), hull("r3", 1, 4, 6),
  ];
  const out = aggregerHullVarme(rader);
  assert.deepEqual(out.celler.map((c) => c.holeNumber), [1, 9]);
});

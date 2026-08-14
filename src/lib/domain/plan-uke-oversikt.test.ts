import assert from "node:assert/strict";
import { test } from "node:test";
import { bygUkeOversikt } from "./plan-uke-oversikt";

test("bygUkeOversikt — merger sammenhengende uker med samme dominerende område", () => {
  const rader = bygUkeOversikt(
    [
      { ukeNr: 1, pyramidArea: "TEK" },
      { ukeNr: 1, pyramidArea: "TEK" },
      { ukeNr: 2, pyramidArea: "TEK" },
      { ukeNr: 3, pyramidArea: "SLAG" },
      { ukeNr: 3, pyramidArea: "SLAG" },
      { ukeNr: 4, pyramidArea: "SLAG" },
    ],
    5,
  );
  assert.deepEqual(rader, [
    { fraUke: 1, tilUke: 2, omrade: "TEK", oktAntall: 3 },
    { fraUke: 3, tilUke: 4, omrade: "SLAG", oktAntall: 3 },
  ]);
});

test("bygUkeOversikt — hopper over uker uten økter, bryter sammenhengende blokk", () => {
  const rader = bygUkeOversikt(
    [
      { ukeNr: 1, pyramidArea: "TEK" },
      { ukeNr: 3, pyramidArea: "TEK" },
    ],
    3,
  );
  assert.deepEqual(rader, [
    { fraUke: 1, tilUke: 1, omrade: "TEK", oktAntall: 1 },
    { fraUke: 3, tilUke: 3, omrade: "TEK", oktAntall: 1 },
  ]);
});

test("bygUkeOversikt — uavgjort avgjøres av pyramide-rekkefølgen (TURN vinner over SPILL)", () => {
  const rader = bygUkeOversikt(
    [
      { ukeNr: 1, pyramidArea: "SPILL" },
      { ukeNr: 1, pyramidArea: "TURN" },
    ],
    1,
  );
  assert.deepEqual(rader, [{ fraUke: 1, tilUke: 1, omrade: "TURN", oktAntall: 2 }]);
});

test("bygUkeOversikt — ingen økter gir tom liste", () => {
  assert.deepEqual(bygUkeOversikt([], 4), []);
});

import assert from "node:assert/strict";
import { test } from "node:test";

import { liveRundeTekst } from "./wang-datagolf-visning";

test("DG-08 live: runde og hull, F når runden er ferdig", () => {
  assert.equal(liveRundeTekst({ runde: 2, thru: 14, status: "TEED_OFF" }), "R2 · 14");
  assert.equal(liveRundeTekst({ runde: 2, thru: 18, status: "TEED_OFF" }), "R2 · F");
  assert.equal(liveRundeTekst({ runde: 1, thru: 0, status: "TEED_OFF" }), "R1 · Ikke startet");
});

test("DG-08 live: ukjent runde og hull blir «—», aldri et gjettet tall", () => {
  assert.equal(liveRundeTekst({ runde: null, thru: null, status: "TEED_OFF" }), "—");
  assert.equal(liveRundeTekst({ runde: 3, thru: null, status: "TEED_OFF" }), "R3");
});

test("DG-08 live: cut og trukket står som ord", () => {
  assert.equal(liveRundeTekst({ runde: 2, thru: 18, status: "CUT" }), "Røk cut");
  assert.equal(liveRundeTekst({ runde: 1, thru: 9, status: "WITHDREW" }), "Trakk seg");
});

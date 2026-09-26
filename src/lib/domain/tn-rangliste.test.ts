/** TN-16 Rangliste: brutto per runde, netto-plassering utelatt, tomme nederst. */
import assert from "node:assert/strict";
import { test } from "node:test";

import { aggregerRangliste, sorterRangliste } from "./tn-rangliste";

const runde = (roundNumber: number, score: number) => ({ roundNumber, score, toPar: null, source: "DATAGOLF" });

test("brutto snitt er per runde, ikke per turnering", () => {
  const tall = aggregerRangliste([
    { status: "FINISHED", position: 3, scoreToPar: 0, totalScore: 216, rounds: null, roundDetails: [runde(1, 72), runde(2, 72), runde(3, 72)] },
    { status: "FINISHED", position: 5, scoreToPar: 0, totalScore: 76, rounds: null, roundDetails: [runde(1, 76)] },
  ]);
  assert.equal(tall.starter, 2);
  assert.equal(tall.runder, 4);
  assert.equal(tall.bruttoSnitt, 73);
  assert.equal(tall.snittplassering, 4);
});

test("påmeldt teller ikke som start, og nettoklasse gir ingen plassering", () => {
  const tall = aggregerRangliste([
    { status: "REGISTERED", position: null, scoreToPar: null, totalScore: null, rounds: null, roundDetails: [] },
    { status: "FINISHED", position: 1, scoreToPar: 0, totalScore: 74, rounds: null, klasseNavn: "Herrer netto", roundDetails: [runde(1, 74)] },
  ]);
  assert.equal(tall.starter, 1);
  assert.equal(tall.snittplassering, null);
  assert.equal(tall.bruttoSnitt, 74);
});

test("spillere uten tall står nederst i alle sorteringer", () => {
  const rader = [
    { navn: "Uten", starter: 0, runder: 0, snittplassering: null, bruttoSnitt: null },
    { navn: "B", starter: 2, runder: 4, snittplassering: 8, bruttoSnitt: 71 },
    { navn: "A", starter: 5, runder: 9, snittplassering: 3, bruttoSnitt: 73 },
  ];
  assert.deepEqual(sorterRangliste(rader, "brutto").map((r) => r.navn), ["B", "A", "Uten"]);
  assert.deepEqual(sorterRangliste(rader, "plass").map((r) => r.navn), ["A", "B", "Uten"]);
  assert.deepEqual(sorterRangliste(rader, "starter").map((r) => r.navn), ["A", "B", "Uten"]);
});

import assert from "node:assert/strict";
import { test } from "node:test";

import { REFERANSE_MINSTE_ANTALL, referanseMedian, sistePerSpiller } from "./tn-referanse-tester-regler";

const d = (dag: number) => new Date(Date.UTC(2026, 9, dag));

test("siste resultat per spiller teller, ikke beste", () => {
  const rader = sistePerSpiller([
    { userId: "a", takenAt: d(1), score: 10 },
    { userId: "a", takenAt: d(5), score: 30 },
    { userId: "b", takenAt: d(3), score: 20 },
  ]);
  assert.deepEqual(rader.map((r) => [r.userId, r.score]).sort(), [["a", 30], ["b", 20]]);
});

test("median vises først fra fem spillere, så ingen celle peker ut én spiller", () => {
  assert.equal(REFERANSE_MINSTE_ANTALL, 5);
  const fire = [1, 2, 3, 4].map((score) => ({ score }));
  assert.equal(referanseMedian(fire), null);
  assert.equal(referanseMedian([...fire, { score: 9 }])?.score, 3);
  assert.equal(referanseMedian([5, 1, 6, 2, 4, 3].map((score) => ({ score })))?.score, 3);
});

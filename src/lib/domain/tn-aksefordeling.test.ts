import { test } from "node:test";
import assert from "node:assert/strict";

import { summerAksefordeling } from "./tn-aksefordeling";

test("summerer gjennomført per akse i timer og planlagt uten avlyste og utkast", () => {
  const r = summerAksefordeling([
    { pyramid: "TEK", durationMinutes: 90, status: "COMPLETED" },
    { pyramid: "TEK", durationMinutes: 30, status: "COMPLETED" },
    { pyramid: "FYS", durationMinutes: 60, status: "PUBLISHED" },
    { pyramid: "SLAG", durationMinutes: 45, status: "CANCELLED" },
    { pyramid: "SPILL", durationMinutes: 120, status: "DRAFT" },
    { pyramid: "UKJENT", durationMinutes: 600, status: "COMPLETED" },
  ]);
  assert.deepEqual(r.gjennomfort, { FYS: 0, TEK: 2, SLAG: 0, SPILL: 0, TURN: 0 });
  assert.equal(r.gjennomfortTimer, 2);
  assert.equal(r.planlagtTimer, 3);
});

test("tom liste gir null overalt", () => {
  const r = summerAksefordeling([]);
  assert.equal(r.planlagtTimer, 0);
  assert.equal(r.gjennomfort.TURN, 0);
});

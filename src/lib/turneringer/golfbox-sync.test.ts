import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveRoundDates } from "./golfbox-sync";

test("deriveRoundDates: én dag", () => {
  const d = new Date(Date.UTC(2026, 7, 6));
  assert.deepEqual(deriveRoundDates(d, null), ["2026-08-06"]);
});

test("deriveRoundDates: flere dager", () => {
  const s = new Date(Date.UTC(2026, 7, 6));
  const e = new Date(Date.UTC(2026, 7, 8));
  assert.deepEqual(deriveRoundDates(s, e), [
    "2026-08-06",
    "2026-08-07",
    "2026-08-08",
  ]);
});

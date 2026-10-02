import assert from "node:assert/strict";
import { test } from "node:test";
import { lokalSlutt } from "./lokal-slutt";

test("gruppetimens varighet bevares over midnatt, måneds- og årsskifte", () => {
  for (const [start, minutter, slutt] of [
    ["2026-10-02T09:30", 30, "2026-10-02T10:00"],
    ["2026-10-02T23:30", 60, "2026-10-03T00:30"],
    ["2026-10-31T23:30", 30, "2026-11-01T00:00"],
    ["2026-12-31T23:30", 120, "2027-01-01T01:30"],
    ["2028-02-28T23:30", 60, "2028-02-29T00:30"],
    ["2026-03-28T23:30", 1440, "2026-03-29T23:30"],
    ["2026-10-24T23:30", 1440, "2026-10-25T23:30"],
  ] as const) assert.equal(lokalSlutt(start, minutter), slutt);
});

test("ugyldig dato og varighet avvises i stedet for å normaliseres", () => {
  for (const start of ["2026-02-31T09:30", "2026-10-02T24:00", "2026-10-02T09:60", "2026-10-02", "2026-10-02T09:30Z"]) {
    assert.throws(() => lokalSlutt(start, 30), /Ugyldig/);
  }
  for (const minutter of [0, -1, 0.5, 1441, NaN, Infinity]) {
    assert.throws(() => lokalSlutt("2026-10-02T09:30", minutter), /Ugyldig/);
  }
});

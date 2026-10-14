import { test } from "node:test";
import assert from "node:assert/strict";
import { periodeUke } from "./uke-periode";

const d = (s: string) => new Date(`${s}T00:00:00Z`);

test("uke 3 av 8 i en periode som starter på en mandag", () => {
  // Periode 21.09–15.11.2026 (åtte uker), mandag 5.10 kl. 14:20 Oslo.
  assert.deepEqual(periodeUke(d("2026-09-21"), d("2026-11-15"), new Date("2026-10-05T12:20:00Z")), { uke: 3, antallUker: 8 });
});

test("periode som starter midt i uka teller startuka som uke 1", () => {
  assert.deepEqual(periodeUke(d("2026-09-24"), d("2026-10-04"), new Date("2026-09-29T08:00:00Z")), { uke: 2, antallUker: 2 });
});

test("søndag kveld i Oslo hører til samme uke", () => {
  // Søndag 11.10 kl. 23:30 Oslo er 21:30 UTC.
  assert.deepEqual(periodeUke(d("2026-09-21"), d("2026-11-15"), new Date("2026-10-11T21:30:00Z")), { uke: 3, antallUker: 8 });
});

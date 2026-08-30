import { test } from "node:test";
import assert from "node:assert/strict";

import {
  kanVisesOffentlig,
  offentligSpillerFilter,
  sisteTryggeFodselsaar,
} from "./offentlig-spiller";

const I_2026 = new Date("2026-08-30T12:00:00Z");

test("sisteTryggeFodselsaar gir 2007 i 2026 — beslutningens ordlyd «født 2008 eller senere skjules»", () => {
  assert.equal(sisteTryggeFodselsaar(I_2026), 2007);
});

test("aldersgulvet flytter seg med årsskiftet", () => {
  assert.equal(sisteTryggeFodselsaar(new Date("2027-01-01T00:00:00Z")), 2008);
});

test("mindreårig norsk spiller skjules", () => {
  assert.equal(kanVisesOffentlig({ birthYear: 2008, dataGolfId: null }, I_2026), false);
  assert.equal(kanVisesOffentlig({ birthYear: 2012, dataGolfId: null }, I_2026), false);
});

test("myndig norsk spiller vises", () => {
  assert.equal(kanVisesOffentlig({ birthYear: 2007, dataGolfId: null }, I_2026), true);
  assert.equal(kanVisesOffentlig({ birthYear: 1985, dataGolfId: null }, I_2026), true);
});

test("manglende fødselsår skjules (fail-closed)", () => {
  assert.equal(kanVisesOffentlig({ birthYear: null, dataGolfId: null }, I_2026), false);
});

test("DataGolf-proff vises selv uten fødselsår", () => {
  assert.equal(kanVisesOffentlig({ birthYear: null, dataGolfId: 18417 }, I_2026), true);
});

test("søppelfødselsår (0) passerer ikke som «gammel nok»", () => {
  assert.equal(kanVisesOffentlig({ birthYear: 0, dataGolfId: null }, I_2026), false);
});

test("filteret slipper gjennom DataGolf ELLER troverdig myndig fødselsår", () => {
  const filter = offentligSpillerFilter(I_2026);
  assert.deepEqual(filter, {
    OR: [
      { dataGolfId: { not: null } },
      { birthYear: { gte: 1900, lte: 2007 } },
    ],
  });
});

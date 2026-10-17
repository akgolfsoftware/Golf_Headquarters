import { test } from "node:test";
import assert from "node:assert/strict";
import { lesFokus, medFokus, nyBelastning, oktTypeFraPyramide } from "./etter-okta";

test("fysisk økt får «Hvor tungt», andre akser Belastning og Fokus", () => {
  assert.equal(oktTypeFraPyramide("FYS"), "fys");
  assert.equal(oktTypeFraPyramide("SLAG"), "golf");
  assert.equal(oktTypeFraPyramide(null), "golf");
});

test("fokus lagres ved siden av gjennomføringen og bevarer ukjente felt", () => {
  const snap = { execution: { version: 1 }, totalSec: 600, ukjent: "behold" };
  const ny = medFokus(snap, 8, "2026-10-17T10:00:00.000Z");
  assert.deepEqual(ny.execution, { version: 1 });
  assert.equal(ny.totalSec, 600);
  assert.equal(ny.ukjent, "behold");
  assert.equal(lesFokus(ny), 8);
});

test("mangler eller ugyldig fokus gir null, aldri et anslag", () => {
  assert.equal(lesFokus(null), null);
  assert.equal(lesFokus({ etterOkta: { fokus: 11, lagretISO: "x" } }), null);
  assert.equal(lesFokus({}), null);
});

test("snapshot som ikke er et objekt endres ikke", () => {
  assert.throws(() => medFokus([1, 2], 5, "2026-10-17T10:00:00.000Z"));
});

test("belastning settes én gang; en annen verdi skrives ikke over", () => {
  assert.deepEqual(nyBelastning(null, 7), { ok: true, verdi: 7 });
  assert.deepEqual(nyBelastning(7, 7), { ok: true, verdi: 7 });
  assert.equal(nyBelastning(6, 7).ok, false);
});

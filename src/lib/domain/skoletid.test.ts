import { test } from "node:test";
import assert from "node:assert/strict";

import { semesterFor, skoletidStatus } from "@/lib/domain/skoletid";

test("august hører til høstsemesteret", () => {
  const s = semesterFor(new Date(2026, 7, 15));

  assert.equal(s.kode, "2026H");
  assert.equal(s.visning, "høsten 2026");
});

test("februar hører til vårsemesteret", () => {
  const s = semesterFor(new Date(2027, 1, 3));

  assert.equal(s.kode, "2027V");
  assert.equal(s.visning, "våren 2027");
});

test("grensen går i skoleferien — juni er vår, juli er høst", () => {
  assert.equal(semesterFor(new Date(2026, 5, 30)).kode, "2026V");
  assert.equal(semesterFor(new Date(2026, 6, 1)).kode, "2026H");
});

test("desember og januar er ulike semestre selv om de ligger inntil hverandre", () => {
  assert.equal(semesterFor(new Date(2026, 11, 20)).kode, "2026H");
  assert.equal(semesterFor(new Date(2027, 0, 5)).kode, "2027V");
});

test("ubekreftet semester navngir semesteret som mangler", () => {
  const s = semesterFor(new Date(2026, 7, 15));
  const status = skoletidStatus(s, null);

  assert.equal(status.bekreftet, false);
  assert.equal(
    status.tekst,
    "ikke bekreftet for høsten 2026",
    "teksten må si HVILKET semester — ellers ser fjorårets svar ut som gyldig",
  );
});

test("bekreftet i dag skrives «i dag», ikke som dato", () => {
  const na = new Date(2026, 7, 15, 20, 0);
  const s = semesterFor(na);
  const status = skoletidStatus(s, na, na);

  assert.equal(status.bekreftet, true);
  assert.match(status.tekst, /bekreftet i dag/);
  assert.match(status.tekst, /gjelder til 20\.12/);
});

test("bekreftet tidligere vises med dato", () => {
  const na = new Date(2026, 7, 15);
  const s = semesterFor(na);
  const status = skoletidStatus(s, new Date(2026, 7, 3), na);

  assert.match(status.tekst, /bekreftet 3\.8/);
});

test("en bekreftelse arves aldri til neste semester", () => {
  // Bekreftet i høstsemesteret, spurt i vårsemesteret.
  const vaar = semesterFor(new Date(2027, 1, 10));

  assert.notEqual(
    vaar.kode,
    semesterFor(new Date(2026, 9, 1)).kode,
    "ulik nøkkel betyr at høstens rad ikke kan slås opp om våren",
  );
});

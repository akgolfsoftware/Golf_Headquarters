import { test } from "node:test";
import assert from "node:assert/strict";

import { isoUke } from "@/lib/admin/ukesrapport-deling";

test("vanlig uke midt i året", () => {
  assert.deepEqual(isoUke(new Date("2026-08-10T00:00:00Z")), { ar: 2026, uke: 33 });
});

test("uke 1 kan ligge i desember — året følger torsdagen, ikke datoen", () => {
  // Mandag 29.12.2025 hører til ISO-uke 1 i 2026 (torsdagen er 1. januar).
  // Uten ISO-året ville delingen blitt lagret på 2025 og digesten blitt
  // usynlig for spilleren gjennom hele nyttårsuka.
  assert.deepEqual(isoUke(new Date("2025-12-29T00:00:00Z")), { ar: 2026, uke: 1 });
});

test("uke 53 kan ligge i januar", () => {
  // Torsdag 31.12.2026 er i uke 53 — mandagen etter (4.1.2027) er uke 1.
  const siste = isoUke(new Date("2026-12-28T00:00:00Z"));
  assert.equal(siste.ar, 2026);
  assert.equal(siste.uke, 53);
});

test("nyttårsdag 2027 hører til uke 53 i 2026", () => {
  assert.deepEqual(isoUke(new Date("2027-01-01T00:00:00Z")), { ar: 2026, uke: 53 });
});

test("alle dager i samme uke gir samme nøkkel", () => {
  const mandag = isoUke(new Date("2026-08-10T00:00:00Z"));
  const sondag = isoUke(new Date("2026-08-16T00:00:00Z"));

  assert.deepEqual(
    mandag,
    sondag,
    "deling må treffe samme rad uansett hvilken dag i uka den skjer",
  );
});

test("mandagen etter er en ny uke", () => {
  const denne = isoUke(new Date("2026-08-10T00:00:00Z"));
  const neste = isoUke(new Date("2026-08-17T00:00:00Z"));

  assert.equal(neste.uke, denne.uke + 1);
});

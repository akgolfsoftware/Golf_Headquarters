/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/jarvis/en-ting-na.test.ts
 */
import test from "node:test";
import assert from "node:assert/strict";
import type { Sak } from "@/generated/prisma/client";
import { SakKanal, SakStatus } from "@/generated/prisma/enums";
import { enTingNa, tidIgjenMs } from "./en-ting-na";

let telle = 0;
function lagSak(overrides: Partial<Sak> = {}): Sak {
  telle += 1;
  return {
    id: `sak-${telle}`,
    kanal: SakKanal.EPOST,
    avsender: "test@akgolf.no",
    emne: "Testsak",
    innhold: "Testinnhold",
    foreslattSvar: null,
    status: SakStatus.VENTER,
    kildeId: null,
    frist: null,
    opprettet: new Date("2026-08-16T08:00:00Z"),
    oppdatert: new Date("2026-08-16T08:00:00Z"),
    provenance: null,
    ...overrides,
  };
}

const NA = new Date("2026-08-16T12:00:00Z");

test("enTingNa: tom liste gir null", () => {
  assert.equal(enTingNa([], NA), null);
});

test("enTingNa: ingen VENTER-saker gir null selv om andre er hastesaker", () => {
  const godkjent = lagSak({ status: SakStatus.GODKJENT, frist: new Date("2026-08-16T10:00:00Z") });
  assert.equal(enTingNa([godkjent], NA), null);
});

test("enTingNa: over frist vinner over en som ikke er over frist", () => {
  const overFrist = lagSak({ id: "over", frist: new Date("2026-08-16T11:00:00Z") }); // -1t
  const ikkeOver = lagSak({ id: "ikke-over", frist: new Date("2026-08-16T12:05:00Z") }); // +5min
  const valgt = enTingNa([ikkeOver, overFrist], NA);
  assert.equal(valgt?.id, "over");
});

test("enTingNa: blant over-frist-saker vinner den som er mest over", () => {
  const litOver = lagSak({ id: "lit-over", frist: new Date("2026-08-16T11:50:00Z") }); // -10min
  const mestOver = lagSak({ id: "mest-over", frist: new Date("2026-08-16T09:00:00Z") }); // -3t
  const valgt = enTingNa([litOver, mestOver], NA);
  assert.equal(valgt?.id, "mest-over");
});

test("enTingNa: blant ikke-over-frist-saker vinner minst tid igjen", () => {
  const myeTid = lagSak({ id: "mye-tid", frist: new Date("2026-08-16T18:00:00Z") }); // +6t
  const litenTid = lagSak({ id: "liten-tid", frist: new Date("2026-08-16T12:30:00Z") }); // +30min
  const valgt = enTingNa([myeTid, litenTid], NA);
  assert.equal(valgt?.id, "liten-tid");
});

test("enTingNa: likt tidspunkt — ANROP vinner over skriftlig kanal", () => {
  const samFrist = new Date("2026-08-16T13:00:00Z");
  const epost = lagSak({ id: "epost", kanal: SakKanal.EPOST, frist: samFrist });
  const anrop = lagSak({ id: "anrop", kanal: SakKanal.ANROP, frist: samFrist });
  const valgt = enTingNa([epost, anrop], NA);
  assert.equal(valgt?.id, "anrop");
});

test("enTingNa: sak uten frist taper mot sak med frist", () => {
  const utenFrist = lagSak({ id: "uten-frist", frist: null });
  const medFrist = lagSak({ id: "med-frist", frist: new Date("2026-08-16T20:00:00Z") });
  const valgt = enTingNa([utenFrist, medFrist], NA);
  assert.equal(valgt?.id, "med-frist");
});

test("enTingNa: begge uten frist — ANROP vinner som tie-break", () => {
  const epost = lagSak({ id: "epost-uten-frist", kanal: SakKanal.EPOST, frist: null });
  const anrop = lagSak({ id: "anrop-uten-frist", kanal: SakKanal.ANROP, frist: null });
  const valgt = enTingNa([epost, anrop], NA);
  assert.equal(valgt?.id, "anrop-uten-frist");
});

test("tidIgjenMs: null uten frist, negativ over frist, positiv innenfor frist", () => {
  assert.equal(tidIgjenMs({ frist: null }, NA), null);
  assert.equal(tidIgjenMs({ frist: new Date("2026-08-16T11:00:00Z") }, NA), -60 * 60 * 1000);
  assert.equal(tidIgjenMs({ frist: new Date("2026-08-16T13:00:00Z") }, NA), 60 * 60 * 1000);
});

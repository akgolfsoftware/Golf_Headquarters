/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/jarvis/ukesreview.test.ts
 */
import test from "node:test";
import assert from "node:assert/strict";
import type { Sak } from "@/generated/prisma/client";
import { SakKanal, SakStatus } from "@/generated/prisma/enums";
import { osloUkeGrenser, beregnSlaEtterlevelse, tellPerKanal } from "./ukesreview";

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
    status: SakStatus.GODKJENT,
    kildeId: null,
    frist: null,
    opprettet: new Date("2026-08-10T08:00:00Z"),
    oppdatert: new Date("2026-08-10T08:00:00Z"),
    provenance: null,
    ...overrides,
  };
}

test("osloUkeGrenser: onsdag midt i uke 33 → mandag 00:00 til påfølgende mandag 00:00 (CEST)", () => {
  const { start, slutt } = osloUkeGrenser(new Date("2026-08-12T12:00:00Z")); // onsdag 12. august
  assert.equal(start.toISOString(), "2026-08-09T22:00:00.000Z"); // mandag 10. august 00:00 CEST
  assert.equal(slutt.toISOString(), "2026-08-16T22:00:00.000Z"); // mandag 17. august 00:00 CEST
});

test("osloUkeGrenser: søndag hører til DENNE ukens mandag, ikke neste", () => {
  const { start } = osloUkeGrenser(new Date("2026-08-16T12:00:00Z")); // søndag 16. august
  assert.equal(start.toISOString(), "2026-08-09T22:00:00.000Z");
});

test("osloUkeGrenser: vintertid (CET) — riktig UTC-offset", () => {
  const { start, slutt } = osloUkeGrenser(new Date("2026-01-14T12:00:00Z")); // onsdag i januar
  assert.equal(start.toISOString(), "2026-01-11T23:00:00.000Z");
  assert.equal(slutt.toISOString(), "2026-01-18T23:00:00.000Z");
});

test("beregnSlaEtterlevelse: ingen saker med frist → null, ikke 0 %", () => {
  const res = beregnSlaEtterlevelse([lagSak({ frist: null })]);
  assert.equal(res.prosentUnderFrist, null);
  assert.equal(res.antall, 0);
  assert.equal(res.medianSvartidMin, null);
});

test("beregnSlaEtterlevelse: teller kun saker med frist, riktig prosent", () => {
  const saker = [
    lagSak({ frist: new Date("2026-08-10T14:00:00Z"), oppdatert: new Date("2026-08-10T12:00:00Z") }), // under frist
    lagSak({ frist: new Date("2026-08-10T14:00:00Z"), oppdatert: new Date("2026-08-10T15:00:00Z") }), // over frist
    lagSak({ frist: null }), // teller ikke
  ];
  const res = beregnSlaEtterlevelse(saker);
  assert.equal(res.antall, 2);
  assert.equal(res.prosentUnderFrist, 50);
});

test("beregnSlaEtterlevelse: median svartid, oddetall antall", () => {
  const saker = [
    lagSak({ frist: new Date("2026-08-11T00:00:00Z"), opprettet: new Date("2026-08-10T08:00:00Z"), oppdatert: new Date("2026-08-10T09:00:00Z") }), // 60 min
    lagSak({ frist: new Date("2026-08-11T00:00:00Z"), opprettet: new Date("2026-08-10T08:00:00Z"), oppdatert: new Date("2026-08-10T08:10:00Z") }), // 10 min
    lagSak({ frist: new Date("2026-08-11T00:00:00Z"), opprettet: new Date("2026-08-10T08:00:00Z"), oppdatert: new Date("2026-08-10T08:30:00Z") }), // 30 min
  ];
  const res = beregnSlaEtterlevelse(saker);
  assert.equal(res.medianSvartidMin, 30);
});

test("tellPerKanal: grupperer og sorterer synkende", () => {
  const saker = [
    lagSak({ kanal: SakKanal.EPOST }),
    lagSak({ kanal: SakKanal.EPOST }),
    lagSak({ kanal: SakKanal.SMS }),
  ];
  const res = tellPerKanal(saker);
  assert.deepEqual(res, [
    { kanal: SakKanal.EPOST, antall: 2 },
    { kanal: SakKanal.SMS, antall: 1 },
  ]);
});

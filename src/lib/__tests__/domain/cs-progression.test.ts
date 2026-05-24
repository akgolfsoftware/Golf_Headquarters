/**
 * Tester for cs-progression.ts — clubhead speed-progresjon.
 *
 * Kjøres med:
 *   npx tsx --test src/lib/__tests__/domain/cs-progression.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  beregnCsProgresjon,
  type CsSesjon,
} from "../../domain/cs-progression";

// ---------------------------------------------------------------------------
// Hjelper
// ---------------------------------------------------------------------------

const NA = new Date("2026-05-24T12:00:00Z");

function dagerFor(antall: number): Date {
  return new Date(NA.getTime() - antall * 24 * 60 * 60 * 1000);
}

// ---------------------------------------------------------------------------
// Tester
// ---------------------------------------------------------------------------

test("tomt input → null-snitt, trend FLAT, ingen varsel", () => {
  const res = beregnCsProgresjon([]);
  assert.equal(res.gjeldendeSnitt, null);
  assert.equal(res.forrigeSnitt, null);
  assert.equal(res.endring, null);
  assert.equal(res.endringPct, null);
  assert.equal(res.trend, "FLAT");
  assert.equal(res.varselFlagg, null);
});

test("kun gjeldende periode har data → forrigeSnitt = null", () => {
  const sesjoner: CsSesjon[] = [
    { dato: dagerFor(3), csValue: 110 },
    { dato: dagerFor(10), csValue: 112 },
  ];
  const res = beregnCsProgresjon(sesjoner);
  assert.ok(res.gjeldendeSnitt !== null);
  assert.equal(res.forrigeSnitt, null);
  assert.equal(res.endring, null);
  assert.equal(res.endringPct, null);
});

test("CS øker fra 110 til 115 → trend OPP", () => {
  const sesjoner: CsSesjon[] = [
    // Gjeldende uker 1-4 (siste 28 dager): snitt 115
    { dato: dagerFor(3), csValue: 115 },
    { dato: dagerFor(10), csValue: 115 },
    { dato: dagerFor(17), csValue: 115 },
    { dato: dagerFor(24), csValue: 115 },
    // Forrige uker 5-8: snitt 110
    { dato: dagerFor(31), csValue: 110 },
    { dato: dagerFor(38), csValue: 110 },
    { dato: dagerFor(45), csValue: 110 },
    { dato: dagerFor(52), csValue: 110 },
  ];
  const res = beregnCsProgresjon(sesjoner);
  assert.equal(res.gjeldendeSnitt, 115);
  assert.equal(res.forrigeSnitt, 110);
  assert.equal(res.endring, 5);
  assert.ok(res.endringPct !== null && res.endringPct > 2);
  assert.equal(res.trend, "OPP");
});

test("CS faller fra 115 til 110 → trend NED", () => {
  const sesjoner: CsSesjon[] = [
    { dato: dagerFor(3), csValue: 110 },
    { dato: dagerFor(10), csValue: 110 },
    { dato: dagerFor(17), csValue: 110 },
    { dato: dagerFor(24), csValue: 110 },
    { dato: dagerFor(31), csValue: 115 },
    { dato: dagerFor(38), csValue: 115 },
    { dato: dagerFor(45), csValue: 115 },
    { dato: dagerFor(52), csValue: 115 },
  ];
  const res = beregnCsProgresjon(sesjoner);
  assert.equal(res.gjeldendeSnitt, 110);
  assert.equal(res.forrigeSnitt, 115);
  assert.equal(res.endring, -5);
  assert.ok(res.endringPct !== null && res.endringPct < -2);
  assert.equal(res.trend, "NED");
});

test("liten endring (< 2 %) → trend FLAT", () => {
  const sesjoner: CsSesjon[] = [
    // Gjeldende: 111
    { dato: dagerFor(3), csValue: 111 },
    { dato: dagerFor(10), csValue: 111 },
    // Forrige: 110 (≈ 0,9 % endring)
    { dato: dagerFor(31), csValue: 110 },
    { dato: dagerFor(38), csValue: 110 },
  ];
  const res = beregnCsProgresjon(sesjoner);
  assert.equal(res.trend, "FLAT");
});

test("brått fall siste uke > 3 mph → varselFlagg = MULIG_SKADE", () => {
  // Siste uke (0-7 dager): snitt 108
  // Nest siste uke (7-14 dager): snitt 115
  // Fall: -7 mph → varsel
  const sesjoner: CsSesjon[] = [
    { dato: dagerFor(2), csValue: 108 },
    { dato: dagerFor(5), csValue: 108 },
    { dato: dagerFor(9), csValue: 115 },
    { dato: dagerFor(12), csValue: 115 },
    // Litt mer data for ikke å påvirke ankerdato
    { dato: dagerFor(20), csValue: 115 },
    { dato: dagerFor(35), csValue: 114 },
  ];
  const res = beregnCsProgresjon(sesjoner);
  assert.equal(res.varselFlagg, "MULIG_SKADE");
});

test("normalt fall (< 3 mph) gir ingen varsel", () => {
  const sesjoner: CsSesjon[] = [
    { dato: dagerFor(2), csValue: 113 },
    { dato: dagerFor(5), csValue: 113 },
    { dato: dagerFor(9), csValue: 115 },
    { dato: dagerFor(12), csValue: 115 },
    { dato: dagerFor(35), csValue: 114 },
  ];
  const res = beregnCsProgresjon(sesjoner);
  assert.equal(res.varselFlagg, null);
});

/**
 * Tester for restitusjonsstatus.ts — grønn/gul/rød fra helsedata.
 * Kjøres med: npx tsx --test src/lib/__tests__/restitusjonsstatus.test.ts
 *
 * Kjernepoenget som testes: statusen er SELV-RELATIV. To spillere med helt
 * ulikt normalnivå skal få samme status når de avviker like mye fra seg selv.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { beregnRestitusjonsstatus, type Maaling } from "../health/restitusjonsstatus";

const DAG = 86_400_000;
const I_DAG = new Date("2026-07-27T06:00:00Z");

/**
 * Bygger en historikk med `antall` døgn bakover fra i dag. `verdier` gjentas
 * syklisk, slik at serien får en reell spredning å måle mot.
 */
function historikk(
  antall: number,
  verdier: { restingHr?: number[]; hrv?: number[]; sleepHours?: number[] },
): Maaling[] {
  return Array.from({ length: antall }, (_, i) => ({
    date: new Date(I_DAG.getTime() - (i + 1) * DAG),
    restingHr: verdier.restingHr ? verdier.restingHr[i % verdier.restingHr.length] : null,
    hrv: verdier.hrv ? verdier.hrv[i % verdier.hrv.length] : null,
    sleepHours: verdier.sleepHours
      ? verdier.sleepHours[i % verdier.sleepHours.length]
      : null,
  }));
}

function iDag(over: Partial<Maaling>): Maaling {
  return { date: I_DAG, restingHr: null, hrv: null, sleepHours: null, ...over };
}

/* ── tomme og tynne tilfeller ──────────────────────────────────────── */

test("ingen målinger gir UKJENT", () => {
  const s = beregnRestitusjonsstatus([]);
  assert.equal(s.farge, "UKJENT");
  assert.equal(s.sisteMaaling, null);
});

test("for kort historikk gir GROENN, ikke falskt alarm", () => {
  // Tre døgns historikk er under MIN_MAALINGER — markøren hoppes over.
  const s = beregnRestitusjonsstatus([
    iDag({ restingHr: 90 }),
    ...historikk(3, { restingHr: [50, 52, 51] }),
  ]);
  assert.equal(s.farge, "GROENN", "vi flagger ikke på et grunnlag vi ikke har");
});

test("konstant historikk gir ingen spredning å måle mot", () => {
  const s = beregnRestitusjonsstatus([
    iDag({ restingHr: 80 }),
    ...historikk(14, { restingHr: [50] }),
  ]);
  assert.equal(s.farge, "GROENN", "standardavvik 0 kan ikke gi et meningsfullt avvik");
});

/* ── selv-relativitet ──────────────────────────────────────────────── */

test("normal verdi for spilleren selv gir GROENN", () => {
  const s = beregnRestitusjonsstatus([
    iDag({ restingHr: 51 }),
    ...historikk(14, { restingHr: [50, 52, 49, 51, 50, 53, 48] }),
  ]);
  assert.equal(s.farge, "GROENN");
  assert.deepEqual(s.avvik, []);
});

test("samme relative avvik gir samme status på tvers av ulike normalnivåer", () => {
  // Utholdenhetsutøver med hvilepuls rundt 42, og en med rundt 68. Begge
  // ligger like mange egne standardavvik over sitt eget snitt i dag.
  const lav = beregnRestitusjonsstatus([
    iDag({ restingHr: 48 }),
    ...historikk(14, { restingHr: [42, 44, 40, 43, 41, 45, 39] }),
  ]);
  const hoy = beregnRestitusjonsstatus([
    iDag({ restingHr: 74 }),
    ...historikk(14, { restingHr: [68, 70, 66, 69, 67, 71, 65] }),
  ]);
  assert.equal(
    lav.farge,
    hoy.farge,
    "en fast terskel ville dømt disse to helt ulikt — det er nettopp feilen vi unngår",
  );
});

/* ── retning per markør ────────────────────────────────────────────── */

test("HØY hvilepuls er dårlig, lav er det ikke", () => {
  const base = historikk(14, { restingHr: [50, 52, 49, 51, 50, 53, 48] });

  const hoy = beregnRestitusjonsstatus([iDag({ restingHr: 60 }), ...base]);
  assert.notEqual(hoy.farge, "GROENN", "kraftig forhøyet hvilepuls skal flagges");

  const lav = beregnRestitusjonsstatus([iDag({ restingHr: 40 }), ...base]);
  assert.equal(lav.farge, "GROENN", "uvanlig LAV hvilepuls er ikke et faresignal");
});

test("LAV HRV og LAV søvn er dårlig, høy er det ikke", () => {
  const base = historikk(14, {
    hrv: [60, 65, 58, 62, 61, 67, 55],
    sleepHours: [7.5, 8, 7, 7.8, 7.2, 8.2, 6.9],
  });

  const daarlig = beregnRestitusjonsstatus([iDag({ hrv: 35, sleepHours: 4 }), ...base]);
  assert.equal(daarlig.farge, "ROED", "to markører kraftig ned samtidig");

  const bra = beregnRestitusjonsstatus([iDag({ hrv: 85, sleepHours: 10 }), ...base]);
  assert.equal(bra.farge, "GROENN", "ekstra god natt er ikke et avvik å varsle om");
});

/* ── samlet farge ──────────────────────────────────────────────────── */

test("to moderate avvik samtidig blir ROED", () => {
  // Hver for seg rundt 1 SD (gult), sammen skal de gi rødt.
  const s = beregnRestitusjonsstatus([
    iDag({ restingHr: 54, sleepHours: 6.5 }),
    ...historikk(14, {
      restingHr: [50, 52, 49, 51, 50, 53, 48],
      sleepHours: [7.5, 8, 7, 7.8, 7.2, 8.2, 6.9],
    }),
  ]);
  assert.equal(s.farge, "ROED");
  assert.equal(s.avvik.length, 2);
});

test("avvik-tekstene inneholder aldri tall — de vises til coach", () => {
  const s = beregnRestitusjonsstatus([
    iDag({ restingHr: 62, hrv: 30, sleepHours: 3.5 }),
    ...historikk(14, {
      restingHr: [50, 52, 49, 51, 50, 53, 48],
      hrv: [60, 65, 58, 62, 61, 67, 55],
      sleepHours: [7.5, 8, 7, 7.8, 7.2, 8.2, 6.9],
    }),
  ]);
  assert.equal(s.farge, "ROED");
  for (const tekst of s.avvik) {
    assert.equal(/\d/.test(tekst), false, `lekker tall: ${tekst}`);
  }
});

test("siste måling velges uavhengig av rekkefølgen radene kommer i", () => {
  const rader = [
    ...historikk(14, { restingHr: [50, 52, 49, 51, 50, 53, 48] }),
    iDag({ restingHr: 51 }),
  ];
  const s = beregnRestitusjonsstatus(rader);
  assert.deepEqual(s.sisteMaaling, I_DAG);
});

test("målinger eldre enn baseline-vinduet teller ikke med", () => {
  // Én fersk måling og en klynge fra i fjor: for lite ferskt til å konkludere.
  const gammelt: Maaling[] = Array.from({ length: 20 }, (_, i) => ({
    date: new Date(I_DAG.getTime() - (200 + i) * DAG),
    restingHr: 50 + (i % 5),
    hrv: null,
    sleepHours: null,
  }));
  const s = beregnRestitusjonsstatus([iDag({ restingHr: 75 }), ...gammelt]);
  assert.equal(s.farge, "GROENN", "fjorårets tall er ikke dagens normalnivå");
});

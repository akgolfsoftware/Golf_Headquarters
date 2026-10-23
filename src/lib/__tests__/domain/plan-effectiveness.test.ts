/**
 * Tester for plan-effectiveness.ts.
 *
 * Vi tester primært den rene aggregeringsfunksjonen — Prisma-spørringen
 * er en tynn wrapper rundt den.
 *
 * Kjøres med:
 *   npx tsx --test src/lib/__tests__/domain/plan-effectiveness.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  aggregerPlanEffektivitet,
  beregnPlanEffektivitet,
  type PlanEffektivitetRaa,
} from "../../domain/plan-effectiveness";

// ---------------------------------------------------------------------------
// aggregerPlanEffektivitet
// ---------------------------------------------------------------------------

test("tomt input → tomt resultat", () => {
  const res = aggregerPlanEffektivitet([]);
  assert.equal(res.antallBrukere, 0);
  assert.equal(res.gjennomsnittligHcpEndring, null);
  assert.equal(res.signifikant, false);
});

test("alle hcpDelta null → ukjent snitt, ikke signifikant", () => {
  const rader: PlanEffektivitetRaa[] = [
    { hcpDelta: null, userId: "u1" },
    { hcpDelta: null, userId: "u2" },
    { hcpDelta: null, userId: "u3" },
  ];
  const res = aggregerPlanEffektivitet(rader);
  assert.equal(res.antallBrukere, 3);
  assert.equal(res.gjennomsnittligHcpEndring, null);
  assert.equal(res.signifikant, false);
});

test("5 brukere med snitt -0,8 er beskrivende, ikke signifikans", () => {
  const rader: PlanEffektivitetRaa[] = [
    { hcpDelta: -1.0, userId: "u1" },
    { hcpDelta: -0.5, userId: "u2" },
    { hcpDelta: -1.2, userId: "u3" },
    { hcpDelta: -0.6, userId: "u4" },
    { hcpDelta: -0.7, userId: "u5" },
  ];
  const res = aggregerPlanEffektivitet(rader);
  assert.equal(res.antallBrukere, 5);
  assert.equal(res.gjennomsnittligHcpEndring, -0.8);
  assert.equal(res.signifikant, false);
});

test("kun 3 brukere → ikke signifikant selv med stor effekt", () => {
  const rader: PlanEffektivitetRaa[] = [
    { hcpDelta: -2.0, userId: "u1" },
    { hcpDelta: -2.0, userId: "u2" },
    { hcpDelta: -2.0, userId: "u3" },
  ];
  const res = aggregerPlanEffektivitet(rader);
  assert.equal(res.antallBrukere, 3);
  assert.equal(res.gjennomsnittligHcpEndring, -2);
  assert.equal(res.signifikant, false);
});

test("5+ brukere men liten effekt (< 0,3) → ikke signifikant", () => {
  const rader: PlanEffektivitetRaa[] = [
    { hcpDelta: -0.1, userId: "u1" },
    { hcpDelta: -0.2, userId: "u2" },
    { hcpDelta: -0.1, userId: "u3" },
    { hcpDelta: 0.0, userId: "u4" },
    { hcpDelta: -0.1, userId: "u5" },
  ];
  const res = aggregerPlanEffektivitet(rader);
  assert.equal(res.antallBrukere, 5);
  assert.ok(Math.abs(res.gjennomsnittligHcpEndring!) < 0.3);
  assert.equal(res.signifikant, false);
});

test("samme bruker flere ganger → telles kun én gang i antallBrukere", () => {
  const rader: PlanEffektivitetRaa[] = [
    { hcpDelta: -0.5, userId: "u1" },
    { hcpDelta: -0.7, userId: "u1" },
    { hcpDelta: -0.6, userId: "u2" },
  ];
  const res = aggregerPlanEffektivitet(rader);
  assert.equal(res.antallBrukere, 2);
});

// ---------------------------------------------------------------------------
// beregnPlanEffektivitet — tom planId
// ---------------------------------------------------------------------------

test("beregnPlanEffektivitet: tom planId → tomt resultat uten DB-kall", async () => {
  const res = await beregnPlanEffektivitet("");
  assert.equal(res.antallBrukere, 0);
  assert.equal(res.gjennomsnittligHcpEndring, null);
  assert.equal(res.signifikant, false);
});

test("hver spiller vekter likt og ukjente målinger telles separat", () => {
  const r = aggregerPlanEffektivitet([{ userId: "a", hcpDelta: -2 }, { userId: "a", hcpDelta: -2 },
    { userId: "b", hcpDelta: 0 }, { userId: "c", hcpDelta: null }]);
  assert.equal(r.antallBrukere, 3);
  assert.equal(r.antallMedMaaling, 2);
  assert.equal(r.gjennomsnittligHcpEndring, -1);
});
test("template alene gir ingen lesing på tvers av spillere", async () => {
  assert.equal((await beregnPlanEffektivitet("template-a")).antallBrukere, 0);
});

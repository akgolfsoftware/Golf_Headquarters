/**
 * A1 · Abonnement-domenet v2 — pakke-definisjonen, PlayerHQ-tilgang og
 * pakkenavn. harAktivPakke er DEN ENE definisjonen av «betalt akkurat nå».
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  harAktivPakke,
  girPlayerHqTilgang,
  pakkeNavn,
  planNavn,
  PLAYERHQ_PRIS_MND_ORE,
  PLAYERHQ_PRIS_AAR_ORE,
  PLAYERHQ_AAR_BESPARELSE_ORE,
} from "@/lib/domain/abonnement";

const NOW = new Date("2026-09-15T12:00:00+02:00");
const FREMTID = new Date("2026-10-01T00:00:00+02:00");
const FORTID = new Date("2026-09-01T00:00:00+02:00");

test("harAktivPakke: ACTIVE og TRIALING er betalt", () => {
  assert.equal(harAktivPakke({ status: "ACTIVE", currentPeriodEnd: null }, NOW), true);
  assert.equal(harAktivPakke({ status: "TRIALING", currentPeriodEnd: null }, NOW), true);
});

test("harAktivPakke: CANCELLED med resttid er fortsatt betalt (regelen fra 2026-07-13)", () => {
  assert.equal(harAktivPakke({ status: "CANCELLED", currentPeriodEnd: FREMTID }, NOW), true);
});

test("harAktivPakke: CANCELLED uten resttid, PAST_DUE og null er ikke betalt", () => {
  assert.equal(harAktivPakke({ status: "CANCELLED", currentPeriodEnd: FORTID }, NOW), false);
  assert.equal(harAktivPakke({ status: "CANCELLED", currentPeriodEnd: null }, NOW), false);
  assert.equal(harAktivPakke({ status: "PAST_DUE", currentPeriodEnd: FREMTID }, NOW), false);
  assert.equal(harAktivPakke(null, NOW), false);
});

test("girPlayerHqTilgang: anker-rad (plan null) gir ALDRI tilgang", () => {
  assert.equal(
    girPlayerHqTilgang(
      { status: "ACTIVE", currentPeriodEnd: null, plan: null, stripeSubscriptionId: null },
      NOW,
    ),
    false,
  );
});

test("girPlayerHqTilgang: MANUELL krever ACTIVE", () => {
  const base = { currentPeriodEnd: null, plan: "MANUELL", stripeSubscriptionId: null };
  assert.equal(girPlayerHqTilgang({ ...base, status: "ACTIVE" }, NOW), true);
  assert.equal(girPlayerHqTilgang({ ...base, status: "CANCELLED" }, NOW), false);
});

test("girPlayerHqTilgang: Stripe-plan uten stripeSubscriptionId gir ikke tilgang", () => {
  assert.equal(
    girPlayerHqTilgang(
      { status: "ACTIVE", currentPeriodEnd: null, plan: "PLAYERHQ_MND", stripeSubscriptionId: null },
      NOW,
    ),
    false,
  );
});

test("girPlayerHqTilgang: Stripe-plan følger harAktivPakke (inkl. TRIALING-broen og CANCELLED med resttid)", () => {
  const base = { plan: "PLAYERHQ_AAR", stripeSubscriptionId: "sub_1" };
  assert.equal(girPlayerHqTilgang({ ...base, status: "ACTIVE", currentPeriodEnd: null }, NOW), true);
  assert.equal(girPlayerHqTilgang({ ...base, status: "TRIALING", currentPeriodEnd: null }, NOW), true);
  assert.equal(girPlayerHqTilgang({ ...base, status: "CANCELLED", currentPeriodEnd: FREMTID }, NOW), true);
  assert.equal(girPlayerHqTilgang({ ...base, status: "CANCELLED", currentPeriodEnd: FORTID }, NOW), false);
});

test("pakkeNavn: 4+ = Performance Pro, 1-3 = Performance, 0 = null", () => {
  assert.equal(pakkeNavn(4), "Performance Pro");
  assert.equal(pakkeNavn(2), "Performance");
  assert.equal(pakkeNavn(0), null);
});

test("planNavn dekker alle planene og gir null for ukjent/null", () => {
  assert.equal(planNavn("PLAYERHQ_MND"), "PlayerHQ månedlig");
  assert.equal(planNavn("PLAYERHQ_AAR"), "PlayerHQ årlig");
  assert.equal(planNavn("PERFORMANCE_PRO"), "Performance Pro");
  assert.equal(planNavn(null), null);
});

test("prisene er kanon: 299/mnd, 2 690/år, 898 kr spart («tre måneder gratis»)", () => {
  assert.equal(PLAYERHQ_PRIS_MND_ORE, 29_900);
  assert.equal(PLAYERHQ_PRIS_AAR_ORE, 269_000);
  assert.equal(PLAYERHQ_AAR_BESPARELSE_ORE, 89_800);
  // «Tre måneder gratis»: 9 måneder dekker årsprisen (299 × 9 = 2 691 ≈ 2 690).
  assert.ok(PLAYERHQ_PRIS_AAR_ORE <= PLAYERHQ_PRIS_MND_ORE * 9);
});

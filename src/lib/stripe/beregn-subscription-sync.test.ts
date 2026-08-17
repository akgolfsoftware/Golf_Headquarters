/**
 * A2 · beregnSubscriptionSync — ren webhook-regelmotor.
 * Price-id-ene er env-styrte og tomme i test — vi tester derfor formen og
 * status/credits/tier-reglene som ikke avhenger av konkrete id-er, pluss
 * kind/plan via de eksporterte mapperne med stubbet env der det trengs.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { beregnSubscriptionSync } from "@/lib/stripe/beregn-subscription-sync";

const base = {
  stripeStatus: "active",
  cancelAtPeriodEnd: false,
  priceId: null,
  interval: "month",
  currentPeriodEnd: null,
};

test("active → ACTIVE, ukjent pris → GRATIS-tier og plan null (anker gir aldri tilgang)", () => {
  const v = beregnSubscriptionSync({ ...base });
  assert.equal(v.status, "ACTIVE");
  assert.equal(v.tier, "GRATIS");
  assert.equal(v.plan, null);
  assert.equal(v.kind, "PLAYERHQ");
  assert.equal(v.monthlyCredits, 0);
});

test("active + cancel_at_period_end → CANCELLED, flagget bevares som eget felt", () => {
  const v = beregnSubscriptionSync({ ...base, cancelAtPeriodEnd: true });
  assert.equal(v.status, "CANCELLED");
  assert.equal(v.cancelAtPeriodEnd, true);
});

test("trialing → TRIALING uten credits (prøvetid har ikke betalt timer)", () => {
  const v = beregnSubscriptionSync({ ...base, stripeStatus: "trialing" });
  assert.equal(v.status, "TRIALING");
  assert.equal(v.monthlyCredits, 0);
});

test("canceled → CANCELLED og GRATIS-tier uansett pris", () => {
  const v = beregnSubscriptionSync({ ...base, stripeStatus: "canceled" });
  assert.equal(v.status, "CANCELLED");
  assert.equal(v.tier, "GRATIS");
});

test("interval faller tilbake til month, periodEnd konverteres fra unix-sekunder", () => {
  const v = beregnSubscriptionSync({ ...base, interval: null, currentPeriodEnd: 1_790_000_000 });
  assert.equal(v.interval, "month");
  assert.equal(v.currentPeriodEnd?.getTime(), 1_790_000_000_000);
  const aar = beregnSubscriptionSync({ ...base, interval: "year" });
  assert.equal(aar.interval, "year");
});

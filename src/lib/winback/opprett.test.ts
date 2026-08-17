/**
 * A4 · Vinn-tilbake-guarden: tilbudet skal ikke opprettes når spilleren
 * allerede har et eget PlayerHQ-abonnement som gir tilgang.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { harBlokkerendePlayerHqAbonnement } from "@/lib/winback/opprett";

test("ingen rad eller anker-rad (plan null) blokkerer ikke", () => {
  assert.equal(harBlokkerendePlayerHqAbonnement(null), false);
  assert.equal(
    harBlokkerendePlayerHqAbonnement({ plan: null, status: "ACTIVE", stripeSubscriptionId: null }),
    false,
  );
});

test("aktivt Stripe-abonnement og aktiv MANUELL-rad blokkerer", () => {
  assert.equal(
    harBlokkerendePlayerHqAbonnement({ plan: "PLAYERHQ_MND", status: "ACTIVE", stripeSubscriptionId: "sub_1" }),
    true,
  );
  assert.equal(
    harBlokkerendePlayerHqAbonnement({ plan: "PLAYERHQ_AAR", status: "TRIALING", stripeSubscriptionId: "sub_2" }),
    true,
  );
  assert.equal(
    harBlokkerendePlayerHqAbonnement({ plan: "MANUELL", status: "ACTIVE", stripeSubscriptionId: null }),
    true,
  );
});

test("kansellert/utløpt PlayerHQ blokkerer ikke — da SKAL tilbudet komme", () => {
  assert.equal(
    harBlokkerendePlayerHqAbonnement({ plan: "PLAYERHQ_MND", status: "CANCELLED", stripeSubscriptionId: "sub_3" }),
    false,
  );
  assert.equal(
    harBlokkerendePlayerHqAbonnement({ plan: "PLAYERHQ_MND", status: "ACTIVE", stripeSubscriptionId: null }),
    false,
  );
});

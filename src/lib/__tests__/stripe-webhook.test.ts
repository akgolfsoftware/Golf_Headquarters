/**
 * Unit-test: Stripe webhook signature-verifisering.
 *
 * Kjøres med node:test + tsx:
 *   npx tsx --test src/lib/__tests__/stripe-webhook.test.ts
 *
 * Verifiserer at:
 *  1. `stripe.webhooks.constructEvent` aksepterer en gyldig signatur generert
 *     med riktig secret og returnerer parset event.
 *  2. Ugyldig signatur (feil secret eller tuklet body) kaster feil.
 *
 * Ingen nettverkskall. Bruker Stripe-SDK sin egen signatur-utils
 * (`stripe.webhooks.generateTestHeaderString`) for å produsere realistisk
 * signatur uten å trenge live nøkler.
 */

import test from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";

const TEST_SECRET = "whsec_test_secret_for_unit_tests_only";

const sampleEvent = {
  id: "evt_test_1",
  object: "event",
  type: "customer.subscription.created",
  data: {
    object: {
      id: "sub_test_1",
      object: "subscription",
      status: "active",
      metadata: { userId: "user-123" },
      items: { data: [{ price: { id: "price_abc" }, current_period_end: 0 } ] },
      customer: "cus_test",
    },
  },
};

function makeStripe(): Stripe {
  // Dummy API-key — vi kaller ikke nettverk, bare crypto-utils.
  return new Stripe("sk_test_dummy_for_unit_tests", {
    apiVersion: "2026-04-22.dahlia",
  });
}

test("constructEvent aksepterer gyldig signatur og returnerer parset event", () => {
  const stripe = makeStripe();
  const payload = JSON.stringify(sampleEvent);
  const header = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: TEST_SECRET,
  });

  const event = stripe.webhooks.constructEvent(payload, header, TEST_SECRET);

  assert.equal(event.id, "evt_test_1");
  assert.equal(event.type, "customer.subscription.created");
});

test("constructEvent kaster ved ugyldig signatur (feil secret)", () => {
  const stripe = makeStripe();
  const payload = JSON.stringify(sampleEvent);
  const header = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: TEST_SECRET,
  });

  assert.throws(
    () =>
      stripe.webhooks.constructEvent(payload, header, "whsec_wrong_secret"),
    /signature/i,
    "feil secret skal kaste signature-feil",
  );
});

test("constructEvent kaster ved tuklet body", () => {
  const stripe = makeStripe();
  const payload = JSON.stringify(sampleEvent);
  const header = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: TEST_SECRET,
  });

  const tamperedPayload = payload.replace("user-123", "user-999");

  assert.throws(
    () =>
      stripe.webhooks.constructEvent(tamperedPayload, header, TEST_SECRET),
    /signature/i,
    "endret body skal kaste signature-feil",
  );
});

test("constructEvent kaster med tom signatur-header", () => {
  const stripe = makeStripe();
  const payload = JSON.stringify(sampleEvent);

  assert.throws(
    () => stripe.webhooks.constructEvent(payload, "", TEST_SECRET),
    /signature/i,
  );
});

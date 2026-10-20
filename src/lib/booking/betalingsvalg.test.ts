import { it } from "node:test";
import assert from "node:assert/strict";
import { bookingBetaling } from "./betalingsvalg";

it("Stripe: tjenestens pris, merket STRIPE, uten abonnement", () => {
  assert.deepEqual(bookingBetaling("STRIPE", 95000, null), { priceOre: 95000, paymentMethod: "STRIPE", subscriptionId: null, giftCardOre: 0 });
});

it("Klipp: pris 0 og pakken, krever pakke", () => {
  assert.deepEqual(bookingBetaling("KLIPP", 95000, "sub-1"), { priceOre: 0, paymentMethod: "KLIPP", subscriptionId: "sub-1", giftCardOre: 0 });
  assert.throws(() => bookingBetaling("KLIPP", 95000, null));
});

it("Faktura og Gratis", () => {
  assert.equal(bookingBetaling("FAKTURA", 95000, null).priceOre, 95000);
  assert.equal(bookingBetaling("GRATIS", 95000, null).priceOre, 0);
});

it("Gavekort: dekker alt gir betalt booking, delvis gir Stripe-rest, uten saldo kastes", () => {
  assert.deepEqual(bookingBetaling("GAVEKORT", 95000, null, 95000), { priceOre: 0, paymentMethod: "GAVEKORT", subscriptionId: null, giftCardOre: 95000 });
  assert.deepEqual(bookingBetaling("GAVEKORT", 95000, null, 40000), { priceOre: 55000, paymentMethod: "STRIPE", subscriptionId: null, giftCardOre: 40000 });
  assert.throws(() => bookingBetaling("GAVEKORT", 95000, null, 0));
});

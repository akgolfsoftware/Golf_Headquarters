import { it } from "node:test";
import assert from "node:assert/strict";
import { bookingBetaling } from "./betalingsvalg";

it("Stripe: tjenestens pris, merket STRIPE, uten abonnement", () => {
  assert.deepEqual(bookingBetaling("STRIPE", 95000, null), { priceOre: 95000, paymentMethod: "STRIPE", subscriptionId: null });
});

it("Klipp: pris 0 og pakken, krever pakke", () => {
  assert.deepEqual(bookingBetaling("KLIPP", 95000, "sub-1"), { priceOre: 0, paymentMethod: "KLIPP", subscriptionId: "sub-1" });
  assert.throws(() => bookingBetaling("KLIPP", 95000, null));
});

it("Faktura og Gratis", () => {
  assert.equal(bookingBetaling("FAKTURA", 95000, null).priceOre, 95000);
  assert.equal(bookingBetaling("GRATIS", 95000, null).priceOre, 0);
});

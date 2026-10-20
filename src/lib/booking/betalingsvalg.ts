/**
 * Betalingsvalg når coach lager en booking (Anders 29.09.2026). Ren funksjon:
 * hvilken pris, betalingsmåte og hvilket abonnement bookingen får.
 *
 * - KLIPP: ett klipp fra coaching-pakken. Pris 0 (samme som createCreditBooking),
 *   subscriptionId peker på pakken.
 * - FAKTURA: tjenestens pris, merket FAKTURA («skal faktureres»). Fakturaen lages
 *   i Tripletex av Anders; appen sender ingen faktura.
 * - GRATIS: pris 0.
 * - STRIPE (natt 17.10): tjenestens pris, merket STRIPE («betales med kort»).
 *   Coachen får en Stripe-betalingslenke (coach-betalingslenke.ts); bookingen står som
 *   «Ikke betalt» til webhooken melder betalingen.
 * - GAVEKORT (bookingplanen steg 7): gavekortet dekker `gavekortDekningOre` av prisen. Dekker det alt,
 *   er bookingen betalt (GAVEKORT, pris 0). Ellers er resten en vanlig Stripe-betaling (STRIPE,
 *   betalingslenke) med gavekortdelen i `giftCardOre`.
 * - Ikke valgt: som før — tjenestens pris, ingen betalingsmåte.
 */
import type { BookingPaymentMethod } from "@/generated/prisma/enums";

export type CoachBetaling = "STRIPE" | "KLIPP" | "FAKTURA" | "GRATIS" | "GAVEKORT";

export function bookingBetaling(
  valg: CoachBetaling | undefined,
  tjenestePrisOre: number,
  klippAbonnementId: string | null,
  gavekortDekningOre = 0,
): { priceOre: number; paymentMethod: BookingPaymentMethod | null; subscriptionId: string | null; giftCardOre: number } {
  if (valg === "GAVEKORT") {
    if (gavekortDekningOre <= 0) throw new Error("Gavekort krever en gyldig kode med saldo.");
    const rest = Math.max(tjenestePrisOre - gavekortDekningOre, 0);
    return { priceOre: rest, paymentMethod: rest === 0 ? "GAVEKORT" : "STRIPE", subscriptionId: null, giftCardOre: Math.min(gavekortDekningOre, tjenestePrisOre) };
  }
  if (valg === "KLIPP") {
    if (!klippAbonnementId) throw new Error("Klipp krever en coaching-pakke.");
    return { priceOre: 0, paymentMethod: "KLIPP", subscriptionId: klippAbonnementId, giftCardOre: 0 };
  }
  if (valg === "FAKTURA") return { priceOre: tjenestePrisOre, paymentMethod: "FAKTURA", subscriptionId: null, giftCardOre: 0 };
  if (valg === "STRIPE") return { priceOre: tjenestePrisOre, paymentMethod: "STRIPE", subscriptionId: null, giftCardOre: 0 };
  if (valg === "GRATIS") return { priceOre: 0, paymentMethod: "GRATIS", subscriptionId: null, giftCardOre: 0 };
  return { priceOre: tjenestePrisOre, paymentMethod: null, subscriptionId: null, giftCardOre: 0 };
}

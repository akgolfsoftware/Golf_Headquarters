/**
 * Betalingsvalg når coach lager en booking (Anders 29.09.2026). Ren funksjon:
 * hvilken pris, betalingsmåte og hvilket abonnement bookingen får.
 *
 * - KLIPP: ett klipp fra coaching-pakken. Pris 0 (samme som createCreditBooking),
 *   subscriptionId peker på pakken.
 * - FAKTURA: tjenestens pris, merket FAKTURA («skal faktureres»). Fakturaen lages
 *   i Tripletex av Anders; appen sender ingen faktura.
 * - GRATIS: pris 0.
 * - Ikke valgt: som før — tjenestens pris, ingen betalingsmåte.
 */
import type { BookingPaymentMethod } from "@/generated/prisma/enums";

export type CoachBetaling = "KLIPP" | "FAKTURA" | "GRATIS";

export function bookingBetaling(
  valg: CoachBetaling | undefined,
  tjenestePrisOre: number,
  klippAbonnementId: string | null,
): { priceOre: number; paymentMethod: BookingPaymentMethod | null; subscriptionId: string | null } {
  if (valg === "KLIPP") {
    if (!klippAbonnementId) throw new Error("Klipp krever en coaching-pakke.");
    return { priceOre: 0, paymentMethod: "KLIPP", subscriptionId: klippAbonnementId };
  }
  if (valg === "FAKTURA") return { priceOre: tjenestePrisOre, paymentMethod: "FAKTURA", subscriptionId: null };
  if (valg === "GRATIS") return { priceOre: 0, paymentMethod: "GRATIS", subscriptionId: null };
  return { priceOre: tjenestePrisOre, paymentMethod: null, subscriptionId: null };
}

"use server";

/**
 * Bookingplanen steg 4: coachen angrer en no-show. Går samme vei som avlysning fra coach
 * (`avlysBookingSomCoach`): klippet føres tilbake, eller hele beløpet refunderes.
 * Bookingen blir «Avlyst», og kunden får avlysnings-e-posten med riktig utfall.
 * Egen fil, så oppfølgingshandlingene ikke drar med seg Stripe-kjeden.
 */

import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { coachBookingScope } from "@/lib/auth/booking-scope";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { avlysBookingSomCoach, type AvlysResultat } from "./actions";

/** Angrer en no-show: klipp tilbake eller full refusjon, som ved avlysning fra coach. */
export async function overstyrNoShow(bookingId: string): Promise<AvlysResultat> {
  const user = await requireCoachActionUser();
  if (!bookingId) return { ok: false, feil: "Ugyldig booking." };
  const funnet = await prisma.booking.findFirst({
    where: { id: bookingId, ...coachBookingScope(user), status: "NO_SHOW" },
    select: { id: true },
  });
  if (!funnet) return { ok: false, feil: "Fant ikke en no-show å overstyre." };
  const res = await avlysBookingSomCoach({ bookingId, begrunnelse: "No-show overstyrt av coach" });
  if (res.ok) await audit({ actorId: user.id, action: "booking.no-show.overridden", target: `Booking:${bookingId}` });
  return res;
}

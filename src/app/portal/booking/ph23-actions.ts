"use server";

/**
 * Server-actions for PH-23 Booking (/portal/booking og /portal/meg/bookinger).
 *
 * Ingen egen bookinglogikk: alt går til de eksisterende flytene.
 * - Klipp: createCreditBooking (CONFIRMED, atomisk trekk fra coaching-pakken).
 * - Kort: opprettBookingMedKort (PENDING → Stripe Checkout → webhooken bekrefter).
 * - Flytt: rescheduleBooking (24t-regel, ledighetssjekk, kalender og e-post).
 * - Ledige tider: beregnSlotVindu (availability-engine).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { createCreditBooking } from "@/lib/booking/credit-booking";
import { opprettBookingMedKort } from "@/app/portal/booking/actions";
import { rescheduleBooking } from "@/app/portal/meg/bookinger/actions";
import { beregnSlotVindu } from "@/lib/portal-booking/slot-vindu";
import {
  bekreftPH23Booking,
  byggSlotData,
  type PH23BekreftResultat,
  type PH23BekreftValg,
  type PH23SlotDetalj,
} from "@/lib/portal-booking/ph23-booking-data";

export async function bekreftPH23BookingAction(valg: PH23BekreftValg): Promise<PH23BekreftResultat> {
  await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });
  return bekreftPH23Booking(valg, {
    opprettMedKlipp: createCreditBooking,
    opprettMedKort: opprettBookingMedKort,
  });
}

export async function hentPH23Slots(serviceTypeId: string): Promise<ReturnType<typeof byggSlotData>> {
  await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });
  return byggSlotData(await beregnSlotVindu(serviceTypeId, 14));
}

export async function flyttPH23Booking(
  bookingId: string,
  slot: PH23SlotDetalj,
): Promise<{ ok: true } | { ok: false; grunn: string }> {
  await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });
  try {
    await rescheduleBooking({ bookingId, newStartIso: slot.startIso, newCoachId: slot.coachId });
    return { ok: true };
  } catch (err) {
    return { ok: false, grunn: err instanceof Error ? err.message : "Kunne ikke flytte timen." };
  }
}

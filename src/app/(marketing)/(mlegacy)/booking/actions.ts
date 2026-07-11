"use server";

/**
 * Booking-actions tilgjengelig fra marketing-flyten (kvittering, avbestillings-lenke).
 *
 * - cancelBooking: avbestill med Stripe-refusjon. Krever > 24t til startAt.
 * - rescheduleBooking: flytt booking til ny tid (forutsetter ledig slot).
 *
 * Begge returnerer Q10-standarden `{ ok, error? }`.
 */

import { prisma } from "@/lib/prisma";
import { stripeKlient } from "@/lib/stripe";
import { audit } from "@/lib/audit";
import { isSlotStillAvailable } from "@/lib/booking/availability";
import {
  sendBookingCancellation,
  sendBookingRescheduled,
} from "@/lib/email/booking-emails";

const TIMER_MS = 60 * 60 * 1000;
const AVBESTILLINGS_VINDU_MS = 24 * TIMER_MS;

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Avbestill en booking. Regel: må gjøres > 24t før startAt.
 *
 * Steg:
 *   1. Hent booking og valider status + tidsvindu
 *   2. Refunder via Stripe (hvis paymentIntent finnes)
 *   3. Oppdater booking til CANCELLED
 *   4. Send avbestillings-e-post
 */
export async function cancelBooking(bookingId: string): Promise<ActionResult> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) {
      return { ok: false, error: "Booking ikke funnet." };
    }

    if (booking.status === "CANCELLED") {
      return { ok: false, error: "Booking er allerede avbestilt." };
    }
    if (booking.status === "COMPLETED") {
      return { ok: false, error: "Booking er allerede gjennomført." };
    }

    const now = Date.now();
    const tidTilStart = booking.startAt.getTime() - now;
    if (tidTilStart < AVBESTILLINGS_VINDU_MS) {
      return {
        ok: false,
        error:
          "Avbestilling må gjøres senest 24 timer før timen. Ta kontakt på post@akgolf.no.",
      };
    }

    // Refunder via Stripe hvis kort-betaling
    let refundIssued = false;
    if (booking.stripePaymentIntentId) {
      try {
        const stripe = stripeKlient();
        await stripe.refunds.create({
          payment_intent: booking.stripePaymentIntentId,
          reason: "requested_by_customer",
        });
        refundIssued = true;
      } catch (err) {
        console.error("[cancelBooking] Stripe refund feilet", err);
        return {
          ok: false,
          error: "Refusjon feilet. Kontakt post@akgolf.no — vi ordner det.",
        };
      }
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    await audit({
      actorId: booking.userId ?? null,
      action: "booking.cancelled",
      target: `Booking:${bookingId}`,
      metadata: { refundIssued, hoursBeforeStart: tidTilStart / TIMER_MS },
    });

    try {
      await sendBookingCancellation(bookingId, { refundIssued });
    } catch (err) {
      // Ikke fail action hvis kun e-post feiler — bookingen er allerede kansellert.
      console.error("[cancelBooking] e-post feilet", err);
    }

    return { ok: true };
  } catch (err) {
    console.error("[cancelBooking]", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Ukjent feil.",
    };
  }
}

/**
 * Flytt en booking til ny start-tid. Krever at det nye slottet er ledig.
 * Sender e-post om ny tid. Tar ikke ny betaling — beholder eksisterende
 * stripePaymentIntent.
 */
export async function rescheduleBooking(
  bookingId: string,
  newStartAt: Date,
): Promise<ActionResult> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { serviceType: true },
    });
    if (!booking) return { ok: false, error: "Booking ikke funnet." };

    if (booking.status === "CANCELLED") {
      return { ok: false, error: "Avbestilt booking kan ikke flyttes." };
    }
    if (booking.status === "COMPLETED") {
      return { ok: false, error: "Gjennomført booking kan ikke flyttes." };
    }

    if (isNaN(newStartAt.getTime())) {
      return { ok: false, error: "Ugyldig tidspunkt." };
    }
    if (newStartAt.getTime() < Date.now() + TIMER_MS) {
      return { ok: false, error: "Ny tid må være minst 1 time fram i tid." };
    }

    // Bruk ekte coach-id fra bookingen (denormalisert på Booking-modellen).
    // Tom streng kun hvis bookingen aldri hadde en coach tilknyttet — da er
    // det ingen kalender å sjekke mot uansett, DB-konflikt fanges fortsatt.
    const coachId = booking.coachId ?? "";
    const slotOk = await isSlotStillAvailable(
      booking.serviceTypeId,
      newStartAt,
      coachId,
    );
    if (!slotOk) {
      return {
        ok: false,
        error: "Den nye tiden er ikke ledig. Velg en annen tid.",
      };
    }

    const oldStartAt = booking.startAt;
    const newEndAt = new Date(
      newStartAt.getTime() + booking.serviceType.durationMin * 60_000,
    );

    await prisma.booking.update({
      where: { id: bookingId },
      data: { startAt: newStartAt, endAt: newEndAt },
    });

    await audit({
      actorId: booking.userId ?? null,
      action: "booking.rescheduled",
      target: `Booking:${bookingId}`,
      metadata: {
        oldStartAt: oldStartAt.toISOString(),
        newStartAt: newStartAt.toISOString(),
      },
    });

    try {
      await sendBookingRescheduled(bookingId, oldStartAt);
    } catch (err) {
      console.error("[rescheduleBooking] e-post feilet", err);
    }

    return { ok: true };
  } catch (err) {
    console.error("[rescheduleBooking]", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Ukjent feil.",
    };
  }
}

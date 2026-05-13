"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { stripeKlient } from "@/lib/stripe";
import { audit } from "@/lib/audit";
import { pushBookingToCalendar, removeFromCalendar } from "@/lib/google-calendar";
import { isSlotStillAvailable } from "@/lib/booking/availability";

export async function cancelBooking(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { serviceType: { select: { coachUserId: true } } },
  });
  if (!booking) throw new Error("not-found");

  const erStaff = user.role === "ADMIN" || user.role === "COACH";
  if (booking.userId !== user.id && !erStaff) {
    throw new Error("forbidden");
  }
  if (booking.status === "CANCELLED") return;

  const tidTilStart = booking.startAt.getTime() - Date.now();
  // Spillere: 24t-regel. Staff (COACH/ADMIN) kan refundere uansett tid.
  const kanRefunderes = erStaff || tidTilStart > 24 * 60 * 60 * 1000;

  // Refunder via Stripe hvis berettiget og PaymentIntent finnes.
  if (kanRefunderes && booking.stripePaymentIntentId) {
    try {
      const stripe = stripeKlient();
      await stripe.refunds.create({
        payment_intent: booking.stripePaymentIntentId,
        reason: "requested_by_customer",
        metadata: { bookingId: booking.id },
      });
    } catch (err) {
      console.error("[cancel-booking] Stripe refund failed", err);
      // Fortsetter — vi avbestiller uansett, refusjon kan tas manuelt.
    }
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  // Credit-tilbakeføring: hvis bookingen var trukket fra Academy-abonnement
  // OG den er avbestilt med refundabel-rett (>24t for spillere, alltid for staff)
  // — øk creditsRemaining med 1.
  let creditRefunded = false;
  if (booking.subscriptionId && kanRefunderes) {
    try {
      await prisma.subscription.update({
        where: { id: booking.subscriptionId },
        data: { creditsRemaining: { increment: 1 } },
      });
      creditRefunded = true;
    } catch (err) {
      console.error("[cancel-booking] credit-refund failed", err);
    }
  }

  // Slett event fra Google Calendar hvis pushet (best-effort)
  if (booking.googleEventId && booking.serviceType.coachUserId) {
    try {
      await removeFromCalendar(
        booking.serviceType.coachUserId,
        booking.googleEventId,
      );
    } catch (err) {
      console.error("[cancel-booking] calendar-remove failed", err);
    }
  }

  await audit({
    actorId: user.id,
    action: creditRefunded ? "booking.cancelled.credit-refunded" : "booking.cancelled",
    target: `Booking:${bookingId}`,
    metadata: {
      stripeRefunded: kanRefunderes && !!booking.stripePaymentIntentId,
      creditRefunded,
      subscriptionId: booking.subscriptionId,
      tidTilStartMs: tidTilStart,
    },
  });

  // Send avbestillings-e-post (best-effort)
  try {
    const { sendBookingCancellation } = await import("@/lib/email/booking-emails");
    await sendBookingCancellation(bookingId);
  } catch (err) {
    console.error("[cancel-booking] e-post-feil", err);
  }

  revalidatePath("/portal/meg/bookinger");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");
}

/**
 * Reschedule (bytt tid) på eksisterende booking.
 * Regler:
 * - Krever >24t igjen til opprinnelig starttidspunkt (samme som refund-policy).
 * - Ny slot må være ledig og innenfor coachens tilgjengelighet.
 * - Beholder coach, lokasjon, service, pris, evt. subscriptionId.
 * - Oppdaterer Google Calendar-event hvis pushet.
 * - Booking-status forblir CONFIRMED.
 */
export async function rescheduleBooking(input: {
  bookingId: string;
  newStartIso: string;
  newCoachId: string;
}): Promise<{ ok: true }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    include: { serviceType: { select: { id: true, durationMin: true, coachUserId: true } } },
  });
  if (!booking) throw new Error("not-found");

  const erStaff = user.role === "ADMIN" || user.role === "COACH";
  if (booking.userId !== user.id && !erStaff) {
    throw new Error("forbidden");
  }
  if (booking.status === "CANCELLED") {
    throw new Error("Avbestilt booking kan ikke flyttes — book ny tid.");
  }

  // Sjekk 24t-regel (staff slipper)
  const tidTilStart = booking.startAt.getTime() - Date.now();
  if (!erStaff && tidTilStart <= 24 * 60 * 60 * 1000) {
    throw new Error(
      "Du kan bare flytte timer som er mer enn 24 timer fram i tid.",
    );
  }

  const newStart = new Date(input.newStartIso);
  if (isNaN(newStart.getTime())) throw new Error("Ugyldig dato.");
  if (newStart.getTime() <= Date.now()) {
    throw new Error("Ny tid må være i framtiden.");
  }

  // Sjekk slot ledig (inkludert Calendar busy-times)
  const ok = await isSlotStillAvailable(
    booking.serviceType.id,
    newStart,
    input.newCoachId,
  );
  if (!ok) {
    throw new Error(
      "Tiden er ikke ledig. Velg en annen tid.",
    );
  }

  const newEnd = new Date(
    newStart.getTime() + booking.serviceType.durationMin * 60_000,
  );

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      startAt: newStart,
      endAt: newEnd,
    },
  });

  // Oppdater Google Calendar-event (push bruker eksisterende googleEventId)
  if (booking.googleEventId) {
    try {
      await pushBookingToCalendar(booking.id);
    } catch (err) {
      console.error("[reschedule] calendar push failed", err);
    }
  }

  await audit({
    actorId: user.id,
    action: "booking.rescheduled",
    target: `Booking:${booking.id}`,
    metadata: {
      gammelStart: booking.startAt.toISOString(),
      nyStart: newStart.toISOString(),
      coachId: input.newCoachId,
    },
  });

  // Send oppdaterings-e-post (best-effort)
  try {
    const { sendBookingConfirmation } = await import("@/lib/email/booking-emails");
    await sendBookingConfirmation(booking.id);
  } catch (err) {
    console.error("[reschedule] confirmation-email failed", err);
  }

  revalidatePath("/portal/meg/bookinger");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");

  return { ok: true };
}

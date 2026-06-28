"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { stripeKlient } from "@/lib/stripe";
import { audit } from "@/lib/audit";
import { pushBookingToCalendar, removeFromCalendar } from "@/lib/google-calendar";
import { isSlotStillAvailable } from "@/lib/booking/availability";
import { notify } from "@/lib/notifications";
import { isoDate } from "@/lib/validation/schemas";

const CancelBookingSchema = z.object({
  bookingId: z.string().min(1, "Booking-ID er påkrevd"),
});

const RescheduleBookingSchema = z.object({
  bookingId: z.string().min(1, "Booking-ID er påkrevd"),
  newStartIso: isoDate,
  newCoachId: z.string().min(1, "Coach er påkrevd"),
});

export async function cancelBooking(bookingId: string) {
  CancelBookingSchema.parse({ bookingId });
  const user = await requireConsentingUser();

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
  // S-19: spor om refund faktisk lyktes — ikke tier stille ved feil.
  let stripeRefundOk = false;
  let stripeRefundFeilet = false;
  if (kanRefunderes && booking.stripePaymentIntentId) {
    try {
      const stripe = stripeKlient();
      await stripe.refunds.create({
        payment_intent: booking.stripePaymentIntentId,
        reason: "requested_by_customer",
        metadata: { bookingId: booking.id },
      });
      stripeRefundOk = true;
    } catch (err) {
      stripeRefundFeilet = true;
      console.error("[cancel-booking] Stripe refund failed", err);
      // S-19: Legg inn WebhookFailure slik at admin ser det i dashbordet
      // og kan behandle refund manuelt. Best-effort — ikke blokker avbestilling.
      try {
        await prisma.webhookFailure.create({
          data: {
            webhookSource: "stripe-refund",
            eventId: `cancel-${booking.id}-${Date.now()}`,
            payload: {
              bookingId: booking.id,
              paymentIntentId: booking.stripePaymentIntentId,
              userId: booking.userId,
            },
            errorMessage: err instanceof Error ? err.message : "ukjent feil",
            status: "PENDING",
          },
        });
      } catch (dbErr) {
        console.error("[cancel-booking] klarte ikke logge WebhookFailure", dbErr);
      }
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

  // S-19: bruk riktig action-navn basert på faktisk refund-resultat
  const auditAction = stripeRefundFeilet
    ? "booking.cancelled.refund-failed"
    : creditRefunded
      ? "booking.cancelled.credit-refunded"
      : "booking.cancelled";

  await audit({
    actorId: user.id,
    action: auditAction,
    target: `Booking:${bookingId}`,
    metadata: {
      stripeRefunded: stripeRefundOk,
      stripeRefundFeilet,
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

  // In-app-varsel til spilleren som eier bookingen
  // S-19: vær ærlig om refund-status
  const tidStr = booking.startAt.toLocaleString("nb-NO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  if (booking.userId) {
    let refundTekst: string;
    if (creditRefunded) {
      refundTekst = "Credit returnert.";
    } else if (stripeRefundFeilet) {
      refundTekst = "Refundering feilet — vi behandler den manuelt innen 24 timer.";
    } else if (stripeRefundOk) {
      refundTekst = "Refusjon underveis.";
    } else if (!kanRefunderes) {
      refundTekst = "Mindre enn 24t igjen — ingen refusjon.";
    } else {
      refundTekst = "";
    }

    await notify({
      userId: booking.userId,
      type: "booking",
      title: "Booking avbestilt",
      body: `${tidStr}.${refundTekst ? " " + refundTekst : ""}`,
      link: "/portal/meg/bookinger",
    });
  }

  revalidatePath("/portal/meg/bookinger");
  revalidatePath("/admin/bookinger");
  revalidatePath("/admin/kalender");
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
  RescheduleBookingSchema.parse(input);
  const user = await requireConsentingUser();

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

  // In-app-varsel
  const nyTidStr = newStart.toLocaleString("nb-NO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  if (booking.userId) {
    await notify({
      userId: booking.userId,
      type: "booking",
      title: "Booking flyttet",
      body: `Ny tid: ${nyTidStr}.`,
      link: "/portal/meg/bookinger",
    });
  }

  revalidatePath("/portal/meg/bookinger");
  revalidatePath("/admin/bookinger");
  revalidatePath("/admin/kalender");

  return { ok: true };
}

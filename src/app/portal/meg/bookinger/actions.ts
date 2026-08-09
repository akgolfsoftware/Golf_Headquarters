"use server";

import { z } from "zod";
import { sjekkKollisjon, erKollisjonsfeil, kollisjonsmelding } from "@/lib/booking/kollisjonsvern";
import { revalidatePath } from "next/cache";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { stripeKlient } from "@/lib/stripe";
import { audit } from "@/lib/audit";
import { pushBooking, fjernBooking } from "@/lib/google-calendar-kilder";
import { isSlotStillAvailable } from "@/lib/booking/availability";
import { notify } from "@/lib/notifications";
import { isoDate } from "@/lib/validation/schemas";
import { logError } from "@/lib/error-tracking";
import { actorFromRole, cancelOutcome, rescheduleOutcome } from "@/lib/booking/policy";
import { recordBookingMetric } from "@/lib/booking/metrics";

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

  const actor = actorFromRole(user.id, user.role);
  const outcome = cancelOutcome(
    {
      id: booking.id,
      userId: booking.userId,
      coachId: booking.coachId,
      serviceCoachUserId: booking.serviceType.coachUserId,
      startAt: booking.startAt,
      status: booking.status,
      subscriptionId: booking.subscriptionId,
      stripePaymentIntentId: booking.stripePaymentIntentId,
      priceOre: booking.priceOre,
    },
    actor,
  );
  if (!outcome.allowed) {
    if (booking.status === "CANCELLED") return;
    if (outcome.reasonIfDenied?.includes("tilgang")) throw new Error("forbidden");
    throw new Error(outcome.reasonIfDenied ?? "forbidden");
  }

  // Refunder via Stripe hvis berettiget og PaymentIntent finnes.
  // S-19: spor om refund faktisk lyktes — ikke tier stille ved feil.
  let stripeRefundOk = false;
  let stripeRefundFeilet = false;
  if (outcome.refundStripe && booking.stripePaymentIntentId) {
    try {
      const stripe = stripeKlient();
      await stripe.refunds.create({
        payment_intent: booking.stripePaymentIntentId,
        reason: "requested_by_customer",
        metadata: { bookingId: booking.id },
      });
      stripeRefundOk = true;
    } catch (error) {
      stripeRefundFeilet = true;
      await logError({
        context: "booking.cancel.stripeRefund",
        error,
        meta: { userId: user.id, bookingId, paymentIntentId: booking.stripePaymentIntentId },
      });
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
            errorMessage: error instanceof Error ? error.message : "ukjent feil",
            status: "PENDING",
          },
        });
      } catch (dbError) {
        await logError({
          context: "booking.cancel.webhookFailureLogg",
          error: dbError,
          meta: { userId: user.id, bookingId },
          severity: "warn",
        });
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
  if (booking.subscriptionId && outcome.restoreCredit) {
    try {
      await prisma.subscription.update({
        where: { id: booking.subscriptionId },
        data: { creditsRemaining: { increment: 1 } },
      });
      creditRefunded = true;
    } catch (error) {
      await logError({
        context: "booking.cancel.creditRefund",
        error,
        meta: { userId: user.id, bookingId, subscriptionId: booking.subscriptionId },
      });
    }
  }

  // Slett event fra Google Calendar hvis pushet (best-effort)
  if (booking.googleEventId && booking.serviceType.coachUserId) {
    try {
      await fjernBooking(
        booking.serviceType.coachUserId,
        booking.id,
      );
    } catch (error) {
      await logError({
        context: "booking.cancel.calendarRemove",
        error,
        meta: { userId: user.id, bookingId },
        severity: "warn",
      });
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
  } catch (error) {
    await logError({
      context: "booking.cancel.epost",
      error,
      meta: { userId: user.id, bookingId },
      severity: "warn",
    });
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
    } else if (outcome.lateCancelNoRefund) {
      refundTekst = outcome.playerMessage;
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

  await recordBookingMetric("book_cancel");
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

  const erEier = booking.userId === user.id;
  const erEgenCoachBooking =
    user.role === "COACH" &&
    (booking.coachId === user.id || booking.serviceType.coachUserId === user.id);
  const erStaff = user.role === "ADMIN" || erEgenCoachBooking;
  if (!erEier && !erStaff) {
    throw new Error("forbidden");
  }
  if (booking.status === "CANCELLED") {
    throw new Error("Avbestilt booking kan ikke flyttes — book ny tid.");
  }

  const actorR = actorFromRole(user.id, user.role);
  const ro = rescheduleOutcome(
    {
      id: booking.id,
      userId: booking.userId,
      coachId: booking.coachId,
      serviceCoachUserId: booking.serviceType.coachUserId,
      startAt: booking.startAt,
      status: booking.status,
      subscriptionId: booking.subscriptionId,
      stripePaymentIntentId: booking.stripePaymentIntentId,
      priceOre: booking.priceOre,
    },
    actorR,
  );
  if (!ro.allowed) {
    throw new Error(ro.reasonIfDenied ?? "Ombooking ikke tillatt");
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

  try {
    await prisma.$transaction(async (tx) => {
      const vern = await sjekkKollisjon(tx, {
        coachId: input.newCoachId ?? booking.coachId,
        serviceTypeId: booking.serviceTypeId,
        facilityId: booking.facilityId,
        startAt: newStart,
        endAt: newEnd,
        ekskluderBookingId: booking.id,
      });
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          startAt: newStart,
          endAt: newEnd,
          plassNr: vern.plassNr,
        },
      });
    });
  } catch (e) {
    if (erKollisjonsfeil(e)) {
      throw new Error(kollisjonsmelding(e));
    }
    throw e;
  }

  // Oppdater Google Calendar-event (push bruker eksisterende googleEventId)
  if (booking.googleEventId) {
    try {
      await pushBooking(booking.id);
    } catch (error) {
      await logError({
        context: "booking.reschedule.calendarPush",
        error,
        meta: { userId: user.id, bookingId: booking.id },
        severity: "warn",
      });
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
  } catch (error) {
    await logError({
      context: "booking.reschedule.epost",
      error,
      meta: { userId: user.id, bookingId: booking.id },
      severity: "warn",
    });
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

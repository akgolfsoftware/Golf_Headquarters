"use server";

import { z } from "zod";
import { sjekkKollisjon, erKollisjonsfeil, kollisjonsmelding } from "@/lib/booking/kollisjonsvern";
import { revalidatePath } from "next/cache";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { bookingRefundKey, refundCancelledBooking } from "@/lib/booking/refund";
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

  // Avbestilling, klipp og varig refusjonsjobb skrives samlet. Bare én
  // samtidig forespørsel får endre en fortsatt aktiv booking.
  const avbestilt = await prisma.$transaction(async tx => {
    const claimed = await tx.booking.updateMany({
      where: { id: bookingId, status: booking.status, updatedAt: booking.updatedAt },
      data: { status: "CANCELLED" },
    });
    if (claimed.count !== 1) return false;
    if (booking.subscriptionId && outcome.restoreCredit) {
      await tx.subscription.update({
        where: { id: booking.subscriptionId },
        data: { creditsRemaining: { increment: 1 } },
      });
    }
    if (outcome.refundStripe && booking.stripePaymentIntentId) {
      await tx.webhookFailure.upsert({
        where: { eventId: bookingRefundKey(bookingId) },
        create: {
          eventId: bookingRefundKey(bookingId), webhookSource: "booking-refund",
          payload: { bookingId }, errorMessage: "Refusjon venter på behandling.", attemptCount: 0,
        },
        update: {},
      });
    }
    return true;
  });
  if (!avbestilt) {
    const latest = await prisma.booking.findUnique({ where: { id: bookingId }, select: { status: true } });
    if (latest?.status === "CANCELLED") return;
    throw new Error("Bookingen ble endret samtidig. Oppdater siden og prøv igjen.");
  }

  const creditRefunded = Boolean(booking.subscriptionId && outcome.restoreCredit);
  let stripeRefundOk = false;
  let stripeRefundFeilet = false;
  if (outcome.refundStripe && booking.stripePaymentIntentId) {
    try {
      await refundCancelledBooking(bookingId);
      stripeRefundOk = true;
    } catch (error) {
      stripeRefundFeilet = true;
      // Den varige jobben forblir PENDING også ved prosessavbrudd.
      await logError({ context: "booking.cancel.stripeRefund", error, meta: { userId: user.id, bookingId } });
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
      tidTilStartMs: booking.startAt.getTime() - Date.now(),
    },
  });

  // Send avbestillings-e-post (best-effort)
  try {
    const { sendBookingCancellation } = await import("@/lib/email/booking-emails");
    await sendBookingCancellation(bookingId, { refundIssued: stripeRefundOk, isCreditBooking: creditRefunded, refundPending: stripeRefundFeilet, lateCancelNoRefund: outcome.lateCancelNoRefund });
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
      refundTekst = "Refusjonen venter på behandling. Vi følger opp betalingen.";
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

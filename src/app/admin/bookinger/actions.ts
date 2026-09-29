"use server";

/**
 * Coach-handlinger i AG-06 Booking (Precision Athletics, Anders 29.09.2026).
 *
 * - avlysBookingSomCoach: coach avlyser en bekreftet booking. FULL refusjon
 *   uansett tidspunkt (hele beløpet i Stripe, AK Golf dekker gebyret) eller
 *   klippet tilbake. Stripe FØR egen database (gotchas §Betaling): feiler
 *   refusjonen, avlyses ingenting. Spilleren får `sendBookingCancellation`.
 *   Bygger på samme byggeklosser som `cancelBooking` (portal/meg/bookinger).
 * - avvisBookingMedBegrunnelse: avviser en booking uten betaling og lagrer
 *   begrunnelsen som utkast i Innboks (InnboksEpost, UTKAST_KLART). Ingenting
 *   sendes automatisk — coach sender selv fra Innboks.
 * - fjernTjeneste: sletter en tjeneste uten bookinger; har den bookinger,
 *   deaktiveres den i stedet (historikken peker på den).
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { coachBookingScope } from "@/lib/auth/booking-scope";
import { prisma } from "@/lib/prisma";
import { stripeKlient } from "@/lib/stripe";
import { audit } from "@/lib/audit";
import { logError } from "@/lib/error-tracking";
import { notify } from "@/lib/notifications";
import { fjernBooking } from "@/lib/google-calendar-kilder";
import { avlysningsplan } from "@/lib/booking/coach-avlysning";

function revalider(bookingId?: string) {
  revalidatePath("/admin/bookinger");
  revalidatePath("/admin/kalender");
  revalidatePath("/portal/meg/bookinger");
  if (bookingId) {
    revalidatePath(`/admin/bookinger/${bookingId}`);
    revalidatePath(`/portal/booking/${bookingId}`);
  }
}

const TID = (d: Date) => d.toLocaleString("nb-NO", { dateStyle: "medium", timeStyle: "short" });

export type AvlysResultat =
  | { ok: true; refundert: boolean; klippTilbake: boolean }
  | { ok: false; feil: string };

const AvlysSchema = z.object({ bookingId: z.string().min(1), begrunnelse: z.string().max(1000).optional() });

export async function avlysBookingSomCoach(input: { bookingId: string; begrunnelse?: string }): Promise<AvlysResultat> {
  const user = await requireCoachActionUser();
  const p = AvlysSchema.safeParse(input);
  if (!p.success) return { ok: false, feil: "Ugyldig booking." };

  const booking = await prisma.booking.findFirst({
    where: { id: p.data.bookingId, ...coachBookingScope(user) },
    select: {
      id: true,
      userId: true,
      status: true,
      startAt: true,
      subscriptionId: true,
      stripePaymentIntentId: true,
      googleEventId: true,
      coachId: true,
      serviceType: { select: { coachUserId: true } },
      payments: {
        where: { stripePaymentIntentId: { not: null }, status: "SUCCEEDED" },
        select: { stripePaymentIntentId: true },
        take: 1,
      },
    },
  });
  if (!booking) return { ok: false, feil: "Fant ikke bookingen." };
  if (booking.status !== "CONFIRMED" && booking.status !== "PENDING") {
    return { ok: false, feil: "Bookingen er allerede avlyst eller gjennomført." };
  }

  const plan = avlysningsplan({
    stripePaymentIntentId: booking.stripePaymentIntentId ?? booking.payments[0]?.stripePaymentIntentId ?? null,
    subscriptionId: booking.subscriptionId,
  });

  // 1) Stripe først. Ingen `amount` = hele det gjenstående beløpet refunderes.
  if (plan.refunderPaymentIntent) {
    try {
      await stripeKlient().refunds.create(
        {
          payment_intent: plan.refunderPaymentIntent,
          reason: "requested_by_customer",
          metadata: { bookingId: booking.id, avlystAv: "coach" },
        },
        { idempotencyKey: `coach-avlys-${booking.id}` },
      );
    } catch (error) {
      await logError({
        context: "admin.booking.avlysSomCoach.stripeRefund",
        error,
        meta: { bookingId: booking.id, paymentIntentId: plan.refunderPaymentIntent },
      });
      return { ok: false, feil: "Refusjonen i Stripe feilet. Bookingen er ikke avlyst — prøv igjen." };
    }
  }

  // 2) Egen database.
  const oppdatert = await prisma.booking.updateMany({
    where: { id: booking.id, status: { in: ["CONFIRMED", "PENDING"] } },
    data: { status: "CANCELLED", proposedStartAt: null, proposedEndAt: null, proposedAt: null, proposedById: null },
  });
  if (oppdatert.count === 0) return { ok: false, feil: "Bookingen ble endret samtidig. Last siden på nytt." };

  let klippTilbake = false;
  if (plan.klippTilbake && booking.subscriptionId) {
    try {
      await prisma.subscription.update({
        where: { id: booking.subscriptionId },
        data: { creditsRemaining: { increment: 1 } },
      });
      klippTilbake = true;
    } catch (error) {
      await logError({ context: "admin.booking.avlysSomCoach.klipp", error, meta: { bookingId: booking.id } });
    }
  }

  const googleEier = booking.serviceType.coachUserId ?? booking.coachId;
  if (booking.googleEventId && googleEier) {
    try {
      await fjernBooking(googleEier, booking.id);
    } catch (error) {
      await logError({ context: "admin.booking.avlysSomCoach.google", error, meta: { bookingId: booking.id }, severity: "warn" });
    }
  }

  try {
    const { sendBookingCancellation } = await import("@/lib/email/booking-emails");
    await sendBookingCancellation(booking.id, { refundIssued: !!plan.refunderPaymentIntent, isCreditBooking: klippTilbake });
  } catch (error) {
    await logError({ context: "admin.booking.avlysSomCoach.epost", error, meta: { bookingId: booking.id }, severity: "warn" });
  }

  if (booking.userId) {
    await notify({
      userId: booking.userId,
      type: "booking",
      title: "Booking avlyst av coach",
      body: `${TID(booking.startAt)}. ${plan.refunderPaymentIntent ? "Hele beløpet refunderes." : klippTilbake ? "Klippet er ført tilbake." : ""}`.trim(),
      link: "/portal/meg/bookinger",
    });
  }

  await audit({
    actorId: user.id,
    action: "booking.cancelled.by-coach",
    target: `Booking:${booking.id}`,
    metadata: {
      fullRefusjon: !!plan.refunderPaymentIntent,
      klippTilbake,
      begrunnelse: p.data.begrunnelse?.trim() || null,
      tidTilStartMs: booking.startAt.getTime() - Date.now(),
    },
  });

  revalider(booking.id);
  return { ok: true, refundert: !!plan.refunderPaymentIntent, klippTilbake };
}

export type AvvisResultat = { ok: true; utkast: boolean } | { ok: false; feil: string };

const AvvisSchema = z.object({ bookingId: z.string().min(1), begrunnelse: z.string().trim().min(8).max(1000) });

export async function avvisBookingMedBegrunnelse(input: { bookingId: string; begrunnelse: string }): Promise<AvvisResultat> {
  const user = await requireCoachActionUser();
  const p = AvvisSchema.safeParse(input);
  if (!p.success) return { ok: false, feil: "Skriv en kort begrunnelse på minst 8 tegn." };

  const booking = await prisma.booking.findFirst({
    where: { id: p.data.bookingId, status: "PENDING", ...coachBookingScope(user) },
    select: {
      id: true,
      startAt: true,
      guestName: true,
      guestEmail: true,
      user: { select: { name: true, email: true } },
      serviceType: { select: { name: true } },
    },
  });
  if (!booking) return { ok: false, feil: "Fant ikke en booking som venter på svar." };

  const res = await prisma.booking.updateMany({
    where: { id: booking.id, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
  if (res.count === 0) return { ok: false, feil: "Bookingen ble endret samtidig. Last siden på nytt." };

  const epost = booking.user?.email ?? booking.guestEmail;
  const navn = booking.user?.name ?? booking.guestName ?? null;
  let utkast = false;
  if (epost) {
    const tid = TID(booking.startAt);
    await prisma.innboksEpost.create({
      data: {
        fraEpost: epost,
        fraNavn: navn,
        emne: `Booking: ${booking.serviceType.name} ${tid}`,
        brodtekst: `Bookingen ble avvist i AgencyOS av ${user.name ?? "coach"}.\n\nBegrunnelse: ${p.data.begrunnelse}`,
        status: "UTKAST_KLART",
        utkastSvar: [
          `Hei ${navn?.split(" ")[0] ?? ""}`.trim() + ",",
          `Vi kan dessverre ikke ta imot bookingen din: ${booking.serviceType.name}, ${tid}.`,
          p.data.begrunnelse,
          "Book gjerne en annen tid, eller svar på denne e-posten.",
          `Hilsen\n${user.name ?? "AK Golf"}`,
        ].join("\n\n"),
        utkastGenerertAt: new Date(),
        bookingId: booking.id,
      },
    });
    utkast = true;
  }

  await audit({
    actorId: user.id,
    action: "booking.rejected.with-reason",
    target: `Booking:${booking.id}`,
    metadata: { utkastIInnboks: utkast },
  });
  revalider(booking.id);
  revalidatePath("/admin/innboks-epost");
  return { ok: true, utkast };
}

export type TjenesteResultat = { ok: true; deaktivert: boolean } | { ok: false; feil: string };

/** «Slett» i tjeneste-arket: sletter bare en tjeneste uten bookinger, ellers deaktiveres den. */
export async function fjernTjeneste(id: string): Promise<TjenesteResultat> {
  const user = await requireCoachActionUser();
  if (!z.string().min(1).safeParse(id).success) return { ok: false, feil: "Ugyldig tjeneste." };
  const tjeneste = await prisma.serviceType.findUnique({ where: { id }, select: { id: true, _count: { select: { bookings: true } } } });
  if (!tjeneste) return { ok: false, feil: "Fant ikke tjenesten." };

  const deaktivert = tjeneste._count.bookings > 0;
  if (deaktivert) {
    await prisma.serviceType.update({ where: { id }, data: { active: false } });
  } else {
    await prisma.serviceType.delete({ where: { id } });
  }
  await audit({
    actorId: user.id,
    action: deaktivert ? "service.deactivated" : "service.deleted",
    target: `ServiceType:${id}`,
  });
  revalidatePath("/admin/services");
  revalidatePath("/admin/bookinger");
  return { ok: true, deaktivert };
}

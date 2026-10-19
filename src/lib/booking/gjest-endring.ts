/**
 * Gjest uten konto flytter eller avbestiller fra lenken i e-posten
 * (bookingplanen 15.10 steg 5).
 *
 * Samme regler som spilleren i PlayerHQ (`src/app/portal/meg/bookinger/actions.ts`):
 * - Flytting bare til en ledig tid innenfor coachens tilgjengelighet
 *   (`isSlotStillAvailable`), og bare mer enn 24 timer før start (`rescheduleOutcome`).
 *   Gjesten beholder coachen; ny coach velges ved ny booking.
 * - Avbestilling etter 24-timersregelen (`cancelOutcome`): refusjon i Stripe
 *   bare før fristen, med varig refusjonsjobb som i portalen.
 * Tilgang er bare den signerte lenken (`gjest-lenke.ts`), og bare for bookinger
 * uten konto. Lenken er bundet til starttiden, så en flyttet time krever ny lenke.
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { logError } from "@/lib/error-tracking";
import { getAvailableSlots, isSlotStillAvailable } from "@/lib/booking/availability";
import { erKollisjonsfeil, kollisjonsmelding, sjekkKollisjon } from "@/lib/booking/kollisjonsvern";
import { bookingRefundKey, refundCancelledBooking } from "@/lib/booking/refund";
import { cancelOutcome, rescheduleOutcome, type BookingPolicyActor, type BookingPolicySnapshot } from "@/lib/booking/policy";
import { fjernBooking, pushBooking } from "@/lib/google-calendar-kilder";
import { tilNaivVeggklokke } from "@/lib/google-calendar-tid";
import { lesGjestLenke } from "@/lib/booking/gjest-lenke";

const bookingInclude = {
  serviceType: { select: { id: true, name: true, durationMin: true, coachUserId: true, maksDagerFram: true } },
  location: { select: { name: true } },
  coach: { select: { name: true } },
} as const;

async function hentRad(id: string) {
  return prisma.booking.findUnique({ where: { id }, include: bookingInclude });
}
type GjestRad = NonNullable<Awaited<ReturnType<typeof hentRad>>>;

export type GjestOppslag =
  | { ok: true; booking: GjestRad; actor: BookingPolicyActor; snapshot: BookingPolicySnapshot }
  | { ok: false; grunn: "ugyldig" | "endret" };

/**
 * Leser lenken og bookingen. «ugyldig»: feil signatur, utløpt, ingen booking eller
 * booking med konto. «endret»: timen har fått ny tid etter at lenken ble sendt.
 */
export async function hentGjestBooking(token: string, naa: Date = new Date()): Promise<GjestOppslag> {
  const lenke = lesGjestLenke(token, naa);
  if (!lenke) return { ok: false, grunn: "ugyldig" };
  const booking = await hentRad(lenke.bookingId);
  if (!booking || booking.userId) return { ok: false, grunn: "ugyldig" };
  if (booking.startAt.getTime() !== lenke.startAt.getTime()) return { ok: false, grunn: "endret" };
  return {
    ok: true,
    booking,
    actor: { kind: "guest", bookingId: booking.id },
    snapshot: {
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
  };
}

const UGYLDIG = "Lenken virker ikke lenger. Bruk lenken i den nyeste e-posten fra oss, eller skriv til post@akgolf.no.";
const ENDRET = "Timen har fått ny tid siden denne e-posten. Bruk lenken i den nyeste e-posten.";

export type GjestResultat = { ok: true; melding: string } | { ok: false; melding: string };

/** Ledige tider hos samme coach for tjenestens bookingvindu. Tidene er Oslo-veggklokke. */
export async function gjestLedigeTider(booking: GjestRad, naa: Date = new Date()): Promise<Date[][]> {
  const coachId = booking.coachId ?? booking.serviceType.coachUserId;
  if (!coachId) return [];
  const idag = tilNaivVeggklokke(naa);
  idag.setHours(0, 0, 0, 0);
  const dager: Date[][] = [];
  for (let i = 0; i < booking.serviceType.maksDagerFram; i++) {
    const d = new Date(idag);
    d.setDate(d.getDate() + i);
    const slots = await getAvailableSlots(booking.serviceTypeId, d);
    dager.push(slots.filter(s => s.coachId === coachId).map(s => s.start));
  }
  return dager;
}

export async function gjestFlyttTime(token: string, nyStart: Date, naa: Date = new Date()): Promise<GjestResultat> {
  const oppslag = await hentGjestBooking(token, naa);
  if (!oppslag.ok) return { ok: false, melding: oppslag.grunn === "endret" ? ENDRET : UGYLDIG };
  const { booking, actor, snapshot } = oppslag;

  const utfall = rescheduleOutcome(snapshot, actor, naa);
  if (!utfall.allowed) {
    return { ok: false, melding: utfall.requiresStaffOverride ? "Det er 24 timer eller mindre til timen. Skriv til post@akgolf.no for å flytte den." : (utfall.reasonIfDenied ?? UGYLDIG) };
  }
  if (!Number.isFinite(nyStart.getTime())) return { ok: false, melding: "Ugyldig tid." };

  const coachId = booking.coachId ?? booking.serviceType.coachUserId;
  if (!coachId || !(await isSlotStillAvailable(booking.serviceTypeId, nyStart, coachId))) {
    return { ok: false, melding: "Tiden er ikke ledig hos coachen. Velg en annen tid." };
  }

  const nySlutt = new Date(nyStart.getTime() + booking.serviceType.durationMin * 60_000);
  try {
    const flyttet = await prisma.$transaction(async tx => {
      const vern = await sjekkKollisjon(tx, {
        coachId,
        serviceTypeId: booking.serviceTypeId,
        facilityId: booking.facilityId,
        startAt: nyStart,
        endAt: nySlutt,
        ekskluderBookingId: booking.id,
      });
      // Bare én samtidig endring får gå gjennom på samme versjon av bookingen.
      const r = await tx.booking.updateMany({
        where: { id: booking.id, startAt: booking.startAt, updatedAt: booking.updatedAt, status: booking.status },
        data: { startAt: nyStart, endAt: nySlutt, plassNr: vern.plassNr },
      });
      return r.count === 1;
    });
    if (!flyttet) return { ok: false, melding: ENDRET };
  } catch (e) {
    if (erKollisjonsfeil(e)) return { ok: false, melding: kollisjonsmelding(e) };
    throw e;
  }

  if (booking.googleEventId) {
    try {
      await pushBooking(booking.id);
    } catch (error) {
      await logError({ context: "booking.gjest.flytt.calendar", error, meta: { bookingId: booking.id }, severity: "warn" });
    }
  }
  await audit({
    actorId: null,
    action: "booking.rescheduled.guest-link",
    target: `Booking:${booking.id}`,
    metadata: { gammelStart: booking.startAt.toISOString(), nyStart: nyStart.toISOString(), coachId },
  });
  try {
    const { sendBookingRescheduled } = await import("@/lib/email/booking-emails");
    await sendBookingRescheduled(booking.id, booking.startAt);
  } catch (error) {
    await logError({ context: "booking.gjest.flytt.epost", error, meta: { bookingId: booking.id }, severity: "warn" });
  }
  return { ok: true, melding: "Timen er flyttet. Du får en e-post med ny tid og ny lenke." };
}

export async function gjestAvbestillTime(token: string, naa: Date = new Date()): Promise<GjestResultat> {
  const oppslag = await hentGjestBooking(token, naa);
  if (!oppslag.ok) return { ok: false, melding: oppslag.grunn === "endret" ? ENDRET : UGYLDIG };
  const { booking, actor, snapshot } = oppslag;

  const utfall = cancelOutcome(snapshot, actor, naa);
  if (!utfall.allowed) return { ok: false, melding: utfall.reasonIfDenied ?? UGYLDIG };

  const avbestilt = await prisma.$transaction(async tx => {
    const r = await tx.booking.updateMany({
      where: { id: booking.id, status: booking.status, updatedAt: booking.updatedAt },
      data: { status: "CANCELLED" },
    });
    if (r.count !== 1) return false;
    if (utfall.refundStripe && booking.stripePaymentIntentId) {
      await tx.webhookFailure.upsert({
        where: { eventId: bookingRefundKey(booking.id) },
        create: {
          eventId: bookingRefundKey(booking.id), webhookSource: "booking-refund",
          payload: { bookingId: booking.id }, errorMessage: "Refusjon venter på behandling.", attemptCount: 0,
        },
        update: {},
      });
    }
    return true;
  });
  if (!avbestilt) return { ok: false, melding: ENDRET };

  let refundert = false;
  let refusjonVenter = false;
  if (utfall.refundStripe && booking.stripePaymentIntentId) {
    try {
      await refundCancelledBooking(booking.id);
      refundert = true;
    } catch (error) {
      // Den varige jobben over prøver igjen.
      refusjonVenter = true;
      await logError({ context: "booking.gjest.avbestill.refusjon", error, meta: { bookingId: booking.id } });
    }
  }
  if (booking.googleEventId && booking.serviceType.coachUserId) {
    try {
      await fjernBooking(booking.serviceType.coachUserId, booking.id);
    } catch (error) {
      await logError({ context: "booking.gjest.avbestill.calendar", error, meta: { bookingId: booking.id }, severity: "warn" });
    }
  }
  await audit({
    actorId: null,
    action: refusjonVenter ? "booking.cancelled.refund-failed" : "booking.cancelled",
    target: `Booking:${booking.id}`,
    metadata: { kilde: "gjestelenke", refundert, refusjonVenter, etterFristen: utfall.lateCancelNoRefund },
  });
  try {
    const { sendBookingCancellation } = await import("@/lib/email/booking-emails");
    await sendBookingCancellation(booking.id, { refundIssued: refundert, refundPending: refusjonVenter, lateCancelNoRefund: utfall.lateCancelNoRefund });
  } catch (error) {
    await logError({ context: "booking.gjest.avbestill.epost", error, meta: { bookingId: booking.id }, severity: "warn" });
  }

  const melding = refundert
    ? "Timen er avbestilt. Pengene går tilbake til kortet, vanligvis innen 5–10 virkedager."
    : refusjonVenter
      ? "Timen er avbestilt. Refusjonen er registrert og behandles snart."
      : utfall.lateCancelNoRefund && booking.priceOre > 0
        ? "Timen er avbestilt. Det var 24 timer eller mindre igjen, så betalingen refunderes ikke."
        : "Timen er avbestilt.";
  return { ok: true, melding };
}

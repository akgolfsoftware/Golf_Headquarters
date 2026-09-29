"use server";

/**
 * Spilleren svarer på coachens forslag om ny tid (Anders 29.09.2026).
 *
 * - Godta: bookingen flyttes til foreslått tid med samme vern som
 *   `flyttBookingTilTid` (kollisjonssjekk i transaksjon, Google-kalender
 *   etterpå), forslaget nullstilles og EP-02 (`sendBookingRescheduled`) går ut.
 * - Avslå: forslaget nullstilles, tiden står, coachen får varsel.
 *
 * Bare spilleren selv, eller en godkjent forelder til spilleren, kan svare.
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { hentBarnHvisTilhoerer } from "@/lib/forelder";
import { sjekkKollisjon, erKollisjonsfeil, kollisjonsmelding } from "@/lib/booking/kollisjonsvern";
import { hoursUntil } from "@/lib/booking/policy";
import { pushBooking } from "@/lib/google-calendar-kilder";
import { notify } from "@/lib/notifications";
import { audit } from "@/lib/audit";
import { logError } from "@/lib/error-tracking";

export type ForslagSvar = { ok: true } | { ok: false; feil: string };

const Id = z.string().min(1);

async function hentForslag(bookingId: string) {
  const user = await requireConsentingUser();
  if (!Id.safeParse(bookingId).success) return { ok: false as const, feil: "Ugyldig booking." };
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      userId: true,
      status: true,
      startAt: true,
      endAt: true,
      coachId: true,
      facilityId: true,
      serviceTypeId: true,
      proposedStartAt: true,
      proposedEndAt: true,
      proposedById: true,
      serviceType: { select: { name: true } },
    },
  });
  if (!booking || !booking.userId) return { ok: false as const, feil: "Fant ikke bookingen." };
  const eier = booking.userId === user.id || (await hentBarnHvisTilhoerer(user.id, booking.userId)) != null;
  if (!eier) return { ok: false as const, feil: "Fant ikke bookingen." };
  if (!booking.proposedStartAt || !booking.proposedEndAt) return { ok: false as const, feil: "Det finnes ikke noe forslag å svare på." };
  return { ok: true as const, user, booking: { ...booking, proposedStartAt: booking.proposedStartAt, proposedEndAt: booking.proposedEndAt } };
}

function revalider(bookingId: string) {
  revalidatePath(`/portal/booking/${bookingId}`);
  revalidatePath("/portal/meg/bookinger");
  revalidatePath("/admin/kalender");
  revalidatePath("/admin/bookinger");
  revalidatePath(`/admin/bookinger/${bookingId}`);
}

const TID = (d: Date) =>
  d.toLocaleString("nb-NO", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export async function godtaFlytteforslag(bookingId: string): Promise<ForslagSvar> {
  const treff = await hentForslag(bookingId);
  if (!treff.ok) return { ok: false, feil: treff.feil };
  const { user, booking } = treff;

  if (booking.status !== "CONFIRMED" && booking.status !== "PENDING") {
    return { ok: false, feil: "Bookingen kan ikke flyttes lenger." };
  }
  if (hoursUntil(booking.proposedStartAt) <= 0) {
    return { ok: false, feil: "Den foreslåtte tiden har passert. Be coachen om en ny tid." };
  }

  const gammelStart = booking.startAt;
  try {
    await prisma.$transaction(async (tx) => {
      const vern = await sjekkKollisjon(tx, {
        coachId: booking.coachId,
        serviceTypeId: booking.serviceTypeId,
        facilityId: booking.facilityId,
        startAt: booking.proposedStartAt,
        endAt: booking.proposedEndAt,
        ekskluderBookingId: booking.id,
      });
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          startAt: booking.proposedStartAt,
          endAt: booking.proposedEndAt,
          plassNr: vern.plassNr,
          proposedStartAt: null,
          proposedEndAt: null,
          proposedAt: null,
          proposedById: null,
        },
      });
    });
  } catch (e) {
    if (erKollisjonsfeil(e)) return { ok: false, feil: `${kollisjonsmelding(e)} Be coachen om en ny tid.` };
    throw e;
  }

  try {
    await pushBooking(booking.id);
  } catch (error) {
    await logError({ context: "portal.booking.godtaForslag.google", error, meta: { bookingId: booking.id }, severity: "warn" });
  }
  try {
    const { sendBookingRescheduled } = await import("@/lib/email/booking-emails");
    await sendBookingRescheduled(booking.id, gammelStart);
  } catch (error) {
    await logError({ context: "portal.booking.godtaForslag.epost", error, meta: { bookingId: booking.id }, severity: "warn" });
  }
  if (booking.proposedById) {
    await notify({
      userId: booking.proposedById,
      type: "booking",
      title: "Ny tid er godtatt",
      body: `${booking.serviceType.name} er flyttet til ${TID(booking.proposedStartAt)}.`,
      link: `/admin/bookinger/${booking.id}`,
    });
  }
  await audit({
    actorId: user.id,
    action: "booking.move-proposal-accepted",
    target: `Booking:${booking.id}`,
    metadata: { fra: gammelStart.toISOString(), til: booking.proposedStartAt.toISOString() },
  });
  revalider(booking.id);
  return { ok: true };
}

export async function avslaaFlytteforslag(bookingId: string): Promise<ForslagSvar> {
  const treff = await hentForslag(bookingId);
  if (!treff.ok) return { ok: false, feil: treff.feil };
  const { user, booking } = treff;

  await prisma.booking.update({
    where: { id: booking.id },
    data: { proposedStartAt: null, proposedEndAt: null, proposedAt: null, proposedById: null },
  });
  if (booking.proposedById) {
    await notify({
      userId: booking.proposedById,
      type: "booking",
      title: "Forslaget om ny tid er avslått",
      body: `${booking.serviceType.name} står fortsatt ${TID(booking.startAt)}.`,
      link: `/admin/bookinger/${booking.id}`,
    });
  }
  await audit({ actorId: user.id, action: "booking.move-proposal-declined", target: `Booking:${booking.id}` });
  revalider(booking.id);
  return { ok: true };
}

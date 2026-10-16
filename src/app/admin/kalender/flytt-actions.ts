"use server";

/**
 * Coach foreslår ny tid på en booking (beslutninger.md §COACH SOM AVLYSER GIR
 * ALLTID FULL REFUSJON, 15.10.2026). Coach FORESLÅR ny tid. `startAt`/`endAt` endres ikke før
 *   spilleren godtar i PlayerHQ (se src/app/portal/booking/[bookingId]/actions.ts).
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { coachBookingScope } from "@/lib/auth/booking-scope";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { audit } from "@/lib/audit";
import { logError } from "@/lib/error-tracking";
import { sjekkKollisjon, erKollisjonsfeil, kollisjonsmelding } from "@/lib/booking/kollisjonsvern";
import { hoursUntil } from "@/lib/booking/policy";

export type FlyttResultat = { ok: true; varslet: boolean } | { ok: false; feil: string };

const IsoDato = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const Klokke = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/);

function datoTekst(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}

function revaliderKalender() {
  revalidatePath("/admin/kalender");
  revalidatePath("/admin/bookinger");
}

const ForslagSchema = z.object({
  bookingId: z.string().min(1),
  dato: IsoDato,
  tid: Klokke,
});

/**
 * Coach foreslår ny tid på en booking med spillerkonto. Bare forslagsfeltene
 * skrives — `startAt`/`endAt` står urørt til spilleren godtar. Kollisjon
 * sjekkes nå (og på nytt når spilleren godtar).
 */
export async function foreslaaNyBookingtid(input: { bookingId: string; dato: string; tid: string }): Promise<FlyttResultat> {
  const user = await requireCoachActionUser();
  const p = ForslagSchema.safeParse(input);
  if (!p.success) return { ok: false, feil: "Velg dato og klokkeslett." };

  const booking = await prisma.booking.findFirst({
    where: { id: p.data.bookingId, ...coachBookingScope(user) },
    select: {
      id: true,
      userId: true,
      status: true,
      updatedAt: true,
      startAt: true,
      endAt: true,
      coachId: true,
      facilityId: true,
      serviceTypeId: true,
      serviceType: { select: { name: true } },
    },
  });
  if (!booking) return { ok: false, feil: "Fant ikke bookingen." };
  if (booking.status !== "CONFIRMED" && booking.status !== "PENDING") {
    return { ok: false, feil: "Bare kommende bookinger kan flyttes." };
  }
  if (!booking.userId) {
    return { ok: false, feil: "Gjestebookinger har ingen PlayerHQ-konto å godta i. Avtal ny tid med kunden direkte." };
  }

  const [y, m, d] = p.data.dato.split("-").map(Number);
  const [hh, mm] = p.data.tid.split(":").map(Number);
  // Lagret tid er naiv Oslo-veggklokke (policy.ts) — samme konvensjon her.
  const nyStart = new Date(Date.UTC(y, m - 1, d, hh, mm, 0, 0));
  if (nyStart.toISOString().slice(0, 10) !== p.data.dato) return { ok: false, feil: "Ugyldig dato." };
  if (hoursUntil(nyStart) <= 0) return { ok: false, feil: "Ny tid må være fram i tid." };
  if (nyStart.getTime() === booking.startAt.getTime()) return { ok: false, feil: "Bookingen ligger allerede på denne tiden." };
  const nyEnd = new Date(nyStart.getTime() + (booking.endAt.getTime() - booking.startAt.getTime()));

  try {
    const oppdatert = await prisma.$transaction(async (tx) => {
      await sjekkKollisjon(tx, {
        coachId: booking.coachId,
        serviceTypeId: booking.serviceTypeId,
        facilityId: booking.facilityId,
        startAt: nyStart,
        endAt: nyEnd,
        ekskluderBookingId: booking.id,
      });
      const res = await tx.booking.updateMany({
        where: { id: booking.id, status: booking.status, updatedAt: booking.updatedAt, ...coachBookingScope(user) },
        data: { proposedStartAt: nyStart, proposedEndAt: nyEnd, proposedAt: new Date(), proposedById: user.id },
      });
      return res.count === 1;
    });
    if (!oppdatert) return { ok: false, feil: "Bookingen ble endret samtidig. Last siden på nytt." };
  } catch (e) {
    if (erKollisjonsfeil(e)) return { ok: false, feil: kollisjonsmelding(e) };
    throw e;
  }

  await notify({
    userId: booking.userId,
    type: "booking",
    title: "Coach foreslår ny tid",
    body: `${booking.serviceType.name}: ${datoTekst(p.data.dato)} kl. ${p.data.tid}. Godta eller avslå i PlayerHQ.`,
    link: `/portal/booking/${booking.id}`,
  });
  try {
    const { sendBookingFlytteforslag } = await import("@/lib/email/booking-emails");
    await sendBookingFlytteforslag(booking.id);
  } catch (error) {
    await logError({ context: "kalender.foreslaaNyBookingtid.epost", error, meta: { bookingId: booking.id }, severity: "warn" });
  }
  await audit({
    actorId: user.id,
    action: "booking.move-proposed",
    target: `Booking:${booking.id}`,
    metadata: { fra: booking.startAt.toISOString(), foreslaatt: nyStart.toISOString() },
  });

  revaliderKalender();
  revalidatePath(`/admin/bookinger/${booking.id}`);
  revalidatePath(`/portal/booking/${booking.id}`);
  return { ok: true, varslet: true };
}

/** Trekk tilbake et forslag som spilleren ikke har svart på. */
export async function trekkTilbakeForslag(bookingId: string): Promise<FlyttResultat> {
  const user = await requireCoachActionUser();
  const res = await prisma.booking.updateMany({
    where: { id: bookingId, proposedStartAt: { not: null }, ...coachBookingScope(user) },
    data: { proposedStartAt: null, proposedEndAt: null, proposedAt: null, proposedById: null },
  });
  if (res.count === 0) return { ok: false, feil: "Fant ikke forslaget." };
  await audit({ actorId: user.id, action: "booking.move-proposal-withdrawn", target: `Booking:${bookingId}` });
  revaliderKalender();
  revalidatePath(`/admin/bookinger/${bookingId}`);
  revalidatePath(`/portal/booking/${bookingId}`);
  return { ok: true, varslet: false };
}

"use server";

/**
 * I5 · Uka-kanban: dra en booking til en annen dag — flytter startAt/endAt
 * til samme klokkeslett på måldagen. Fullførte/kansellerte flyttes ikke.
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { sjekkKollisjon, erKollisjonsfeil, kollisjonsmelding } from "@/lib/booking/kollisjonsvern";
import { pushBooking } from "@/lib/google-calendar-kilder";
import { logError } from "@/lib/error-tracking";

const FlyttSchema = z.object({
  bookingId: z.string().min(1),
  // Full ISO (uka-kanbanen) eller ren dato YYYY-MM-DD (kalenderen) — ren dato
  // tolkes som LOKAL dag (aldri UTC-skift over midnatt).
  targetDayISO: z.union([z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]),
});

export async function flyttBookingTilDag(
  bookingId: string,
  targetDayISO: string,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = FlyttSchema.safeParse({ bookingId, targetDayISO });
  if (!parsed.success) return { ok: false, error: "Ugyldig flytting." };
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, startAt: true, endAt: true, status: true, coachId: true, facilityId: true, serviceTypeId: true },
  });
  if (!booking) return { ok: false, error: "Booking ikke funnet." };
  if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
    return { ok: false, error: "Denne bookingen er fullført eller kansellert — opprett en ny booking i stedet." };
  }

  const ren = /^(\d{4})-(\d{2})-(\d{2})$/.exec(parsed.data.targetDayISO);
  const maal = ren
    ? new Date(Number(ren[1]), Number(ren[2]) - 1, Number(ren[3]))
    : new Date(parsed.data.targetDayISO);
  const nyStart = new Date(maal);
  nyStart.setHours(booking.startAt.getHours(), booking.startAt.getMinutes(), 0, 0);
  const varighetMs = booking.endAt.getTime() - booking.startAt.getTime();
  const nyEnd = new Date(nyStart.getTime() + varighetMs);

  try {
    await prisma.$transaction(async (tx) => {
      const vern = await sjekkKollisjon(tx, {
        coachId: booking.coachId,
        serviceTypeId: booking.serviceTypeId,
        facilityId: booking.facilityId,
        startAt: nyStart,
        endAt: nyEnd,
        ekskluderBookingId: booking.id,
      });
      await tx.booking.update({
        where: { id: booking.id },
        data: { startAt: nyStart, endAt: nyEnd, plassNr: vern.plassNr },
      });
    });
  } catch (e) {
    if (erKollisjonsfeil(e)) return { ok: false, error: kollisjonsmelding(e) };
    throw e;
  }

  // Hold Google-kalenderen i synk etter flytting (best-effort).
  try {
    await pushBooking(booking.id);
  } catch (error) {
    await logError({ context: "agencyos.uka.google-push-etter-flytting", error, severity: "warn", meta: { bookingId: booking.id } });
  }

  revalidatePath("/admin/agencyos/uka");
  revalidatePath("/admin/kalender");
  revalidatePath("/admin/bookinger");
  return { ok: true };
}

const FlyttTidSchema = z.object({
  bookingId: z.string().min(1),
  /** Ny starttid samme dag, «HH:MM». Dagen endres aldri her — se flyttBookingTilDag. */
  nyStartKl: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
});

/**
 * PP-2.4 steg 3 · Løs en kollisjon: flytt en booking til et nytt klokkeslett
 * SAMME dag, med uendret varighet.
 *
 * Søsteren til `flyttBookingTilDag` — den bytter dag og beholder klokkeslettet,
 * denne bytter klokkeslett og beholder dagen. Fasitens begrunnelse for at det er
 * TID som flyttes: «den eneste dimensjonen som finnes når coachen er ressursen».
 *
 * Samme vern som søsteren, med vilje: rollesjekk, guard mot fullførte/kansellerte,
 * `sjekkKollisjon` inne i transaksjonen (så to samtidige flyttinger ikke kan lage
 * den overlappingen vi nettopp fjernet), og Google-push etterpå.
 */
export async function flyttBookingTilTid(
  bookingId: string,
  nyStartKl: string,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = FlyttTidSchema.safeParse({ bookingId, nyStartKl });
  if (!parsed.success) return { ok: false, error: "Ugyldig klokkeslett." };
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, startAt: true, endAt: true, status: true, coachId: true, facilityId: true, serviceTypeId: true },
  });
  if (!booking) return { ok: false, error: "Booking ikke funnet." };
  if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
    return { ok: false, error: "Denne bookingen er fullført eller kansellert — opprett en ny booking i stedet." };
  }

  const [timer, minutter] = parsed.data.nyStartKl.split(":").map(Number);
  // Bygger fra bookingens egen dato med lokale settere: startAt er naiv
  // veggklokke i serverens tid, så en UTC-basert konstruksjon ville forskjøvet
  // avtalen (se gotchas §Tidssone).
  const nyStart = new Date(booking.startAt);
  nyStart.setHours(timer, minutter, 0, 0);
  const varighetMs = booking.endAt.getTime() - booking.startAt.getTime();
  const nyEnd = new Date(nyStart.getTime() + varighetMs);

  if (nyStart.getTime() === booking.startAt.getTime()) {
    return { ok: false, error: "Bookingen ligger allerede på dette tidspunktet." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const vern = await sjekkKollisjon(tx, {
        coachId: booking.coachId,
        serviceTypeId: booking.serviceTypeId,
        facilityId: booking.facilityId,
        startAt: nyStart,
        endAt: nyEnd,
        ekskluderBookingId: booking.id,
      });
      await tx.booking.update({
        where: { id: booking.id },
        data: { startAt: nyStart, endAt: nyEnd, plassNr: vern.plassNr },
      });
    });
  } catch (e) {
    if (erKollisjonsfeil(e)) return { ok: false, error: kollisjonsmelding(e) };
    throw e;
  }

  try {
    await pushBooking(booking.id);
  } catch (error) {
    await logError({ context: "agencyos.uka.google-push-etter-tidsflytting", error, severity: "warn", meta: { bookingId: booking.id } });
  }

  revalidatePath("/admin/agencyos/uka");
  revalidatePath("/admin/kalender");
  revalidatePath("/admin/bookinger");
  return { ok: true };
}

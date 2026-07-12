"use server";

/**
 * I5 · Uka-kanban: dra en booking til en annen dag — flytter startAt/endAt
 * til samme klokkeslett på måldagen. Fullførte/kansellerte flyttes ikke.
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

const FlyttSchema = z.object({
  bookingId: z.string().min(1),
  targetDayISO: z.string().datetime(),
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
    select: { id: true, startAt: true, endAt: true, status: true },
  });
  if (!booking) return { ok: false, error: "Booking ikke funnet." };
  if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
    return { ok: false, error: "Fullførte/kansellerte bookinger kan ikke flyttes." };
  }

  const maal = new Date(parsed.data.targetDayISO);
  const nyStart = new Date(maal);
  nyStart.setHours(booking.startAt.getHours(), booking.startAt.getMinutes(), 0, 0);
  const varighetMs = booking.endAt.getTime() - booking.startAt.getTime();
  const nyEnd = new Date(nyStart.getTime() + varighetMs);

  await prisma.booking.update({
    where: { id: booking.id },
    data: { startAt: nyStart, endAt: nyEnd },
  });

  revalidatePath("/admin/agencyos/uka");
  revalidatePath("/admin/kalender");
  revalidatePath("/admin/bookinger");
  return { ok: true };
}

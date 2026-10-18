"use server";

/**
 * Bookingplanen steg 4: handlinger på Bookingen (AG-06) etter timen.
 *
 * - merkGjennomfort: en bekreftet booking som har startet, settes til COMPLETED.
 * - lagreNotat: coachens notat på bookingen (`Booking.notes`), maks 2000 tegn.
 *
 * Begge går gjennom `coachBookingScope`, så coachen når bare egne bookinger
 * (admin alle). «No-show» er ikke med: den krever ny status `NO_SHOW` i basen,
 * som venter på Anders' ja.
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { coachBookingScope } from "@/lib/auth/booking-scope";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export type OppfolgingResultat = { ok: true } | { ok: false; feil: string };

function revalider(bookingId: string) {
  revalidatePath("/admin/bookinger");
  revalidatePath(`/admin/bookinger/${bookingId}`);
  revalidatePath("/admin/kalender");
}

export async function merkGjennomfort(bookingId: string): Promise<OppfolgingResultat> {
  const user = await requireCoachActionUser();
  if (!bookingId) return { ok: false, feil: "Ugyldig booking." };
  const res = await prisma.booking.updateMany({
    where: { id: bookingId, ...coachBookingScope(user), status: "CONFIRMED", startAt: { lte: new Date() } },
    data: { status: "COMPLETED" },
  });
  if (res.count === 0) return { ok: false, feil: "Bare en bekreftet time som har startet, kan merkes gjennomført." };
  await audit({ actorId: user.id, action: "booking.completed.by-coach", target: `Booking:${bookingId}` });
  revalider(bookingId);
  return { ok: true };
}

const NotatSchema = z.object({ bookingId: z.string().min(1), notat: z.string().max(2000) });

export async function lagreNotat(input: { bookingId: string; notat: string }): Promise<OppfolgingResultat> {
  const user = await requireCoachActionUser();
  const p = NotatSchema.safeParse(input);
  if (!p.success) return { ok: false, feil: "Notatet kan være høyst 2000 tegn." };
  const tekst = p.data.notat.trim();
  const res = await prisma.booking.updateMany({
    where: { id: p.data.bookingId, ...coachBookingScope(user) },
    data: { notes: tekst.length > 0 ? tekst : null },
  });
  if (res.count === 0) return { ok: false, feil: "Fant ikke bookingen." };
  revalider(p.data.bookingId);
  return { ok: true };
}

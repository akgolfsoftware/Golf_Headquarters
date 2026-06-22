"use server";

/**
 * Server-actions for økt-detalj (coach-context) på /admin/gjennomfore/okter/[id].
 *
 * Økten lastes som en Booking. Eneste handling som bygges her er kansellering —
 * resten av knappene på skjermen er ekte lenker eller flagg (handlingen bor ikke
 * her ennå). Se page.tsx for begrunnelse per knapp.
 *
 * Forskjell fra bookinger/actions.ts (avvisBooking): den gjelder KUN PENDING
 * (avvis et svar). Her kan coach avlyse en allerede BEKREFTET økt også, så
 * status-guarden dekker PENDING ELLER CONFIRMED.
 */

import { revalidatePath } from "next/cache";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";

/**
 * startOkt — Booking↔live-konsoll-broen.
 *
 * Live-konsollen (/admin/live/[sessionId]) kjører på TrainingSessionV2, ikke
 * Booking. Denne action-en kobler en booking til en live-økt: finnes koblingen
 * fra før returneres den, ellers opprettes en TrainingSessionV2 fra bookingen og
 * id-en lagres på Booking.trainingSessionV2Id.
 *
 * NØYTRALE DEFAULTS (ingen øktplan finnes på en bar Booking — vi fabrikkerer
 * ikke innhold): miljo = M0 (innendørs/studio), practiceType = BLOKK
 * (blokkpraksis/teknisk). Begge er ærlige, lav-antakelse-defaults; coach kan
 * endre dem i live-konsollen.
 */
export async function startOkt(
  bookingId: string,
): Promise<{ ok: boolean; sessionId?: string; error?: string }> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  if (!bookingId) return { ok: false, error: "Mangler økt-id" };

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        userId: true,
        startAt: true,
        endAt: true,
        trainingSessionV2Id: true,
        user: { select: { name: true } },
      },
    });

    if (!booking) return { ok: false, error: "Fant ikke økten." };

    // Idempotent: er bookingen allerede koblet til en live-økt, returner den.
    if (booking.trainingSessionV2Id) {
      return { ok: true, sessionId: booking.trainingSessionV2Id };
    }

    const fornavn = booking.user?.name?.split(" ")[0] ?? "Spiller";

    const session = await prisma.trainingSessionV2.create({
      data: {
        title: `${fornavn} · økt`,
        coachId: coach.id,
        studentId: booking.userId ?? undefined,
        startTime: booking.startAt,
        endTime: booking.endAt,
        miljo: "M0", // nøytral default: innendørs/studio
        practiceType: "BLOKK", // nøytral default: blokkpraksis/teknisk
      },
      select: { id: true },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { trainingSessionV2Id: session.id },
    });

    revalidatePath(`/admin/gjennomfore/okter/${bookingId}`);

    return { ok: true, sessionId: session.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ukjent feil" };
  }
}

export async function kansellerBooking(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  if (!id) return { ok: false, error: "Mangler økt-id" };

  try {
    // Status-guard: bare aktive økter kan avlyses (ikke allerede avlyste).
    const res = await prisma.booking.updateMany({
      where: { id, status: { in: ["PENDING", "CONFIRMED"] } },
      data: { status: "CANCELLED" },
    });

    if (res.count === 0) {
      return { ok: false, error: "Økten kan ikke avlyses (allerede avlyst?)." };
    }

    // Varsle spilleren — best-effort, feiler stille i notify.
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        userId: true,
        startAt: true,
      },
    });
    if (booking?.userId) {
      const dato = booking.startAt.toLocaleDateString("nb-NO", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      await notify({
        userId: booking.userId,
        type: "booking",
        title: "Økt avlyst",
        body: `Økten din ${dato} er avlyst av coachen din.`,
        link: "/portal/booking",
      });
    }

    revalidatePath(`/admin/gjennomfore/okter/${id}`);
    revalidatePath("/admin/gjennomfore");
    revalidatePath("/admin/bookinger");

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ukjent feil" };
  }
}

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
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";

/**
 * startOkt — Booking↔live-konsoll-broen.
 *
 * Live-konsollen (/admin/live/[sessionId]) kjører på TrainingSessionV2, ikke
 * Booking. Denne action-en kobler en booking til en live-økt i tre trinn:
 *   1. Finnes koblingen fra før (Booking.trainingSessionV2Id) → returner den.
 *   2. Har coachen en planlagt økt (PLANNED) for samme spiller i bookingens
 *      tidsvindu som ikke alt er koblet → bruk DEN (coachens forarbeid:
 *      øvelser/mål/miljø vises i konsollen). KUN ved ENTYDIG treff (nøyaktig én)
 *      — 0 eller flere treff faller trygt tilbake til trinn 3. Aldri gjett.
 *   3. Ellers: opprett en frisk TrainingSessionV2 med nøytrale defaults
 *      (miljo = M0, practiceType = BLOKK). Vi fabrikkerer ikke innhold på en bar
 *      booking; coach justerer i live-konsollen. (Auto-utledning av miljø fra
 *      booket sted avventer metodikk-kanon, D1.7.)
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

    // Coach-scoping: kun egne spillere (leads uten bruker har ingen spillerdata).
    if (booking.userId && !(await harCoachTilgangTilSpiller(coach, booking.userId))) {
      return { ok: false, error: "Du har ikke tilgang til denne spilleren." };
    }

    // 1) Idempotent: er bookingen allerede koblet til en live-økt, returner den.
    if (booking.trainingSessionV2Id) {
      return { ok: true, sessionId: booking.trainingSessionV2Id };
    }

    // 2) Foretrekk en allerede planlagt økt for samme spiller i tidsvinduet.
    //    Krever spiller + ENTYDIG treff (én ledig PLANNED-økt) for å unngå å
    //    åpne feil økt — ellers fall trygt tilbake til en frisk økt.
    if (booking.userId) {
      const TOL_MS = 30 * 60 * 1000; // ±30 min toleranse på starttid
      const kandidater = await prisma.trainingSessionV2.findMany({
        where: {
          studentId: booking.userId,
          status: "PLANNED",
          startTime: {
            gte: new Date(booking.startAt.getTime() - TOL_MS),
            lte: booking.endAt,
          },
        },
        select: { id: true },
        take: 5,
      });

      if (kandidater.length > 0) {
        // Filtrer bort økter som alt er koblet til en (annen) booking.
        const koblede = await prisma.booking.findMany({
          where: { trainingSessionV2Id: { in: kandidater.map((k) => k.id) } },
          select: { trainingSessionV2Id: true },
        });
        const kobletSet = new Set(koblede.map((b) => b.trainingSessionV2Id));
        const ledige = kandidater.filter((k) => !kobletSet.has(k.id));

        if (ledige.length === 1) {
          const planlagtId = ledige[0].id;
          await prisma.booking.update({
            where: { id: bookingId },
            data: { trainingSessionV2Id: planlagtId },
          });
          revalidatePath(`/admin/gjennomfore/okter/${bookingId}`);
          return { ok: true, sessionId: planlagtId };
        }
      }
    }

    // 3) Fallback: frisk økt med nøytrale, lav-antakelse-defaults.
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
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  if (!id) return { ok: false, error: "Mangler økt-id" };

  try {
    // Coach-scoping FØR skriving: kun egne spillere (leads uten bruker er business-flyt).
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        userId: true,
        startAt: true,
      },
    });
    if (!booking) return { ok: false, error: "Fant ikke økten." };
    if (booking.userId && !(await harCoachTilgangTilSpiller(coach, booking.userId))) {
      return { ok: false, error: "Du har ikke tilgang til denne spilleren." };
    }

    // Status-guard: bare aktive økter kan avlyses (ikke allerede avlyste).
    const res = await prisma.booking.updateMany({
      where: { id, status: { in: ["PENDING", "CONFIRMED"] } },
      data: { status: "CANCELLED" },
    });

    if (res.count === 0) {
      return { ok: false, error: "Økten kan ikke avlyses (allerede avlyst?)." };
    }

    // Varsle spilleren — best-effort, feiler stille i notify.
    if (booking.userId) {
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

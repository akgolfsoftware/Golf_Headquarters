"use server";

/**
 * Flytting i AG-05 Kalender (Precision Athletics, Anders 29.09.2026).
 *
 * - Økt (WorkbenchSession): flyttes direkte med `moveSession` (samme
 *   tilgangssjekk som Workbench). Ser spilleren økta, får spilleren varsel.
 *   Coach kan angre i 10 sekunder: økta flyttes tilbake, og det uleste
 *   flyttevarselet trekkes tilbake, så spilleren ikke får to beskjeder.
 * - Booking: coach FORESLÅR ny tid. `startAt`/`endAt` endres ikke før
 *   spilleren godtar i PlayerHQ (se src/app/portal/booking/[bookingId]/actions.ts).
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { coachBookingScope } from "@/lib/auth/booking-scope";
import { prisma } from "@/lib/prisma";
import { moveSession } from "@/lib/workbench/wb-actions";
import { notify } from "@/lib/notifications";
import { audit } from "@/lib/audit";
import { logError } from "@/lib/error-tracking";
import { sjekkKollisjon, erKollisjonsfeil, kollisjonsmelding } from "@/lib/booking/kollisjonsvern";
import { hoursUntil } from "@/lib/booking/policy";
import { SPILLER_SYNLIGE_STATUSER } from "@/lib/workbench/wb-map";

export type FlyttResultat = { ok: true; varslet: boolean } | { ok: false; feil: string };

const IsoDato = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const Klokke = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/);

const FlyttOktSchema = z.object({
  sessionId: z.string().min(1),
  dato: IsoDato,
  startMin: z.number().int().min(0).max(1439),
});

/** Grupperingsnøkkel for flyttevarselet — lar «Angre» finne og trekke det tilbake. */
function flyttNokkel(sessionId: string): string {
  return `kalender-flytt:${sessionId}`;
}

function klokke(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

function datoTekst(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}

function revaliderKalender() {
  revalidatePath("/admin/kalender");
  revalidatePath("/admin/bookinger");
}

export async function flyttOktIKalender(input: { sessionId: string; dato: string; startMin: number }): Promise<FlyttResultat> {
  await requireCoachActionUser();
  const p = FlyttOktSchema.safeParse(input);
  if (!p.success) return { ok: false, feil: "Ugyldig flytting." };

  const res = await moveSession({ sessionId: p.data.sessionId, newDate: p.data.dato, newStartMinute: p.data.startMin });
  if (!res.ok) return { ok: false, feil: res.error };

  const okt = res.data;
  const spillerSer = (SPILLER_SYNLIGE_STATUSER as readonly string[]).includes(okt.status);
  if (spillerSer) {
    await notify({
      userId: okt.playerId,
      type: "plan",
      title: "Økta er flyttet",
      body: `${okt.title}: ${datoTekst(okt.date)} kl. ${klokke(okt.startMinute)}.`,
      link: "/portal",
      groupKey: flyttNokkel(okt.id),
    });
  }
  revaliderKalender();
  return { ok: true, varslet: spillerSer };
}

/**
 * «Angre» innen 10 sekunder: flytt tilbake og trekk tilbake flyttevarselet
 * hvis spilleren ikke har lest det ennå. Leste varsler står (spilleren har
 * allerede sett beskjeden) — da får spilleren beskjed om at flyttingen er angret.
 */
export async function angreOktFlytting(input: { sessionId: string; dato: string; startMin: number }): Promise<FlyttResultat> {
  await requireCoachActionUser();
  const p = FlyttOktSchema.safeParse(input);
  if (!p.success) return { ok: false, feil: "Ugyldig angring." };

  const res = await moveSession({ sessionId: p.data.sessionId, newDate: p.data.dato, newStartMinute: p.data.startMin });
  if (!res.ok) return { ok: false, feil: res.error };

  const okt = res.data;
  const nokkel = flyttNokkel(okt.id);
  const nylig = new Date(Date.now() - 2 * 60_000);
  const slettet = await prisma.notification.deleteMany({
    where: { userId: okt.playerId, groupKey: nokkel, readAt: null, createdAt: { gte: nylig } },
  });
  const lest = await prisma.notification.count({
    where: { userId: okt.playerId, groupKey: nokkel, readAt: { not: null }, createdAt: { gte: nylig } },
  });
  if (lest > 0 && slettet.count === 0) {
    await notify({
      userId: okt.playerId,
      type: "plan",
      title: "Flyttingen er angret",
      body: `${okt.title} er tilbake på ${datoTekst(okt.date)} kl. ${klokke(okt.startMinute)}.`,
      link: "/portal",
    });
  }
  revaliderKalender();
  return { ok: true, varslet: lest > 0 };
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
  const nyStart = new Date(y, m - 1, d, hh, mm, 0, 0);
  if (hoursUntil(nyStart) <= 0) return { ok: false, feil: "Ny tid må være fram i tid." };
  if (nyStart.getTime() === booking.startAt.getTime()) return { ok: false, feil: "Bookingen ligger allerede på denne tiden." };
  const nyEnd = new Date(nyStart.getTime() + (booking.endAt.getTime() - booking.startAt.getTime()));

  try {
    await prisma.$transaction(async (tx) => {
      await sjekkKollisjon(tx, {
        coachId: booking.coachId,
        serviceTypeId: booking.serviceTypeId,
        facilityId: booking.facilityId,
        startAt: nyStart,
        endAt: nyEnd,
        ekskluderBookingId: booking.id,
      });
      await tx.booking.update({
        where: { id: booking.id },
        data: { proposedStartAt: nyStart, proposedEndAt: nyEnd, proposedAt: new Date(), proposedById: user.id },
      });
    });
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

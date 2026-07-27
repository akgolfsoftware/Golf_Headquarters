/**
 * Kildeadaptere: henter en intern økt/hendelse og pusher den til Google
 * (steg 3, 2026-07-27).
 *
 * Én funksjon per kildetype. Hver finner riktig coach, bygger en PushKilde og
 * overlater resten til google-calendar-push.
 *
 * Alle er best-effort: de kaster aldri videre. En feilet Google-push skal
 * aldri velte lagringen av selve økta i AgencyOS.
 */
import { prisma } from "@/lib/prisma";
import {
  pushKildeTilGoogle,
  fjernKildeFraGoogle,
  type PushResultat,
} from "@/lib/google-calendar-push";

const INGEN: PushResultat = { skrevet: 0, feilet: 0, hoppetOver: true };

/**
 * Hendelser uten coach (ferie/stengt for hele akademiet) legges i eierens
 * kalender — samme mønster som Meg-assistenten bruker.
 */
async function finnEierUserId(): Promise<string | null> {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", googleCalendar: { status: "ACTIVE" } },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  return admin?.id ?? null;
}

/**
 * Booking → Google.
 *
 * Erstatter den gamle pushBookingToCalendar i google-calendar.ts. To feil er
 * rettet på veien:
 *   1. Tid ble sendt som toISOString() (med Z) sammen med timeZone Oslo →
 *      Google tolket den som UTC og viste avtalen to timer feil om sommeren.
 *   2. Kun første push-kalenders event-id ble lagret, så oppdatering/sletting
 *      traff bare én kalender. Nå har hver kalender sin egen rad.
 *
 * Booking.googleEventId settes fortsatt (første kalender) — webhook og
 * refleksjon matcher innkommende Google-endringer på det feltet.
 * Returnerer event-id hvis minst én push lyktes, ellers null.
 */
export async function pushBooking(bookingId: string): Promise<string | null> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { name: true, email: true } },
        serviceType: { select: { name: true, coachUserId: true } },
        location: { select: { name: true, address: true } },
      },
    });
    if (!booking?.serviceType.coachUserId) return null;

    const navn = booking.user?.name ?? booking.guestName ?? "Gjest";
    const epost = booking.user?.email ?? booking.guestEmail ?? null;

    const res = await pushKildeTilGoogle(booking.serviceType.coachUserId, {
      type: "BOOKING",
      id: booking.id,
      summary: `${booking.serviceType.name} — ${navn}`,
      description: [
        epost ? `Spiller: ${navn} (${epost})` : `Spiller: ${navn}`,
        booking.notes ? `Notater: ${booking.notes}` : null,
        "Booket via AK Golf Platform",
      ]
        .filter(Boolean)
        .join("\n"),
      location: `${booking.location.name}, ${booking.location.address}`,
      startAt: booking.startAt,
      endAt: booking.endAt,
      attendee: epost ? { email: epost, navn } : null,
    });
    if (res.skrevet === 0) return null;

    const rad = await prisma.pushedCalendarEvent.findFirst({
      where: { kildeType: "BOOKING", kildeId: booking.id },
      select: { googleEventId: true },
      orderBy: { createdAt: "asc" },
    });
    if (rad && rad.googleEventId !== booking.googleEventId) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { googleEventId: rad.googleEventId },
      });
    }
    return rad?.googleEventId ?? null;
  } catch (err) {
    console.error(
      `[gcal-kilder] pushBooking(${bookingId}) feilet`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

/** Fjern en booking fra alle Google-kalendere den ligger i. */
export async function fjernBooking(
  coachUserId: string,
  bookingId: string,
): Promise<number> {
  try {
    return await fjernKildeFraGoogle(coachUserId, "BOOKING", bookingId);
  } catch (err) {
    console.error(
      `[gcal-kilder] fjernBooking(${bookingId}) feilet`,
      err instanceof Error ? err.message : err,
    );
    return 0;
  }
}

/** Kalenderhendelse: ferie, stengt anlegg, møte. */
export async function pushKalenderHendelse(
  calendarEventId: string,
): Promise<PushResultat> {
  try {
    const h = await prisma.calendarEvent.findUnique({
      where: { id: calendarEventId },
    });
    if (!h) return INGEN;

    const coachUserId = h.coachId ?? (await finnEierUserId());
    if (!coachUserId) return INGEN;

    // Hendelser som dekker hele døgn (00:00 → 00:00) sendes som heldags,
    // slik at de vises som en bånd øverst i Google — ikke som en 24-timers
    // blokk tvers gjennom dagen.
    const heldag =
      h.startAt.getHours() === 0 &&
      h.startAt.getMinutes() === 0 &&
      h.endAt.getHours() === 0 &&
      h.endAt.getMinutes() === 0 &&
      h.endAt.getTime() > h.startAt.getTime();

    return await pushKildeTilGoogle(coachUserId, {
      type: "CALENDAR_EVENT",
      id: h.id,
      summary: h.title,
      description: [h.notes, "Fra AgencyOS"].filter(Boolean).join("\n"),
      startAt: h.startAt,
      endAt: h.endAt,
      heldag,
    });
  } catch (err) {
    console.error(
      `[gcal-kilder] pushKalenderHendelse(${calendarEventId}) feilet`,
      err instanceof Error ? err.message : err,
    );
    return INGEN;
  }
}

export async function fjernKalenderHendelse(
  calendarEventId: string,
  coachId: string | null,
): Promise<void> {
  try {
    const userId = coachId ?? (await finnEierUserId());
    if (!userId) return;
    await fjernKildeFraGoogle(userId, "CALENDAR_EVENT", calendarEventId);
  } catch (err) {
    console.error(
      `[gcal-kilder] fjernKalenderHendelse(${calendarEventId}) feilet`,
      err instanceof Error ? err.message : err,
    );
  }
}

/** Gruppetime (GroupSchedule) — én forekomst, eller serieanker ved WEEKLY. */
export async function pushGruppeTime(
  groupScheduleId: string,
): Promise<PushResultat> {
  try {
    const s = await prisma.groupSchedule.findUnique({
      where: { id: groupScheduleId },
      include: { group: { select: { name: true, coachId: true } } },
    });
    if (!s) return INGEN;

    const coachUserId = s.group.coachId ?? (await finnEierUserId());
    if (!coachUserId) return INGEN;

    return await pushKildeTilGoogle(coachUserId, {
      type: "GROUP_SCHEDULE",
      id: s.id,
      summary: `${s.title} — ${s.group.name}`,
      description: [s.description, "Gruppetime fra AgencyOS"]
        .filter(Boolean)
        .join("\n"),
      location: s.location,
      startAt: s.startAt,
      endAt: s.endAt,
    });
  } catch (err) {
    console.error(
      `[gcal-kilder] pushGruppeTime(${groupScheduleId}) feilet`,
      err instanceof Error ? err.message : err,
    );
    return INGEN;
  }
}

export async function fjernGruppeTime(
  groupScheduleId: string,
  coachId: string | null,
): Promise<void> {
  try {
    const userId = coachId ?? (await finnEierUserId());
    if (!userId) return;
    await fjernKildeFraGoogle(userId, "GROUP_SCHEDULE", groupScheduleId);
  } catch (err) {
    console.error(
      `[gcal-kilder] fjernGruppeTime(${groupScheduleId}) feilet`,
      err instanceof Error ? err.message : err,
    );
  }
}

/** Treningsøkt (TrainingSessionV2). */
export async function pushTreningsokt(
  sessionId: string,
): Promise<PushResultat> {
  try {
    const s = await prisma.trainingSessionV2.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        status: true,
        coachId: true,
        hostId: true,
      },
    });
    if (!s) return INGEN;

    // Avlyste økter skal ikke ligge i Google.
    if (s.status === "CANCELLED") {
      await fjernKildeFraGoogle(
        s.coachId ?? s.hostId ?? "",
        "TRAINING_SESSION",
        s.id,
      );
      return INGEN;
    }

    const coachUserId = s.coachId ?? s.hostId;
    if (!coachUserId) return INGEN;

    return await pushKildeTilGoogle(coachUserId, {
      type: "TRAINING_SESSION",
      id: s.id,
      summary: s.title,
      description: "Treningsøkt fra AgencyOS",
      startAt: s.startTime,
      endAt: s.endTime,
    });
  } catch (err) {
    console.error(
      `[gcal-kilder] pushTreningsokt(${sessionId}) feilet`,
      err instanceof Error ? err.message : err,
    );
    return INGEN;
  }
}

export async function fjernTreningsokt(
  sessionId: string,
  coachUserId: string,
): Promise<void> {
  try {
    await fjernKildeFraGoogle(coachUserId, "TRAINING_SESSION", sessionId);
  } catch (err) {
    console.error(
      `[gcal-kilder] fjernTreningsokt(${sessionId}) feilet`,
      err instanceof Error ? err.message : err,
    );
  }
}

/**
 * Tilgjengelighet-engine for booking-flow.
 *
 * Returnerer ledige slots for en gitt dato + tjeneste basert på:
 * - CoachAvailability (ukedag + start/slutt-tider)
 * - Eksisterende Booking (status != CANCELLED)
 * - Tjenestens varighet
 * - Tjenestens buffer før og etter, minste varsel og maks dager fram
 *   (bookingplanen steg 2, 15.10.2026)
 */

import { vurderDeling } from "@/lib/booking/deling";
import { forsteLedigeRom } from "@/lib/booking/rom";
import { tilNaivVeggklokke } from "@/lib/google-calendar-tid";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { getCalendarBusy } from "@/lib/google-calendar";
import { kalenderBlokkererSlot, type CalendarBusyResult } from "@/lib/booking/calendar-result";

export type Slot = {
  start: Date;
  end: Date;
  coachId: string;
  coachName: string;
};

const SLOT_INTERVAL_MIN = 30;

/** Reglene på tjenesten som styrer hvilke luker som tilbys. */
export type LukeRegler = {
  durationMin: number;
  bufferForMin: number;
  bufferEtterMin: number;
  minVarselTimer: number;
  maksDagerFram: number;
};

/**
 * Er dagen innenfor «maks dager fram» fra i dag (Oslo-veggklokke)? Dag 0 er
 * i dag, så maksDagerFram = 7 gir i dag og de seks neste dagene, som den gamle
 * faste sjudagersstrimmelen på BK-01.
 */
export function dagInnenforMaksFram(date: Date, maksDagerFram: number, naa: Date): boolean {
  const idag = new Date(naa);
  idag.setHours(0, 0, 0, 0);
  const dag = new Date(date);
  dag.setHours(0, 0, 0, 0);
  const diffDager = Math.round((dag.getTime() - idag.getTime()) / 86_400_000);
  return diffDager >= 0 && diffDager < Math.max(1, maksDagerFram);
}

/** Tidligste start som respekterer minste varsel. */
export function tidligsteStart(naa: Date, minVarselTimer: number): Date {
  return new Date(naa.getTime() + Math.max(0, minVarselTimer) * 3_600_000);
}

// Antall hele uker siden en fast mandag-epoke (1970-01-05). Brukes til å avgjøre
// om et «hver Nte uke»-vindu treffer en gitt dato.
function ukeNummer(d: Date): number {
  const epoke = Date.UTC(1970, 0, 5); // mandag
  const dag = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((dag - epoke) / (7 * 86_400_000));
}

/**
 * Returner ledige tider for tjenesten på gitt dato.
 *
 * @param serviceTypeId — ID på tjenesten
 * @param date — dato (vi bruker bare år/måned/dag, tidssone Europe/Oslo)
 */
export async function getAvailableSlots(
  serviceTypeId: string,
  date: Date,
  locationId?: string,
): Promise<Slot[]> {
  const service = await prisma.serviceType.findUnique({
    where: { id: serviceTypeId },
  });
  if (!service || !service.active) return [];

  const now = tilNaivVeggklokke(new Date());
  // Maks dager fram: dager etter vinduet har ingen luker, uansett tilgjengelighet.
  if (!dagInnenforMaksFram(date, service.maksDagerFram, now)) return [];

  // 0 = søndag i JS Date.getDay(), men 0 = mandag i CoachAvailability.
  // Konverter: (jsDay + 6) % 7.
  const weekday = (date.getDay() + 6) % 7;

  const dagStart = new Date(date);
  dagStart.setHours(0, 0, 0, 0);
  const dagSlutt = new Date(date);
  dagSlutt.setHours(23, 59, 59, 999);

  // Hent aktive availability-vinduer for DENNE datoen. HVOR (sted) legges til
  // kun når kalleren oppgir lokasjon — da tilbys en coach aldri på et anlegg de
  // ikke har satt seg tilgjengelig. Uten lokasjon: legacy «alle steder».
  const andKlausuler: Prisma.CoachAvailabilityWhereInput[] = [
    // NÅR: ukentlig på denne ukedagen ELLER én-gangs på denne datoen.
    { OR: [{ weekday }, { date: { gte: dagStart, lte: dagSlutt } }] },
    // PERIODE-gyldighet (års-perioder): vinduet må omslutte datoen.
    { OR: [{ validFrom: null }, { validFrom: { lte: dagSlutt } }] },
    { OR: [{ validTo: null }, { validTo: { gte: dagStart } }] },
  ];
  if (locationId) {
    andKlausuler.push({ OR: [{ locationId }, { locationId: null }] });
  }
  const availability = await prisma.coachAvailability.findMany({
    where: { active: true, ...(service.coachUserId ? { coachId: service.coachUserId } : {}), AND: andKlausuler },
    include: { coach: { select: { id: true, name: true, role: true, bookingBufferMin: true } } },
  });

  if (availability.length === 0) return [];

  // Repetisjon: dropp ukentlige vinduer som ikke treffer denne uka (hver Nte).
  // Ankret til validFrom (ellers fast epoke). Én-gangs-datoer påvirkes ikke.
  const ukeIdag = ukeNummer(date);
  const gjeldende = availability.filter((av) => {
    if (!av.recurrenceInterval || av.recurrenceInterval <= 1 || av.weekday === null) {
      return true;
    }
    const ankerUke = ukeNummer(av.validFrom ?? new Date(0));
    const n = av.recurrenceInterval;
    return ((((ukeIdag - ankerUke) % n) + n) % n) === 0;
  });
  if (gjeldende.length === 0) return [];

  // Hent eksisterende bookinger for denne dagen (uavhengig av coach).
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const existing = await prisma.booking.findMany({
    where: {
      startAt: { lt: dayEnd },
      endAt: { gt: dayStart },
      status: { in: ["PENDING", "CONFIRMED", "COMPLETED", "NO_SHOW"] },
    },
    select: { coachId: true, serviceTypeId: true, startAt: true, endAt: true, plassNr: true, facilityId: true },
  });

  // Steg 2: krever tjenesten en romtype på stedet, tilbys tiden bare når et rom av typen er ledig.
  // Mangler stedet eller rommene, tilbys ingenting (fail-closed, som kalenderen).
  const romStedId = service.locationId ?? locationId ?? null;
  const rom = service.facilityType
    ? romStedId
      ? await prisma.facility.findMany({
          where: { locationId: romStedId, type: service.facilityType, active: true },
          select: { id: true, capacity: true },
          orderBy: [{ name: "asc" }, { id: "asc" }],
        })
      : []
    : null;
  if (rom && rom.length === 0) return [];

  // I3: kalenderhendelser (ferie, stengt anlegg, møte) som overlapper dagen.
  // coachId=null blokkerer alle coacher, ellers kun den aktuelle coachen.
  const hendelser = await prisma.calendarEvent.findMany({
    where: { startAt: { lt: dayEnd }, endAt: { gt: dayStart } },
    select: { coachId: true, startAt: true, endAt: true },
  });

  // Hent travle tider fra Google Calendar per coach (parallelt).
  // Hvis en coach ikke har koblet Calendar, returneres tom liste.
  const uniqueCoachIds = Array.from(
    new Set(
      gjeldende
        .filter((av) => av.coach && (av.coach.role === "COACH" || av.coach.role === "ADMIN"))
        .map((av) => av.coach.id),
    ),
  );
  const busyPerCoach = new Map<string, CalendarBusyResult>();
  await Promise.all(
    uniqueCoachIds.map(async (coachId) => {
      const result = await getCalendarBusy(coachId, dayStart, dayEnd);
      busyPerCoach.set(coachId, result);
    }),
  );

  const slots: Slot[] = [];
  // Minste varsel: luker nærmere enn så mange timer tilbys ikke.
  const tidligste = tidligsteStart(now, service.minVarselTimer);
  const bufferFor = Math.max(0, service.bufferForMin) * 60_000;
  const bufferEtter = Math.max(0, service.bufferEtterMin) * 60_000;

  for (const av of gjeldende) {
    if (!av.coach || (av.coach.role !== "COACH" && av.coach.role !== "ADMIN")) {
      continue;
    }
    const kalender = busyPerCoach.get(av.coach.id);
    // Fail-closed: kunne ikke sjekke coachens kalender ⇒ vis ingen slots for
    // den coachen (unngå dobbeltbooking mot private avtaler).
    if (!kalender || !kalender.ok) continue;

    const [startH, startM] = av.startTime.split(":").map(Number);
    const [endH, endM] = av.endTime.split(":").map(Number);

    let cursor = new Date(date);
    cursor.setHours(startH, startM, 0, 0);
    const dayEndForAv = new Date(date);
    dayEndForAv.setHours(endH, endM, 0, 0);

    while (cursor.getTime() + service.durationMin * 60_000 <= dayEndForAv.getTime()) {
      const slotEnd = new Date(cursor.getTime() + service.durationMin * 60_000);

      // Filtrer ut historiske slots og slots innenfor minste varsel.
      if (cursor.getTime() >= tidligste.getTime()) {
        // Bufferen holdes av rundt timen: en annen avtale som ligger innenfor
        // bufferen før eller etter, blokkerer luka. Deling (2-til-1) sjekkes
        // fortsatt på selve timen, så nøyaktig samme økt teller ikke som konflikt.
        // Coachens egen buffer (bookingplanen steg 3) gjelder i tillegg; den største vinner.
        const coachBuffer = Math.max(0, av.coach.bookingBufferMin ?? 0) * 60_000;
        const medBufferStart = new Date(cursor.getTime() - Math.max(bufferFor, coachBuffer));
        const medBufferEnd = new Date(slotEnd.getTime() + Math.max(bufferEtter, coachBuffer));
        // Sjekk konflikt med eksisterende bookinger ELLER Calendar-busy.
        const overlapping = existing.filter(b => b.coachId === av.coach.id && medBufferStart < b.endAt && medBufferEnd > b.startAt);
        const bookingConflict = vurderDeling(overlapping, { serviceTypeId: service.id, startAt: cursor, endAt: slotEnd }, service.maxDeltakere).utfall !== "ledig";
        const hendelseConflict = hendelser.some(
          (h) =>
            (h.coachId === null || h.coachId === av.coach.id) &&
            medBufferStart.getTime() < h.endAt.getTime() &&
            medBufferEnd.getTime() > h.startAt.getTime(),
        );
        const calendarConflict = kalenderBlokkererSlot(kalender, medBufferStart, medBufferEnd);
        const romConflict = rom !== null && forsteLedigeRom(rom, existing, cursor, slotEnd) === null;
        const conflict = bookingConflict || hendelseConflict || calendarConflict || romConflict;
        if (!conflict) {
          slots.push({
            start: new Date(cursor),
            end: slotEnd,
            coachId: av.coach.id,
            coachName: av.coach.name ?? "Coach",
          });
        }
      }
      cursor = new Date(cursor.getTime() + SLOT_INTERVAL_MIN * 60_000);
    }
  }

  // Sorter etter starttid.
  slots.sort((a, b) => a.start.getTime() - b.start.getTime());
  return slots.filter((slot, index, all) => all.findIndex(other => other.coachId === slot.coachId && other.start.getTime() === slot.start.getTime()) === index);
}

/**
 * Verifiser at et spesifikt slot fortsatt er ledig.
 * Brukes ved checkout for å unngå race conditions.
 *
 * Soft slot-hold (3 min) respekteres: annen holders hold → false.
 * holderId = egen bruker/guest-nøkkel (kan fornye sitt hold).
 */
export async function isSlotStillAvailable(
  serviceTypeId: string,
  startAt: Date,
  coachId: string,
  holderId?: string | null,
): Promise<boolean> {
  if (!Number.isFinite(startAt.getTime())) return false;
  const { isBlockedByHold } = await import("@/lib/booking/slot-hold");
  if (await isBlockedByHold({ serviceTypeId, coachId, startIso: startAt.toISOString() }, holderId)) return false;
  // Same window, recurrence, coach, capacity and calendar rules as the offered slots.
  const offered = await getAvailableSlots(serviceTypeId, startAt);
  return offered.some(slot => slot.coachId === coachId && slot.start.getTime() === startAt.getTime());
}

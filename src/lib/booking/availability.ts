/**
 * Tilgjengelighet-engine for booking-flow.
 *
 * Returnerer ledige slots for en gitt dato + tjeneste basert på:
 * - CoachAvailability (ukedag + start/slutt-tider)
 * - Eksisterende Booking (status != CANCELLED)
 * - Tjenestens varighet
 */

import { prisma } from "@/lib/prisma";

export type Slot = {
  start: Date;
  end: Date;
  coachId: string;
  coachName: string;
};

const SLOT_INTERVAL_MIN = 30;

/**
 * Returner ledige tider for tjenesten på gitt dato.
 *
 * @param serviceTypeId — ID på tjenesten
 * @param date — dato (vi bruker bare år/måned/dag, tidssone Europe/Oslo)
 */
export async function getAvailableSlots(
  serviceTypeId: string,
  date: Date,
): Promise<Slot[]> {
  const service = await prisma.serviceType.findUnique({
    where: { id: serviceTypeId },
  });
  if (!service || !service.active) return [];

  // 0 = søndag i JS Date.getDay(), men 0 = mandag i CoachAvailability.
  // Konverter: (jsDay + 6) % 7.
  const weekday = (date.getDay() + 6) % 7;

  // Hent alle aktive availability-slots for denne ukedagen.
  const availability = await prisma.coachAvailability.findMany({
    where: { weekday, active: true },
    include: { coach: { select: { id: true, name: true, role: true } } },
  });

  if (availability.length === 0) return [];

  // Hent eksisterende bookinger for denne dagen (uavhengig av coach).
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const existing = await prisma.booking.findMany({
    where: {
      startAt: { gte: dayStart, lte: dayEnd },
      status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
    },
    select: { startAt: true, endAt: true },
  });

  const slots: Slot[] = [];
  const now = new Date();

  for (const av of availability) {
    if (!av.coach || (av.coach.role !== "COACH" && av.coach.role !== "ADMIN")) {
      continue;
    }

    const [startH, startM] = av.startTime.split(":").map(Number);
    const [endH, endM] = av.endTime.split(":").map(Number);

    let cursor = new Date(date);
    cursor.setHours(startH, startM, 0, 0);
    const dayEndForAv = new Date(date);
    dayEndForAv.setHours(endH, endM, 0, 0);

    while (cursor.getTime() + service.durationMin * 60_000 <= dayEndForAv.getTime()) {
      const slotEnd = new Date(cursor.getTime() + service.durationMin * 60_000);

      // Filtrer ut historiske slots.
      if (cursor.getTime() > now.getTime()) {
        // Sjekk konflikt med eksisterende bookinger.
        const conflict = existing.some(
          (b) =>
            cursor.getTime() < b.endAt.getTime() &&
            slotEnd.getTime() > b.startAt.getTime(),
        );
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
  return slots;
}

/**
 * Verifiser at et spesifikt slot fortsatt er ledig.
 * Brukes ved checkout for å unngå race conditions.
 */
export async function isSlotStillAvailable(
  serviceTypeId: string,
  startAt: Date,
  coachId: string,
): Promise<boolean> {
  const service = await prisma.serviceType.findUnique({
    where: { id: serviceTypeId },
  });
  if (!service) return false;

  const endAt = new Date(startAt.getTime() + service.durationMin * 60_000);

  const conflict = await prisma.booking.findFirst({
    where: {
      startAt: { lt: endAt },
      endAt: { gt: startAt },
      status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
    },
  });

  return !conflict;
}

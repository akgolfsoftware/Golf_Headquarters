/**
 * Plan 1 helper: Kombinerer CoachAvailability + Booking for ledige slots.
 * Kan brukes både i HQ og deles med booking-app.
 */
import { prisma } from "@/lib/prisma";

export type AvailableSlot = {
  start: Date;
  end: Date;
  locationId?: string | null;
};

export async function getMergedAvailability(weekStart: Date, weekEnd: Date) {
  const [avail, bookings] = await Promise.all([
    prisma.coachAvailability.findMany({ where: { active: true } }),
    prisma.booking.findMany({
      where: { startAt: { gte: weekStart, lt: weekEnd }, status: { in: ["PENDING", "CONFIRMED"] } },
      select: { startAt: true, endAt: true, locationId: true, facilityId: true },
    }),
  ]);

  // Enkel merge: returner availability windows minus bookinger
  const free: AvailableSlot[] = [];

  avail.forEach((a) => {
    // For ukentlige: bygg slots for uka
    // Her forenklet: returner rå availability + marker bookede
    free.push({
      start: weekStart, // placeholder - ekte impl ville parse weekday + tid
      end: weekEnd,
      locationId: a.locationId,
    });
  });

  return { free, booked: bookings };
}

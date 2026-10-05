/**
 * Felles dataoppslag for PH-23 Booking (/portal/booking og /portal/meg/bookinger).
 * Bare ekte data: tjenester og priser fra ServiceType, timer fra hub-data, ledige
 * tider fra availability-engine. Feiler oppslaget av tider, vises ingen tider.
 */

import { prisma } from "@/lib/prisma";
import { getBookingHubData } from "@/lib/portal-booking/hub-data";
import { beregnSlotVindu, type SlotVindu } from "@/lib/portal-booking/slot-vindu";
import { mapHubDataToPH23, type PH23BookingData, type PH23Service } from "@/lib/portal-booking/ph23-booking-data";
import { logError } from "@/lib/error-tracking";

export async function hentPH23Data(user: { id: string; email: string | null }): Promise<PH23BookingData> {
  const [hub, dbServices] = await Promise.all([
    getBookingHubData(user.id),
    prisma.serviceType.findMany({
      where: { active: true },
      include: { coach: { select: { id: true, name: true } } },
      orderBy: { durationMin: "asc" },
    }),
  ]);

  const services: PH23Service[] = dbServices.map((s) => ({
    id: s.id,
    name: s.name,
    min: s.durationMin,
    coach: s.coach?.name ?? null,
    coachId: s.coach?.id ?? null,
    clip: s.priceOre === 0 || hub.credits.canUseCredits,
    price: s.priceOre > 0 ? s.priceOre / 100 : null,
    note: s.description ?? undefined,
  }));

  let slotVindu: SlotVindu | null = null;
  if (services[0]) {
    try {
      slotVindu = await beregnSlotVindu(services[0].id, 14);
    } catch (error) {
      await logError({ context: "portal.booking.ph23.slots", error, meta: { userId: user.id }, severity: "warn" });
    }
  }

  return mapHubDataToPH23(hub, user.email ?? "", services, slotVindu);
}

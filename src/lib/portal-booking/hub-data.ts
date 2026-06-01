/**
 * Data-loader for booking-hub (/portal/booking).
 *
 * Henter ALT fra ekte Prisma — aldri hardkodede tall:
 *   - Abonnement (tier + credit-saldo) lest DIREKTE fra subscription-tabellen,
 *     ikke fra user.tier (som overstyres av PRO-kampanjen i getCurrentUser).
 *   - Kommende bookinger (PENDING + CONFIRMED, startAt >= nå).
 *   - Tilgjengelige coacher: User med rolle COACH som eier minst én aktiv
 *     ServiceType. Fra-pris = laveste aktive serviceType-pris for coachen.
 *
 * Presentasjons-komponenten (booking-hub.tsx) tar kun disse typene som props.
 */

import { prisma } from "@/lib/prisma";
import type { Tier } from "@/generated/prisma/client";

const NOK = new Intl.NumberFormat("nb-NO");

export type HubCredits = {
  tier: Tier;
  /** Antall coaching-timer pakken gir per måned (0 for GRATIS). */
  monthlyCredits: number;
  /** Saldo for inneværende periode. */
  creditsRemaining: number;
  /** Når saldoen fornyes — ISO-streng eller null. */
  renewsAtIso: string | null;
  /** True hvis brukeren kan booke med credits (aktivt abonnement + credits-pakke). */
  canUseCredits: boolean;
};

export type HubBooking = {
  id: string;
  serviceName: string;
  locationName: string;
  coachName: string | null;
  startIso: string;
  durationMin: number;
  /** True hvis trukket fra abonnement (credit-booking), false = betalt. */
  fromCredits: boolean;
  status: "PENDING" | "CONFIRMED";
};

export type HubCoach = {
  id: string;
  name: string;
  initials: string;
  /** Antall aktive tjenester coachen tilbyr. */
  serviceCount: number;
  /** Laveste aktive fra-pris, formatert "600 kr" — null hvis bare credit-tjenester. */
  fromPrice: string | null;
};

export type BookingHubData = {
  credits: HubCredits;
  upcoming: HubBooking[];
  coaches: HubCoach[];
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export async function getBookingHubData(userId: string): Promise<BookingHubData> {
  const now = new Date();

  const [subscription, upcomingRows, coachRows] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.booking.findMany({
      where: {
        userId,
        startAt: { gte: now },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      orderBy: { startAt: "asc" },
      take: 8,
      include: {
        serviceType: { select: { name: true, durationMin: true } },
        location: { select: { name: true } },
        coach: { select: { name: true } },
      },
    }),
    prisma.user.findMany({
      where: {
        role: "COACH",
        deletedAt: null,
        serviceTypes: { some: { active: true } },
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        serviceTypes: {
          where: { active: true },
          select: { priceOre: true },
        },
      },
    }),
  ]);

  const credits: HubCredits = {
    tier: subscription?.tier ?? "GRATIS",
    monthlyCredits: subscription?.monthlyCredits ?? 0,
    creditsRemaining: subscription?.creditsRemaining ?? 0,
    renewsAtIso: subscription?.currentPeriodEnd?.toISOString() ?? null,
    canUseCredits:
      !!subscription &&
      subscription.status === "ACTIVE" &&
      subscription.monthlyCredits > 0,
  };

  const upcoming: HubBooking[] = upcomingRows.map((b) => ({
    id: b.id,
    serviceName: b.serviceType.name,
    locationName: b.location.name,
    coachName: b.coach?.name ?? null,
    startIso: b.startAt.toISOString(),
    durationMin: b.serviceType.durationMin,
    fromCredits: b.subscriptionId !== null,
    status: b.status as "PENDING" | "CONFIRMED",
  }));

  const coaches: HubCoach[] = coachRows.map((c) => {
    const priced = c.serviceTypes.map((s) => s.priceOre).filter((p) => p > 0);
    const min = priced.length > 0 ? Math.min(...priced) : null;
    return {
      id: c.id,
      name: c.name,
      initials: initialsFromName(c.name),
      serviceCount: c.serviceTypes.length,
      fromPrice: min !== null ? `${NOK.format(min / 100)} kr` : null,
    };
  });

  return { credits, upcoming, coaches };
}

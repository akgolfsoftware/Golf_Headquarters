/**
 * /admin/bookinger/ny — Manuell oppretting av booking for coach/admin.
 *
 * Server-shell: auth-guard + ekte Prisma-data (spillere, aktive tjenester,
 * lokasjoner med fasiliteter). 5-stegs flyt rendres av NyBookingWizard (client)
 * som wirer mot eksisterende server-action createSessionFromCalendar.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { NyBookingWizard } from "@/components/admin/bookinger/ny-booking-wizard";

export const dynamic = "force-dynamic";

export default async function NyBookingPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [spillere, tjenester, lokasjoner] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PLAYER", deletedAt: null },
      select: { id: true, name: true, email: true, homeClub: true },
      orderBy: { name: "asc" },
      take: 300,
    }),
    prisma.serviceType.findMany({
      where: { active: true },
      select: { id: true, name: true, durationMin: true, priceOre: true },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        address: true,
        facilities: {
          where: { active: true },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <NyBookingWizard
      spillere={spillere.map((s) => ({
        id: s.id,
        name: s.name ?? "Uten navn",
        email: s.email,
        homeClub: s.homeClub,
      }))}
      tjenester={tjenester}
      lokasjoner={lokasjoner}
    />
  );
}

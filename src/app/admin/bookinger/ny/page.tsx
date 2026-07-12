/**
 * /admin/bookinger/ny — Manuell oppretting av booking for coach/admin (v2).
 *
 * Portet fra (legacy) 2026-07-12: samme auth-guard, dataloading og
 * NyBookingWizard (5-stegs klient-wizard mot createSessionFromCalendar) —
 * nå i V2Shell (AgencyOS-chrome, aktiv=bookinger) i stedet for legacy-layout.
 * Wizarden bruker semantiske tokens (foreground/muted/primary) og rendrer
 * riktig i mørk v2-scope.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { NyBookingWizard } from "@/components/admin/bookinger/ny-booking-wizard";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";

export const dynamic = "force-dynamic";

export default async function NyBookingPage({ searchParams }: { searchParams: Promise<{ groupId?: string }> }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const { groupId } = await searchParams;

  const [spillere, tjenester, lokasjoner, gruppe] = await Promise.all([
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
    groupId ? prisma.group.findUnique({ where: { id: groupId }, select: { id: true, name: true, maxParticipants: true } }) : Promise.resolve(null),
  ]);

  return (
    <V2Shell aktiv="bookinger" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <NyBookingWizard
        spillere={spillere.map((s) => ({
          id: s.id,
          name: s.name ?? "Uten navn",
          email: s.email,
          homeClub: s.homeClub,
        }))}
        tjenester={tjenester}
        lokasjoner={lokasjoner}
        groupId={groupId}
        group={gruppe ? { id: gruppe.id, name: gruppe.name, maxParticipants: gruppe.maxParticipants } : null}
      />
    </V2Shell>
  );
}

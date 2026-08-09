/**
 * /admin/bookinger/ny — Manuell oppretting av booking for coach/admin (v2).
 *
 * Multi-coach (2026-08-08):
 * - ADMIN ser alle aktive tjenester med coach-navn.
 * - COACH ser egne + felles (coachUserId null).
 * - Fasiliteter lastes per lokasjon (capacity i wizard).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { NyBookingWizard } from "@/components/admin/bookinger/ny-booking-wizard";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { policyBannerTexts } from "@/lib/booking/policy";

export const dynamic = "force-dynamic";

export default async function NyBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ groupId?: string; start?: string; coachId?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const erAdmin = user.role === "ADMIN";
  const { groupId, start, coachId: coachPrefill } = await searchParams;

  const [spillere, tjenester, lokasjoner, coacher, gruppe] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PLAYER", deletedAt: null },
      select: { id: true, name: true, email: true, homeClub: true },
      orderBy: { name: "asc" },
      take: 300,
    }),
    prisma.serviceType.findMany({
      where: {
        active: true,
        ...(erAdmin
          ? {}
          : { OR: [{ coachUserId: user.id }, { coachUserId: null }] }),
      },
      select: {
        id: true,
        name: true,
        durationMin: true,
        priceOre: true,
        maxDeltakere: true,
        coachUserId: true,
        coach: { select: { id: true, name: true } },
      },
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
          select: { id: true, name: true, capacity: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    erAdmin
      ? prisma.user.findMany({
          where: { role: { in: ["COACH", "ADMIN"] } },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
          take: 50,
        })
      : Promise.resolve([{ id: user.id, name: user.name }]),
    groupId
      ? prisma.group.findUnique({
          where: { id: groupId },
          select: { id: true, name: true, maxParticipants: true },
        })
      : Promise.resolve(null),
  ]);

  const policy = policyBannerTexts();

  return (
    <V2Shell bredde="kolonne" aktiv="bookinger" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <NyBookingWizard
        spillere={spillere.map((s) => ({
          id: s.id,
          name: s.name ?? "Uten navn",
          email: s.email,
          homeClub: s.homeClub,
        }))}
        tjenester={tjenester.map((t) => ({
          id: t.id,
          name: t.name,
          durationMin: t.durationMin,
          priceOre: t.priceOre,
          maxDeltakere: t.maxDeltakere,
          coachUserId: t.coachUserId,
          coachName: t.coach?.name ?? null,
        }))}
        lokasjoner={lokasjoner.map((l) => ({
          id: l.id,
          name: l.name,
          address: l.address,
          facilities: l.facilities.map((f) => ({
            id: f.id,
            name: f.name,
            capacity: f.capacity,
          })),
        }))}
        coacher={coacher.map((c) => ({
          id: c.id,
          name: c.name ?? "Coach",
        }))}
        viewerErAdmin={erAdmin}
        viewerCoachId={user.id}
        defaultCoachId={coachPrefill ?? (erAdmin ? undefined : user.id)}
        groupId={groupId}
        group={gruppe}
        defaultStart={start}
        policyHint={policy.cancel}
      />
    </V2Shell>
  );
}

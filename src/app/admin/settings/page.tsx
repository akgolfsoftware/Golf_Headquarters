/**
 * AgencyOS — Innstillinger-hub (`/admin/settings`), v2. Port av
 * `(legacy)/settings/page.tsx` (2026-07-14, AgencyOS Bølge 3.32) — samme
 * Prisma-aggregering (klubber + coacher/unike spillere).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminInnstillingerV2, type KlubbRadV2, type TeamRadV2 } from "@/components/admin/v2/AdminInnstillingerV2";

export const dynamic = "force-dynamic";

type Tab = "org" | "team" | "tilgang";
const TABS: Tab[] = ["org", "team", "tilgang"];

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requirePortalUser({ allow: ["ADMIN"] });
  const sp = await searchParams;
  const tab: Tab = TABS.includes(sp.tab as Tab) ? (sp.tab as Tab) : "org";

  const [klubber, coacher] = await Promise.all([
    prisma.location.findMany({
      where: { active: true },
      select: { id: true, name: true, _count: { select: { facilities: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "COACH"] }, deletedAt: null },
      select: { id: true, name: true, role: true, coachedGroups: { select: { members: { select: { userId: true } } } } },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
  ]);

  const klubbRader: KlubbRadV2[] = klubber.map((k) => ({ id: k.id, navn: k.name, antallFasiliteter: k._count.facilities }));

  const teamRader: TeamRadV2[] = coacher.map((c) => {
    const unike = new Set<string>();
    for (const g of c.coachedGroups) for (const m of g.members) unike.add(m.userId);
    return { id: c.id, navn: c.name, rolleLabel: c.role === "ADMIN" ? "Head coach" : "Coach", antallSpillere: unike.size, erEier: c.role === "ADMIN" };
  });

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminInnstillingerV2 tab={tab} klubber={klubbRader} teamRader={teamRader} />
    </V2Shell>
  );
}

/**
 * AgencyOS — v2 Innstillinger, /admin/settings.
 *
 * Rekomponerer den gamle `/admin/(legacy)/settings` (Organisasjon & tilgang)
 * i v2-språket. `/admin/organisasjon` redirecter hit — denne ruten var
 * tidligere 404 (dangling redirect-mål).
 *
 * Faner (?tab=, server component — ingen useState):
 *   - org: prisma.location (aktive klubber/anlegg) + fasilitetstall.
 *   - team: prisma.user (ADMIN/COACH) + antall unike spillere i coachens
 *     grupper. ADMIN → «Eier»-chip (fasit), COACH → «Coach».
 *   - tilgang: org-innstillinger har ingen DB-modell ennå — fasit-radene
 *     vises med «—» i stedet for toggles, med lenke til den ekte
 *     CBAC-matrisen på /admin/settings/tilgang (bygges separat).
 *
 * ADMIN-only (samme som legacy — Team & roller viser rolletilgang for hele
 * organisasjonen, ikke noe en COACH skal se).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  AdminSettingsV2,
  type AdminSettingsV2Data,
  type AdminSettingsV2Klubb,
  type AdminSettingsV2Tab,
  type AdminSettingsV2TeamRad,
} from "@/components/admin/v2/AdminSettingsV2";

export const dynamic = "force-dynamic";

const TAB_KEYS: AdminSettingsV2Tab[] = ["org", "team", "tilgang"];

export default async function V2AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  const sp = await searchParams;
  const tab: AdminSettingsV2Tab = TAB_KEYS.includes(sp.tab as AdminSettingsV2Tab)
    ? (sp.tab as AdminSettingsV2Tab)
    : "org";

  const [klubber, coacher] = await Promise.all([
    prisma.location.findMany({
      where: { active: true },
      select: { id: true, name: true, _count: { select: { facilities: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "COACH"] }, deletedAt: null },
      select: {
        id: true,
        name: true,
        role: true,
        coachedGroups: { select: { members: { select: { userId: true } } } },
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
  ]);

  const klubbData: AdminSettingsV2Klubb[] = klubber.map((k) => ({
    id: k.id,
    navn: k.name,
    fasiliteter: k._count.facilities,
  }));

  const teamData: AdminSettingsV2TeamRad[] = coacher.map((c) => {
    const unike = new Set<string>();
    for (const g of c.coachedGroups) for (const m of g.members) unike.add(m.userId);
    return {
      id: c.id,
      navn: c.name,
      rolle: c.role === "ADMIN" ? "Head coach" : "Coach",
      spillere: unike.size,
      eier: c.role === "ADMIN",
    };
  });

  const data: AdminSettingsV2Data = {
    tab,
    klubber: klubbData,
    team: teamData,
    tilgangHref: "/admin/settings/tilgang",
  };

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/agencyos">Cockpit</TilbakeLenke>
      <AdminSettingsV2 data={data} />
    </V2Shell>
  );
}

/**
 * v2-preview: AgencyOS Cockpit (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell/AdminShell — kun root-layout — så
 * V2Shell leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data er identisk med den ekte /admin/agencyos-siden: samme
 * requirePortalUser-guard (ADMIN/COACH) og samme loadDailyBrief-loader.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadDailyBrief } from "@/lib/agencyos/daily-brief-data";
import { loadInnboksSammendrag } from "@/lib/innboks/data";
import { loadFokusSpillere } from "@/lib/agencyos/fokus-spillere";
import { loadAiDispatch } from "@/lib/agencyos/ai-dispatch-data";
import { prisma } from "@/lib/prisma";
import type { PlayerProgram } from "@/generated/prisma/client";
import { V2Shell, AGENCYOS_NAV, type VekslerData } from "@/components/v2/shell";
import { CockpitV2 } from "@/components/admin/v2/CockpitV2";

export const dynamic = "force-dynamic";

export default async function V2CockpitPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const isAdmin = user.role === "ADMIN";
  const [data, innboks, fokus, spillereRaw, grupperRaw] = await Promise.all([
    loadDailyBrief({ id: user.id, name: user.name, avatarUrl: user.avatarUrl, role: user.role }),
    loadInnboksSammendrag(),
    loadFokusSpillere({ id: user.id, role: user.role }),
    // D2-veksler: lettvekts spillerliste i coachens scope (samme where-mønster
    // som loadStallen — ADMIN ser alle, COACH ser egne). Kun id/navn/avatar.
    prisma.user.findMany({
      where: {
        role: "PLAYER",
        deletedAt: null,
        enrollmentsAsPlayer: {
          some: {
            endedAt: null,
            NOT: { program: "PLATFORM_ONLY" as PlayerProgram },
            ...(isAdmin ? {} : { coachId: user.id }),
          },
        },
      },
      select: { id: true, name: true, avatarUrl: true },
      orderBy: { name: "asc" },
      take: 400,
    }),
    prisma.group.findMany({
      select: { id: true, name: true, _count: { select: { members: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  // AI-dispatch etter at innboks/fokus er kjent — speiler AgenticOS multi-AI-mal.
  const aiDispatch = await loadAiDispatch({
    id: user.id,
    role: user.role,
    innboksNye: innboks.antallNye,
    fokusSpillere: fokus.forslag.length + fokus.pinnet.length,
  });

  const vekslerData: VekslerData = {
    spillere: spillereRaw.map((s) => ({ id: s.id, navn: s.name ?? "Spiller", avatarUrl: s.avatarUrl })),
    grupper: grupperRaw.map((g) => ({ id: g.id, navn: g.name, href: `/admin/grupper/${g.id}`, antall: g._count.members })),
    aktivNavn: "Hele stallen",
    aktivType: null,
    spillerHrefBase: "/admin/spillere",
  };

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} vekslerData={vekslerData}>
      <CockpitV2 data={data} innboks={innboks} fokus={fokus} aiDispatch={aiDispatch} />
    </V2Shell>
  );
}

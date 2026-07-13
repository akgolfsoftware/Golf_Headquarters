/**
 * v2-forhåndsvisning — AgencyOS Planlegge-hub (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver AdminShell — kun root-layout — så
 * V2Shell leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + datakontrakt gjenbrukt fra den ekte siden
 * (src/app/admin/planlegge/page.tsx): samme requirePortalUser-guard
 * (ADMIN/COACH) og samme spillerspørring (role=PLAYER, deletedAt=null,
 * navn asc). Den ekte siden er en redirect inn i Workbench; her viser vi den
 * ærlige inngangen (spillervalg → Workbench) og beriker med EKTE aktive-plan-
 * tellinger (TechnicalPlan status=ACTIVE) per spiller.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminPlanleggeV2,
  type AdminPlanleggeData,
} from "@/components/admin/v2/AdminPlanleggeV2";

export const dynamic = "force-dynamic";

export default async function V2AdminPlanleggePreviewPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  // Samme spillerkontrakt som den ekte redirecten.
  const spillere = await prisma.user.findMany({
    // I0: kun coachede spillere — selvbetjente (PLATFORM_ONLY) er usynlige i AgencyOS.
    where: { AND: [coachScopedPlayerWhere(user), { deletedAt: null }] },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  // Ekte antall aktive tekniske planer per spiller (én spørring, gruppert).
  const aktiveGrupper = await prisma.technicalPlan.groupBy({
    by: ["userId"],
    where: { status: "ACTIVE", userId: { in: spillere.map((s) => s.id) } },
    _count: { _all: true },
  });
  const aktivePlanerFor = new Map(
    aktiveGrupper.map((g) => [g.userId, g._count._all]),
  );

  const data: AdminPlanleggeData = {
    coachFornavn: (user.name ?? "Coach").split(" ")[0],
    spillere: spillere.map((s) => ({
      id: s.id,
      navn: s.name ?? "Spiller",
      aktivePlaner: aktivePlanerFor.get(s.id) ?? 0,
    })),
  };

  return (
    <V2Shell aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminPlanleggeV2 data={data} />
    </V2Shell>
  );
}

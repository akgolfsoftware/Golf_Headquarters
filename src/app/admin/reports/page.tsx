/**
 * v2-preview: AgencyOS Rapporter (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell/AdminShell — kun root-layout — så
 * V2Shell leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data er identisk med den ekte /admin/reports-siden: samme
 * requirePortalUser-guard (ADMIN/COACH) og samme Prisma-counts (aktive
 * spillere + fullførte økter + sesongår).
 *
 * Server component.
 */

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { can, Capability } from "@/lib/auth/cbac";
import { parseMaanedsrapport } from "@/lib/agents/maanedsrapport";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminReportsV2 } from "@/components/admin/v2/AdminReportsV2";
import { TilbakeLenke } from "@/components/v2";

export const dynamic = "force-dynamic";

export default async function V2AdminReportsPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const [spillere, okter, rapportRader] = await Promise.all([
    prisma.user.count({ where: { AND: [coachScopedPlayerWhere(user), { deletedAt: null }] } }),
    prisma.trainingPlanSession.count({ where: { status: "COMPLETED" } }),
    prisma.monthlyReport.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 12,
      select: { payload: true },
    }),
  ]);

  // B5: kronetall kun bak VIEW_FINANCE — uten capability sendes rapportene
  // med nullede beløp (antall/aktivitet vises fortsatt).
  const kanSeFinans = can(user.role, Capability.VIEW_FINANCE);
  const maanedsrapporter = rapportRader
    .map((r) => parseMaanedsrapport(r.payload))
    .filter((r): r is NonNullable<typeof r> => r != null)
    .map((r) =>
      kanSeFinans
        ? r
        : {
            ...r,
            totalt: { ...r.totalt, bookingVerdiOre: 0, innbetaltOre: 0 },
            perSelskap: r.perSelskap.map((sel) => ({ ...sel, bookingVerdiOre: 0, innbetaltOre: 0 })),
          },
    );

  const data = {
    spillere,
    okter,
    sesong: new Date().getFullYear(),
    maanedsrapporter,
    visKroner: kanSeFinans,
  };

  return (
    <V2Shell aktiv="innsikt" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/analyse">Innsikt</TilbakeLenke>
      <AdminReportsV2 data={data} />
    </V2Shell>
  );
}

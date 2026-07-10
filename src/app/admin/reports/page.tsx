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

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminReportsV2 } from "@/components/admin/v2/AdminReportsV2";

export const dynamic = "force-dynamic";

export default async function V2AdminReportsPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const [spillere, okter] = await Promise.all([
    prisma.user.count({ where: { role: "PLAYER", deletedAt: null } }),
    prisma.trainingPlanSession.count({ where: { status: "COMPLETED" } }),
  ]);

  const data = {
    spillere,
    okter,
    sesong: new Date().getFullYear(),
  };

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminReportsV2 data={data} />
    </V2Shell>
  );
}

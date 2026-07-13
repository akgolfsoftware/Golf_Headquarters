/**
 * v2-preview: AgencyOS Team (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout — så V2Shell
 * leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data følger den ekte /admin/team-flaten: coach-/admin-roster med
 * antall grupper og tidsvinduer, samt total spillerfordeling. Auth via
 * requirePortalUser (ADMIN/COACH). Ingen fabrikerte tall — kun Prisma.
 *
 * Server component.
 */

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminTeamV2,
  type AdminTeamV2Data,
  type AdminTeamV2Member,
} from "@/components/admin/v2/AdminTeamV2";

export const dynamic = "force-dynamic";

export default async function V2AdminTeamPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const team = await prisma.user.findMany({
    where: { role: { in: ["COACH", "ADMIN"] } },
    include: {
      _count: { select: { coachedGroups: true, coachAvailability: true } },
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  const totalSpillere = await prisma.user.count({ where: coachScopedPlayerWhere(user) });

  const totalCount = team.length;
  const adminCount = team.filter((u) => u.role === "ADMIN").length;
  const coachCount = team.filter((u) => u.role === "COACH").length;
  const snittSpillere =
    totalCount > 0
      ? (totalSpillere / totalCount).toFixed(1).replace(".", ",")
      : "—";

  const medlemmer: AdminTeamV2Member[] = team.map((u) => ({
    id: u.id,
    navn: u.name ?? "Uten navn",
    epost: u.email,
    rolle: u.role === "ADMIN" ? "ADMIN" : "COACH",
    grupper: u._count.coachedGroups,
    tidsvinduer: u._count.coachAvailability,
  }));

  const data: AdminTeamV2Data = {
    medlemmer,
    totalCount,
    adminCount,
    coachCount,
    totalSpillere,
    snittSpillere,
    inviterHref: "/admin/team/inviter",
  };

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminTeamV2 data={data} />
    </V2Shell>
  );
}

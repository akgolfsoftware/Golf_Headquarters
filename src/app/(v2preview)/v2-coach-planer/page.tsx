/**
 * v2-forhåndsvisning — PlayerHQ Delte planer (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver PortalShell — kun root-layout.
 * V2Shell leverer chrome-en (IkonRail/BunnNav), CoachPlanerV2 rendrer
 * innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden
 * (src/app/portal/coach/plans/page.tsx): samme prisma-spørring, samme
 * kolonne-inndeling (Aktiv · Fullført · Pause) og samme Pro-gating.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { CoachPlanerV2, type CoachPlanerData, type PlanKolonne } from "@/components/portal/v2/CoachPlanerV2";

export const dynamic = "force-dynamic";

export default async function V2CoachPlanerPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  let data: CoachPlanerData;

  if (user.tier === "GRATIS") {
    data = { tier: user.tier, coachNavn: null, planer: [] };
  } else {
    // Samme spørring som den ekte skjermen: coach-delte planer (createdById satt).
    const planer = await prisma.trainingPlan.findMany({
      where: { userId: user.id, createdById: { not: null } },
      include: { sessions: { select: { id: true, status: true } } },
      orderBy: { startDate: "desc" },
    });

    // Coach-navn — fra createdById på nyeste plan (ærlig; null hvis ukjent).
    const coachId = planer.find((p) => p.createdById)?.createdById ?? null;
    const coach = coachId
      ? await prisma.user.findUnique({ where: { id: coachId }, select: { name: true } })
      : null;

    data = {
      tier: user.tier,
      coachNavn: coach?.name ?? null,
      planer: planer.map((p) => {
        const fullfort = p.sessions.filter((s) => s.status === "COMPLETED").length;
        const total = p.sessions.length;
        const pct = total > 0 ? Math.round((fullfort / total) * 100) : 0;
        // Identisk kolonne-inndeling som den ekte skjermen.
        const kolonne: PlanKolonne = p.isActive
          ? "aktiv"
          : fullfort > 0
            ? "fullfort"
            : "pause";
        return {
          id: p.id,
          name: p.name,
          startDate: p.startDate,
          endDate: p.endDate,
          isActive: p.isActive,
          fullfort,
          total,
          pct,
          kolonne,
        };
      }),
    };
  }

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <CoachPlanerV2 data={data} />
    </V2Shell>
  );
}

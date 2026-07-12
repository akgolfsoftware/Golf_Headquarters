/**
 * v2-forhåndsvisning — AgencyOS Teknisk-plan (oversikt, retning C). Egen
 * top-level route-group (v2preview) som IKKE arver AdminShell — kun
 * root-layout — så V2Shell leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + datakontrakt gjenbrukt 1:1 fra den ekte siden
 * (src/app/admin/teknisk-plan/page.tsx): samme requirePortalUser-guard
 * (COACH/ADMIN) og samme to Prisma-spørringer (PLAYER-brukere med aktiv plan +
 * TEK-økter, og godkjente PlanTemplate-maler). Aggregatene per spiller regnes
 * ut her (server) så komponenten forblir ren visning. Ærlig tomt når ingen data.
 *
 * Server component.
 */

import { coachedPlayerWhere } from "@/lib/auth/coached";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminTekniskPlanV2,
  type AdminTekniskPlanData,
} from "@/components/admin/v2/AdminTekniskPlanV2";

export const dynamic = "force-dynamic";

export default async function V2AdminTekniskPlanPreviewPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  // Samme loader-kontrakt som den ekte /admin/teknisk-plan-oversikten.
  const [spillere, maler] = await Promise.all([
    prisma.user.findMany({
      where: coachedPlayerWhere(),
      select: {
        id: true,
        name: true,
        hcp: true,
        homeClub: true,
        avatarUrl: true,
        trainingPlans: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            sessions: {
              where: { pyramidArea: "TEK" },
              select: { id: true, status: true, durationMin: true },
            },
          },
          take: 1,
          orderBy: { startDate: "desc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.planTemplate.findMany({
      where: { approved: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, description: true, varighetUker: true },
    }),
  ]);

  const data: AdminTekniskPlanData = {
    spillere: spillere.map((s) => {
      const aktivPlan = s.trainingPlans[0] ?? null;
      const tekOkter = aktivPlan?.sessions ?? [];
      return {
        id: s.id,
        navn: s.name,
        hcp: s.hcp,
        homeClub: s.homeClub,
        avatarUrl: s.avatarUrl,
        planNavn: aktivPlan?.name ?? null,
        tekTotalt: tekOkter.length,
        tekFullfort: tekOkter.filter((o) => o.status === "COMPLETED").length,
        tekTidMin: tekOkter.reduce((sum, o) => sum + o.durationMin, 0),
      };
    }),
    maler: maler.map((m) => ({
      id: m.id,
      navn: m.name,
      beskrivelse: m.description,
      varighetUker: m.varighetUker,
    })),
  };

  return (
    <V2Shell aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminTekniskPlanV2 data={data} />
    </V2Shell>
  );
}

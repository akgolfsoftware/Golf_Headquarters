/**
 * v2-forhåndsvisning — AgencyOS Spiller-plan (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver AdminShell — kun root-layout — så
 * V2Shell leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + datakontrakt gjenbrukt 1:1 fra den ekte siden
 * (src/app/admin/spillere/[id]/plan/page.tsx): samme requirePortalUser-guard
 * (ADMIN/COACH) og samme TechnicalPlan-spørring (navn/status/datoer).
 *
 * Detaljrute i preview: vi henter en EKTE eksempel-spiller — helst en som
 * faktisk har planer (nyeste TechnicalPlan), ellers en vilkårlig spiller.
 * Finnes ingen spiller → ærlig tom V2Shell.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminSpillerPlanV2,
  type AdminSpillerPlanData,
} from "@/components/admin/v2/AdminSpillerPlanV2";

export const dynamic = "force-dynamic";

export default async function V2SpillerPlanPreviewPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  // Eksempel-spiller: helst en som har tekniske planer (så lista fylles),
  // ellers første tilgjengelige bruker. Ærlig tom-tilstand hvis ingen finnes.
  const medPlan = await prisma.technicalPlan.findFirst({
    orderBy: { updatedAt: "desc" },
    select: { userId: true },
  });
  const eksempelId =
    medPlan?.userId ??
    (await prisma.user.findFirst({ select: { id: true } }))?.id ??
    null;

  if (!eksempelId) {
    return (
      <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
        <AdminSpillerPlanV2
          data={{ spiller: { id: "", navn: "Spiller" }, planer: [] }}
        />
      </V2Shell>
    );
  }

  // Samme select-kontrakt som den ekte /plan-indeksen.
  const [spiller, planer] = await Promise.all([
    prisma.user.findUnique({
      where: { id: eksempelId },
      select: { id: true, name: true },
    }),
    prisma.technicalPlan.findMany({
      where: { userId: eksempelId },
      select: {
        id: true,
        navn: true,
        status: true,
        startDato: true,
        sluttDato: true,
        updatedAt: true,
      },
    }),
  ]);

  const data: AdminSpillerPlanData = {
    spiller: { id: spiller?.id ?? eksempelId, navn: spiller?.name ?? "Spiller" },
    planer,
  };

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminSpillerPlanV2 data={data} />
    </V2Shell>
  );
}

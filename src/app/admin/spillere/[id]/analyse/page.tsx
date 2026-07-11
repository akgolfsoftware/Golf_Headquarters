/**
 * AgencyOS — Full spilleranalyse i coach-dybde (/admin/spillere/[id]/analyse),
 * v2-design (retning C). Coach-speilet av PlayerHQ «Analysere», alltid
 * nivaa="elite" (full dekomponering + fagkode-chips).
 *
 * Auth + dataloader gjenbrukt 1:1 fra den forrige (legacy) siden: samme
 * requirePortalUser-guard (ADMIN/COACH), samme loadMinGolf i «elite»-dybde
 * og loadAnalyticsWorkbenchData. Spiller-id kommer fra ruten (params.id) —
 * notFound() hvis spilleren ikke finnes.
 *
 * Server component.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadMinGolf } from "@/lib/min-golf/load-min-golf";
import { loadAnalyticsWorkbenchData } from "@/app/portal/analysere/actions";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminSpillerAnalyseV2 } from "@/components/admin/v2/AdminSpillerAnalyseV2";

export const dynamic = "force-dynamic";

export default async function SpillerAnalysePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;

  const spiller = await prisma.user.findUnique({
    where: { id, role: "PLAYER" },
    select: { id: true, name: true },
  });
  if (!spiller) notFound();

  // Coach ser alltid full dekomponering → «elite»-dybde.
  const [minGolf, workbench] = await Promise.all([
    loadMinGolf(spiller.id, "elite"),
    loadAnalyticsWorkbenchData(spiller.id),
  ]);

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminSpillerAnalyseV2
        navn={spiller.name ?? "Spiller"}
        spillerId={spiller.id}
        data={{ minGolf, workbench }}
      />
    </V2Shell>
  );
}

/**
 * AgencyOS — Spiller-plan-indeks (/admin/spillere/[id]/plan), v2-design (retning C).
 *
 * Auth + datakontrakt gjenbrukt 1:1 fra den forrige (legacy) siden: samme
 * requirePortalUser-guard (ADMIN/COACH) og samme TechnicalPlan-spørring
 * (navn/status/datoer). Spiller-id kommer fra ruten (params.id) —
 * notFound() hvis spilleren ikke finnes.
 *
 * Server component.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminSpillerPlanV2,
  type AdminSpillerPlanData,
} from "@/components/admin/v2/AdminSpillerPlanV2";

export const dynamic = "force-dynamic";

export default async function SpillerPlanIndeksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;

  // Samme select-kontrakt som den forrige /plan-indeksen.
  const [spiller, planer] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true },
    }),
    prisma.technicalPlan.findMany({
      where: { userId: id },
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

  if (!spiller) notFound();

  const data: AdminSpillerPlanData = {
    spiller: { id: spiller.id, navn: spiller.name },
    planer,
  };

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminSpillerPlanV2 data={data} />
    </V2Shell>
  );
}

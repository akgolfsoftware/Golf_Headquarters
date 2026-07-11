/**
 * AgencyOS — coach-view av en spillers tester (/admin/spillere/[id]/tester),
 * v2-design (retning C).
 *
 * Auth + dataloader gjenbrukt 1:1 fra den forrige (legacy) siden:
 * requirePortalUser (ADMIN/COACH) + loadSpillerTesterData. Spiller-id kommer
 * fra ruten (params.id) — notFound() hvis ingen data finnes.
 *
 * Server component.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadSpillerTesterData } from "@/lib/admin/spiller-tester-data";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminSpillerTesterV2 } from "@/components/admin/v2/AdminSpillerTesterV2";

export const dynamic = "force-dynamic";

export default async function SpillerTesterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;

  const data = await loadSpillerTesterData(id);
  if (!data) notFound();

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminSpillerTesterV2 data={data} playerId={id} />
    </V2Shell>
  );
}

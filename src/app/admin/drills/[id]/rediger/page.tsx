/**
 * AgencyOS — Rediger drill v2 (retning C). Rekomponert fra
 * src/app/admin/(legacy)/drills/[id]/rediger (`DrillEditForm`, 27 felt) —
 * samme loader (ExerciseDefinition + andre drills for prerequisites) og
 * samme server action `updateDrill` (uendret).
 *
 * Server component.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { AdminDrillRedigerV2 } from "@/components/admin/v2/AdminDrillRedigerV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rediger drill · AgencyOS" };

export default async function AdminDrillRedigerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const drill = await prisma.exerciseDefinition.findUnique({ where: { id } });
  if (!drill) notFound();

  const andreDrills = await prisma.exerciseDefinition.findMany({
    where: { NOT: { id } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href={`/admin/drills/${id}`}>{drill.name}</TilbakeLenke>
      <AdminDrillRedigerV2 drill={drill} andreDrills={andreDrills} />
    </V2Shell>
  );
}

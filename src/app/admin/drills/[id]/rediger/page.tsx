/**
 * AgencyOS — Rediger drill (/admin/drills/[id]/rediger) — v2.
 * v2-port 17. juli 2026 (Team D3): `AdminDrillRedigerV2` erstatter
 * drill-edit-form, ruten flyttet ut av (legacy). Auth-guard (COACH + ADMIN),
 * Prisma-queries (drill + andre drills til forutsetnings-flervalget) og
 * server action `updateDrill` er uendret — kun presentasjonslaget er nytt.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminDrillRedigerV2 } from "@/components/admin/v2/AdminDrillRedigerV2";

export default async function DrillEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const drill = await prisma.exerciseDefinition.findUnique({
    where: { id },
  });
  if (!drill) notFound();

  const andreDrills = await prisma.exerciseDefinition.findMany({
    where: { NOT: { id } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <AdminDrillRedigerV2 drill={drill} andreDrills={andreDrills} />
    </V2Shell>
  );
}

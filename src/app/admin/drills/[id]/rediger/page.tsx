/**
 * AgencyOS — Rediger drill (`/admin/drills/[id]/rediger`), v2.
 *
 * Port av `(legacy)/drills/[id]/rediger/page.tsx` (2026-07-14, AgencyOS Bølge 1.2).
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminDrillRedigerV2 } from "@/components/admin/v2/AdminDrillRedigerV2";
import type { DrillSkjemaInitial } from "@/components/admin/v2/DrillSkjemaFelter";
import type { NgfKategori } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

export default async function DrillEditPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const drill = await prisma.exerciseDefinition.findUnique({ where: { id } });
  if (!drill) notFound();

  const andreDrills = await prisma.exerciseDefinition.findMany({
    where: { NOT: { id } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const initial: DrillSkjemaInitial = {
    name: drill.name,
    description: drill.description,
    videoUrl: drill.videoUrl,
    kilde: drill.kilde,
    coachNotes: drill.coachNotes,
    pyramidArea: drill.pyramidArea,
    lPhase: drill.lPhase,
    skillArea: drill.skillArea,
    minKategori: drill.minKategori,
    maxKategori: drill.maxKategori,
    minHcp: drill.minHcp,
    maxHcp: drill.maxHcp,
    environment: drill.environment,
    utstyr: drill.utstyr,
    intensitet: drill.intensitet,
    lPhases: drill.lPhases,
    morad: drill.morad,
    prerequisites: drill.prerequisites,
    tags: drill.tags,
    defaultSets: drill.defaultSets,
    defaultReps: drill.defaultReps,
    defaultRepsSets: drill.defaultRepsSets,
    durationMin: drill.durationMin,
    csMin: drill.csMin,
    csMax: drill.csMax,
    csTargetByKategori: drill.csTargetByKategori as Partial<Record<NgfKategori, number>> | null,
  };

  return (
    <V2Shell aktiv="drills" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminDrillRedigerV2 id={drill.id} name={drill.name} initial={initial} andreDrills={andreDrills} />
    </V2Shell>
  );
}

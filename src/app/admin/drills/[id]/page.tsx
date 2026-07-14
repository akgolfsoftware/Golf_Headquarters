/**
 * AgencyOS — Drill-detalj (`/admin/drills/[id]`), v2.
 *
 * Port av `(legacy)/drills/[id]/page.tsx` (2026-07-14, AgencyOS Bølge 1.2) —
 * samme datamodell (prisma.exerciseDefinition + prerequisites), ny
 * v2-presentasjon i `AdminDrillDetaljV2`.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { safeUrl } from "@/lib/security/safe-url";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { AdminDrillDetaljV2, type AdminDrillDetaljV2Data } from "@/components/admin/v2/AdminDrillDetaljV2";
import type { PyramidArea, SkillArea, NgfKategori } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

const DISCIPLIN_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk", TEK: "Teknikk", SLAG: "Slagkvalitet", SPILL: "Spill", TURN: "Turnering",
};
const SKILL_LABEL: Record<SkillArea, string> = {
  TEE_TOTAL: "Tee total", TILNAERMING: "Tilnærming", AROUND_GREEN: "Nærspill", PUTTING: "Putting", SPILL: "Spill",
};
const AKSE_FARGE: Record<PyramidArea, string> = {
  FYS: T.ax.FYS, TEK: T.ax.TEK, SLAG: T.ax.SLAG, SPILL: T.ax.SPILL, TURN: T.ax.TURN,
};

export default async function DrillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const drill = await prisma.exerciseDefinition.findUnique({ where: { id }, include: { _count: { select: { sessionDrills: true } } } });
  if (!drill) notFound();

  const prereqDrills = drill.prerequisites.length > 0
    ? await prisma.exerciseDefinition.findMany({ where: { id: { in: drill.prerequisites } }, select: { id: true, name: true } })
    : [];

  const csTarget = drill.csTargetByKategori as Partial<Record<NgfKategori, number>> | null;

  const data: AdminDrillDetaljV2Data = {
    id: drill.id,
    name: drill.name,
    disiplinLabel: DISCIPLIN_LABEL[drill.pyramidArea],
    skillLabel: drill.skillArea ? SKILL_LABEL[drill.skillArea] : null,
    barFarge: AKSE_FARGE[drill.pyramidArea],
    morad: drill.morad,
    kilde: drill.kilde,
    bruktIOkter: drill._count.sessionDrills,
    description: drill.description,
    coachNotes: drill.coachNotes,
    minKategori: drill.minKategori,
    maxKategori: drill.maxKategori,
    minHcp: drill.minHcp,
    maxHcp: drill.maxHcp,
    csTarget: csTarget && Object.keys(csTarget).length > 0 ? csTarget : null,
    durationMin: drill.durationMin,
    intensitet: drill.intensitet,
    defaultSets: drill.defaultSets,
    defaultReps: drill.defaultReps,
    defaultRepsSets: drill.defaultRepsSets,
    csMin: drill.csMin,
    csMax: drill.csMax,
    lPhase: drill.lPhase,
    environment: drill.environment,
    utstyr: drill.utstyr,
    lPhases: drill.lPhases,
    prerequisites: prereqDrills,
    tags: drill.tags,
    videoUrl: safeUrl(drill.videoUrl),
  };

  return (
    <V2Shell aktiv="drills" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminDrillDetaljV2 {...data} />
    </V2Shell>
  );
}

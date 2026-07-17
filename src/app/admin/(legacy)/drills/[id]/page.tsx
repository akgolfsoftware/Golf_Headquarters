/**
 * AgencyOS — Drill-detalj. v2-port 16. juli 2026.
 * Viser én ExerciseDefinition i full bredde.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea, SkillArea, NgfKategori } from "@/generated/prisma/enums";
import { DrillDetailActions } from "./drill-detail-actions";
import { safeUrl } from "@/lib/security/safe-url";
import { AdminDrillDetaljV2, type AdminDrillDetaljV2Data } from "@/components/admin/v2/AdminDrillDetaljV2";

const NGF_ORDER: readonly NgfKategori[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;

const DISCIPLIN_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknikk",
  SLAG: "Slagkvalitet",
  SPILL: "Spill",
  TURN: "Turnering",
};

const SKILL_LABEL: Record<SkillArea, string> = {
  TEE_TOTAL: "Tee total",
  TILNAERMING: "Tilnærming",
  AROUND_GREEN: "Nærspill",
  PUTTING: "Putting",
  SPILL: "Spill",
};

export default async function DrillDetail({ params }: { params: Promise<{ id: string }> }) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const drill = await prisma.exerciseDefinition.findUnique({
    where: { id },
    include: { _count: { select: { sessionDrills: true } } },
  });
  if (!drill) notFound();

  const prereqDrills =
    drill.prerequisites.length > 0
      ? await prisma.exerciseDefinition.findMany({
          where: { id: { in: drill.prerequisites } },
          select: { id: true, name: true },
        })
      : [];

  const csTargetRaw = drill.csTargetByKategori as Partial<Record<NgfKategori, number>> | null;
  const csTarget = csTargetRaw
    ? NGF_ORDER.filter((k) => csTargetRaw[k] !== undefined).map((k) => ({ kategori: k, verdi: csTargetRaw[k] as number }))
    : [];

  const data: AdminDrillDetaljV2Data = {
    id: drill.id,
    navn: drill.name,
    disiplinLabel: DISCIPLIN_LABEL[drill.pyramidArea],
    skillLabel: drill.skillArea ? SKILL_LABEL[drill.skillArea] : null,
    morad: drill.morad,
    kilde: drill.kilde,
    brukAntall: drill._count.sessionDrills,
    beskrivelse: drill.description,
    coachNotater: drill.coachNotes,
    ngfOrder: [...NGF_ORDER],
    minKategori: drill.minKategori,
    maxKategori: drill.maxKategori,
    minHcp: drill.minHcp,
    maxHcp: drill.maxHcp,
    csTarget,
    varighetMin: drill.durationMin,
    intensitet: typeof drill.intensitet === "number" ? drill.intensitet : null,
    defaultSets: drill.defaultSets,
    defaultReps: drill.defaultReps,
    defaultRepsSets: drill.defaultRepsSets,
    csMin: drill.csMin,
    csMax: drill.csMax,
    lPhasePrimary: drill.lPhase,
    environment: drill.environment,
    utstyr: drill.utstyr,
    lPhases: drill.lPhases,
    prerequisites: prereqDrills.map((p) => ({ id: p.id, navn: p.name })),
    tags: drill.tags,
    videoUrl: safeUrl(drill.videoUrl),
  };

  return (
    <AdminDrillDetaljV2
      data={data}
      actions={
        <DrillDetailActions drillId={drill.id} drillName={drill.name} hasSessions={drill._count.sessionDrills > 0} />
      }
    />
  );
}

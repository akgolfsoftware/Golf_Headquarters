/**
 * AgencyOS — Drill-detalj v2 (retning C). Rekomponert fra
 * src/app/admin/(legacy)/drills/[id] — samme loader (ExerciseDefinition +
 * prerequisites-navn), samme `duplicateDrill`/`deleteDrill`-actions.
 * `videoUrl` saniteres fortsatt via `safeUrl()` før den sendes til klienten
 * (S-21 — aldri stol på rå DB-URL i en href).
 *
 * Server component.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { NgfKategori } from "@/generated/prisma/enums";
import { safeUrl } from "@/lib/security/safe-url";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  AdminDrillDetaljV2,
  type AdminDrillDetaljData,
} from "@/components/admin/v2/AdminDrillDetaljV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Drill-detalj · AgencyOS" };

const SKILL_LABEL: Record<string, string> = {
  TEE_TOTAL: "Tee total",
  TILNAERMING: "Tilnærming",
  AROUND_GREEN: "Nærspill",
  PUTTING: "Putting",
  SPILL: "Spill",
};

export default async function AdminDrillDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
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

  const csTarget = drill.csTargetByKategori as Partial<Record<NgfKategori, number>> | null;

  const data: AdminDrillDetaljData = {
    id: drill.id,
    navn: drill.name,
    omrade: drill.pyramidArea,
    skillLabel: drill.skillArea ? SKILL_LABEL[drill.skillArea] : null,
    beskrivelse: drill.description,
    coachNotater: drill.coachNotes,
    morad: drill.morad,
    kilde: drill.kilde,
    oktAntall: drill._count.sessionDrills,
    minKategori: drill.minKategori,
    maxKategori: drill.maxKategori,
    minHcp: drill.minHcp,
    maxHcp: drill.maxHcp,
    csTarget,
    varighetMin: drill.durationMin,
    intensitet: drill.intensitet,
    defaultSets: drill.defaultSets,
    defaultReps: drill.defaultReps,
    defaultRepsSets: drill.defaultRepsSets,
    csMin: drill.csMin,
    csMax: drill.csMax,
    lFase: drill.lPhase,
    environment: drill.environment,
    utstyr: drill.utstyr,
    lFaser: drill.lPhases,
    prerequisites: prereqDrills.map((p) => ({ id: p.id, navn: p.name })),
    tags: drill.tags,
    videoUrl: safeUrl(drill.videoUrl),
  };

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/drills">Drill-bibliotek</TilbakeLenke>
      <AdminDrillDetaljV2 data={data} />
    </V2Shell>
  );
}

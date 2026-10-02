import "server-only";
import { prisma } from "@/lib/prisma";
import type { SgBaselinePoint } from "./sg";

export const SG_ENGINE_VERSION = "2.0.0";

/** Bare et publisert, versjonskompatibelt sett kan brukes til nye SG-tall. */
export async function hentPublisertSgReferanse() {
  const sett = await prisma.sgReferenceSet.findFirst({
    where: { levelCode: "PGA_TOUR", publishedAt: { not: null }, engineCompatibleVersion: SG_ENGINE_VERSION },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true, label: true, levelCode: true, source: true, sourceVersion: true,
      baselines: { select: {
        phase: true, lie: true, teePar: true, distanceM: true, expectedStrokes: true,
      } },
    },
  });
  if (!sett || sett.baselines.length === 0) return null;
  return {
    id: sett.id,
    label: sett.label,
    levelCode: sett.levelCode,
    source: sett.source,
    sourceVersion: sett.sourceVersion,
    points: sett.baselines satisfies SgBaselinePoint[],
  };
}

export async function hentSgReferanseForRunde(referenceSetId: string | null) {
  if (!referenceSetId) return hentPublisertSgReferanse();
  const sett = await prisma.sgReferenceSet.findFirst({
    where: { id: referenceSetId, publishedAt: { not: null }, engineCompatibleVersion: SG_ENGINE_VERSION },
    select: {
      id: true, label: true, levelCode: true, source: true, sourceVersion: true,
      baselines: { select: {
        phase: true, lie: true, teePar: true, distanceM: true, expectedStrokes: true,
      } },
    },
  });
  if (!sett || sett.baselines.length === 0) return null;
  return { id: sett.id, label: sett.label, levelCode: sett.levelCode,
    source: sett.source, sourceVersion: sett.sourceVersion,
    points: sett.baselines satisfies SgBaselinePoint[] };
}

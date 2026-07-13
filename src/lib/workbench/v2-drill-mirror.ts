// Drill-speiling plan → live, delt mellom v2-sync (server) og
// backfill-scriptet (tsx). Bevisst UTEN "server-only" — scripts kan ikke
// importere react-server-moduler.

import type { PyramidArea } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/** Kobling plan-økt ↔ V2-speil. Reverse-synker MÅ matche samme streng. */
export const GENERERT_FRA = "WORKBENCH_PLAN";

/**
 * Speil plan-øktas SessionDrill-rader til TrainingDrillV2 (replace-semantikk),
 * så live-avspilleren viser samme driller som planen. Felt-kontrakten er delt
 * (bølge 2 · 2026-07-04); navn/beskrivelse hentes fra øvelsesbanken.
 */
export async function syncDrillsToV2(
  v2SessionId: string,
  planSessionId: string,
  fallbackPyramide: PyramidArea,
): Promise<void> {
  const drills = await prisma.sessionDrill.findMany({
    where: { sessionId: planSessionId },
    orderBy: { orderIndex: "asc" },
    include: { exercise: { select: { name: true, description: true, durationMin: true } } },
  });

  await prisma.trainingDrillV2.deleteMany({ where: { sessionId: v2SessionId } });
  if (drills.length === 0) return;

  await prisma.trainingDrillV2.createMany({
    data: drills.map((d, i) => ({
      sessionId: v2SessionId,
      // Kobling til øvelsesbanken (2026-07-13-migreringen, TrainingDrillV2.exerciseId)
      // — lar live-flyten spore drillen tilbake til ExerciseDefinition (opprett-i-økt,
      // "Legg i økt"-flyten fra banken, fremtidig bruk-historikk).
      exerciseId: d.exerciseId,
      sortOrder: d.orderIndex ?? i,
      name: d.exercise.name,
      description: d.notes ?? d.exercise.description ?? null,
      durationMinutes: d.repMinutter ?? d.exercise.durationMin ?? 10,
      repetitions: d.reps ?? d.repAntall ?? null,
      pyramide: d.pyramidArea ?? fallbackPyramide,
      omraade: d.skillArea ?? null,
      lFase: d.lFase,
      csNivaa: d.csNivaa,
      miljo: d.miljo,
      prPress: d.prPress,
      repType: d.repType,
      repAntall: d.repAntall,
      repMinutter: d.repMinutter,
      repSett: d.repSett,
      repReps: d.repReps,
    })),
  });
}

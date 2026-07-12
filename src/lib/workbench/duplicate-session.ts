/**
 * 8c.4 — Cmd+D: dupliser ÉN økt (Notion-stil). Kopien legges NESTE DAG
 * samme klokkeslett, med alle drills og AK-formel-felter — kopien er
 * dragbar som alle andre økter («dupliser og fordel utover måneden»).
 * Samme felt-sett som duplicateWeekCore; auth/revalidering eies av kallerne.
 */

import { prisma } from "@/lib/prisma";
import { upsertV2ForPlanSession } from "@/lib/workbench/v2-sync";

export async function duplicateSessionCore(
  playerId: string,
  sessionId: string,
  coachId?: string,
): Promise<{ ok: boolean; sessionId?: string; error?: string }> {
  const s = await prisma.trainingPlanSession.findFirst({
    where: { id: sessionId, plan: { userId: playerId } },
    select: {
      planId: true,
      title: true,
      scheduledAt: true,
      durationMin: true,
      pyramidArea: true,
      skillArea: true,
      environment: true,
      lPhase: true,
      lFase: true,
      miljo: true,
      csNivaa: true,
      pressureLevel: true,
      pPosisjoner: true,
      drills: {
        orderBy: { orderIndex: "asc" },
        select: {
          exerciseId: true,
          repsSets: true,
          sets: true,
          reps: true,
          csTarget: true,
          notes: true,
          orderIndex: true,
          lFase: true,
          miljo: true,
          csNivaa: true,
          prPress: true,
          pPosisjoner: true,
          pyramidArea: true,
          skillArea: true,
          repType: true,
          repAntall: true,
          repMinutter: true,
          repSett: true,
          repReps: true,
        },
      },
    },
  });
  if (!s) return { ok: false, error: "Økten finnes ikke" };

  const newAt = new Date(s.scheduledAt);
  newAt.setDate(newAt.getDate() + 1);

  const created = await prisma.trainingPlanSession.create({
    data: {
      planId: s.planId,
      title: s.title,
      scheduledAt: newAt,
      durationMin: s.durationMin,
      pyramidArea: s.pyramidArea,
      skillArea: s.skillArea,
      environment: s.environment,
      lPhase: s.lPhase,
      lFase: s.lFase,
      miljo: s.miljo,
      csNivaa: s.csNivaa,
      pressureLevel: s.pressureLevel,
      pPosisjoner: s.pPosisjoner,
      status: "PLANNED",
    },
    select: { id: true, title: true, scheduledAt: true, durationMin: true, pyramidArea: true, miljo: true },
  });
  if (s.drills.length > 0) {
    await prisma.sessionDrill.createMany({
      data: s.drills.map((d) => ({ ...d, sessionId: created.id })),
    });
  }
  await upsertV2ForPlanSession({
    planSessionId: created.id,
    playerId,
    title: created.title,
    scheduledAt: created.scheduledAt,
    durationMin: created.durationMin,
    pyramidArea: created.pyramidArea,
    coachId: coachId ?? null,
    miljo: created.miljo,
  });

  return { ok: true, sessionId: created.id };
}

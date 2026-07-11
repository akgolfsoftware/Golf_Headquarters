/**
 * «Gjenta forrige uke» — delt kjerne for coach- og spiller-actionene.
 * Kopierer alle økter (med drills, inkl. rep-type/volum) fra uka før
 * `targetWeekOffset` inn i den uka, forskjøvet +7 dager (samme dag+tid).
 * Legger til — rører ikke eksisterende økter i måluka. Auth og revalidering
 * eies av kallerne (session-actions.ts / workbench/actions.ts).
 */

import { prisma } from "@/lib/prisma";
import { weekRefDate } from "@/lib/workbench/session-move";
import { upsertV2ForPlanSession } from "@/lib/workbench/v2-sync";

export async function duplicateWeekCore(
  playerId: string,
  targetWeekOffset = 0,
  coachId?: string,
): Promise<{ ok: boolean; count?: number; error?: string }> {
  const targetMonday = weekRefDate(targetWeekOffset);
  const sourceMonday = new Date(targetMonday);
  sourceMonday.setDate(sourceMonday.getDate() - 7);

  const sources = await prisma.trainingPlanSession.findMany({
    where: {
      plan: { userId: playerId },
      scheduledAt: { gte: sourceMonday, lt: targetMonday },
    },
    orderBy: { scheduledAt: "asc" },
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
  if (sources.length === 0) return { ok: false, error: "Forrige uke har ingen økter" };

  let count = 0;
  for (const s of sources) {
    const newAt = new Date(s.scheduledAt);
    newAt.setDate(newAt.getDate() + 7);
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
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        durationMin: true,
        pyramidArea: true,
        miljo: true,
      },
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
    count++;
  }

  return { ok: true, count };
}

// Individuelle observasjoner før og etter en avsluttet planperiode.
// Sammenligner fem runder på samme målegrunnlag innen 180 dager på hver side.
// Manglende sluttdato eller utilstrekkelige målinger gir ingen effektpåstand.
// Dette beviser ikke årsak og oppdaterer aldri felles malstatistikk.

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

import { SG_ANALYSE_SELECT, sgSnapshot, sammenlignbareSgRunder } from "./analyse-grunnlag";
import { summerTreningsvolum } from "@/lib/workbench/treningsvolum";

function delta(post: number | null, pre: number | null): number | null {
  if (post === null || pre === null) return null;
  return post - pre;
}

export type ComputeEffectivenessResultat = Awaited<
  ReturnType<typeof prisma.planEffectiveness.upsert>
>;

/**
 * Beregner og lagrer PlanEffectiveness for én avsluttet planperiode.
 *
 * Oppdaterer bare egen metodeversjon for samme plan og spiller.
 * Returnerer null hvis planen mangler eller perioden ikke er avsluttet.
 */
export async function computeEffectiveness(
  planId: string,
): Promise<ComputeEffectivenessResultat | null> {
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    select: {
      id: true,
      userId: true,
      startDate: true,
      endDate: true,
      aiGenerationId: true,
    },
  });
  if (!plan) return null;

  const now = new Date();
  // En pågående plan har ikke et ettervindu ennå.
  if (!plan.endDate || plan.endDate > now || plan.endDate <= plan.startDate) return null;
  const sessions = await prisma.workbenchSession.findMany({
    where: { playerId: plan.userId, planId },
    select: { id: true, date: true, startMinute: true, pyramid: true, durationMinutes: true,
      actualMinutes: true, status: true, isTemplate: true, hiddenByPlayer: true, needsPlayerApproval: true,
      approvalStatus: true, updatedAt: true, migrertFraTrainingPlanSessionId: true },
  });
  const volum = summerTreningsvolum(sessions, { fraDato: plan.startDate, tilDato: plan.endDate, naa: now }).total;
  const completionRate = volum.planlagteOkter > 0 ? volum.gjennomforteOkter / volum.planlagteOkter : null;
  const [preRounds, postRounds] = await Promise.all([
    prisma.round.findMany({
      where: { userId: plan.userId, playedAt: { gte: new Date(plan.startDate.getTime() - 180 * 86400000), lt: plan.startDate }, playStatus: "COMPLETED", partialSave: false },
      orderBy: [{ playedAt: "desc" }, { id: "desc" }], take: 100, select: SG_ANALYSE_SELECT,
    }),
    prisma.round.findMany({
      where: { userId: plan.userId, playedAt: { gte: plan.endDate, lte: new Date(Math.min(now.getTime(), plan.endDate.getTime() + 180 * 86400000)) }, playStatus: "COMPLETED", partialSave: false },
      orderBy: [{ playedAt: "asc" }, { id: "asc" }], take: 100, select: SG_ANALYSE_SELECT,
    }),
  ]);
  const sammenlignbare = sammenlignbareSgRunder(preRounds, postRounds);
  const preSnapshot = sgSnapshot(sammenlignbare.pre);
  const postSnapshot = sgSnapshot(sammenlignbare.post);
  // Dagens HCP/kategori er ikke historiske start- og sluttmålinger.
  const preSnapshotJson = { ...preSnapshot, hcp: null, kategori: null, referanse: sammenlignbare.key } satisfies Prisma.InputJsonValue;
  const postSnapshotJson = { ...postSnapshot, hcp: null, kategori: null, referanse: sammenlignbare.key,
    treningsvolum: volum } satisfies Prisma.InputJsonValue;

  // 4) Templat-id: hentes fra AiPlanGeneration.contextJson._templateId
  let templateId: string | null = null;
  if (plan.aiGenerationId) {
    const gen = await prisma.aiPlanGeneration.findUnique({
      where: { id: plan.aiGenerationId },
      select: { contextJson: true },
    });
    if (gen?.contextJson && typeof gen.contextJson === "object") {
      const ctx = gen.contextJson as Record<string, unknown>;
      const t = ctx._templateId;
      if (typeof t === "string") templateId = t;
    }
  }

  // Serialiser denne skriveren per plan; bevar andre metodeversjoner.
  const rad = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM training_plans WHERE id = ${planId} FOR UPDATE`;
    const existing = await tx.planEffectiveness.findFirst({
    where: { planId, userId: plan.userId, postSnapshot: { path: ["analyseVersjon"], equals: "2026-10-23.1" } },
    select: { id: true },
  });

  return existing
    ? await tx.planEffectiveness.update({
        where: { id: existing.id },
        data: {
          templateId,
          preSnapshot: preSnapshotJson,
          postSnapshot: postSnapshotJson,
          sgTotalDelta: delta(postSnapshot.sgTotal, preSnapshot.sgTotal),
          sgOttDelta: delta(postSnapshot.sgOtt, preSnapshot.sgOtt),
          sgAppDelta: delta(postSnapshot.sgApp, preSnapshot.sgApp),
          sgArgDelta: delta(postSnapshot.sgArg, preSnapshot.sgArg),
          sgPuttDelta: delta(postSnapshot.sgPutt, preSnapshot.sgPutt),
          completionRate,
          complianceRate: completionRate,
          plannedSessions: volum.planlagteOkter,
          completedSessions: volum.gjennomforteOkter,
          totalTimeMinutes: volum.ukjentOkter === 0 && volum.legacyAnslagOkter === 0 ? volum.faktiskMinutter : null,
          hcpDelta: null,
          computedAt: new Date(),
        },
      })
    : await tx.planEffectiveness.create({
        data: {
          planId,
          userId: plan.userId,
          templateId,
          preSnapshot: preSnapshotJson,
          postSnapshot: postSnapshotJson,
          sgTotalDelta: delta(postSnapshot.sgTotal, preSnapshot.sgTotal),
          sgOttDelta: delta(postSnapshot.sgOtt, preSnapshot.sgOtt),
          sgAppDelta: delta(postSnapshot.sgApp, preSnapshot.sgApp),
          sgArgDelta: delta(postSnapshot.sgArg, preSnapshot.sgArg),
          sgPuttDelta: delta(postSnapshot.sgPutt, preSnapshot.sgPutt),
          completionRate,
          complianceRate: completionRate,
          plannedSessions: volum.planlagteOkter,
          completedSessions: volum.gjennomforteOkter,
          totalTimeMinutes: volum.ukjentOkter === 0 && volum.legacyAnslagOkter === 0 ? volum.faktiskMinutter : null,
          hcpDelta: null,
        },
      });

  });

  // Ingen automatisk oppdatering av felles malstatistikk. Individuell
  // tjeneste og frivillig læring på tvers er forskjellige behandlingsformål.
  return rad;
}

/**
 * Henter siste PlanEffectiveness-rad for én bruker, eller null.
 */
export async function getLatestEffectiveness(
  userId: string,
): Promise<ComputeEffectivenessResultat | null> {
  return prisma.planEffectiveness.findFirst({
    where: { userId, postSnapshot: { path: ["analyseVersjon"], equals: "2026-10-23.1" } },
    orderBy: { computedAt: "desc" },
  });
}

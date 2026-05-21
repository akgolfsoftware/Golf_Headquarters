// Effektivitets-tracking for AI-genererte planer.
//
// Etter en plan er fullført regner vi ut pre/post SG-deltas og completion-rate,
// og lagrer dette i PlanEffectiveness. AI-en bruker så denne historikken til
// å vurdere hvilke templates som faktisk virker for hvilke spillere.
//
// Snitt-vinduet for SG-data er definert som de 5 rundene umiddelbart før plan-
// start og de 5 rundene etter plan-slutt (eller dagens dato hvis planen ikke
// har endDate). Bruker null hvis utvalget er for lite.

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const SG_VINDU_RUNDER = 5;

type RoundSg = {
  sgTotal: number | null;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
};

type SgSnapshot = {
  sgTotal: number | null;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
  antallRunder: number;
};

function snittSg(rounds: RoundSg[]): SgSnapshot {
  if (rounds.length === 0) {
    return {
      sgTotal: null,
      sgOtt: null,
      sgApp: null,
      sgArg: null,
      sgPutt: null,
      antallRunder: 0,
    };
  }

  function snitt(key: keyof RoundSg): number | null {
    const verdier = rounds
      .map((r) => r[key])
      .filter((v): v is number => v !== null);
    if (verdier.length === 0) return null;
    return verdier.reduce((sum, v) => sum + v, 0) / verdier.length;
  }

  return {
    sgTotal: snitt("sgTotal"),
    sgOtt: snitt("sgOtt"),
    sgApp: snitt("sgApp"),
    sgArg: snitt("sgArg"),
    sgPutt: snitt("sgPutt"),
    antallRunder: rounds.length,
  };
}

function delta(post: number | null, pre: number | null): number | null {
  if (post === null || pre === null) return null;
  return post - pre;
}

export type ComputeEffectivenessResultat = Awaited<
  ReturnType<typeof prisma.planEffectiveness.upsert>
>;

/**
 * Beregner og lagrer PlanEffectiveness for én fullført treningsplan.
 *
 * Idempotent: hvis det allerede finnes en rad for planId, oppdateres den.
 * Returnerer null hvis planen ikke finnes.
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

  // 1) Total antall økter + antall fullførte
  const sessions = await prisma.trainingPlanSession.findMany({
    where: { planId },
    select: {
      id: true,
      log: { select: { completedAt: true } },
    },
  });
  const total = sessions.length;
  const fullforte = sessions.filter(
    (s) => s.log && s.log.completedAt !== null,
  ).length;
  const completionRate = total > 0 ? fullforte / total : 0;

  // 2) SG-data før og etter
  const preCutoff = plan.startDate;
  const postFra = plan.endDate ?? new Date();

  const [preRounds, postRounds] = await Promise.all([
    prisma.round.findMany({
      where: { userId: plan.userId, playedAt: { lt: preCutoff } },
      orderBy: { playedAt: "desc" },
      take: SG_VINDU_RUNDER,
      select: {
        sgTotal: true,
        sgOtt: true,
        sgApp: true,
        sgArg: true,
        sgPutt: true,
      },
    }),
    prisma.round.findMany({
      where: { userId: plan.userId, playedAt: { gte: postFra } },
      orderBy: { playedAt: "asc" },
      take: SG_VINDU_RUNDER,
      select: {
        sgTotal: true,
        sgOtt: true,
        sgApp: true,
        sgArg: true,
        sgPutt: true,
      },
    }),
  ]);

  const preSnapshot = snittSg(preRounds);
  const postSnapshot = snittSg(postRounds);

  // 3) Hent HCP + kategori for snapshot-kontekst (best-effort)
  const [user, wagr] = await Promise.all([
    prisma.user.findUnique({
      where: { id: plan.userId },
      select: { hcp: true },
    }),
    prisma.wagrSnapshot.findUnique({
      where: { userId: plan.userId },
      select: { ngfCategory: true },
    }),
  ]);

  const preSnapshotJson = {
    ...preSnapshot,
    hcp: user?.hcp ?? null,
    kategori: wagr?.ngfCategory ?? null,
  } satisfies Prisma.InputJsonValue;

  const postSnapshotJson = {
    ...postSnapshot,
    hcp: user?.hcp ?? null,
    kategori: wagr?.ngfCategory ?? null,
  } satisfies Prisma.InputJsonValue;

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

  // 5) Upsert
  const rad = await prisma.planEffectiveness.upsert({
    where: { planId },
    create: {
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
    },
    update: {
      templateId,
      preSnapshot: preSnapshotJson,
      postSnapshot: postSnapshotJson,
      sgTotalDelta: delta(postSnapshot.sgTotal, preSnapshot.sgTotal),
      sgOttDelta: delta(postSnapshot.sgOtt, preSnapshot.sgOtt),
      sgAppDelta: delta(postSnapshot.sgApp, preSnapshot.sgApp),
      sgArgDelta: delta(postSnapshot.sgArg, preSnapshot.sgArg),
      sgPuttDelta: delta(postSnapshot.sgPutt, preSnapshot.sgPutt),
      completionRate,
      computedAt: new Date(),
    },
  });

  // 6) Oppdater effectivenessAvg på PlanTemplate hvis vi har templateId
  if (templateId && rad.sgTotalDelta !== null) {
    const agg = await prisma.planEffectiveness.aggregate({
      where: { templateId, sgTotalDelta: { not: null } },
      _avg: { sgTotalDelta: true },
    });
    if (agg._avg.sgTotalDelta !== null) {
      await prisma.planTemplate.update({
        where: { id: templateId },
        data: { effectivenessAvg: agg._avg.sgTotalDelta },
      });
    }
  }

  return rad;
}

/**
 * Henter siste PlanEffectiveness-rad for én bruker, eller null.
 */
export async function getLatestEffectiveness(
  userId: string,
): Promise<ComputeEffectivenessResultat | null> {
  return prisma.planEffectiveness.findFirst({
    where: { userId },
    orderBy: { computedAt: "desc" },
  });
}

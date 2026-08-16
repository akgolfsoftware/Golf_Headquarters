import "server-only";

import { Prisma, type PyramidArea, type MMiljo } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveValgtCoachIdEllerAdmin } from "@/lib/domain/valgt-coach";
import { GENERERT_FRA, syncDrillsToV2 } from "./v2-drill-mirror";
import { validerOkt } from "@/lib/canon/valider-plan";

// Re-eksport: reverse-synkene (okt-status-actions, live-actions) matcher
// samme streng via denne.
export { GENERERT_FRA };

const PYR_TO_PRACTICE: Record<PyramidArea, "BLOKK" | "RANDOM" | "KONKURRANSE" | "SPILL_TEST"> = {
  FYS: "BLOKK",
  TEK: "BLOKK",
  SLAG: "RANDOM",
  SPILL: "SPILL_TEST",
  TURN: "KONKURRANSE",
};

/**
 * Finn coachId for V2-økt. Delegerer til valgt coach-resolveren (G2) —
 * fallback-kjeden (primaryCoachId → enrollment → gruppe → plan → eldste ADMIN)
 * bor i src/lib/domain/valgt-coach.ts, aldri «første coach»-gjetting her.
 * Garantien «returnerer alltid en id» (TrainingSessionV2.coachId er NOT NULL)
 * bevares: finnes verken coach eller ADMIN, returneres spillerens egen id.
 */
export async function resolveCoachIdForPlayer(
  playerId: string,
  explicitCoachId?: string | null,
): Promise<string> {
  if (explicitCoachId) return explicitCoachId;
  return resolveValgtCoachIdEllerAdmin(playerId);
}

/** Opprett eller oppdater TrainingSessionV2 koblet til TrainingPlanSession. */
export async function upsertV2ForPlanSession(input: {
  planSessionId: string;
  playerId: string;
  title: string;
  scheduledAt: Date;
  durationMin: number;
  pyramidArea: PyramidArea;
  coachId?: string | null;
  // AK-formel (Fase 0) — kun miljo speiles (eneste session-nivå AK-felt på
  // TrainingSessionV2). Full formel bor på kanon TrainingPlanSession;
  // drill-nivå-formelen bor på TrainingDrillV2 (egen runde).
  miljo?: MMiljo | null;
  /** Hvor økten skjer + hva den skal oppnå — speiles så live-økta viser det samme. */
  location?: string | null;
  maalsetning?: string | null;
  /** G3: satt når kilden er en gruppeutrulling — speiles til TrainingSessionV2.groupId.
   *  Utelatt/null = individuell økt; et eksisterende groupId røres da IKKE. */
  sourceGroupId?: string | null;
}): Promise<void> {
  const coachId = await resolveCoachIdForPlayer(input.playerId, input.coachId);
  const endTime = new Date(input.scheduledAt.getTime() + input.durationMin * 60_000);

  const existing = await prisma.trainingSessionV2.findFirst({
    where: { generertFra: GENERERT_FRA, generertFraId: input.planSessionId },
    select: { id: true, status: true },
  });

  // Felles data for create + update. Status settes KUN ved create — en
  // update skal aldri nullstille COMPLETED/CANCELLED/SKIPPED til PLANNED.
  // groupId settes KUN når kilden faktisk er en gruppeutrulling (G3) —
  // undefined betyr «ikke rør feltet» i update-grenen.
  const data = {
    title: input.title,
    studentId: input.playerId,
    coachId,
    startTime: input.scheduledAt,
    endTime,
    miljo: input.miljo ?? "M2",
    location: input.location ?? null,
    maalsetning: input.maalsetning ?? null,
    practiceType: PYR_TO_PRACTICE[input.pyramidArea],
    isCoachCreated: coachId !== input.playerId,
    generertFra: GENERERT_FRA,
    generertFraId: input.planSessionId,
    ...(input.sourceGroupId ? { groupId: input.sourceGroupId } : {}),
  };

  let v2Id: string;
  if (existing) {
    await prisma.trainingSessionV2.update({ where: { id: existing.id }, data });
    v2Id = existing.id;
  } else {
    const opprettet = await prisma.trainingSessionV2.create({
      data: { ...data, status: "PLANNED" },
      select: { id: true },
    });
    v2Id = opprettet.id;
  }

  // Drill-speiling: kun for PLANNED-økter — en påbegynt/logget økt røres aldri.
  if (!existing || existing.status === "PLANNED") {
    await syncDrillsToV2(v2Id, input.planSessionId, input.pyramidArea);

    // CANON-invariantene (okt-scope) — anbefaling, aldri sperre. Resultatet
    // lagres på V2-speilet (regelBrudd/trengerOppmerksomhet) slik at UI kan
    // vise det uten et eget levende kall per visning.
    const validering = await validerOkt(input.planSessionId);
    const brudd = validering.brudd.map((b) => b.melding);
    await prisma.trainingSessionV2.update({
      where: { id: v2Id },
      data: {
        regelBrudd: brudd.length > 0 ? brudd : Prisma.DbNull,
        trengerOppmerksomhet: validering.hardeBrudd > 0,
      },
    });
  }
}

/**
 * Synk V2-speilet fra plan-økt-id alene — for mutasjonsflater som ikke har
 * feltene for hånden (admin/plans, AI-executor, legacy planlegge).
 */
export async function syncV2FromPlanSessionId(planSessionId: string): Promise<void> {
  const s = await prisma.trainingPlanSession.findUnique({
    where: { id: planSessionId },
    select: {
      id: true,
      title: true,
      scheduledAt: true,
      durationMin: true,
      pyramidArea: true,
      miljo: true,
      location: true,
      maalsetning: true,
      sourceGroupId: true,
      plan: { select: { userId: true, createdById: true } },
    },
  });
  if (!s) return;
  await upsertV2ForPlanSession({
    planSessionId: s.id,
    playerId: s.plan.userId,
    title: s.title,
    scheduledAt: s.scheduledAt,
    durationMin: s.durationMin,
    pyramidArea: s.pyramidArea,
    coachId: s.plan.createdById,
    miljo: s.miljo,
    location: s.location,
    maalsetning: s.maalsetning,
    sourceGroupId: s.sourceGroupId,
  });
}

/** Slett V2-økt koblet til plan-økt. */
export async function deleteV2ForPlanSession(planSessionId: string): Promise<void> {
  await prisma.trainingSessionV2.deleteMany({
    where: { generertFra: GENERERT_FRA, generertFraId: planSessionId },
  });
}
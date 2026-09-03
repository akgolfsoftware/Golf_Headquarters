import "server-only";

import type { Prisma, PrismaClient, PyramidArea, MMiljo } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveValgtCoachIdEllerAdmin } from "@/lib/domain/valgt-coach";
import { GENERERT_FRA, syncDrillsToV2 } from "./v2-drill-mirror";

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
  /** 14.5A: valgfri tx-klient — lar mal-utrullingens transaksjon i apply-template-actions.ts
   *  dele samme transaksjon som denne upserten (og drill-speilingen den trigger). Default
   *  modul-`prisma` for alle andre kallere. */
  db?: PrismaClient | Prisma.TransactionClient;
}): Promise<void> {
  const db = input.db ?? prisma;
  const coachId = await resolveCoachIdForPlayer(input.playerId, input.coachId);
  const endTime = new Date(input.scheduledAt.getTime() + input.durationMin * 60_000);

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

  // Atomisk opprett-eller-oppdater på databasens unike nøkkel
  // (generertFra, generertFraId) — hindrer at to samtidige kall (dobbel-
  // klikk, gruppeutrulling som krysser en synk) begge lager sin egen
  // speil-økt for samme planøkt (14.5A).
  const v2 = await db.trainingSessionV2.upsert({
    where: { generertFra_generertFraId: { generertFra: GENERERT_FRA, generertFraId: input.planSessionId } },
    update: data,
    create: { ...data, status: "PLANNED" },
    select: { id: true, status: true, createdAt: true, updatedAt: true },
  });

  // Drill-speiling: kun for PLANNED-økter — en påbegynt/logget økt røres aldri.
  // (createdAt === updatedAt) er den atomiske erstatningen for "eksisterte
  // ikke fra før" siden upsert ikke selv forteller om det opprettet eller
  // oppdaterte raden.
  const varOpprettetNaa = v2.createdAt.getTime() === v2.updatedAt.getTime();
  if (varOpprettetNaa || v2.status === "PLANNED") {
    await syncDrillsToV2(v2.id, input.planSessionId, input.pyramidArea, db);
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
import "server-only";

/**
 * Delt repslogg-automatikk for teknisk-plan-oppgaver (runde 2 · 2026-07-14).
 * Trukket ut fra den opprinnelige logReps()-server-actionen i
 * src/app/portal/tren/teknisk-plan/actions.ts, som fortsatt eier
 * autorisasjon (ensurePlanAccess) og kaller denne. Live-økt-hookupen
 * (src/app/portal/(fullscreen)/live/[sessionId]/actions.ts) kaller den
 * også, med sessionV2Id satt, når en drill er koblet til en oppgave.
 *
 * PH-TP-01 (29.09.2026): registreringen kan bære miljø (belastning) og en
 * kommentar til coachen. Miljøet teller mot målmatrisen (PositionTaskMaal),
 * som rekalkuleres fra alle loggene — loggene er fasit, cellen er cache.
 */

import { prisma } from "@/lib/prisma";
import type { Belastning, RepHastighet, Prisma } from "@/generated/prisma/client";
import { tellMotMatrise } from "@/lib/domain/teknisk-maalmatrise";
import { HASTIGHET_TIL_MOTORIKK } from "@/lib/teknisk-plan/tp-visning";

export type RepsInput = { dry?: number; lav?: number; full?: number };

export async function applyPositionTaskReps(
  taskId: string,
  reps: RepsInput,
  loggedByUserId: string,
  opts?: { sessionV2Id?: string; belastning?: Belastning | null; notater?: string | null },
  db?: Prisma.TransactionClient,
): Promise<void> {
  if (!db) return prisma.$transaction(tx => applyPositionTaskReps(taskId, reps, loggedByUserId, opts, tx));
  if (![reps.dry, reps.lav, reps.full].some(n => n != null && n !== 0)) return;
  await db.positionTask.update({
    where: { id: taskId },
    data: {
      repsGjortDry: { increment: reps.dry ?? 0 },
      repsGjortLav: { increment: reps.lav ?? 0 },
      repsGjortFull: { increment: reps.full ?? 0 },
      lastRepLoggedAt: new Date(),
    },
  });

  const logRows: { hastighet: RepHastighet; reps: number }[] = (
    [
      { hastighet: "DRY", reps: reps.dry ?? 0 },
      { hastighet: "LAV", reps: reps.lav ?? 0 },
      { hastighet: "FULL", reps: reps.full ?? 0 },
    ] as { hastighet: RepHastighet; reps: number }[]
  ).filter((r) => r.reps !== 0);

  if (logRows.length === 0) return;

  await db.positionTaskLog.createMany({
    data: logRows.map((r) => ({
      taskId,
      loggedByUserId,
      reps: r.reps,
      hastighet: r.hastighet,
      sessionV2Id: opts?.sessionV2Id,
      belastning: opts?.belastning ?? null,
      notater: opts?.notater ?? null,
    })),
  });

  if (opts?.belastning) await rekalkulerMaalMatrise(taskId, db);
}

/** Setter gjortReps i målmatrisen på nytt fra alle loggene for oppgaven. */
export async function rekalkulerMaalMatrise(taskId: string, db?: Prisma.TransactionClient): Promise<void> {
  if (!db) return prisma.$transaction(tx => rekalkulerMaalMatrise(taskId, tx));
  const [celler, logger] = await Promise.all([
    db.positionTaskMaal.findMany({ where: { taskId }, select: { id: true, motorikk: true, belastning: true, maalReps: true } }),
    db.positionTaskLog.findMany({ where: { taskId }, select: { reps: true, hastighet: true, belastning: true } }),
  ]);
  if (celler.length === 0) return;
  // Korreksjoner er signerte loggposter; summer før domenets positive teller.
  const summer = new Map<string, { motorikk: ReturnType<typeof motorikkFra>; belastning: Belastning | null; reps: number }>();
  function motorikkFra(h: RepHastighet) { return HASTIGHET_TIL_MOTORIKK[h]; }
  for (const l of logger) {
    const key = `${l.hastighet}:${l.belastning}`;
    const prior = summer.get(key);
    summer.set(key, { motorikk: motorikkFra(l.hastighet), belastning: l.belastning, reps: (prior?.reps ?? 0) + l.reps });
  }
  const talt = tellMotMatrise(celler, [...summer.values()]);
  await Promise.all(
    celler.map((c) => {
      const t = talt.find((x) => x.motorikk === c.motorikk && x.belastning === c.belastning);
      return db.positionTaskMaal.update({ where: { id: c.id }, data: { gjortReps: t?.gjortReps ?? 0 } });
    }),
  );
}

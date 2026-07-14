import "server-only";

/**
 * Delt repslogg-automatikk for teknisk-plan-oppgaver (runde 2 · 2026-07-14).
 * Trukket ut fra den opprinnelige logReps()-server-actionen i
 * src/app/portal/(legacy)/tren/teknisk-plan/actions.ts, som fortsatt eier
 * autorisasjon (ensurePlanAccess) og kaller denne. Live-økt-hookupen
 * (src/app/portal/(fullscreen)/live/[sessionId]/actions.ts) kaller den
 * også, med sessionV2Id satt, når en drill er koblet til en oppgave.
 */

import { prisma } from "@/lib/prisma";
import type { RepHastighet } from "@/generated/prisma/client";

export type RepsInput = { dry?: number; lav?: number; full?: number };

export async function applyPositionTaskReps(
  taskId: string,
  reps: RepsInput,
  loggedByUserId: string,
  opts?: { sessionV2Id?: string },
): Promise<void> {
  await prisma.positionTask.update({
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
  ).filter((r) => r.reps > 0);

  if (logRows.length === 0) return;

  await prisma.positionTaskLog.createMany({
    data: logRows.map((r) => ({
      taskId,
      loggedByUserId,
      reps: r.reps,
      hastighet: r.hastighet,
      sessionV2Id: opts?.sessionV2Id,
    })),
  });
}

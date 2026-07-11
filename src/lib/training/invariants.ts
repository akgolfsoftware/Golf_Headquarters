import type { ExecutorDelta } from "@/lib/agents/plan-action-executor";

export type ExecutorInvariantResult = {
  ok: boolean;
  reason?: string;
};

/**
 * Lette executor-invarianter før planendring apply.
 * (CANON-invarianter i lib/canon dekker økt/perioder — dette er agent-delta.)
 */
export function validateExecutorDelta(
  delta: ExecutorDelta,
  ctx: { planlagteOkterNesteUke: number },
): ExecutorInvariantResult {
  const adds = delta.sessionsToAdd.length;
  const removes = delta.sessionsToRemove.length;

  if (adds > 4) {
    return { ok: false, reason: "Maks 4 nye økter per godkjenning." };
  }
  if (removes > 6) {
    return { ok: false, reason: "Maks 6 fjernede økter per godkjenning." };
  }
  if (ctx.planlagteOkterNesteUke + adds - removes > 14) {
    return { ok: false, reason: "Junior/uke-grense: maks 14 planlagte økter neste uke." };
  }
  if (
    delta.planMeta?.periodNote &&
    (adds > 0 || removes > 0 || delta.sessionsToModify.length > 0)
  ) {
    return {
      ok: false,
      reason: "Periodebytte skal ikke kombineres med økt-endringer i samme apply.",
    };
  }

  return { ok: true };
}
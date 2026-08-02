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
// ---------- CANON inv_1: TEK-minimum ----------

/**
 * CANON v3.5, invariant 1: teknikk skal alltid utgjøre minst 15 % av pyramiden.
 * Periodiserings-skillen kunne tidligere returnere TEK = 10 % (skade, pre-turnering,
 * turneringsuke og periodeslutt) — maskinelt brudd på en invariant som aldri skal
 * kunne brytes. Verdiene er rettet ved kilden, og denne funksjonen er nettet under:
 * enhver pyramide som passerer her får TEK løftet til minimum.
 *
 * Merk: dette SPERRER ingenting for spilleren (jf. husets invariant «anbefalinger
 * sperrer aldri») — den justerer en foreslått fordeling før den blir til en plan.
 */
export const MIN_TEK_PROSENT = 15;

export type Pyramide = Partial<
  Record<"FYS" | "TEK" | "SLAG" | "SPILL" | "TURN", number>
>;

/**
 * Løfter TEK til minimum 15 % og tar differansen fra det største andre området,
 * slik at summen holder seg uendret. Returnerer pyramiden urørt hvis den allerede
 * oppfyller minimumet (eller er null/tom).
 */
export function handhevTekMinimum<T extends Pyramide | null>(pyramide: T): T {
  if (!pyramide) return pyramide;
  const tek = pyramide.TEK ?? 0;
  if (tek >= MIN_TEK_PROSENT) return pyramide;

  const mangler = MIN_TEK_PROSENT - tek;
  const andre = (["FYS", "SLAG", "SPILL", "TURN"] as const).filter(
    (k) => (pyramide[k] ?? 0) > 0,
  );
  if (andre.length === 0) return pyramide;

  const storst = andre.reduce((a, b) =>
    (pyramide[b] ?? 0) > (pyramide[a] ?? 0) ? b : a,
  );
  return {
    ...pyramide,
    TEK: MIN_TEK_PROSENT,
    [storst]: Math.max(0, (pyramide[storst] ?? 0) - mangler),
  };
}

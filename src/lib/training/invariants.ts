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
// ---------- CANON inv_1: TEK-anbefaling (varsel, ikke sperre) ----------

/**
 * CANON v3.5, invariant 1: teknikk bør utgjøre minst 15 % av pyramiden.
 *
 * Dette er en ANBEFALING, ikke en sperre. Fordelingen er ikke låst — spilleren
 * (og coachen) setter sine egne verdier, og koden skal aldri skrive dem om i
 * stillhet. Vi sier bare fra i klartekst når en foreslått fordeling ligger under
 * CANON-nivået, slik at avviket er synlig og valgt, ikke usett.
 *
 * Jf. husets invariant 1: anbefalinger sperrer aldri.
 */
export const ANBEFALT_MIN_TEK_PROSENT = 15;

export type Pyramide = Partial<
  Record<"FYS" | "TEK" | "SLAG" | "SPILL" | "TURN", number>
>;

/**
 * Returnerer en varseltekst hvis TEK ligger under CANON-anbefalingen, ellers null.
 * Kalleren legger teksten i `begrensninger` (eller viser den i UI). Verdiene
 * røres ikke.
 */
export function tekAnbefalingsVarsel(pyramide: Pyramide | null): string | null {
  if (!pyramide) return null;
  const tek = pyramide.TEK ?? 0;
  if (tek >= ANBEFALT_MIN_TEK_PROSENT) return null;
  return `Teknikk ligger på ${tek} % denne uka — CANON anbefaler minst ${ANBEFALT_MIN_TEK_PROSENT} %. Fordelingen er din, men avviket er verdt å være klar over.`;
}

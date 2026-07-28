/**
 * SG-mål-hjelpere — lesing/validering av `sgOmrade`/`sgStart` i `Goal.payload`.
 *
 * Historikk: dette modulet inneholdt tidligere også `beregnMaalFremdrift`
 * (én kilde til mål-fremdrift). Ved sammenslåing av to parallelle grener
 * 27. juli 2026 ble den orkestreringen erstattet av `beregnGoalProgress`
 * (src/lib/portal/goals/progress.ts), som nå er eneste kilde til mål-
 * fremdrift i appen og bruker hjelperne under til å regne SG-område-mål.
 *
 * SG_AREA krever at målet vet HVILKET område det gjelder. Det ligger ikke
 * i `type` — det lagres i `Goal.payload` som `sgOmrade` sammen med
 * `sgStart` (spillerens SG i området da målet ble satt).
 */

/** SG-områdene slik de lagres på målet (speiler Round.sgOtt/App/Arg/Putt). */
export const SG_OMRADER = ["OTT", "APP", "ARG", "PUTT"] as const;
export type SgOmrade = (typeof SG_OMRADER)[number];

/** Norsk fasit-navn (AK-formelen): Tee Total · Innspill · Nærspill · Putting. */
export const SG_OMRADE_NAVN: Record<SgOmrade, string> = {
  OTT: "Tee Total",
  APP: "Innspill",
  ARG: "Nærspill",
  PUTT: "Putting",
};

export function erSgOmrade(v: unknown): v is SgOmrade {
  return typeof v === "string" && (SG_OMRADER as readonly string[]).includes(v);
}

/** Leser sgOmrade/sgStart ut av Goal.payload uten å stole på formen. */
export function lesSgMaal(payload: unknown): { omrade: SgOmrade; start: number | null } | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const p = payload as Record<string, unknown>;
  if (!erSgOmrade(p.sgOmrade)) return null;
  const start = typeof p.sgStart === "number" && Number.isFinite(p.sgStart) ? p.sgStart : null;
  return { omrade: p.sgOmrade, start };
}

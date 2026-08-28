/**
 * Designsystem-nøytrale små hjelpere som tidligere bodde i Paper-tokenfila
 * (src/lib/v2/tokens.ts). Flyttet hit 28.08.2026 så produktskjermer (Train-lock)
 * slipper å importere fra Paper-modulen. tokens.ts re-eksporterer for
 * bakoverkompatibilitet (marketing).
 */

/** Akse-nøkler i pyramiden (FYS/TEK/SLAG/SPILL/TURN). */
export type AkseKey = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

/** SG-formatering: komma-desimal + fortegn (+/−), 1 desimal. Speil av mockupens fmtSg. */
export function fmtSg(v: number): string {
  return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1).replace(".", ",");
}

/** Tom tallverdi i UI — alltid em-dash (fasit). */
export const TOM_TALL = "—";

/** Returner em-dash for null/undefined/tom streng; ellers verdien. */
export function fmtTall(v: number | string | null | undefined): string {
  if (v === null || v === undefined || v === "") return TOM_TALL;
  return String(v);
}

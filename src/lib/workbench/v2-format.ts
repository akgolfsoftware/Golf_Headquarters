/**
 * Workbench v2 — delte, rene formaterings-hjelpere (tid/varighet). Brukt av
 * WorkbenchV2 og WorkbenchV2Sheets — egen fil for å unngå sirkulær import
 * mellom de to komponentfilene.
 */

/** «1,5 t» (≥60 min) eller «45 min». */
export function fmtVarighet(min: number): string {
  if (min >= 60) return `${(min / 60).toFixed(1).replace(".", ",")} t`;
  return `${min} min`;
}

/** «1,5 t» fra timetall. */
export function fmtTimer(t: number): string {
  return `${t.toFixed(1).replace(".", ",")} t`;
}

export function toKl(h: number, m = 0): string {
  return `${h}:${String(m).padStart(2, "0")}`;
}

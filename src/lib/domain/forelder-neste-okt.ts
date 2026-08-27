/**
 * Forelder «neste økt» (C9 / FO-01).
 *
 * Invariant 3: DRAFT er usynlig. Kun PUBLISHED | IN_PROGRESS.
 * GDPR: kun fornavn.
 */

export const FORELDER_NESTE_OKT_STATUS = ["PUBLISHED", "IN_PROGRESS"] as const;

export type ForelderNesteOktStatus = (typeof FORELDER_NESTE_OKT_STATUS)[number];

export function fornavnAv(fulltNavn: string): string {
  const t = fulltNavn.trim();
  if (!t) return "";
  return t.split(/\s+/)[0] ?? t;
}

export function erSynligForForelder(status: string): status is ForelderNesteOktStatus {
  return status === "PUBLISHED" || status === "IN_PROGRESS";
}

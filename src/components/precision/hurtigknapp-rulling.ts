/** Ned-rulling på mobil skjuler knappen (den dekker høyre kant av lister); opp-rulling og stillstand viser den. */
export function skjultVedRulling(forrige: number, ny: number, skjult: boolean): boolean {
  const d = ny - forrige;
  if (d > 8) return true;
  if (d < -8) return false;
  return skjult;
}

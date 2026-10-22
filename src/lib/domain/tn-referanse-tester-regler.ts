/**
 * Regler for Referanse › Tester (Anders 22.10.2026, beslutninger.md #1614): median og antall per test for hele
 * Team Norway-gruppa, regnet av hver spillers siste gyldige resultat siste 12 måneder. Under fem spillere vises «—».
 * Ingen «beste». Rene funksjoner, så reglene kan låses med test.
 */

export const REFERANSE_MINSTE_ANTALL = 5;
export const REFERANSE_VINDU_DAGER = 365;

/** Siste rad per spiller (radene kan komme i hvilken som helst rekkefølge). */
export function sistePerSpiller<T extends { userId: string; takenAt: Date }>(rader: readonly T[]): T[] {
  const siste = new Map<string, T>();
  for (const r of rader) {
    const naa = siste.get(r.userId);
    if (!naa || r.takenAt.getTime() > naa.takenAt.getTime()) siste.set(r.userId, r);
  }
  return [...siste.values()];
}

/**
 * Median av verdiene; ved partall antall den nedre av de to midterste, som før. Null når færre enn
 * fem spillere har resultat, så ingen celle kan peke ut én spiller.
 */
export function referanseMedian<T extends { score: number }>(rader: readonly T[]): T | null {
  if (rader.length < REFERANSE_MINSTE_ANTALL) return null;
  const sortert = [...rader].sort((a, b) => a.score - b.score);
  return sortert[Math.floor((sortert.length - 1) / 2)] ?? null;
}

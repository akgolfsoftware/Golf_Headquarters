// Streak-aggregat fra sesjons-logger.

import { sammeDag } from "./uke-helpers";

/**
 * Returnerer array av booleans for de siste `days`-dagene (eldst først).
 * En dag er "on" hvis det finnes minst én log med startedAt på den dagen.
 */
export function computeStreak(
  loggDates: Date[],
  days: number = 14
): boolean[] {
  const idag = new Date();
  idag.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, i) => {
    const dato = new Date(idag);
    dato.setDate(idag.getDate() - (days - 1 - i));
    return loggDates.some((d) => sammeDag(new Date(d), dato));
  });
}

export function streakAntall(streak: boolean[]): number {
  return streak.filter(Boolean).length;
}

export function aktivStreak(streak: boolean[]): number {
  // Nåværende streak fra slutten (i dag) bakover
  let antall = 0;
  for (let i = streak.length - 1; i >= 0; i--) {
    if (streak[i]) antall++;
    else break;
  }
  return antall;
}

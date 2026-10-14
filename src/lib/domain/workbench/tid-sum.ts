/**
 * Én regel for «lagt inn» og «gjennomført» tid i Workbench (uke, måned, periode, år).
 * Minuttene er øktens planlagte varighet, også for gjennomførte økter; de er ikke
 * målt aktiv tid (beslutning 26.09.2026, samme regel som etterlevelse).
 */
type TidOkt = { durationMinutes: number; status: string };

export function planlagtMinutter(okter: readonly TidOkt[]): number {
  return okter.reduce((sum, s) => sum + Math.max(0, s.durationMinutes), 0);
}

export function gjennomfortMinutter(okter: readonly TidOkt[]): number {
  return planlagtMinutter(okter.filter((s) => s.status === "COMPLETED"));
}

/**
 * Én regel for «lagt inn» og «gjennomført» tid i Workbench (uke, måned, periode, år).
 * Minuttene er øktens planlagte varighet, også for gjennomførte økter; de er ikke
 * målt aktiv tid (beslutning 26.09.2026, samme regel som etterlevelse).
 */
type TidOkt = { durationMinutes: number; status: string };

export function planlagtMinutter(okter: readonly { durationMinutes: number }[]): number {
  return okter.reduce((sum, s) => sum + Math.max(0, s.durationMinutes), 0);
}

export function gjennomfortMinutter(okter: readonly TidOkt[]): number {
  return planlagtMinutter(okter.filter((s) => s.status === "COMPLETED"));
}

/**
 * Fremdrift («gjennomført av planlagt hittil») teller alt som ikke er avlyst.
 * Hoppet over teller som avvik: Workbench-økter har ingen registrert årsak, og
 * hoppet over uten årsak er et ekte avvik (src/lib/domain/okt-status.ts).
 * Samme regel som I dag og Plan bruker for økter uten årsak.
 */
export function tellerIFremdrift(okt: { status: string }): boolean {
  return okt.status !== "CANCELLED";
}

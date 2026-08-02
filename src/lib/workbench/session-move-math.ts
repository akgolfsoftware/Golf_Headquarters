/**
 * Pure date math for Workbench week drag-drop (no server imports —
 * uke-helpers er også ren og delt klient+server).
 *
 * Tidssone: «hvilken uke/dag er nå» regnes mot norsk kalenderdag via
 * uke-helpers (Intl, Europe/Oslo). Returverdiene følger samme konvensjon som
 * uke-helpers: midnatt i SERVERENS lokale tid på den norske kalenderdagen
 * (naiv veggklokke) — så setDate()/setHours()-aritmetikken og Prisma-grensene
 * hos konsumentene er uendret. Før 2026-07 brukte denne filen rå getDay()/
 * setHours() på new Date(); på Vercel (UTC) pekte det på feil dag/uke i
 * vinduet rundt norsk midnatt (se gotchas).
 */

import { startOfWeek } from "@/lib/uke-helpers";

/** Hvor langt fram/tilbake uke-navigasjonen tillates (±1 år). */
export const WEEK_OFFSET_MIN = -52;
export const WEEK_OFFSET_MAX = 52;

/**
 * Tolk `?uke=N`-parameteren til et trygt heltalls uke-offset.
 * Ugyldig/manglende → 0. Klemmes til [WEEK_OFFSET_MIN, WEEK_OFFSET_MAX].
 */
export function parseWeekOffset(raw: string | string[] | undefined | null): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v == null || v === "") return 0;
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(WEEK_OFFSET_MIN, Math.min(WEEK_OFFSET_MAX, Math.trunc(n)));
}

/** Mandag 00:00 (lokal tid) i den norske uka som inneholder `d` (mandag = indeks 0). */
export function mondayOf(d: Date): Date {
  return startOfWeek(d);
}

/**
 * Mandag 00:00 i uka som ligger `weekOffset` uker fra uka som inneholder `now`.
 * weekOffset 0 = inneværende uke, +1 = neste, −1 = forrige. Brukes som `refDate`
 * inn i `dateForDayIndex`/`computeMoveTarget` så drag-drop persisteres til den
 * uka brukeren faktisk ser — ikke alltid inneværende uke.
 */
export function weekRefDate(weekOffset: number, now: Date = new Date()): Date {
  const m = mondayOf(now);
  m.setDate(m.getDate() + Math.trunc(weekOffset) * 7);
  return m;
}

export function dateForDayIndex(
  dayIndex: number,
  hour: number,
  minute: number,
  refDate: Date = new Date(),
): Date {
  const target = mondayOf(refDate);
  target.setDate(target.getDate() + dayIndex);
  target.setHours(hour, minute, 0, 0);
  return target;
}

/** Behold klokkeslett, bytt dag innenfor uka som inneholder refDate. */
export function computeMoveTarget(
  scheduledAt: Date,
  dayIndex: number,
  refDate: Date = new Date(),
): Date {
  if (dayIndex < 0 || dayIndex > 6) {
    throw new Error("Ugyldig dag");
  }
  return dateForDayIndex(dayIndex, scheduledAt.getHours(), scheduledAt.getMinutes(), refDate);
}

/** Dag-indeks (0=man) for scheduledAt relativt til refDate sin uke. */
export function dayIndexFromScheduledAt(scheduledAt: Date, refDate: Date = new Date()): number {
  const mon = mondayOf(refDate);
  const day = new Date(scheduledAt);
  day.setHours(0, 0, 0, 0);
  // Math.round tåler 23-/25-timersdøgn ved sommertidsskifte.
  return Math.round((day.getTime() - mon.getTime()) / 86_400_000);
}

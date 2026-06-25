/** Pure date math for Workbench week drag-drop (no server imports). */

/** Mandag 00:00 i uka som inneholder `d` (mandag = indeks 0). */
export function mondayOf(d: Date): Date {
  const x = new Date(d);
  const dow = (x.getDay() + 6) % 7;
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - dow);
  return x;
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
  return Math.round((day.getTime() - mon.getTime()) / 86_400_000);
}
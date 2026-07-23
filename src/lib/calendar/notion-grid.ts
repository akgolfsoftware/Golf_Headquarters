/**
 * Notion Calendar-fasit for AK Golf HQ (PlayerHQ + AgencyOS).
 *
 * Én kilde for tidslinje, oppløsning og uke — brukes av shared/calendar,
 * workbench-grid og øktplanlegger (tid-velger). Endre her, ikke i tre steder.
 *
 * Låst 2026-07-23: 05:00–23:00, 30 min, man først.
 */

/** Første time i grid (inkl.). */
export const GRID_START_HOUR = 5;

/** Siste time i grid (inkl. — siste rad er denne timen). */
export const GRID_END_HOUR = 23;

/** Slot-oppløsning i minutter. */
export const GRID_SLOT_MIN = 30;

/** Uke starter mandag (date-fns weekStartsOn). */
export const WEEK_STARTS_ON = 1 as const;

/** Piksler per time i uke/dag-timegrid (desktop-tetthet). */
export const PIXEL_PER_HOUR = 56;

/** Antall timer i grid (inkl. start og slutt). */
export const GRID_HOUR_COUNT = GRID_END_HOUR - GRID_START_HOUR + 1;

/** Total høyde i px for timegrid-body. */
export const GRID_BODY_PX = (GRID_END_HOUR - GRID_START_HOUR) * PIXEL_PER_HOUR;

/** Timer som rader: 5, 6, …, 23. */
export function gridHours(): number[] {
  return Array.from({ length: GRID_HOUR_COUNT }, (_, i) => GRID_START_HOUR + i);
}

/** Alle 30-min slots som "HH:MM" fra start til (men ikke forbi) slutt-time. */
export function gridTimeSlots(): string[] {
  const out: string[] = [];
  const pad = (n: number) => String(n).padStart(2, "0");
  for (let h = GRID_START_HOUR; h <= GRID_END_HOUR; h++) {
    out.push(`${pad(h)}:00`);
    if (h < GRID_END_HOUR) out.push(`${pad(h)}:30`);
  }
  return out;
}

/** Minutter siden midnatt for grid-start. */
export const GRID_START_MIN = GRID_START_HOUR * 60;

/** Minutter siden midnatt for grid-slutt (23:00 = siste hele time-start). */
export const GRID_END_MIN = GRID_END_HOUR * 60;

/**
 * Y-posisjon i px for et klokkeslett innenfor grid.
 * Klemmes til [0, GRID_BODY_PX].
 */
export function timeToPx(hours: number, minutes = 0): number {
  const t = hours + minutes / 60;
  return Math.max(0, Math.min(GRID_BODY_PX, (t - GRID_START_HOUR) * PIXEL_PER_HOUR));
}

/** Y-posisjon fra Date. */
export function dateToPx(dato: Date): number {
  return timeToPx(dato.getHours(), dato.getMinutes());
}

/** Høyde i px for varighet i minutter (min 20px for klikkbarhet). */
export function durationToPx(varighetMin: number): number {
  return Math.max(20, (varighetMin / 60) * PIXEL_PER_HOUR);
}

/**
 * Foreslå neste slot etter siste aktivitet (start HH:MM + varighet).
 * Klemmes til grid 05:00–23:00. Avrunder opp til nærmeste 30 min.
 */
export function foreslaGridTid(sisteStartKl?: string, varighetMin = 60): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  if (!sisteStartKl) return "09:00";
  const [h, m] = sisteStartKl.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return "09:00";
  let min = h * 60 + m + varighetMin;
  // Avrund opp til 30-min
  min = Math.ceil(min / GRID_SLOT_MIN) * GRID_SLOT_MIN;
  min = Math.max(GRID_START_MIN, Math.min(GRID_END_MIN, min));
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
}

/** Parse "HH:MM" → minutter siden midnatt, eller null. */
export function parseKlokke(kl: string): number | null {
  const [h, m] = kl.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

/** ISO-lokal "YYYY-MM-DDTHH:mm" for kalender → øktplanlegger. */
export function tilStartParam(datoIso: string, klokkeslett: string): string {
  return `${datoIso}T${klokkeslett}`;
}

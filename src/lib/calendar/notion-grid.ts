/**
 * Notion Calendar-fasit for AK Golf HQ (PlayerHQ + AgencyOS).
 *
 * Én kilde for tidslinje, oppløsning og uke — brukes av shared/calendar,
 * workbench-grid og øktplanlegger (tid-velger). Endre her, ikke i tre steder.
 *
 * Paper-fasit (2026-08-10, PP-2.4): 05:00–23:00 i 30-minutters intervaller,
 * 22 px per slot. Identisk i `agencyos-kalender.html` og `workbench-desktop.html`
 * (`T_START = 5*60, T_SLUTT = 23*60, SLOT = 30, SLOT_H = 22`) — Workbench-linjen
 * er merket «beslutning Anders 01.08.2026».
 *
 * Dette avløser 04:00–23:00/20 min fra AgencyOS-kodeordren 2026-07-29, som
 * utvidet aksen til 04:00 for morgenøkter (WANG/GFGK før skole). Paper vinner
 * (CLAUDE.md invariant 2), og 05:00 er tidlig nok for skoletrening. Økter som
 * likevel starter før 05:00 klemmes til toppen av grid av `timeGridBlockStyle`
 * — de forsvinner ikke, men de får ikke egen rad.
 */

/** Første time i grid (inkl.). */
export const GRID_START_HOUR = 5;

/** Siste time i grid (inkl. — siste rad er denne timen). */
export const GRID_END_HOUR = 23;

/** Slot-oppløsning i minutter. */
export const GRID_SLOT_MIN = 30;

/** Uke starter mandag (date-fns weekStartsOn). */
export const WEEK_STARTS_ON = 1 as const;

/**
 * Piksler per time i uke/dag-timegrid (desktop-tetthet).
 * Paper: SLOT_H 22 px per 30 min → 44 px per time.
 */
export const PIXEL_PER_HOUR = 44;

/** Antall timer i grid (inkl. start og slutt). */
export const GRID_HOUR_COUNT = GRID_END_HOUR - GRID_START_HOUR + 1;

/** Total høyde i px for timegrid-body. */
export const GRID_BODY_PX = (GRID_END_HOUR - GRID_START_HOUR) * PIXEL_PER_HOUR;

/** Timer som rader: 5, 6, …, 23. */
export function gridHours(): number[] {
  return Array.from({ length: GRID_HOUR_COUNT }, (_, i) => GRID_START_HOUR + i);
}

/**
 * Tidsakse-merker som minutter siden midnatt — ett per slot fra grid-start til
 * og med siste merke FØR grid-slutt (05:00, 05:30, …, 22:30).
 *
 * Paper `tegnAkse()` merker hver slot, ikke hver time, og gir hele timer sterkere
 * vekt enn halvtimene. Slutt-timen tas ikke med: den ville falt nøyaktig på
 * underkanten av grid-kroppen og fått etiketten til å henge utenfor rammen.
 */
export function gridTicks(): number[] {
  const out: number[] = [];
  for (let min = GRID_START_HOUR * 60; min < GRID_END_HOUR * 60; min += GRID_SLOT_MIN) {
    out.push(min);
  }
  return out;
}

/** Alle GRID_SLOT_MIN-slots som "HH:MM" fra start til og med slutt-time. */
export function gridTimeSlots(): string[] {
  const out: string[] = [];
  const pad = (n: number) => String(n).padStart(2, "0");
  for (
    let min = GRID_START_HOUR * 60;
    min <= GRID_END_HOUR * 60;
    min += GRID_SLOT_MIN
  ) {
    out.push(`${pad(Math.floor(min / 60))}:${pad(min % 60)}`);
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

/**
 * Y-posisjon fra minutter siden midnatt (f.eks. 9:30 → 570).
 * Klemmes til grid.
 */
export function minutesToPx(minSinceMidnight: number): number {
  return Math.max(
    0,
    Math.min(GRID_BODY_PX, ((minSinceMidnight - GRID_START_MIN) / 60) * PIXEL_PER_HOUR),
  );
}

/** Høyde i px for varighet i minutter (min 20px for klikkbarhet). */
export function durationToPx(varighetMin: number): number {
  return Math.max(20, (varighetMin / 60) * PIXEL_PER_HOUR);
}

/**
 * Foreslå neste slot etter siste aktivitet (start HH:MM + varighet).
 * Klemmes til grid 05:00–23:00. Avrunder opp til nærmeste GRID_SLOT_MIN.
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

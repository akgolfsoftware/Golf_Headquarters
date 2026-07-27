/**
 * Tidskonvertering mellom Google Calendar og AK Golf HQ.
 *
 * Egen fil uten Prisma-import slik at logikken kan enhetstestes isolert
 * (samme mønster som booking/calendar-result.ts).
 */
import type { calendar_v3 } from "googleapis";

/**
 * Oslo-veggklokke-deler av et absolutt tidspunkt.
 * hourCycle h23 så midnatt blir 00, ikke 24.
 */
const OSLO_DELER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/**
 * Konverter et absolutt tidspunkt til kodebasens «naiv veggklokke»-konvensjon.
 *
 * VIKTIG — hvorfor dette ikke bare er `new Date(dateTime)`:
 * Resten av AK Golf HQ lagrer tider som veggklokke i SERVERENS tidssone
 * (`setHours(15, 0)` i booking-flyten, `lokalMidnatt()` i uke-helpers) og leser
 * dem tilbake med `getHours()`. Google leverer derimot ekte instants med
 * tidssone. Speilet vi rått, ville en avtale kl. 15:00 Oslo blitt vist som
 * 13:00 i prod (Vercel kjører UTC) — to timer feil, rett ved siden av en
 * booking som viser riktig. Vi oversetter derfor til samme konvensjon:
 * ta Oslo-veggklokken og bygg en Date med den lokale konstruktøren.
 *
 *   Prod (UTC):  new Date(2026, 6, 28, 15, 0) → 15:00Z, getHours() = 15  ✓
 *   Dev  (Oslo): new Date(2026, 6, 28, 15, 0) → 13:00Z, getHours() = 15  ✓
 *
 * Konsekvens: feltene i GoogleCalendarEvent er IKKE absolutte tidspunkt. De
 * skal kun sammenlignes med andre naive tider i kodebasen (Booking.startAt,
 * uke-helpers), aldri med en rå `new Date()` i prod.
 */
export function tilNaivVeggklokke(instant: Date): Date {
  const deler = OSLO_DELER.formatToParts(instant);
  const tall = (type: string) =>
    Number(deler.find((d) => d.type === type)?.value ?? "0");
  return new Date(
    tall("year"),
    tall("month") - 1,
    tall("day"),
    tall("hour"),
    tall("minute"),
    tall("second"),
  );
}

/**
 * Google leverer heldagshendelser som `start.date` ("2026-07-28"), tidsbestemte
 * som `start.dateTime`. Begge oversettes til naiv veggklokke — se
 * tilNaivVeggklokke for hvorfor.
 */
export function parseGoogleTidspunkt(
  felt: calendar_v3.Schema$EventDateTime | undefined,
): { tid: Date; heldag: boolean } | null {
  if (!felt) return null;
  if (felt.dateTime) {
    const d = new Date(felt.dateTime);
    if (Number.isNaN(d.getTime())) return null;
    return { tid: tilNaivVeggklokke(d), heldag: false };
  }
  if (felt.date) {
    const [aar, maned, dag] = felt.date.split("-").map(Number);
    if (!aar || !maned || !dag) return null;
    // Heldag: midnatt lokalt på den kalenderdagen — samme mønster som
    // lokalMidnatt() i uke-helpers.ts.
    return { tid: new Date(aar, maned - 1, dag), heldag: true };
  }
  return null;
}

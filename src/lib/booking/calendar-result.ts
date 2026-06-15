/**
 * Rent resultat-objekt + beslutning for kalender-tilgjengelighet.
 *
 * Ligger i egen fil uten tunge avhengigheter (prisma/googleapis) slik at
 * beslutnings-logikken kan enhetstestes isolert.
 */

export type Interval = { start: Date; end: Date };

/**
 * Resultat av en kalender-tilgjengelighetssjekk. Skiller bevisst «sjekket OK»
 * fra «klarte IKKE å sjekke» (utløpt token / API-feil) slik at booking aldri
 * stille fail-open-er og dobbeltbooker mot en privat avtale.
 *
 * - ok:true  = sjekken gikk gjennom (eller coachen har ingen kalender-beskyttelse).
 * - ok:false = minst én pull-kalender kunne IKKE sjekkes. `busy` inneholder det
 *              vi rakk å hente, men bildet er ufullstendig.
 */
export type CalendarBusyResult =
  | { ok: true; busy: Interval[] }
  | { ok: false; reason: string; busy: Interval[] };

/**
 * Skal et slot blokkeres på kalender-grunnlag?
 *
 * Fail-closed: hvis kalenderen ikke kunne sjekkes (ok:false) blokkeres slotet —
 * vi antar ALDRI at coachen er ledig basert på en mislykket sjekk.
 */
export function kalenderBlokkererSlot(
  result: CalendarBusyResult,
  slotStart: Date,
  slotEnd: Date,
): boolean {
  if (!result.ok) return true;
  return result.busy.some(
    (b) => slotStart.getTime() < b.end.getTime() && slotEnd.getTime() > b.start.getTime(),
  );
}

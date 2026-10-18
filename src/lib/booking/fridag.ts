/**
 * Fridag (bookingplanen steg 3, natt 17.10): en heldags `CalendarEvent` for coachen
 * med tittel som starter med «Fridag». Lukeberegningen fjerner tid som overlapper
 * en hendelse for coachen, så fridagen tar bort all tid den dagen.
 */
export const FRIDAG_TITTEL = "Fridag";

export function erFridag(tittel: string): boolean {
  return tittel === FRIDAG_TITTEL || tittel.startsWith(`${FRIDAG_TITTEL} · `);
}

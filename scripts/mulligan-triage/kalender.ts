/**
 * Kalender-ledighet for Mulligan-triagen. Todeling: regnUtLedigeVinduer()
 * (ren utregning, testet i src/lib/mulligan/ledige-tider.test.ts) er
 * adskilt fra selve Google-API-kallet her — samme mønster som
 * kalenderNavnMatcher (ren) vs. kalenderAgenda (API-kall) i
 * src/lib/meg/connectors/google.ts.
 *
 * Gjenbruker getCalendarBusy() fra src/lib/google-calendar.ts fremfor å
 * bygge et nytt freebusy-kall: den funksjonen håndterer allerede
 * multi-kalender pull-subscriptions, fail-closed ved API-feil, og PAUSED-
 * håndtering av utløpte tokens — nøyaktig den robustheten booking-flyten i
 * appen allerede stoler på. Ingen ny Google-auth-vei bygges.
 */
import { getCalendarBusy } from "@/lib/google-calendar";
import { regnUtLedigeVinduer, type Tidsvindu } from "@/lib/mulligan/ledige-tider";
import { hentAdminGoogleTilkobling } from "./google-tilkobling";

/**
 * Finner ledige tidsvinduer i [fraDato, tilDato] for ADMIN-brukerens
 * kalender(e). Returnerer null ved feil/manglende tilkobling — ALDRI en
 * gjettet/antatt ledighet (fail-closed, jf. mulligan-drift.md: "Aldri
 * bekreft en booking uten verifisert ledig tid i kalenderen").
 */
export async function finnLedigeTider(fraDato: Date, tilDato: Date): Promise<Tidsvindu[] | null> {
  try {
    const conn = await hentAdminGoogleTilkobling();
    if (!conn) {
      console.warn("[mulligan-triage/kalender] Ingen aktiv Google-tilkobling (ADMIN) — kan ikke sjekke ledighet.");
      return null;
    }

    const resultat = await getCalendarBusy(conn.userId, fraDato, tilDato);
    if (!resultat.ok) {
      console.warn("[mulligan-triage/kalender] Kalender-sjekk feilet (fail-closed):", resultat.reason);
      return null;
    }

    const travlePerioder: Tidsvindu[] = resultat.busy.map((i) => ({ start: i.start, slutt: i.end }));
    return regnUtLedigeVinduer(travlePerioder, fraDato, tilDato);
  } catch (err) {
    console.error(
      "[mulligan-triage/kalender] Uventet feil ved henting av kalender-ledighet:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

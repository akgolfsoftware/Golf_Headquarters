/**
 * Vedlikeholdsmodus for akgolf.no.
 *
 * Bestilt av Anders 25.08.2026: hele domenet settes i vedlikehold, og
 * coaching-tjenester bookes på telefon i mellomtiden. Kun innlogging
 * (`/auth/*`) og maskin-endepunktene (`/api/*` — Supabase-callback,
 * Stripe-webhook, cron) står åpne, slik at sesjoner, betalinger og
 * planlagte jobber ikke brekker mens skiltet henger ute.
 *
 * Bryteren er en miljøvariabel, ikke en kodekonstant: `VEDLIKEHOLD=0`
 * (eller `av`/`false`) i Vercel + redeploy åpner nettstedet igjen uten PR.
 * Standard er PÅ — det er tilstanden som er bestilt.
 *
 * NB: dette stenger også `/portal` og `/admin`, også for Anders selv.
 * Trenger du admin mens vedlikeholdet står på, er veien å sette
 * `VEDLIKEHOLD=0` — det finnes ingen bypass-nøkkel med vilje.
 */

/** Telefonnummer for coaching-booking mens nettsiden er nede. */
export const VEDLIKEHOLD_TELEFON = "909 67 995";

/** Samme nummer i `tel:`-format (E.164). */
export const VEDLIKEHOLD_TELEFON_LENKE = "tel:+4790967995";

/** Er vedlikeholdsmodus på? Av kun når VEDLIKEHOLD eksplisitt slås av. */
export function vedlikeholdAktivt(): boolean {
  const v = (process.env.VEDLIKEHOLD ?? "").trim().toLowerCase();
  return !(v === "0" || v === "av" || v === "false" || v === "off");
}

/** Ruter som forblir åpne mens vedlikeholdet står på. */
export function erUnntattVedlikehold(path: string): boolean {
  return (
    path === "/vedlikehold" ||
    // Innlogging skal stå åpen (Anders' valg 25.08.2026).
    path === "/auth" ||
    path.startsWith("/auth/") ||
    // Maskin-endepunkter: auth-callback, Stripe-webhook, cron, health.
    path.startsWith("/api/") ||
    // PWA-skallet — uten disse får installerte klienter en ødelagt app-ikon-flate.
    path === "/sw.js" ||
    path === "/manifest.webmanifest" ||
    path === "/offline"
  );
}

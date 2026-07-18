/**
 * Kanonisk app-URL — én kilde for absolutte lenker i e-post, Stripe-redirects
 * og samtykke-lenker.
 *
 * Fallback er produksjonsdomenet akgolf.no — samme som robots.ts, sitemap.ts,
 * lib/security/same-origin.ts og lib/email/booking-emails.ts allerede bruker.
 * Tidligere falt enkelte server-actions tilbake til akgolf-hq.vercel.app, så
 * e-post- og booking-lenker fikk feil vertsnavn dersom NEXT_PUBLIC_APP_URL ikke
 * var satt i miljøet. Denne konstanten fjerner det spriket.
 *
 * Sett NEXT_PUBLIC_APP_URL eksplisitt i Vercel (prod) så fallback aldri trengs.
 */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf.no";

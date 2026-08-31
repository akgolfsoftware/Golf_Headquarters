import { redirect } from "next/navigation";

/**
 * /admin/oppfolging → /admin/spillere?fane=oppfolging (Oppfølgingskø).
 * Var re-eksport av queue/page.tsx (to URL-er for samme flate) — ren redirect
 * per duplikat-oppryddingen i git-historikken (B1, 2026-07-12). Oppdatert
 * MASTERPLAN 15.11 til å peke rett på den nye fanen fremfor via /admin/queue.
 */
export default function OppfolgingRedirect(): never {
  redirect("/admin/spillere?fane=oppfolging");
}

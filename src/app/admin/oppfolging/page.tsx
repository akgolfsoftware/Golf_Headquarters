import { redirect } from "next/navigation";

/**
 * /admin/oppfolging → /admin/queue (Oppfølgingskø).
 * Var re-eksport av queue/page.tsx (to URL-er for samme flate) — ren redirect
 * per duplikat-oppryddingen i docs/AGENCYOS-INVENTAR.md (B1, 2026-07-12).
 */
export default function OppfolgingRedirect(): never {
  redirect("/admin/queue");
}

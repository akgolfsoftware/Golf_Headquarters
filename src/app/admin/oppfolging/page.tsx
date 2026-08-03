import { redirect } from "next/navigation";

/**
 * /admin/oppfolging → /admin/queue (Oppfølgingskø).
 * Var re-eksport av queue/page.tsx (to URL-er for samme flate) — ren redirect
 * per duplikat-oppryddingen i docs/arkiv/2026-08-03-forenkling-bolge2/AGENCYOS-INVENTAR.md (B1, 2026-07-12).
 */
export default function OppfolgingRedirect(): never {
  redirect("/admin/queue");
}

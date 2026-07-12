import { redirect } from "next/navigation";

/**
 * /admin/agencyos/spillere → /admin/spillere (B2, 2026-07-12).
 * Cockpit-varianten av stall-lista er slått sammen med hovedlista: pakke/
 * betaling og «Abonnent/Skylder»-filteret bor nå i /admin/spillere (StallV2).
 */
export default function AgencyosSpillereRedirect(): never {
  redirect("/admin/spillere");
}

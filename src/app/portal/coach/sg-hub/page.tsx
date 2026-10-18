/**
 * «Sammenlign med coach» finnes ikke lenger (vedtak 16.10.2026, beslutninger.md §STATS-RESTEN punkt 3).
 * Siden sammenlignet spilleren med faste tall som ikke var målt. Adressen sender til Stats › Strokes Gained.
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function CoachSgHubRedirect(): Promise<never> {
  // Samme nivå som før (FULL, /portal/coach står ikke på talent-allowlisten).
  await requirePortalUser({ kreverTilgang: "FULL" });
  redirect("/portal/analysere?del=sg");
}

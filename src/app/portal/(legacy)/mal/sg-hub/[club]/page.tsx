import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/** Legacy → moderne PlayerHQ-rute (B / v2). */
export default async function LegacyRedirect(): Promise<never> {
  // (legacy)-layouten krever kun innlogging (17.08) — nivået håndheves her.
  // Målruten /portal/coach/sg-hub står ikke på talent-allowlisten: FULL.
  // (sg-hub-layouten guarder også, men siden må si det selv — rutekontrakten
  // leses per side, og et layout-ledd kan bli løsnet uten at siden merker det.)
  await requirePortalUser({ kreverTilgang: "FULL" });
  redirect("/portal/coach/sg-hub");
}

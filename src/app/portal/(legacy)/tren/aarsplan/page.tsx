import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/** Legacy → moderne PlayerHQ-rute (B / v2). */
export default async function LegacyRedirect(): Promise<never> {
  // (legacy)-layouten krever kun innlogging (17.08) — nivået håndheves her.
  // Målruten /portal/planlegge/workbench står ikke på talent-allowlisten: FULL.
  await requirePortalUser({ kreverTilgang: "FULL" });
  redirect("/portal/planlegge/workbench?zoom=ar");
}

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/** Legacy → moderne PlayerHQ-rute (B / v2). */
export default async function LegacyRedirect(): Promise<never> {
  // (legacy)-layouten krever kun innlogging (17.08) — nivået håndheves her.
  // Nivået følger MÅLRUTEN: /portal/tren/tester er åpen for TALENT
  // (testbatteriet er kjernen i den gratis talentprofilen).
  await requirePortalUser({ kreverTilgang: "TALENT" });
  redirect("/portal/tren/tester");
}

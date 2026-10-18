import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PLAN_HJELPERE_VIDERESENDING } from "@/lib/portal/plan-hjelpere-videresending";

/** Legacy → Fysisk program (pakke 17b). */
export default async function LegacyRedirect(): Promise<never> {
  // (legacy)-layouten krever kun innlogging (17.08) — nivået håndheves her (FULL).
  await requirePortalUser({ kreverTilgang: "FULL" });
  redirect(PLAN_HJELPERE_VIDERESENDING["/portal/tren/fys-plan/[planId]"]);
}

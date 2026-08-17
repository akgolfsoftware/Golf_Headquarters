import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/** Legacy → moderne PlayerHQ-rute (B / v2). */
export default async function LegacyRedirect(): Promise<never> {
  // (legacy)-layouten krever kun innlogging (17.08) — nivået håndheves her.
  // Nivået følger MÅLRUTEN: /portal/analysere er åpen for TALENT
  // (talent-allowlist.ts), og /portal/statistikk står selv på allowlisten.
  await requirePortalUser({ kreverTilgang: "TALENT" });
  redirect("/portal/analysere");
}

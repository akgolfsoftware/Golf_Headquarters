import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/** Legacy inngang — kanonisk TrackMan-hub. */
export default async function TrackManLegacyRedirect(): Promise<never> {
  // Rot-layouten krever kun innlogging (16.08) — tilgangsnivået håndheves her.
  // FULL beholdt bevisst: talent-allowlist.test.ts slår fast at /portal/trackman
  // skal være låst for gratisprofilen. At målruten under Analyse er åpnere er en
  // uavklart produktbeslutning, ikke noe denne oppryddingen skal avgjøre.
  // Peker nå rett på Analyse-lista (29.08) — gikk tidligere via
  // /portal/mal/trackman, som selv bare var en redirect hit. To hopp ble til ett.
  await requirePortalUser({ kreverTilgang: "FULL" });
  redirect("/portal/analysere/trackman");
}

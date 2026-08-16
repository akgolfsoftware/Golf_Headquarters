import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/** /portal/tren/kalender (gammel adresse) → /portal/kalender. */
export default async function Redirect(): Promise<never> {
  // Rot-layouten krever kun innlogging (16.08) — tilgangsnivået håndheves her.
  // Målruten /portal/kalender krever FULL; aliaset speiler den.
  await requirePortalUser({ kreverTilgang: "FULL" });
  redirect("/portal/kalender");
}

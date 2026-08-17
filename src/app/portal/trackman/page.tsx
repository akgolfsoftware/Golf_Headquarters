import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/** Legacy inngang — kanonisk TrackMan-hub. */
export default async function TrackManLegacyRedirect(): Promise<never> {
  // Rot-layouten krever kun innlogging (16.08) — tilgangsnivået håndheves her.
  // Målruten /portal/mal/trackman krever FULL; aliaset speiler den.
  await requirePortalUser({ kreverTilgang: "FULL" });
  redirect("/portal/mal/trackman");
}

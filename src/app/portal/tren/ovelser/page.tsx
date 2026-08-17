import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/**
 * /portal/tren/ovelser (gammel adresse) → /portal/drills.
 * Øvelsesbanken er kanonisk på /portal/drills.
 */
export default async function OvelserRedirect(): Promise<never> {
  // Rot-layouten krever kun innlogging (16.08) — tilgangsnivået håndheves her.
  // Målruten /portal/drills krever FULL; aliaset speiler den.
  await requirePortalUser({ kreverTilgang: "FULL" });
  redirect("/portal/drills");
}

// Gameplan (B30, 16. jul 2026) — "Baneguide" er det gamle navnet på funksjonen.
// Ruten lever videre kun som redirect for gamle lenker/bokmerker.
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function BaneguideRedirect(): Promise<never> {
  // Rot-layouten krever kun innlogging (16.08) — tilgangsnivået håndheves her.
  // Målruten /portal/gameplan krever FULL; aliaset speiler den.
  await requirePortalUser({ kreverTilgang: "FULL" });
  redirect("/portal/gameplan");
}

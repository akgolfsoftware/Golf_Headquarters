import "server-only";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachLesetilgangTilSpiller, harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { revalidatePath } from "next/cache";

/**
 * Eier, eller coach med tilgang. «skriv» (standard) krever egen
 * coach-relasjon (D-25); «les» slipper også inn uttrykkelig deling (D-04).
 */
export async function planTilgang(playerId: string, modus: "les" | "skriv" = "skriv") {
  const viewer = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  if (!["PLAYER", "COACH", "ADMIN"].includes(viewer.role)) return null;
  if (viewer.id === playerId) return viewer;
  const sjekk = modus === "les" ? harCoachLesetilgangTilSpiller : harCoachTilgangTilSpiller;
  if (viewer.role === "PLAYER" || !await sjekk(viewer, playerId)) return null;
  return viewer;
}
export function revaliderPlan(playerId: string) {
  revalidatePath(`/admin/workbench/${playerId}`);
  revalidatePath("/portal/planlegge/workbench");
}

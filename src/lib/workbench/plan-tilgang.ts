import "server-only";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { revalidatePath } from "next/cache";

/** Deler appens eksisterende eier- og aktive coachvakt, aldri ekstern profiltilgang. */
export async function planTilgang(playerId: string) {
  const viewer = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  if (!["PLAYER", "COACH", "ADMIN"].includes(viewer.role)) return null;
  if (viewer.id === playerId) return viewer;
  if (viewer.role === "PLAYER" || !await harCoachTilgangTilSpiller(viewer, playerId)) return null;
  return viewer;
}
export function revaliderPlan(playerId: string) {
  revalidatePath(`/admin/workbench/${playerId}`);
  revalidatePath("/portal/planlegge/workbench");
}

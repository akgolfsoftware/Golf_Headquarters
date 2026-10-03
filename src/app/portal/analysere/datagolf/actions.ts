"use server";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/** The customer-facing DataGolf workflow is disabled pending licensed rights. */
export async function lagreDataGolfUtfordring(_input: unknown) {
  await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "ADMIN", "COACH"] });
  return { ok: false as const, message: "DataGolf-verktøyet er utilgjengelig til lisensen er avklart." };
}

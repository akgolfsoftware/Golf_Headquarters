"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { avsluttTilgang, leggTilTrener, settTilgang, type TnAvsluttResultat, type TnLeggTilResultat, type TnSettRolleResultat, type TnTrenerRolle } from "@/lib/domain/tn-tilgang";

/** TN-18 — kun sportssjef kaller disse; erSportssjef sjekkes på nytt i domenelaget. */
export async function avsluttTilgangAction(groupId: string, targetUserId: string): Promise<TnAvsluttResultat> {
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const resultat = await avsluttTilgang({ caller: { id: bruker.id, role: bruker.role }, groupId, targetUserId });
  if (resultat.ok) revalidatePath("/team-norway/tilgang");
  return resultat;
}

export async function settTilgangAction(input: {
  groupId: string;
  targetUserId: string;
  rolle: TnTrenerRolle;
  fraIso: string;
  tilIso: string | null;
}): Promise<TnSettRolleResultat> {
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const resultat = await settTilgang({ caller: { id: bruker.id, role: bruker.role }, ...input });
  if (resultat.ok) revalidatePath("/team-norway/tilgang");
  return resultat;
}

/** TN-19 «Legg til trener». Rollen valideres her; gruppen settes i domenelaget. */
export async function leggTilTrenerAction(epost: string, rolle: TnTrenerRolle): Promise<TnLeggTilResultat> {
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  if (rolle !== "COACH" && rolle !== "ASSISTANT") throw new Error("Ugyldig rolle");
  if (typeof epost !== "string" || epost.length > 320) throw new Error("Ugyldig e-post");
  const resultat = await leggTilTrener({ caller: { id: bruker.id, role: bruker.role }, epost, rolle });
  if (resultat.ok) revalidatePath("/team-norway/tilgang");
  return resultat;
}

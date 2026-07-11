"use server";

import { revalidatePath } from "next/cache";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

/**
 * Toggler "anonymiser meg" i talent-sammenligning. Lagres i User.preferences
 * under nøkkelen `talent.anonymiserSammenligning` (boolean).
 */
export async function toggleAnonymiser(neste: boolean) {
  const user = await requirePortalUser({ allow: ["PLAYER"] });

  const eksisterende =
    user.preferences && typeof user.preferences === "object" && !Array.isArray(user.preferences)
      ? (user.preferences as Record<string, unknown>)
      : {};

  const talent =
    eksisterende.talent && typeof eksisterende.talent === "object" && !Array.isArray(eksisterende.talent)
      ? (eksisterende.talent as Record<string, unknown>)
      : {};

  const oppdatert = {
    ...eksisterende,
    talent: {
      ...talent,
      anonymiserSammenligning: neste,
    },
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: oppdatert },
  });

  revalidatePath("/portal/talent/sammenligning");
}

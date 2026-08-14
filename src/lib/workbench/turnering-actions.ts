"use server";

/**
 * Turneringsfanen i Workbench — skrivesiden.
 *
 * Én handling: coach bekrefter en tentativ påmelding (PLANNED/CLAIMED →
 * CONFIRMED). Speiler auth-mønsteret i session-actions.ts: requirePortalUser
 * (COACH/ADMIN) + harCoachTilgangTilSpiller, og raden må tilhøre spilleren.
 */

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";

export async function coachBekreftTurneringEntry(
  playerId: string,
  entryId: string,
): Promise<{ ok: boolean; error?: string }> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  if (!(await harCoachTilgangTilSpiller(coach, playerId))) {
    return { ok: false, error: "Du har ikke tilgang til denne spilleren." };
  }
  const entry = await prisma.tournamentEntry.findUnique({
    where: { id: entryId },
    select: { id: true, userId: true, entryStatus: true },
  });
  if (!entry || entry.userId !== playerId) {
    return { ok: false, error: "Fant ikke påmeldingen." };
  }
  if (entry.entryStatus === "CONFIRMED") return { ok: true };
  if (entry.entryStatus !== "PLANNED" && entry.entryStatus !== "CLAIMED_REGISTERED") {
    return { ok: false, error: "Påmeldingen kan ikke bekreftes fra denne statusen." };
  }
  await prisma.tournamentEntry.update({
    where: { id: entryId },
    data: { entryStatus: "CONFIRMED" },
  });
  revalidatePath(`/admin/spillere/${playerId}/workbench`);
  revalidatePath("/portal/planlegge/workbench");
  return { ok: true };
}

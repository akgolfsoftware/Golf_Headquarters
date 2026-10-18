"use server";

/**
 * Del runde (pakke 13): lagrer hvem som ser runden i appen. «Bare deg» = coachen ser den ikke i
 * Spiller 360 eller Runder. Bare eieren av runden kan endre den.
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

const Inn = z.object({ roundId: z.string().min(1).max(64), sharedWithCoach: z.boolean() });

export async function settRundeSynlighet(input: { roundId: string; sharedWithCoach: boolean }): Promise<{ ok: true } | { ok: false; feil: string }> {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const parsed = Inn.safeParse(input);
  if (!parsed.success) return { ok: false, feil: "Ugyldig valg." };
  const { count } = await prisma.round.updateMany({
    where: { id: parsed.data.roundId, userId: user.id },
    data: { sharedWithCoach: parsed.data.sharedWithCoach },
  });
  if (count !== 1) return { ok: false, feil: "Fant ikke runden." };
  revalidatePath(`/portal/statistikk/runder/${parsed.data.roundId}/del`);
  return { ok: true };
}

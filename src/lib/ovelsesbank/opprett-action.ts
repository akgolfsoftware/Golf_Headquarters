"use server";

/**
 * Delt «opprett øvelse i banken»-action (Bølge 4, 2026-07-13) — brukes av
 * NyOvelseArk i Øvelsesbanken OG opprett-i-økt-flyten (Workbench/live).
 * Rollebevisst: COACH/ADMIN → source COACH + synlig for coachens spillere;
 * PLAYER → source PLAYER + privat (spilleren + tildelt coach, jf. enum-dok
 * i schema.prisma). Returnerer id+navn så kalleren kan koble øvelsen rett
 * inn i økta (exerciseId).
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

const NyOvelseSchema = z.object({
  navn: z.string().min(1, "Navn er påkrevd").max(200),
  beskrivelse: z.string().max(2000).nullable().optional(),
  pyramidArea: z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]),
  defaultRepsSets: z.string().max(100).nullable().optional(),
  intensitet: z.number().int().min(1).max(10).nullable().optional(),
  videoUrl: z.string().url().max(500).nullable().optional(),
});

export type NyOvelseInput = z.infer<typeof NyOvelseSchema>;

export async function opprettOvelseIBanken(
  input: NyOvelseInput,
): Promise<{ ok: boolean; id?: string; name?: string; error?: string }> {
  const parsed = NyOvelseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ugyldig input." };
  }
  const user = await requirePortalUser();
  const erCoach = user.role === "COACH" || user.role === "ADMIN";

  try {
    const ovelse = await prisma.exerciseDefinition.create({
      data: {
        name: parsed.data.navn.trim(),
        description: parsed.data.beskrivelse?.trim() || undefined,
        pyramidArea: parsed.data.pyramidArea,
        defaultRepsSets: parsed.data.defaultRepsSets?.trim() || undefined,
        intensitet: parsed.data.intensitet ?? undefined,
        videoUrl: parsed.data.videoUrl?.trim() || undefined,
        source: erCoach ? "COACH" : "PLAYER",
        visibility: erCoach ? "COACH_PLAYERS" : "PRIVATE",
        createdBy: user.id,
      },
      select: { id: true, name: true },
    });
    revalidatePath("/portal/drills");
    revalidatePath("/portal/coach/ovelser");
    return { ok: true, id: ovelse.id, name: ovelse.name };
  } catch {
    return { ok: false, error: "Kunne ikke lagre øvelsen. Prøv igjen." };
  }
}

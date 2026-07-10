"use server";

/**
 * Server-actions for AI mål-bygger (`/portal/ai/mal-bygger`).
 *
 * Wizard-en hjelper spilleren å formulere egne SMART-mål — den dikter ALDRI
 * opp tall på spillerens vegne. Verdiene kommer fra spillerens egne valg.
 * Lagrer ett eller flere Goal-rader med riktig kategori (OUTCOME/PROCESS).
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { GoalCategory } from "@/generated/prisma/client";

const MalSchema = z.object({
  type: z.string().min(1),
  category: z.nativeEnum(GoalCategory),
  title: z.string().trim().min(3, "Beskriv målet").max(500),
  targetValue: z.number().nullable().optional(),
  targetDate: z.string().nullable().optional(),
});

const LagreSchema = z.object({
  goals: z.array(MalSchema).min(1, "Velg minst ett mål").max(5),
});

export type MalForslagInput = z.infer<typeof MalSchema>;

export async function lagreMalForslag(goals: MalForslagInput[]): Promise<{ count: number }> {
  const parsed = LagreSchema.parse({ goals });
  const user = await requireConsentingUser();

  await prisma.goal.createMany({
    data: parsed.goals.map((g) => ({
      userId: user.id,
      type: g.type,
      category: g.category,
      title: g.title,
      targetValue: g.targetValue ?? null,
      targetDate: g.targetDate ? new Date(g.targetDate) : null,
    })),
  });

  revalidatePath("/portal/mal");
  return { count: parsed.goals.length };
}

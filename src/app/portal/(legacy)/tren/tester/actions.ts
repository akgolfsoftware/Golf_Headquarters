"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { triggerTestAgent } from "@/lib/agents/triggers";

const RegistrerResultatSchema = z.object({
  testId: z.string().min(1, "Test-ID er påkrevd"),
  score: z.number({ error: "Score må være et tall" }),
  notes: z.string().max(2000).nullable().optional(),
  details: z.string().max(10000).nullable().optional(),
});

export async function registrerResultat(formData: FormData) {
  const user = await requirePortalUser();

  const testId = formData.get("testId") as string;
  const score = parseFloat(formData.get("score") as string);
  const notes = (formData.get("notes") as string) || null;
  const detailsRaw = formData.get("details") as string;

  RegistrerResultatSchema.parse({ testId, score, notes, details: detailsRaw || null });

  const test = await prisma.testDefinition.findUnique({ where: { id: testId } });
  if (!test) throw new Error("Testen finnes ikke.");

  let details: object | null = null;
  if (detailsRaw) {
    try {
      details = JSON.parse(detailsRaw);
    } catch {
      throw new Error("Ugyldig JSON i details.");
    }
  }

  await prisma.testResult.create({
    data: {
      userId: user.id,
      testId,
      takenAt: new Date(),
      score,
      notes,
      details: details ?? undefined,
    },
  });

  triggerTestAgent(user.id);

  revalidatePath(`/portal/tren/tester/${testId}`);
  revalidatePath("/portal/tren/tester");
}

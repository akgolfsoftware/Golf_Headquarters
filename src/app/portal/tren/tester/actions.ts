"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { triggerTestAgent } from "@/lib/agents/triggers";

export async function registrerResultat(formData: FormData) {
  const user = await requirePortalUser();

  const testId = formData.get("testId") as string;
  const score = parseFloat(formData.get("score") as string);
  const notes = (formData.get("notes") as string) || null;
  const detailsRaw = formData.get("details") as string;

  if (!testId || isNaN(score)) {
    throw new Error("Ugyldig data: testId og score er påkrevd.");
  }

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

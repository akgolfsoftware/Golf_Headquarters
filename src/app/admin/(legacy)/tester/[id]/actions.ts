"use server";

/**
 * Server action — lagre coach-notat på et TestResult.
 * Kun COACH/ADMIN. Notatet ligger på TestResult.notes (privat for coach-teamet).
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

const Schema = z.object({
  resultId: z.string().min(1),
  notes: z.string().max(2000),
});

export async function lagreCoachNotat(
  input: z.infer<typeof Schema>,
): Promise<{ ok: boolean; error?: string }> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig notat." };

  const notes = parsed.data.notes.trim();
  await prisma.testResult.update({
    where: { id: parsed.data.resultId },
    data: { notes: notes ? notes : null },
  });

  revalidatePath(`/admin/tester/${parsed.data.resultId}`);
  return { ok: true };
}

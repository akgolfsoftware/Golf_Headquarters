"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { nonEmpty } from "@/lib/validation/schemas";

const SvarSchema = z.object({
  questionId: z.string().min(1),
  answer: nonEmpty(8000),
});

export type SvarPaSporsmalInput = z.infer<typeof SvarSchema>;

// Coach/admin besvarer et spørsmål fra en spiller. Setter answer + status og
// tidsstempel, og oppdaterer både detalj- og liste-skjermen.
export async function svarPaSporsmal(questionId: string, answer: string): Promise<void> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = SvarSchema.parse({ questionId, answer });

  // IDOR-vern: en coach kan kun svare på spørsmål rettet til seg selv eller i
  // den åpne køen (coachUserId = null). ADMIN kan svare på alle.
  const question = await prisma.question.findUnique({
    where: { id: parsed.questionId },
    select: { coachUserId: true },
  });
  if (!question) throw new Error("not_found");
  if (
    user.role !== "ADMIN" &&
    question.coachUserId !== null &&
    question.coachUserId !== user.id
  ) {
    throw new Error("forbidden");
  }

  await prisma.question.update({
    where: { id: parsed.questionId },
    data: {
      answer: parsed.answer.trim(),
      status: "ANSWERED",
      answeredAt: new Date(),
    },
  });

  revalidatePath(`/portal/coach/sporsmal/${parsed.questionId}`);
  revalidatePath("/portal/coach/sporsmal");
}

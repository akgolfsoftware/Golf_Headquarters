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
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = SvarSchema.parse({ questionId, answer });

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

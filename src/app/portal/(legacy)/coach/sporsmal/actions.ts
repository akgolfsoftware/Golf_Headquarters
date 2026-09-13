"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { kanSvarePaSporsmal } from "@/lib/portal-okt/coach-sporsmal-tilgang";
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

  const question = await prisma.question.findUnique({
    where: { id: parsed.questionId },
    select: { coachUserId: true, askerUserId: true },
  });
  if (!question) throw new Error("not_found");
  const harSpillerTilgang =
    user.role === "COACH" ? await harCoachTilgangTilSpiller(user, question.askerUserId) : false;
  if (
    !kanSvarePaSporsmal({
      viewerId: user.id,
      viewerRole: user.role,
      coachUserId: question.coachUserId,
      harSpillerTilgang,
    })
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

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { nonEmpty } from "@/lib/validation/schemas";

const SvarSchema = z.object({
  questionId: z.string().min(1),
  answer: nonEmpty(8000),
});

export type SvarPaSporsmalInput = z.infer<typeof SvarSchema>;

const StillSporsmalSchema = z.object({
  title: nonEmpty(140),
  body: nonEmpty(4000),
});

export type StillSporsmalInput = z.infer<typeof StillSporsmalSchema>;

// Finn spillerens coach via aktiv enrollering (samme kilde som drills-data.ts).
// Returnerer null hvis spilleren ikke har en aktiv coach → spørsmålet havner i
// den åpne køen (coachUserId = null), som liste-skjermen allerede plukker opp.
async function finnSpillerensCoachId(userId: string): Promise<string | null> {
  const enrollment = await prisma.playerEnrollment.findFirst({
    where: { userId, endedAt: null, coachId: { not: null } },
    orderBy: { enrolledAt: "desc" },
    select: { coachId: true },
  });
  return enrollment?.coachId ?? null;
}

// Spilleren stiller et spørsmål til coachen sin. Oppretter en OPEN Question med
// askerUserId = spilleren og coachUserId = spillerens coach (eller null = åpen kø).
export async function stillSporsmal(input: StillSporsmalInput): Promise<void> {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  const parsed = StillSporsmalSchema.parse(input);

  const coachUserId = await finnSpillerensCoachId(user.id);

  await prisma.question.create({
    data: {
      askerUserId: user.id,
      coachUserId,
      title: parsed.title.trim(),
      body: parsed.body.trim(),
      status: "OPEN",
    },
  });

  revalidatePath("/portal/coach/sporsmal/ny");
  revalidatePath("/portal/coach/sporsmal");
  redirect("/portal/coach/sporsmal/ny?sendt=1");
}

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

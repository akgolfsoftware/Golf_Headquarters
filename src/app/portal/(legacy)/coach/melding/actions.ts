"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { nonEmpty } from "@/lib/validation/schemas";

const CoachMeldingSchema = z.object({
  coachId: z.string().min(1, "Coach-ID er påkrevd"),
  content: nonEmpty(4000),
});

export type CoachMeldingInput = {
  coachId: string;
  content: string;
};

export async function sendCoachMelding(input: CoachMeldingInput) {
  CoachMeldingSchema.parse(input);
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.tier === "GRATIS") throw new Error("upgrade-required");
  if (!input.content.trim()) throw new Error("empty-message");

  const eksisterende = await prisma.coachingSession.findFirst({
    where: { userId: user.id, coachId: input.coachId, kind: "DIRECT" },
    orderBy: { updatedAt: "desc" },
  });

  const nyMelding: Prisma.InputJsonValue = {
    role: "user",
    content: input.content.trim(),
    ts: new Date().toISOString(),
  };

  if (eksisterende) {
    const eksisterendeMeldinger = Array.isArray(eksisterende.messages)
      ? (eksisterende.messages as Prisma.InputJsonValue[])
      : [];
    const oppdaterte: Prisma.InputJsonValue[] = [...eksisterendeMeldinger, nyMelding];
    await prisma.coachingSession.update({
      where: { id: eksisterende.id },
      data: { messages: oppdaterte },
    });
  } else {
    await prisma.coachingSession.create({
      data: {
        userId: user.id,
        coachId: input.coachId,
        kind: "DIRECT",
        messages: [nyMelding] as Prisma.InputJsonValue[],
      },
    });
  }

  revalidatePath("/portal/coach");
  revalidatePath("/portal/coach/notes");
  redirect("/portal/coach/notes");
}

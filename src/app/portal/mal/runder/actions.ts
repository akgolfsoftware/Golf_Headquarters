"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

export type RoundInput = {
  courseId: string;
  playedAt: string; // ISO-dato
  score: number;
  sgTotal?: number;
  sgOtt?: number;
  sgApp?: number;
  sgArg?: number;
  sgPutt?: number;
  notes?: string;
};

export async function createRound(input: RoundInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  await prisma.round.create({
    data: {
      userId: user.id,
      courseId: input.courseId,
      playedAt: new Date(input.playedAt),
      score: input.score,
      sgTotal: input.sgTotal ?? null,
      sgOtt: input.sgOtt ?? null,
      sgApp: input.sgApp ?? null,
      sgArg: input.sgArg ?? null,
      sgPutt: input.sgPutt ?? null,
      notes: input.notes ?? null,
    },
  });

  revalidatePath("/portal/mal");
  revalidatePath("/portal/mal/runder");
}

export async function deleteRound(roundId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  // RLS sikrer at brukeren kun kan slette egne runder. Ekstra sjekk her for sikkerhet.
  const round = await prisma.round.findUnique({ where: { id: roundId } });
  if (!round || round.userId !== user.id) throw new Error("forbidden");

  await prisma.round.delete({ where: { id: roundId } });
  revalidatePath("/portal/mal");
  revalidatePath("/portal/mal/runder");
}

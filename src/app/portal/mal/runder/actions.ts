"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { triggerRoundAgent } from "@/lib/agents/triggers";

export type RoundInput = {
  courseId: string;
  playedAt: string; // ISO-dato
  score: number;
  // Top-level SG
  sgTotal?: number;
  sgOtt?: number;
  sgApp?: number;
  sgArg?: number;
  sgPutt?: number;
  // Granulære SG
  sgTee?: number;
  sgApp200?: number;
  sgApp150?: number;
  sgApp100?: number;
  sgApp50?: number;
  sgChip?: number;
  sgPitch?: number;
  sgLob?: number;
  sgBunker?: number;
  sgPutt0_3?: number;
  sgPutt3_5?: number;
  sgPutt5_10?: number;
  sgPutt10_15?: number;
  sgPutt15_25?: number;
  sgPutt25_40?: number;
  sgPutt40plus?: number;
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
      sgTee: input.sgTee ?? null,
      sgApp200: input.sgApp200 ?? null,
      sgApp150: input.sgApp150 ?? null,
      sgApp100: input.sgApp100 ?? null,
      sgApp50: input.sgApp50 ?? null,
      sgChip: input.sgChip ?? null,
      sgPitch: input.sgPitch ?? null,
      sgLob: input.sgLob ?? null,
      sgBunker: input.sgBunker ?? null,
      sgPutt0_3: input.sgPutt0_3 ?? null,
      sgPutt3_5: input.sgPutt3_5 ?? null,
      sgPutt5_10: input.sgPutt5_10 ?? null,
      sgPutt10_15: input.sgPutt10_15 ?? null,
      sgPutt15_25: input.sgPutt15_25 ?? null,
      sgPutt25_40: input.sgPutt25_40 ?? null,
      sgPutt40plus: input.sgPutt40plus ?? null,
      notes: input.notes ?? null,
    },
  });

  await triggerRoundAgent(user.id);

  revalidatePath("/portal/mal");
  revalidatePath("/portal/mal/runder");
}

export async function deleteRound(roundId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const round = await prisma.round.findUnique({ where: { id: roundId } });
  if (!round || round.userId !== user.id) throw new Error("forbidden");

  await prisma.round.delete({ where: { id: roundId } });
  revalidatePath("/portal/mal");
  revalidatePath("/portal/mal/runder");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

export type LogRoundManualInput = {
  courseId: string;
  playedAt: string;
  score: number;
  holeScores?: number[];
  tee?: string;
  weather?: string[];
  spillType?: string;
  partners?: string[];
  fir?: { hits: number; of: number };
  gir?: { hits: number; of: number };
  putts?: number;
  sandSaves?: string;
  penalties?: number;
  notes?: string;
  tellHandicap?: boolean;
};

/**
 * logRoundManual — registrerer en manuell runde (uten GolfBox-import).
 * Lager en Round-rad med score og valgfrie statistikk-felter.
 */
export async function logRoundManual(input: LogRoundManualInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  await prisma.round.create({
    data: {
      userId: user.id,
      courseId: input.courseId,
      playedAt: new Date(input.playedAt),
      score: input.score,
      notes: input.notes ?? null,
    },
  });

  revalidatePath("/portal/mal/runder");
  redirect("/portal/mal/runder");
}

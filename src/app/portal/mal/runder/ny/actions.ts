"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
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
  // Strokes Gained — manuelt registrert, alle valgfrie.
  sgOtt?: number | null;
  sgApp?: number | null;
  sgArg?: number | null;
  sgPutt?: number | null;
};

/**
 * logRoundManual — registrerer en manuell runde (uten GolfBox-import).
 * Lager en Round-rad med score og valgfrie statistikk-felter.
 */
export async function logRoundManual(input: LogRoundManualInput) {
  const user = await requireConsentingUser();

  const sgValues = [input.sgOtt, input.sgApp, input.sgArg, input.sgPutt];
  const sgTotal = sgValues.some((v) => typeof v === "number")
    ? sgValues.reduce<number>((sum, v) => sum + (v ?? 0), 0)
    : null;

  await prisma.round.create({
    data: {
      userId: user.id,
      courseId: input.courseId,
      playedAt: new Date(input.playedAt),
      score: input.score,
      notes: input.notes ?? null,
      sgOtt: input.sgOtt ?? null,
      sgApp: input.sgApp ?? null,
      sgArg: input.sgArg ?? null,
      sgPutt: input.sgPutt ?? null,
      sgTotal,
    },
  });

  revalidatePath("/portal/mal/runder");
  redirect("/portal/mal/runder");
}

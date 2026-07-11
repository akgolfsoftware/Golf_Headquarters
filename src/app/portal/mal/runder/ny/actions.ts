"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { parTemplate } from "@/lib/portal-runder/par-template";

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
 * Lager en Round-rad + HoleScore per hull (samme deterministiske par-mal
 * som skjemaet viser — banen mangler ekte per-hull-par) i samme transaksjon.
 * HoleScore er det «Fullfør kjeden» leter etter — uten den kan en
 * hurtig-registrert runde aldri tilbys full Strokes Gained i etterkant.
 */
export async function logRoundManual(input: LogRoundManualInput) {
  const user = await requireConsentingUser();

  const sgValues = [input.sgOtt, input.sgApp, input.sgArg, input.sgPutt];
  const sgTotal = sgValues.some((v) => typeof v === "number")
    ? sgValues.reduce<number>((sum, v) => sum + (v ?? 0), 0)
    : null;

  const course = await prisma.courseDefinition.findUnique({
    where: { id: input.courseId },
    select: { par: true },
  });
  if (!course) throw new Error("Banen finnes ikke");

  const pars = parTemplate(course.par);
  const holeScores = (input.holeScores ?? [])
    .slice(0, pars.length)
    .map((strokes, i) => ({
      holeNumber: i + 1,
      par: pars[i],
      strokes,
      putts: null,
      fairway: null,
      gir: null,
    }));

  await prisma.$transaction(async (tx) => {
    const round = await tx.round.create({
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
        // Håndtastet SG skal aldri overskrives av autoberegning (recomputeRoundSg)
        sgSource: sgTotal != null ? "manual" : null,
      },
      select: { id: true },
    });

    if (holeScores.length > 0) {
      await tx.holeScore.createMany({
        data: holeScores.map((h) => ({ ...h, roundId: round.id })),
      });
    }
  });

  revalidatePath("/portal/mal/runder");
  redirect("/portal/mal/runder");
}

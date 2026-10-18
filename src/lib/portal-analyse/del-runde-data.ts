import "server-only";

import { prisma } from "@/lib/prisma";
import { byggDelRunde, type DelRundeData } from "./del-runde";

/** Runden slik den deles. Bare eierens egen runde; null ellers. */
export async function hentDelRunde(roundId: string, userId: string): Promise<DelRundeData | null> {
  const r = await prisma.round.findFirst({
    where: { id: roundId, userId },
    select: {
      id: true, score: true, playedAt: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true, sharedWithCoach: true,
      course: { select: { name: true } },
      holeScores: { select: { holeNumber: true, par: true, strokes: true }, orderBy: { holeNumber: "asc" } },
    },
  });
  if (!r) return null;
  return byggDelRunde({
    id: r.id,
    score: r.score,
    playedAt: r.playedAt,
    bane: r.course?.name ?? "—",
    sg: { ott: r.sgOtt, app: r.sgApp, arg: r.sgArg, putt: r.sgPutt },
    hull: r.holeScores.map((h) => ({ nr: h.holeNumber, par: h.par, slag: h.strokes })),
    sharedWithCoach: r.sharedWithCoach,
  });
}

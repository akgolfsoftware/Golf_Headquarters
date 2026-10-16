import { prisma } from "@/lib/prisma";
import { byggPH16Stats, SNITT_VINDU, type PH16StatsData } from "./ph16-stats-data";

/**
 * Laster Stats-grunnlaget for spilleren: runder (med hullscore og SG-felt) og TrackMan-slag.
 * Alt som ikke er målt, kommer ut som null eller tom liste (se `byggPH16Stats`).
 * Ingen demodata: feiler lesingen, kastes feilen videre til sidens feiltilstand.
 */
export async function loadPH16Stats(
  userId: string,
  brukerNavn?: string
): Promise<PH16StatsData> {
  const [rounds, user, tmSessions] = await Promise.all([
    prisma.round.findMany({
      where: { userId },
      orderBy: { playedAt: "desc" },
      // To vinduer à 10 for snitt og trend, med slakk for 9-hullsrunder og runder uten hullscore.
      take: SNITT_VINDU * 6,
      select: {
        id: true,
        playedAt: true,
        score: true,
        roundType: true,
        sgTotal: true,
        sgSource: true,
        benchmarkLevelSnapshot: true,
        sgTee: true,
        sgApp200: true,
        sgApp150: true,
        sgApp100: true,
        sgApp50: true,
        sgChip: true,
        sgPitch: true,
        sgLob: true,
        sgBunker: true,
        sgPutt0_3: true,
        sgPutt3_5: true,
        sgPutt5_10: true,
        sgPutt10_15: true,
        sgPutt15_25: true,
        sgPutt25_40: true,
        sgPutt40plus: true,
        course: { select: { name: true } },
        holeScores: { select: { par: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    }),
    prisma.trackManSession.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      take: 3,
      select: {
        shots: {
          take: 200,
          select: {
            club: true,
            side: true,
            carryDistance: true,
            clubPath: true,
            faceAngle: true,
            faceToPath: true,
            attackAngle: true,
            dynamicLoft: true,
            clubSpeed: true,
            outlier: true,
          },
        },
      },
    }),
  ]);

  return byggPH16Stats({
    navn: user?.name || brukerNavn || "",
    runder: rounds.map(({ course, ...r }) => ({ ...r, courseName: course?.name ?? null })),
    tmSlag: tmSessions.flatMap((s) => s.shots),
  });
}

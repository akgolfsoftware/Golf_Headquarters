// Server-kontekst for restraint-blokken — henter det fase A faktisk har:
// baller logget i økta (SessionBallLog) og personlige bånd fra siste
// importerte TrackMan-økt (dominant kølle). Feiler ALDRI chatten: alle
// databasefeil degraderer til tom kontekst.

import "server-only";
import { prisma } from "@/lib/prisma";
import { computePlayerBand, type PlayerBand } from "./bands";
import { RESTRAINT_FIELDS, type RestraintMetric } from "./metric-fields";
import type { RestraintPromptInput } from "./prompt";

export async function hentRestraintPromptData(
  userId: string,
  sessionId: string,
  kind: "plan-session" | "session-v2",
): Promise<RestraintPromptInput> {
  try {
    const [ballerLogget, tmSession] = await Promise.all([
      kind === "plan-session"
        ? prisma.sessionBallLog
            .aggregate({ where: { planSessionId: sessionId }, _sum: { count: true } })
            .then((r) => r._sum.count ?? 0)
        : Promise.resolve(null),
      prisma.trackManSession.findFirst({
        where: { userId },
        orderBy: { recordedAt: "desc" },
        select: {
          recordedAt: true,
          shots: {
            select: {
              club: true,
              carryDistance: true,
              side: true,
              ballSpeed: true,
              launchAngle: true,
              spinRate: true,
              smashFactor: true,
            },
          },
        },
      }),
    ]);

    if (!tmSession || tmSession.shots.length === 0) {
      return { bands: [], klubb: null, ballerLogget, sisteTrackManOkt: null };
    }

    // Dominant kølle — bånd på tvers av køller er meningsløse (carry varierer).
    const perKlubb = new Map<string, number>();
    for (const s of tmSession.shots) {
      perKlubb.set(s.club, (perKlubb.get(s.club) ?? 0) + 1);
    }
    const klubb = [...perKlubb.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const klubbSlag = tmSession.shots.filter((s) => s.club === klubb);

    const bands: PlayerBand[] = [];
    for (const [metric, field] of RESTRAINT_FIELDS) {
      const values = klubbSlag
        .map((s) => s[field])
        .filter((v): v is number => v !== null);
      const band = computePlayerBand(metric, values);
      if (band) bands.push(band);
    }

    return {
      bands,
      klubb: bands.length > 0 ? klubb : null,
      ballerLogget,
      sisteTrackManOkt: {
        dato: tmSession.recordedAt.toISOString().slice(0, 10),
        antallSlag: tmSession.shots.length,
      },
    };
  } catch {
    // Restraint-kontekst er hjelpedata — chatten skal aldri knekke på den.
    return { bands: [], klubb: null, ballerLogget: null, sisteTrackManOkt: null };
  }
}

export type { RestraintMetric };

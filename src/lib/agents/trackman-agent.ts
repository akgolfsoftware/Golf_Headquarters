// trackman-agent: kjøres etter TrackManSession.create. Leser primært TrackManShot,
// fallback rawJson. Skriver målesignaler, ikke tekniske diagnoser.

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";
import { summarizeFaceToPath, type FaceToPathShot } from "./trackman-observations";

export const AGENT_NAME = "trackman-agent";

type Slag = Record<string, string | undefined>;

export async function runTrackManAgent(userId: string): Promise<AgentResult> {
  return runAgent(AGENT_NAME, userId, async () => {
    const sisteSesjon = await prisma.trackManSession.findFirst({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      include: {
        shots: {
          select: {
            club: true,
            carryDistance: true,
            totalDistance: true,
            faceToPath: true,
          },
        },
      },
    });
    if (!sisteSesjon) {
      return { signalsWritten: 0, planActionsWritten: 0 };
    }

    const perKolle = new Map<string, number[]>();
    const faceToPathShots: FaceToPathShot[] = [];

    // Primær: strukturerte TrackManShot-rader (CSV + HTML-pipeline)
    if (sisteSesjon.shots.length > 0) {
      for (const s of sisteSesjon.shots) {
        const dist = s.carryDistance ?? s.totalDistance;
        if (dist != null) {
          perKolle.set(s.club, [...(perKolle.get(s.club) ?? []), dist]);
        }
        faceToPathShots.push({ club: s.club, faceToPath: s.faceToPath });
      }
    } else if (sisteSesjon.rawJson) {
      // Fallback: rawJson (eldre HTML uten shots)
      const rader = Array.isArray(sisteSesjon.rawJson)
        ? (sisteSesjon.rawJson as unknown[])
        : [];
      for (const rad of rader) {
        if (typeof rad !== "object" || rad === null) continue;
        const r = rad as Slag;
        const klubb = r.Club ?? r.club ?? r.kolle ?? null;
        const distanseStr =
          r.Distance ?? r.distance ?? r.Carry ?? r.carry ?? null;
        const ftpStr =
          r["Face To Path"] ??
          r.faceToPath ??
          r["Face to Path"] ??
          r.FaceToPath ??
          null;
        if (klubb && distanseStr) {
          const distanse = Number(distanseStr);
          if (!Number.isNaN(distanse)) {
            perKolle.set(klubb, [...(perKolle.get(klubb) ?? []), distanse]);
          }
        }
        if (klubb && ftpStr != null && ftpStr !== "") {
          const ftp = Number(ftpStr);
          faceToPathShots.push({ club: klubb, faceToPath: ftp });
        }
      }
    }

    const faceToPathObservations = summarizeFaceToPath(faceToPathShots);
    if (perKolle.size === 0 && faceToPathObservations.length === 0) {
      return { signalsWritten: 0, planActionsWritten: 0 };
    }

    const computedAt = new Date();
    const signaler: Array<{
      userId: string;
      kind: string;
      value: number;
      payload: Prisma.InputJsonValue;
      computedAt: Date;
    }> = Array.from(perKolle.entries()).map(([klubb, distanser]) => ({
      userId,
      kind: "CLUB_AVG",
      value: distanser.reduce((s, d) => s + d, 0) / distanser.length,
      payload: {
        klubb,
        antallSlag: distanser.length,
        sessionId: sisteSesjon.id,
      },
      computedAt,
    }));

    for (const observation of faceToPathObservations) {
      signaler.push({
        userId,
        kind: "TRACKMAN_FACE_TO_PATH",
        value: observation.meanDegrees,
        payload: {
          sessionId: sisteSesjon.id,
          klubb: observation.club,
          antallSlag: observation.shotCount,
          interpretation: "MEASUREMENT_ONLY",
        },
        computedAt,
      });
    }

    if (signaler.length > 0) {
      await prisma.signal.createMany({ data: signaler });
    }

    return {
      signalsWritten: signaler.length,
      planActionsWritten: 0,
    };
  });
}

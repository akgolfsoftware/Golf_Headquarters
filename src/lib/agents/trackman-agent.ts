// trackman-agent: kjøres etter TrackManSession.create. Leser primært TrackManShot,
// fallback rawJson. Skriver Signal og evt. INTENSITY_ADJUST PlanAction.

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveCoachIdForPlayer } from "@/lib/workbench/v2-sync";
import { mapSgBandToFault } from "@/lib/training/skills/morad-fault";
import { runAgent, type AgentResult } from "./agent-runner";
import { varsleVedPlanAction } from "./notify-plan-action";

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
            smashFactor: true,
            faceToPath: true,
          },
        },
      },
    });
    if (!sisteSesjon) {
      return { signalsWritten: 0, planActionsWritten: 0 };
    }

    const perKolle = new Map<string, number[]>();
    const smashValues: number[] = [];
    const faceToPathValues: number[] = [];

    // Primær: strukturerte TrackManShot-rader (CSV + HTML-pipeline)
    if (sisteSesjon.shots.length > 0) {
      for (const s of sisteSesjon.shots) {
        const dist = s.carryDistance ?? s.totalDistance;
        if (dist != null) {
          perKolle.set(s.club, [...(perKolle.get(s.club) ?? []), dist]);
        }
        if (s.smashFactor != null) smashValues.push(s.smashFactor);
        if (s.faceToPath != null) faceToPathValues.push(s.faceToPath);
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
        const smashStr = r["Smash Factor"] ?? r.smashFactor ?? r.Smash ?? null;
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
        if (smashStr) {
          const smash = Number(smashStr);
          if (!Number.isNaN(smash)) smashValues.push(smash);
        }
        if (ftpStr) {
          const ftp = Number(ftpStr);
          if (!Number.isNaN(ftp)) faceToPathValues.push(ftp);
        }
      }
    }

    if (perKolle.size === 0 && smashValues.length === 0) {
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

    if (faceToPathValues.length >= 3) {
      const snittFtp =
        faceToPathValues.reduce((a, b) => a + b, 0) / faceToPathValues.length;
      const moradFaultId =
        Math.abs(snittFtp) > 4
          ? snittFtp > 0
            ? "face_open"
            : "over_the_top"
          : mapSgBandToFault("OTT");
      if (moradFaultId) {
        signaler.push({
          userId,
          kind: "TRACKMAN_FACE_TO_PATH",
          value: snittFtp,
          payload: {
            sessionId: sisteSesjon.id,
            moradFaultId,
            antallSlag: faceToPathValues.length,
          },
          computedAt,
        });
      }
    }

    if (signaler.length > 0) {
      await prisma.signal.createMany({ data: signaler });
    }

    let planActionsWritten = 0;
    if (smashValues.length >= 3) {
      const snitt =
        smashValues.reduce((a, b) => a + b, 0) / smashValues.length;
      if (snitt < 1.38) {
        const plan = await prisma.trainingPlan.findFirst({
          where: { userId, isActive: true },
          select: { id: true },
        });
        const eksisterende = await prisma.planAction.findFirst({
          where: {
            userId,
            actionType: "INTENSITY_ADJUST",
            status: "PENDING",
            agentName: AGENT_NAME,
          },
        });
        if (!eksisterende) {
          const coachId = await resolveCoachIdForPlayer(userId);
          const forklaring = `Smash factor snitt ${snitt.toFixed(2)} — reduser CS og fokuser treffkvalitet.`;
          const created = await prisma.planAction.create({
            data: {
              userId,
              coachId,
              planId: plan?.id ?? null,
              actionType: "INTENSITY_ADJUST",
              agentName: AGENT_NAME,
              suggestion: {
                csTarget: 60,
                forklaring,
                signalSnapshot: {
                  kind: "TRACKMAN_METRIC",
                  value: snitt,
                  metric: "smash_factor",
                },
              },
            },
          });
          planActionsWritten++;
          await varsleVedPlanAction({
            userId,
            agentName: AGENT_NAME,
            actionType: "INTENSITY_ADJUST",
            forklaring,
            planActionId: created.id,
          });
        }
      }
    }

    return {
      signalsWritten: signaler.length,
      planActionsWritten,
    };
  });
}
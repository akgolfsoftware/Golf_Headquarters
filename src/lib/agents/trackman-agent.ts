// trackman-agent: kjøres etter TrackManSession.create. Parser rawJson,
// skriver Signal og evt. INTENSITY_ADJUST PlanAction ved lav smash-trend.

import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";

export const AGENT_NAME = "trackman-agent";

type Slag = Record<string, string | undefined>;

export async function runTrackManAgent(userId: string): Promise<AgentResult> {
  return runAgent(AGENT_NAME, userId, async () => {
    const sisteSesjon = await prisma.trackManSession.findFirst({
      where: { userId },
      orderBy: { recordedAt: "desc" },
    });
    if (!sisteSesjon?.rawJson) {
      return { signalsWritten: 0, planActionsWritten: 0 };
    }

    const rader = Array.isArray(sisteSesjon.rawJson)
      ? (sisteSesjon.rawJson as unknown[])
      : [];
    if (rader.length === 0) return { signalsWritten: 0, planActionsWritten: 0 };

    const perKolle = new Map<string, number[]>();
    const smashValues: number[] = [];

    for (const rad of rader) {
      if (typeof rad !== "object" || rad === null) continue;
      const r = rad as Slag;
      const klubb = r.Club ?? r.club ?? r.kolle ?? null;
      const distanseStr =
        r.Distance ?? r.distance ?? r.Carry ?? r.carry ?? null;
      const smashStr = r["Smash Factor"] ?? r.smashFactor ?? r.Smash ?? null;
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
    }

    const computedAt = new Date();
    const signaler = Array.from(perKolle.entries()).map(([klubb, distanser]) => ({
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
          await prisma.planAction.create({
            data: {
              userId,
              planId: plan?.id ?? null,
              actionType: "INTENSITY_ADJUST",
              agentName: AGENT_NAME,
              suggestion: {
                csTarget: 60,
                forklaring: `Smash factor snitt ${snitt.toFixed(2)} — reduser CS og fokuser treffkvalitet.`,
                signalSnapshot: {
                  kind: "TRACKMAN_METRIC",
                  value: snitt,
                  metric: "smash_factor",
                },
              },
            },
          });
          planActionsWritten++;
        }
      }
    }

    return {
      signalsWritten: signaler.length,
      planActionsWritten,
    };
  });
}
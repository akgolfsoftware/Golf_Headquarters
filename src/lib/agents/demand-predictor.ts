import { runAgent, type AgentResult } from "./agent-runner";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const AGENT_NAME = "demand-predictor";

export async function runDemandPredictor(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    const bookings = await prisma.booking.count({
      where: { startAt: { gte: new Date(Date.now() - 30 * 86400000) } },
    });

    const predict = Math.round(bookings / 4); // grov prediksjon per uke
    const note = `Forventet ~${predict} bookinger/uke basert på historikk. Juster availability deretter.`;

    await prisma.planAction.create({
      data: {
        actionType: "AVAILABILITY_SUGGEST",
        suggestion: { agent: AGENT_NAME, predicted: predict, note } as Prisma.InputJsonValue,
        status: "PENDING",
        agentName: AGENT_NAME,
        userId: (await prisma.user.findFirst({ where: { role: "ADMIN" } }))!.id,
      },
    });

    return { planActionsWritten: 1, output: { predictedWeekly: predict } as Prisma.InputJsonValue };
  });
}

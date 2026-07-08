import { runAgent, type AgentResult } from "./agent-runner";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const AGENT_NAME = "availability-gap-filler";

export async function runAvailabilityGapFiller(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    // Finn dager med lav booking men mye availability, eller omvendt
    const recent = await prisma.booking.findMany({
      where: { startAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } },
      select: { startAt: true },
    });

    const byDay: Record<number, number> = {};
    recent.forEach(b => {
      const d = (b.startAt.getDay() + 6) % 7; // man=0
      byDay[d] = (byDay[d] || 0) + 1;
    });

    const lowDays = Object.entries(byDay)
      .filter(([, c]) => c < 2)
      .map(([d]) => Number(d));

    if (lowDays.length > 0) {
      await prisma.planAction.create({
        data: {
          actionType: "AVAILABILITY_SUGGEST",
          suggestion: {
            agent: AGENT_NAME,
            lowDays,
            note: "Dager med lav belegg – vurder å fylle med drop-in eller markedsføring",
          } as Prisma.InputJsonValue,
          status: "PENDING",
          agentName: AGENT_NAME,
          userId: (await prisma.user.findFirst({ where: { role: "ADMIN" } }))!.id,
        },
      });
    }

    return { 
      planActionsWritten: lowDays.length ? 1 : 0,
      output: { lowDays } as Prisma.InputJsonValue 
    };
  });
}

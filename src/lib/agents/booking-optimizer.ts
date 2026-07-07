import { runAgent, type AgentResult } from "./agent-runner";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const AGENT_NAME = "booking-optimizer";

export async function runBookingOptimizer(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    // Analyser siste bookinger for å foreslå bedre availability
    const recentBookings = await prisma.booking.findMany({
      where: { startAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      include: { serviceType: true },
      take: 100,
    });

    // Enkel analyse: tell per ukedag
    const byDay: Record<number, number> = {};
    recentBookings.forEach(b => {
      const day = b.startAt.getDay();
      byDay[day] = (byDay[day] || 0) + 1;
    });

    const suggestions = Object.entries(byDay)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 3)
      .map(([day, count]) => `Dag ${day}: ${count} bookinger - vurder mer availability`);

    // Lagre som plan action for review
    await prisma.planAction.create({
      data: {
        actionType: "AVAILABILITY_SUGGEST",
        suggestion: { agent: AGENT_NAME, topDays: suggestions, note: "Auto-forslag basert på data. Godkjenn for å justere." } as Prisma.InputJsonValue,
        status: "PENDING",
        agentName: AGENT_NAME,
        userId: (await prisma.user.findFirst({ where: { role: "ADMIN" } }))!.id,
      },
    });

    return { 
      planActionsWritten: 1,
      output: { forslag: suggestions } as Prisma.InputJsonValue
    };
  });
}

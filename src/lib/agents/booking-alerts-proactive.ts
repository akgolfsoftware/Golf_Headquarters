import { runAgent, type AgentResult } from "./agent-runner";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const AGENT_NAME = "24-7-booking-alerts";

export async function runProactiveBookingAlerts(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    // Finn kommende ledige slots med lav booking – foreslå til spillere via caddie/plan
    const availCount = await prisma.coachAvailability.count({ where: { active: true } });
    const pending = await prisma.booking.count({ where: { status: "PENDING" } });

    if (availCount > 10 && pending < 3) {
      await prisma.planAction.create({
        data: {
          actionType: "PROACTIVE_BOOKING",
          suggestion: {
            agent: AGENT_NAME,
            avail: availCount,
            note: "Mange ledige slots – send proaktive forslag til spillere via caddie eller e-post.",
          } as Prisma.InputJsonValue,
          status: "PENDING",
          agentName: AGENT_NAME,
          userId: (await prisma.user.findFirst({ where: { role: "ADMIN" } }))!.id,
        },
      });
    }

    return { planActionsWritten: 1, output: { proactive: true } as Prisma.InputJsonValue };
  });
}

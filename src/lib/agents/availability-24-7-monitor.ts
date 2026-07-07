import { runAgent, type AgentResult } from "./agent-runner";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const AGENT_NAME = "availability-24-7-monitor";

export async function runAvailabilityMonitor(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    const coaches = await prisma.user.findMany({ where: { role: { in: ["COACH", "ADMIN"] } }, take: 10 });
    let issues = 0;
    for (const coach of coaches) {
      const avail = await prisma.coachAvailability.count({ where: { coachId: coach.id, active: true } });
      if (avail < 5) {
        issues++;
        await prisma.planAction.create({
          data: {
            actionType: "AVAILABILITY_ALERT",
            suggestion: { coach: coach.name, availCount: avail, note: "Lav availability - fyll mer for bedre booking" } as Prisma.InputJsonValue,
            status: "PENDING",
            agentName: AGENT_NAME,
            userId: coach.id,
          },
        });
      }
    }
    return { 
      planActionsWritten: issues,
      output: { issuesFound: issues, note: "24/7 monitor for availability gaps" } as Prisma.InputJsonValue 
    };
  });
}

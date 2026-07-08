import { runAgent, type AgentResult } from "./agent-runner";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const AGENT_NAME = "booking-conflict-monitor";

export async function runBookingConflictMonitor(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    const bookings = await prisma.booking.findMany({
      where: { status: { in: ["PENDING", "CONFIRMED"] } },
      select: { id: true, startAt: true, endAt: true, facilityId: true },
      orderBy: { startAt: "asc" },
      take: 200,
    });

    let conflicts = 0;
    for (let i = 0; i < bookings.length; i++) {
      for (let j = i + 1; j < bookings.length; j++) {
        const a = bookings[i];
        const b = bookings[j];
        if (a.facilityId && b.facilityId && a.facilityId !== b.facilityId) continue;
        if (a.endAt > b.startAt && b.endAt > a.startAt) {
          conflicts++;
          break;
        }
      }
    }

    if (conflicts > 0) {
      await prisma.planAction.create({
        data: {
          actionType: "BOOKING_CONFLICT",
          suggestion: { agent: AGENT_NAME, conflicts, note: "Potensielle dobbeltbookinger funnet. Sjekk kalender." } as Prisma.InputJsonValue,
          status: "PENDING",
          agentName: AGENT_NAME,
          userId: (await prisma.user.findFirst({ where: { role: "ADMIN" } }))!.id,
        },
      });
    }

    return { planActionsWritten: conflicts > 0 ? 1 : 0, output: { conflicts } as Prisma.InputJsonValue };
  });
}

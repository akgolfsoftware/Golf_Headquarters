import { runAgent, type AgentResult } from "./agent-runner";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { kravLesbartForslag } from "./plan-action-innhold";

export const AGENT_NAME = "24-7-booking-alerts";
const ACTION_TYPE = "PROACTIVE_BOOKING";

/**
 * Kjører hvert 20. minutt (vercel.json). Før 20.10.2026 la den et nytt forslag
 * i køen hver gang, uten lesbar tekst — 3 500 tomme «Forslag fra motoren»
 * (audit 20.10, A4). Nå: høyst ett ventende forslag om gangen, og teksten
 * går gjennom vakten i plan-action-innhold.ts.
 */
export async function runProactiveBookingAlerts(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    // Finn kommende ledige slots med lav booking – foreslå til spillere via caddie/plan
    const availCount = await prisma.coachAvailability.count({ where: { active: true } });
    const pending = await prisma.booking.count({ where: { status: "PENDING" } });

    if (availCount <= 10 || pending >= 3) {
      return { planActionsWritten: 0, output: { proactive: false, availCount, pending } as Prisma.InputJsonValue };
    }

    // Duplikatsperre: ett ventende forslag fra denne agenten er nok til coachen har svart.
    const venter = await prisma.planAction.findFirst({
      where: { agentName: AGENT_NAME, actionType: ACTION_TYPE, status: "PENDING" },
      select: { id: true },
    });
    if (venter) {
      return { planActionsWritten: 0, output: { proactive: true, duplikat: venter.id } as Prisma.InputJsonValue };
    }

    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });
    if (!admin) {
      return { planActionsWritten: 0, output: { proactive: true, feil: "ingen ADMIN" } as Prisma.InputJsonValue };
    }

    const suggestion = {
      agent: AGENT_NAME,
      avail: availCount,
      forklaring: `${availCount} ledige tider er åpne og bare ${pending} booking${pending === 1 ? "" : "er"} venter. Send proaktive forslag til spillere via Caddie eller e-post.`,
    };
    kravLesbartForslag(AGENT_NAME, suggestion);

    await prisma.planAction.create({
      data: {
        actionType: ACTION_TYPE,
        suggestion: suggestion as Prisma.InputJsonValue,
        status: "PENDING",
        agentName: AGENT_NAME,
        userId: admin.id,
      },
    });

    return { planActionsWritten: 1, output: { proactive: true, availCount, pending } as Prisma.InputJsonValue };
  });
}

import { runAgent, type AgentResult } from "./agent-runner";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const AGENT_NAME = "ai-code-reviewer";

export async function runAiCodeReviewer(): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    // Enkel statisk analyse + forslag (i virkelighet ville dette trigge AI workspace)
    const suggestions = [
      "Booking kalender: legg til drag-to-move for eksisterende bookinger.",
      "AI workspace: støtt 'apply diff' direkte til fil via admin godkjenning.",
      "Gruppe timeplan: vis antall påmeldte vs maxParticipants i liste.",
    ];

    await prisma.planAction.create({
      data: {
        actionType: "AI_CODE_SUGGEST",
        suggestion: { agent: AGENT_NAME, review: suggestions, note: "Periodisk AI review av booking/AI-kode. Kjør via /admin/ai." } as Prisma.InputJsonValue,
        status: "PENDING",
        agentName: AGENT_NAME,
        userId: (await prisma.user.findFirst({ where: { role: "ADMIN" } }))!.id,
      },
    });

    return { planActionsWritten: 1, output: { reviewCount: suggestions.length } as Prisma.InputJsonValue };
  });
}

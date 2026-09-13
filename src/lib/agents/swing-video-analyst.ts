// Bekrefter mottak av svingvideo i Live-tråden. Videoen analyseres ikke her.

import "server-only";
import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";

export const AGENT_NAME = "swing-video-analyst";

export async function runSwingVideoAnalyst(opts: {
  userId: string;
  sessionId: string;
  videoUrl: string;
  drillId?: string;
}): Promise<AgentResult> {
  return runAgent(AGENT_NAME, opts.userId, async () => {
    const live = await prisma.coachingSession.findFirst({
      where: {
        userId: opts.userId,
        kind: "LIVE",
        liveSessionId: opts.sessionId,
      },
      orderBy: { updatedAt: "desc" },
      select: { id: true, messages: true },
    });

    if (!live) {
      return { output: { acknowledged: false, reason: "ingen-live-trad" } };
    }

    const tekst = opts.drillId
      ? "Video mottatt for øvelsen. Automatisk videoanalyse er ikke tilgjengelig ennå."
      : "Video mottatt. Automatisk videoanalyse er ikke tilgjengelig ennå.";

    const eksisterende = Array.isArray(live.messages) ? live.messages : [];
    await prisma.coachingSession.update({
      where: { id: live.id },
      data: {
        messages: [
          ...eksisterende,
          {
            role: "assistant",
            content: tekst,
            ts: new Date().toISOString(),
            meta: { videoUrl: opts.videoUrl, sessionId: opts.sessionId },
          },
        ],
      },
    });

    return {
      output: { acknowledged: true, sessionId: opts.sessionId },
    };
  });
}

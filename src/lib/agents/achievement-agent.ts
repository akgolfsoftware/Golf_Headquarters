// achievement-agent: sjekker etter milepæler og oppretter Achievement-rader.
// Trigges fra round-agent og test-agent.

import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";
import { computeStreak, aktivStreak } from "@/lib/streak";

export const AGENT_NAME = "achievement-agent";

type Milepæl = {
  kind: string;
  payload?: Record<string, unknown>;
};

export async function runAchievementAgent(userId: string): Promise<AgentResult> {
  return runAgent(AGENT_NAME, userId, async () => {
    const eksisterende = await prisma.achievement.findMany({
      where: { userId },
      select: { kind: true },
    });
    const eksisterendeKinds = new Set(eksisterende.map((a) => a.kind));

    const [runder, tester, sessionLogs] = await Promise.all([
      prisma.round.findMany({ where: { userId }, select: { id: true, sgTotal: true, playedAt: true } }),
      prisma.testResult.findMany({ where: { userId }, select: { id: true } }),
      prisma.trainingPlanSessionLog.findMany({
        where: { session: { plan: { userId } } },
        select: { startedAt: true },
      }),
    ]);

    const milepaeler: Milepæl[] = [];

    if (runder.length > 0) milepaeler.push({ kind: "FIRST_ROUND" });
    if (tester.length > 0) milepaeler.push({ kind: "FIRST_TEST" });

    // SG-positive 30d
    const tretti = new Date();
    tretti.setDate(tretti.getDate() - 30);
    const sg30 = runder.filter((r) => r.playedAt >= tretti && r.sgTotal != null);
    if (sg30.length >= 3) {
      const snitt = sg30.reduce((s, r) => s + (r.sgTotal ?? 0), 0) / sg30.length;
      if (snitt > 0) milepaeler.push({ kind: "SG_POSITIVE_30D", payload: { snitt } });
    }

    // Streak
    const dates = sessionLogs.map((l) => l.startedAt);
    const streak14 = computeStreak(dates, 14);
    const aktiv = aktivStreak(streak14);
    if (aktiv >= 7) milepaeler.push({ kind: "STREAK_7", payload: { dager: aktiv } });
    if (aktiv >= 14) milepaeler.push({ kind: "STREAK_14", payload: { dager: aktiv } });

    const nye = milepaeler.filter((m) => !eksisterendeKinds.has(m.kind));
    if (nye.length === 0) return { signalsWritten: 0 };

    await prisma.achievement.createMany({
      data: nye.map((m) => ({
        userId,
        kind: m.kind,
        payload: m.payload as object | undefined,
      })),
      skipDuplicates: true,
    });

    return { output: { newAchievements: nye.map((m) => m.kind) } };
  });
}

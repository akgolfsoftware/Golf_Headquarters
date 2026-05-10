// test-agent: kjøres etter TestResult.create. Beregner trend per test og
// skriver Signal med kind=TEST_TREND.

import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";

export const AGENT_NAME = "test-agent";

export async function runTestAgent(userId: string): Promise<AgentResult> {
  return runAgent(AGENT_NAME, userId, async () => {
    const resultater = await prisma.testResult.findMany({
      where: { userId },
      orderBy: { takenAt: "desc" },
      include: { test: { select: { id: true, name: true } } },
    });

    if (resultater.length === 0) return { signalsWritten: 0 };

    // Grupper per test, beregn trend (siste minus snitt forrige 3)
    const perTest = new Map<string, typeof resultater>();
    for (const r of resultater) {
      perTest.set(r.testId, [...(perTest.get(r.testId) ?? []), r]);
    }

    const computedAt = new Date();
    const signaler: { kind: string; value: number; payload: object }[] = [];

    for (const [testId, rad] of perTest.entries()) {
      const siste = rad[0];
      const tidligere = rad.slice(1, 4);
      if (tidligere.length === 0) continue;
      const snitt = tidligere.reduce((s, r) => s + r.score, 0) / tidligere.length;
      signaler.push({
        kind: "TEST_TREND",
        value: siste.score - snitt,
        payload: { testId, testNavn: siste.test.name, latest: siste.score, baseline: snitt },
      });
    }

    if (signaler.length === 0) return { signalsWritten: 0 };

    await prisma.signal.createMany({
      data: signaler.map((s) => ({
        userId,
        kind: s.kind,
        value: s.value,
        computedAt,
        payload: s.payload,
      })),
    });

    return { signalsWritten: signaler.length };
  });
}

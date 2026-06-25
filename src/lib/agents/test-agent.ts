// test-agent: kjøres etter TestResult.create. Beregner trend per test,
// skriver Signal og evt. PlanAction ved >15 % forbedring eller >10 % tilbakegang.

import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";

export const AGENT_NAME = "test-agent";

const FORBEDRING_TERSKEL = 0.15;
const TILBAKE_TERSKEL = -0.1;

export async function runTestAgent(userId: string): Promise<AgentResult> {
  return runAgent(AGENT_NAME, userId, async () => {
    const resultater = await prisma.testResult.findMany({
      where: { userId },
      orderBy: { takenAt: "desc" },
      include: { test: { select: { id: true, name: true } } },
    });

    if (resultater.length === 0) {
      return { signalsWritten: 0, planActionsWritten: 0 };
    }

    const perTest = new Map<string, typeof resultater>();
    for (const r of resultater) {
      perTest.set(r.testId, [...(perTest.get(r.testId) ?? []), r]);
    }

    const computedAt = new Date();
    const signaler: { kind: string; value: number; payload: object }[] = [];
    let planActionsWritten = 0;

    for (const [testId, rad] of perTest.entries()) {
      const siste = rad[0];
      const tidligere = rad.slice(1, 4);
      if (tidligere.length === 0) continue;
      const snitt =
        tidligere.reduce((s, r) => s + r.score, 0) / tidligere.length;
      const delta = siste.score - snitt;
      const relativ = snitt !== 0 ? delta / Math.abs(snitt) : 0;

      signaler.push({
        kind: "TEST_TREND",
        value: delta,
        payload: {
          testId,
          testNavn: siste.test.name,
          latest: siste.score,
          baseline: snitt,
        },
      });

      if (
        relativ >= FORBEDRING_TERSKEL ||
        relativ <= TILBAKE_TERSKEL
      ) {
        const plan = await prisma.trainingPlan.findFirst({
          where: { userId, isActive: true },
          select: { id: true },
        });
        const actionType =
          relativ >= FORBEDRING_TERSKEL ? "FOCUS_CHANGE" : "PYRAMID_ADJUST";
        const eksisterende = await prisma.planAction.findFirst({
          where: {
            userId,
            actionType,
            status: "PENDING",
            agentName: AGENT_NAME,
          },
        });
        if (!eksisterende) {
          await prisma.planAction.create({
            data: {
              userId,
              planId: plan?.id ?? null,
              actionType,
              agentName: AGENT_NAME,
              suggestion: {
                testId,
                testNavn: siste.test.name,
                trend: relativ,
                omrade: relativ <= TILBAKE_TERSKEL ? "TEK" : "SLAG",
                forklaring:
                  relativ >= FORBEDRING_TERSKEL
                    ? `${siste.test.name} forbedret ${Math.round(relativ * 100)} % — vurder å flytte fokus.`
                    : `${siste.test.name} tilbake ${Math.round(Math.abs(relativ) * 100)} % — øk TEK-volum.`,
                signalSnapshot: {
                  kind: "TEST_DELTA",
                  value: delta,
                  testNavn: siste.test.name,
                },
              },
            },
          });
          planActionsWritten++;
        }
      }
    }

    if (signaler.length > 0) {
      await prisma.signal.createMany({
        data: signaler.map((s) => ({
          userId,
          kind: s.kind,
          value: s.value,
          computedAt,
          payload: s.payload,
        })),
      });
    }

    return {
      signalsWritten: signaler.length,
      planActionsWritten,
    };
  });
}
// test-agent: kjøres etter TestResult.create. Beregner trend per test,
// skriver Signal og evt. PlanAction ved >15 % forbedring eller >10 % tilbakegang.

import { prisma } from "@/lib/prisma";
import { beregnTestTrend } from "@/lib/portal-tester/test-trend";
import { resolveCoachIdForPlayer } from "@/lib/workbench/v2-sync";
import { runAgent, type AgentResult } from "./agent-runner";
import { varsleVedPlanAction } from "./notify-plan-action";
import { byggProvenance } from "./provenance";
import { proposeTmBaselinesFromTest } from "@/lib/teknisk-plan/test-to-tm-baseline";

export const AGENT_NAME = "test-agent";

const FORBEDRING_TERSKEL = 0.15;
const TILBAKE_TERSKEL = -0.1;

export async function runTestAgent(userId: string): Promise<AgentResult> {
  return runAgent(AGENT_NAME, userId, async () => {
    const resultater = await prisma.testResult.findMany({
      where: { userId },
      orderBy: { takenAt: "desc" },
      include: { test: { select: { id: true, name: true, protocol: true } } },
    });

    if (resultater.length === 0) {
      return { signalsWritten: 0, planActionsWritten: 0 };
    }

    // Whitelist-tester → foreslå TM-baseline på fullsving (PlanAction, ikke auto-skriv)
    const sisteResultat = resultater[0];
    if (sisteResultat) {
      try {
        const tm = await proposeTmBaselinesFromTest(userId, sisteResultat.id);
        // teller ikke som signals; PlanAction telles nedenfor via separat path
        void tm;
      } catch {
        // baseline-forslag er best-effort
      }
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
      const trend = beregnTestTrend(siste, tidligere, siste.test.protocol);
      if (!trend) continue;
      const { snitt, delta, relativ } = trend;

      signaler.push({
        kind: "TEST_TREND",
        value: delta,
        payload: {
          testId,
          testNavn: siste.test.name,
          latest: siste.score,
          baseline: snitt,
          lavereErBedre: trend.lavereErBedre,
          antall: trend.antall,
          evidens: "observasjon",
        },
      });

      if (
        relativ !== null && (relativ >= FORBEDRING_TERSKEL ||
        relativ <= TILBAKE_TERSKEL)
      ) {
        const plan = await prisma.trainingPlan.findFirst({
          where: { userId, isActive: true },
          select: { id: true },
        });
        const actionType = "COACH_REVIEW";
        const eksisterende = await prisma.planAction.findFirst({
          where: {
            userId,
            actionType,
            status: "PENDING",
            agentName: AGENT_NAME,
          },
        });
        if (!eksisterende) {
          const coachId = await resolveCoachIdForPlayer(userId);
          // Testendring alene sier ikke hvilken treningsakse eller øvelse som bør endres.
          const forklaring = relativ >= FORBEDRING_TERSKEL
            ? `${siste.test.name} forbedret ${Math.round(relativ * 100)} % — vurder utviklingen opp mot spill på banen.`
            : `${siste.test.name} tilbake ${Math.round(Math.abs(relativ) * 100)} % — kontroller testforhold og vurder årsaken før planen endres.`;
          const created = await prisma.planAction.create({
            data: {
              userId,
              coachId,
              planId: plan?.id ?? null,
              actionType,
              agentName: AGENT_NAME,
              suggestion: {
                drillPakke: [],
                testId,
                testNavn: siste.test.name,
                trend: relativ,
                forklaring,
                signalSnapshot: {
                  kind: "TEST_DELTA",
                  value: delta,
                  testNavn: siste.test.name,
                },
              },
              provenance: byggProvenance({
                kilde: "TESTER",
                rader: [siste, ...tidligere].map((r) => ({
                  id: r.id,
                  dato: r.takenAt.toISOString(),
                })),
                regel:
                  relativ <= TILBAKE_TERSKEL
                    ? `testresultat tilbake ${TILBAKE_TERSKEL * -100}% eller mer`
                    : `testresultat forbedret ${FORBEDRING_TERSKEL * 100}% eller mer`,
                terskel:
                  relativ <= TILBAKE_TERSKEL ? TILBAKE_TERSKEL : FORBEDRING_TERSKEL,
                maaltVerdi: relativ,
              }),
            },
          });
          planActionsWritten++;
          await varsleVedPlanAction({
            userId,
            agentName: AGENT_NAME,
            actionType,
            forklaring,
            planActionId: created.id,
          });
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
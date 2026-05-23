/**
 * Fullscreen live-scoring for TestDefinition-protokoller.
 *
 * Flyt:
 *   - Last test + start (eller fortsett aktiv TestSession)
 *   - Per steg: vis instruksjon + input-felter
 *   - Submit → recordTestStep + advanceTestStep
 *   - Siste steg ferdig → completeTestSession → /summary
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { startTestSession } from "@/app/portal/tren/tester/session-actions";
import { LiveTestRunner } from "./live-test-runner";

type TestProtocolStep = {
  id: string;
  label: string;
  instruction: string;
  shots: number;
  target?: string;
  inputFields: Array<{
    key: string;
    label: string;
    type: "number" | "select" | "checkbox" | "distance";
    unit?: string;
    options?: string[];
    min?: number;
    max?: number;
    helper?: string;
  }>;
};

type TestProtocol = {
  equipment: string[];
  expectedDurationMin: number;
  scoringMode: string;
  primaryMetric: string;
  unit: string;
  steps: TestProtocolStep[];
  baselineNormal?: { junior?: number; amateur?: number; pro?: number };
  pgaBenchmark?: string;
  notes?: string;
};

export default async function LiveTestPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const user = await requirePortalUser();
  const { testId } = await params;

  const test = await prisma.testDefinition.findUnique({ where: { id: testId } });
  if (!test) notFound();
  if (!test.protocol) {
    redirect(`/portal/tren/tester/${testId}?error=missing-protocol`);
  }

  // Sjekk eller opprett TestSession
  let session = await prisma.testSession.findFirst({
    where: { userId: user.id, testId: test.id, status: "IN_PROGRESS" },
    orderBy: { startedAt: "desc" },
  });

  if (!session) {
    const res = await startTestSession(testId);
    if (!res.ok) {
      redirect(`/portal/tren/tester/${testId}?error=${encodeURIComponent(res.error)}`);
    }
    session = await prisma.testSession.findUnique({ where: { id: res.data.sessionId } });
  }

  if (!session) {
    redirect(`/portal/tren/tester/${testId}?error=session-failed`);
  }

  const protocol = test.protocol as unknown as TestProtocol;

  return (
    <LiveTestRunner
      testId={test.id}
      testName={test.name}
      pyramidArea={test.pyramidArea}
      sessionId={session.id}
      currentStepIndex={session.currentStepIndex}
      protocol={protocol}
      existingData={(session.scoringData ?? {}) as Record<string, Record<string, string | number | boolean | null>[]>}
    />
  );
}

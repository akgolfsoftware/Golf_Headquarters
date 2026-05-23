"use server";

/**
 * Server actions for TestSession-livssyklus.
 * Bruksflyt:
 *   1. start(testId) → opprett TestSession, returner id
 *   2. recordStep(sessionId, stepIndex, shotData[]) → oppdater scoringData
 *   3. advance(sessionId) → flytt currentStepIndex +1
 *   4. complete(sessionId) → kalkuler score, opprett TestResult, marker COMPLETED
 *   5. abort(sessionId) → marker ABORTED (data beholdes for audit)
 *
 * Returner-format (Q10): { ok: true, data } | { ok: false, error }
 */

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/error-tracking";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ShotData = Record<string, string | number | boolean | null>;

type StepShots = Record<string, ShotData[]>;

function isJsonObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function parseScoringData(raw: unknown): StepShots {
  if (!isJsonObject(raw)) return {};
  const out: StepShots = {};
  for (const [k, v] of Object.entries(raw)) {
    if (Array.isArray(v)) out[k] = v as ShotData[];
  }
  return out;
}

// ---------------------------------------------------------------------------
// Start test
// ---------------------------------------------------------------------------

export async function startTestSession(testId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false as const, error: "unauthenticated" };

    // Avbryt eventuell pågående test (kun én aktiv per spiller)
    await prisma.testSession.updateMany({
      where: { userId: user.id, status: "IN_PROGRESS" },
      data: { status: "ABORTED", abortedAt: new Date() },
    });

    const session = await prisma.testSession.create({
      data: {
        userId: user.id,
        testId,
        status: "IN_PROGRESS",
        currentStepIndex: 0,
        scoringData: {},
      },
    });

    return { ok: true as const, data: { sessionId: session.id } };
  } catch (e) {
    logError({ context: "test.session.start", error: e, meta: { testId } });
    return { ok: false as const, error: "Kunne ikke starte test. Prøv igjen." };
  }
}

// ---------------------------------------------------------------------------
// Record step data
// ---------------------------------------------------------------------------

export async function recordTestStep(input: {
  sessionId: string;
  stepId: string;
  shots: ShotData[];
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false as const, error: "unauthenticated" };

    const session = await prisma.testSession.findUnique({ where: { id: input.sessionId } });
    if (!session || session.userId !== user.id) {
      return { ok: false as const, error: "Test-økt finnes ikke" };
    }
    if (session.status !== "IN_PROGRESS") {
      return { ok: false as const, error: "Test-økten er allerede fullført eller avbrutt" };
    }

    const current = parseScoringData(session.scoringData);
    current[input.stepId] = input.shots;

    await prisma.testSession.update({
      where: { id: input.sessionId },
      data: { scoringData: current },
    });

    return { ok: true as const, data: null };
  } catch (e) {
    logError({ context: "test.session.recordStep", error: e, meta: input });
    return { ok: false as const, error: "Kunne ikke lagre slag. Prøv igjen." };
  }
}

// ---------------------------------------------------------------------------
// Advance to next step
// ---------------------------------------------------------------------------

export async function advanceTestStep(sessionId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false as const, error: "unauthenticated" };

    const session = await prisma.testSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== user.id) {
      return { ok: false as const, error: "Test-økt finnes ikke" };
    }

    await prisma.testSession.update({
      where: { id: sessionId },
      data: { currentStepIndex: session.currentStepIndex + 1 },
    });

    return { ok: true as const, data: { nextStep: session.currentStepIndex + 1 } };
  } catch (e) {
    logError({ context: "test.session.advance", error: e, meta: { sessionId } });
    return { ok: false as const, error: "Kunne ikke gå videre." };
  }
}

// ---------------------------------------------------------------------------
// Complete test
// ---------------------------------------------------------------------------

type TestProtocolMinimal = {
  scoringMode?: string;
  primaryMetric?: string;
  steps?: Array<{ id: string; shots: number }>;
};

function calculateScore(protocol: TestProtocolMinimal, data: StepShots): { score: number; details: Record<string, unknown> } {
  const mode = protocol.scoringMode ?? "sum";
  const metric = protocol.primaryMetric ?? "value";
  const allShots: ShotData[] = [];
  for (const stepId of Object.keys(data)) {
    for (const shot of data[stepId]) allShots.push(shot);
  }
  const values = allShots
    .map((s) => {
      const v = s[metric];
      return typeof v === "number" ? v : typeof v === "boolean" ? (v ? 1 : 0) : null;
    })
    .filter((v): v is number => v !== null);

  const totalShots = allShots.length;
  const expectedShots = (protocol.steps ?? []).reduce((acc, s) => acc + (s.shots ?? 0), 0);

  let score = 0;
  if (mode === "sum") {
    score = values.reduce((a, b) => a + b, 0);
  } else if (mode === "average") {
    score = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  } else if (mode === "hit-rate") {
    const hits = allShots.filter((s) => s.ok === true || s.sunket === true).length;
    const total = expectedShots > 0 ? expectedShots : totalShots;
    score = total > 0 ? (hits / total) * 100 : 0;
  } else if (mode === "max") {
    score = values.length > 0 ? Math.max(...values) : 0;
  } else if (mode === "lowest") {
    score = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  } else if (mode === "distance" || mode === "pei") {
    score = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  return {
    score: Math.round(score * 100) / 100,
    details: { mode, metric, expectedShots, actualShots: totalShots, values },
  };
}

export async function completeTestSession(sessionId: string, notes?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false as const, error: "unauthenticated" };

    const session = await prisma.testSession.findUnique({
      where: { id: sessionId },
      include: { test: true },
    });
    if (!session || session.userId !== user.id) {
      return { ok: false as const, error: "Test-økt finnes ikke" };
    }
    if (session.status !== "IN_PROGRESS") {
      return { ok: false as const, error: "Test-økten er allerede fullført" };
    }

    const scoringData = parseScoringData(session.scoringData);
    const protocol = (isJsonObject(session.test.protocol) ? session.test.protocol : {}) as TestProtocolMinimal;

    const { score, details } = calculateScore(protocol, scoringData);

    const result = await prisma.testResult.create({
      data: {
        userId: user.id,
        testId: session.testId,
        takenAt: new Date(),
        score,
        notes: notes?.trim() || null,
        details: { ...details, scoringData },
      },
    });

    await prisma.testSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        testResultId: result.id,
      },
    });

    // Revalidate spiller-dashboards + coach-views
    revalidatePath("/portal");
    revalidatePath("/portal/analysere");
    revalidatePath("/portal/tren/tester");
    revalidatePath(`/portal/tren/tester/${session.testId}`);
    revalidatePath("/admin/analysere");
    revalidatePath(`/admin/spillere/${user.id}`);

    return {
      ok: true as const,
      data: { resultId: result.id, score, testId: session.testId, testName: session.test.name },
    };
  } catch (e) {
    logError({ context: "test.session.complete", error: e, meta: { sessionId } });
    return { ok: false as const, error: "Kunne ikke fullføre test." };
  }
}

// ---------------------------------------------------------------------------
// Abort test
// ---------------------------------------------------------------------------

export async function abortTestSession(sessionId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false as const, error: "unauthenticated" };

    const session = await prisma.testSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== user.id) {
      return { ok: false as const, error: "Test-økt finnes ikke" };
    }

    await prisma.testSession.update({
      where: { id: sessionId },
      data: { status: "ABORTED", abortedAt: new Date() },
    });

    revalidatePath("/portal/tren/tester");
    return { ok: true as const, data: null };
  } catch (e) {
    logError({ context: "test.session.abort", error: e, meta: { sessionId } });
    return { ok: false as const, error: "Kunne ikke avbryte test." };
  }
}

// ---------------------------------------------------------------------------
// Resume in-progress
// ---------------------------------------------------------------------------

export async function getActiveTestSession() {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false as const, error: "unauthenticated" };

    const session = await prisma.testSession.findFirst({
      where: { userId: user.id, status: "IN_PROGRESS" },
      include: { test: true },
      orderBy: { startedAt: "desc" },
    });

    if (!session) return { ok: true as const, data: null };

    return {
      ok: true as const,
      data: {
        sessionId: session.id,
        testId: session.testId,
        testName: session.test.name,
        currentStepIndex: session.currentStepIndex,
        startedAt: session.startedAt,
      },
    };
  } catch (e) {
    logError({ context: "test.session.getActive", error: e });
    return { ok: false as const, error: "Kunne ikke hente aktiv test." };
  }
}

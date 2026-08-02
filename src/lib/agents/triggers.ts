// Triggers — kalles fra server actions etter create-operasjoner.
// Alle er fire-and-forget (vi awaiter ikke i kallerne) men kjører synkront
// for enkelhet. Hvis de blir treige kan de flyttes til Inngest/Trigger.dev.

import { runRoundAgent } from "./round-agent";
import { runSgAnalyseEkspert } from "./sg-analyse-ekspert";
import { runTestAgent } from "./test-agent";
import { runTrackManAgent } from "./trackman-agent";
import { runPeriodiseringsAgent } from "./periodiserings-agent";
import { runAchievementAgent } from "./achievement-agent";
import { prisma } from "@/lib/prisma";
import { runTurneringAgent } from "./turnering-agent";
import { runPlanRevisionAgent } from "./plan-revision-actions";
import { runLiveCoachAgent, type LiveSessionKind } from "./live-coach-agent";
import { runTreningsdataEkspert } from "./treningsdata-ekspert";
import { runSwingVideoAnalyst } from "./swing-video-analyst";
import { logError } from "@/lib/error-tracking";

export async function triggerRoundAgent(userId: string): Promise<void> {
  try {
    await runRoundAgent(userId);
    await runSgAnalyseEkspert(userId);
    const plan = await prisma.trainingPlan.findFirst({
      where: { userId, isActive: true },
      select: { id: true },
    });
    if (plan) {
      await runPlanRevisionAgent({
        planId: plan.id,
        trigger: "siste-runde",
      });
    }
    await runAchievementAgent(userId);
    await runTreningsdataEkspert(userId);
  } catch (error) {
    await logError({
      context: "agents.trigger.roundAgent",
      error,
      meta: { userId },
      severity: "warn",
    });
  }
}

export async function triggerTestAgent(userId: string): Promise<void> {
  try {
    await runTestAgent(userId);
    await runAchievementAgent(userId);
    await runTreningsdataEkspert(userId);
  } catch (error) {
    await logError({
      context: "agents.trigger.testAgent",
      error,
      meta: { userId },
      severity: "warn",
    });
  }
}

export async function triggerTrackManAgent(userId: string): Promise<void> {
  try {
    await runTrackManAgent(userId);
  } catch (error) {
    await logError({
      context: "agents.trigger.trackmanAgent",
      error,
      meta: { userId },
      severity: "warn",
    });
  }
}

export async function triggerPeriodiseringsAgent(planId: string): Promise<void> {
  try {
    await runPeriodiseringsAgent(planId);
  } catch (error) {
    await logError({
      context: "agents.trigger.periodiseringsAgent",
      error,
      meta: { planId },
      severity: "warn",
    });
  }
}

export async function triggerTurneringAgent(): Promise<void> {
  try {
    await runTurneringAgent();
  } catch (error) {
    await logError({
      context: "agents.trigger.turneringAgent",
      error,
      severity: "warn",
    });
  }
}

export async function triggerLiveSessionAgent(opts: {
  userId: string;
  sessionId: string;
  kind: LiveSessionKind;
}): Promise<void> {
  try {
    await runLiveCoachAgent(opts);
  } catch (error) {
    await logError({
      context: "agents.trigger.liveCoachAgent",
      error,
      meta: { userId: opts.userId, sessionId: opts.sessionId, kind: opts.kind },
      severity: "warn",
    });
  }
}

export async function triggerSwingVideoAnalyst(opts: {
  userId: string;
  sessionId: string;
  videoUrl: string;
  drillId?: string;
}): Promise<void> {
  try {
    await runSwingVideoAnalyst(opts);
  } catch (error) {
    await logError({
      context: "agents.trigger.swingVideoAnalyst",
      error,
      meta: { userId: opts.userId, sessionId: opts.sessionId },
      severity: "warn",
    });
  }
}

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
  } catch (err) {
    console.error("[trigger] round-agent feilet", err);
  }
}

export async function triggerTestAgent(userId: string): Promise<void> {
  try {
    await runTestAgent(userId);
    await runAchievementAgent(userId);
    await runTreningsdataEkspert(userId);
  } catch (err) {
    console.error("[trigger] test-agent feilet", err);
  }
}

export async function triggerTrackManAgent(userId: string): Promise<void> {
  try {
    await runTrackManAgent(userId);
  } catch (err) {
    console.error("[trigger] trackman-agent feilet", err);
  }
}

export async function triggerPeriodiseringsAgent(planId: string): Promise<void> {
  try {
    await runPeriodiseringsAgent(planId);
  } catch (err) {
    console.error("[trigger] periodiseringsagent feilet", err);
  }
}

export async function triggerTurneringAgent(): Promise<void> {
  try {
    await runTurneringAgent();
  } catch (err) {
    console.error("[trigger] turnering-agent feilet", err);
  }
}

export async function triggerLiveSessionAgent(opts: {
  userId: string;
  sessionId: string;
  kind: LiveSessionKind;
}): Promise<void> {
  try {
    await runLiveCoachAgent(opts);
  } catch (err) {
    console.error("[trigger] live-coach-agent feilet", err);
  }
}

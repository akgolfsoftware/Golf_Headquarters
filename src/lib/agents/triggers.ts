// Triggers — kalles fra server actions etter create-operasjoner.
// Alle er fire-and-forget (vi awaiter ikke i kallerne) men kjører synkront
// for enkelhet. Hvis de blir treige kan de flyttes til Inngest/Trigger.dev.

import { runRoundAgent } from "./round-agent";
import { runTestAgent } from "./test-agent";
import { runTrackManAgent } from "./trackman-agent";
import { runPeriodiseringsAgent } from "./periodiserings-agent";

export async function triggerRoundAgent(userId: string): Promise<void> {
  try {
    await runRoundAgent(userId);
  } catch (err) {
    console.error("[trigger] round-agent feilet", err);
  }
}

export async function triggerTestAgent(userId: string): Promise<void> {
  try {
    await runTestAgent(userId);
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

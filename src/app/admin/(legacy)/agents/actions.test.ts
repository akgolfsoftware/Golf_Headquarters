/**
 * R-I: admin/(legacy)/agents/actions.ts. Mission Control-agentkjøring er
 * ADMIN-only (ikke COACH) — testen bekrefter at COACH avvises like mye som
 * PLAYER/uinnlogget. Dekker også ruteren: et ukjent agentnavn gir `ok:false`
 * uten å kjøre noe, og et unntak fra selve agent-funksjonen fanges som
 * `ok:false` med feilmeldingen, ikke krasjer.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "admin-a",
  role: "ADMIN",
  name: "Admin A",
};

let planWatcherKall = 0;
let kastFraAgent: string | null = null;

function nullstill() {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  planWatcherKall = 0;
  kastFraAgent = null;
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async (options: { allow?: Rolle | Rolle[] }) => {
      if (!bruker) throw new Error("NEXT_REDIRECT");
      const tillatt = Array.isArray(options.allow) ? options.allow : options.allow ? [options.allow] : undefined;
      if (tillatt && !tillatt.includes(bruker.role)) throw new Error("NEXT_REDIRECT");
      return bruker;
    },
  },
});
function agentStub(kallteller?: { count: number }) {
  return async () => {
    if (kastFraAgent) throw new Error(kastFraAgent);
    if (kallteller) kallteller.count += 1;
  };
}
mock.module("@/lib/agents/plan-watcher", {
  namedExports: {
    runPlanWatcher: async () => {
      if (kastFraAgent) throw new Error(kastFraAgent);
      planWatcherKall += 1;
    },
  },
});
mock.module("@/lib/agents/training-gap", { namedExports: { runTrainingGap: agentStub() } });
mock.module("@/lib/agents/daily-brief-agent", { namedExports: { runDailyBrief: agentStub() } });
mock.module("@/lib/agents/drill-forslag-agent", { namedExports: { runDrillForslag: agentStub() } });
mock.module("@/lib/agents/booking-optimizer", { namedExports: { runBookingOptimizer: agentStub() } });
mock.module("@/lib/agents/availability-24-7-monitor", { namedExports: { runAvailabilityMonitor: agentStub() } });
mock.module("@/lib/agents/availability-gap-filler", { namedExports: { runAvailabilityGapFiller: agentStub() } });
mock.module("@/lib/agents/booking-conflict-monitor", { namedExports: { runBookingConflictMonitor: agentStub() } });
mock.module("@/lib/agents/ai-code-reviewer", { namedExports: { runAiCodeReviewer: agentStub() } });
mock.module("@/lib/agents/demand-predictor", { namedExports: { runDemandPredictor: agentStub() } });
mock.module("@/lib/agents/booking-alerts-proactive", { namedExports: { runProactiveBookingAlerts: agentStub() } });
mock.module("@/lib/agents/plan-effectiveness-agent", { namedExports: { runPlanEffectivenessAgent: agentStub() } });
mock.module("@/lib/agents/social-media-agent", { namedExports: { runSocialMediaAgent: agentStub() } });

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("triggerAgentManually avviser COACH (ADMIN-only)", async () => {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  const { triggerAgentManually } = await actions();
  await assert.rejects(() => triggerAgentManually("plan-watcher"));
  assert.equal(planWatcherKall, 0);
});

test("triggerAgentManually avviser PLAYER", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { triggerAgentManually } = await actions();
  await assert.rejects(() => triggerAgentManually("plan-watcher"));
  assert.equal(planWatcherKall, 0);
});

test("triggerAgentManually avviser uinnlogget", async () => {
  bruker = null;
  const { triggerAgentManually } = await actions();
  await assert.rejects(() => triggerAgentManually("plan-watcher"));
  assert.equal(planWatcherKall, 0);
});

test("triggerAgentManually avviser ukjent agentnavn med ok:false", async () => {
  const { triggerAgentManually } = await actions();
  const svar = await triggerAgentManually("finnes-ikke");
  assert.equal(svar.ok, false);
  assert.match(svar.melding, /Ukjent agent/);
  assert.equal(planWatcherKall, 0);
});

test("triggerAgentManually kjører riktig agent for ADMIN", async () => {
  const { triggerAgentManually } = await actions();
  const svar = await triggerAgentManually("plan-watcher");
  assert.equal(svar.ok, true);
  assert.equal(planWatcherKall, 1);
});

test("triggerAgentManually fanger unntak fra agenten som ok:false", async () => {
  kastFraAgent = "Agenten feilet";
  const { triggerAgentManually } = await actions();
  const svar = await triggerAgentManually("plan-watcher");
  assert.equal(svar.ok, false);
  assert.equal(svar.melding, "Agenten feilet");
});

test("MANUELLE_AGENTER lister alle 13 registrerte agenter", async () => {
  const { MANUELLE_AGENTER } = await actions();
  assert.equal(MANUELLE_AGENTER.length, 13);
  assert.ok(MANUELLE_AGENTER.includes("plan-watcher"));
});

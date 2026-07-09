// Tester for live-coach-agent: idempotent velkomst + trigger-kall.
//
// Bruker node:test sin modul-mocking (t.mock.module) for å unngå ekte
// Prisma/Anthropic-kall. Krever --experimental-test-module-mocks (satt i
// "test"-scriptet i package.json).
//
// VIKTIG mønster: hvert modul-under-test importeres KUN ÉN gang per fil
// (via dynamisk import etter t.mock.module). Node re-evaluerer ikke et
// allerede lastet ES-modul ved senere import()-kall, så en konsument som
// f.eks. triggers.ts som allerede er lastet, plukker IKKE opp en ny
// mock.module()-kall for sine avhengigheter. Derfor: én fersk import per
// spesifikator, med mutérbar mock-tilstand for å dekke flere scenarioer.
//
// Kjør med:
//   npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/__tests__/agents/live-coach-agent.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";

type MeldingRad = { role: string; content: string; ts: string };
type Thread = { id: string; messages: MeldingRad[] } | null;

test("runLiveCoachAgent — idempotent velkomst per økt", async (t) => {
  let eksisterendeThread: Thread = null;
  const updateCalls: unknown[] = [];
  const createCalls: unknown[] = [];
  const agentRunCalls: unknown[] = [];

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        coachingSession: {
          findUnique: async () => eksisterendeThread,
          update: async (args: unknown) => {
            updateCalls.push(args);
            return { id: "thread-updated" };
          },
          create: async (args: unknown) => {
            createCalls.push(args);
            return { id: "thread-created" };
          },
        },
        agentRun: {
          create: async (args: unknown) => {
            agentRunCalls.push(args);
            return { id: "run-1" };
          },
        },
      },
    },
  });

  const { runLiveCoachAgent } = await import("@/lib/agents/live-coach-agent");

  // Scenario 1: tråden finnes allerede MED en assistant-melding — idempotent
  // skip. Ingen update/create skal skje, og welcomeSent skal være false.
  eksisterendeThread = {
    id: "thread-1",
    messages: [
      { role: "assistant", content: "Nå kjører vi «Fredagsøkt».", ts: new Date().toISOString() },
    ],
  };

  const skipResult = await runLiveCoachAgent({
    userId: "user-1",
    sessionId: "session-1",
    kind: "session-v2",
  });
  const skipOutput = skipResult.output as { threadId: string; welcomeSent: boolean };

  assert.equal(skipOutput.welcomeSent, false, "skal skippe velkomst når assistant-melding finnes");
  assert.equal(skipOutput.threadId, "thread-1");
  assert.equal(updateCalls.length, 0, "coachingSession.update skal ikke kalles ved idempotent skip");
  assert.equal(createCalls.length, 0, "coachingSession.create skal ikke kalles ved idempotent skip");
  assert.equal(agentRunCalls.length, 1, "runAgent skal likevel logge kjøringen");
  assert.equal((agentRunCalls[0] as { data: { status: string } }).data.status, "OK");

  // Scenario 2: tråden finnes, men UTEN assistant-melding — dette skal IKKE
  // regnes som idempotent skip. Agenten fortsetter forbi sjekken og prøver å
  // hente økt-info (trainingSessionV2/trainingPlanSession er bevisst ikke
  // mocket her — full velkomst-generering dekkes av manuell UAT). Vi
  // bekrefter kun at logikken faktisk skiller mellom de to tilfellene ved at
  // den forsøker å gå videre (kaster på neste, umockede Prisma-kall) i
  // stedet for å ta idempotent-skip-veien.
  eksisterendeThread = {
    id: "thread-2",
    messages: [{ role: "user", content: "Klar!", ts: new Date().toISOString() }],
  };

  await assert.rejects(
    runLiveCoachAgent({ userId: "user-2", sessionId: "session-2", kind: "session-v2" }),
  );
});

test("triggerLiveSessionAgent kaller runLiveCoachAgent med riktig kind, og svelger feil", async (t) => {
  const captured: Array<{ userId: string; sessionId: string; kind: string }> = [];
  let skalKaste = false;

  t.mock.module("@/lib/agents/live-coach-agent", {
    namedExports: {
      runLiveCoachAgent: async (opts: { userId: string; sessionId: string; kind: string }) => {
        captured.push(opts);
        if (skalKaste) {
          throw new Error("simulert agent-feil");
        }
        return { signalsWritten: 0, planActionsWritten: 0, output: { welcomeSent: true } };
      },
    },
  });

  const { triggerLiveSessionAgent } = await import("@/lib/agents/triggers");

  await triggerLiveSessionAgent({ userId: "user-3", sessionId: "session-3", kind: "plan-session" });
  await triggerLiveSessionAgent({ userId: "user-4", sessionId: "session-4", kind: "session-v2" });

  assert.equal(captured.length, 2);
  assert.equal(captured[0].kind, "plan-session");
  assert.equal(captured[0].userId, "user-3");
  assert.equal(captured[0].sessionId, "session-3");
  assert.equal(captured[1].kind, "session-v2");
  assert.equal(captured[1].userId, "user-4");

  // Fire-and-forget: en feil i runLiveCoachAgent skal aldri lekke ut av triggeren.
  skalKaste = true;
  await assert.doesNotReject(
    triggerLiveSessionAgent({ userId: "user-5", sessionId: "session-5", kind: "plan-session" }),
  );
  assert.equal(captured.length, 3, "kallet skjedde selv om det endte i feil");
});

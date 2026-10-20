// Tester for 24-7-booking-alerts (A4, audit 20.10.2026): agenten lager aldri
// et forslag uten lesbar tekst, og høyst ett ventende forslag om gangen.
//
// Samme fallgruve som i plan-effectiveness-agent.test.ts: modulen under test
// importeres én gang, med mutérbar mock-tilstand, og scenarioene kjøres
// sekvensielt.
//
// Kjør med: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { harLesbartForslag, kravLesbartForslag } from "@/lib/agents/plan-action-innhold";

type CreateArgs = { data: { actionType: string; agentName: string; status: string; userId: string; suggestion: Record<string, unknown> } };

test("harLesbartForslag — tomme forslag avvises, tekstfelt godtas", () => {
  // Nøyaktig det 24-7-booking-alerts skrev før 20.10.2026 — og som innboksen viste som «—».
  assert.equal(harLesbartForslag({ agent: "24-7-booking-alerts", avail: 13 }), false);
  assert.equal(harLesbartForslag({ forklaring: "   " }), false);
  assert.equal(harLesbartForslag(null), false);
  assert.equal(harLesbartForslag("tekst"), false);
  assert.equal(harLesbartForslag({ forklaring: "13 ledige tider er åpne." }), true);
  assert.equal(harLesbartForslag({ note: "Forventet 0 bookinger." }), true);
  assert.equal(harLesbartForslag({ tittel: "Juster intensitet" }), true);
  assert.throws(() => kravLesbartForslag("test-agent", { avail: 1 }), /test-agent: forslaget mangler lesbar tekst/);
});

test("runProactiveBookingAlerts — lesbar tekst, duplikatsperre og terskel", async (t) => {
  let availCount = 13;
  let pending = 0;
  let venter: { id: string } | null = null;
  const createCalls: CreateArgs[] = [];

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        coachAvailability: { count: async () => availCount },
        booking: { count: async () => pending },
        planAction: {
          findFirst: async () => venter,
          create: async (args: CreateArgs) => {
            createCalls.push(args);
            return { id: `pa-${createCalls.length}` };
          },
        },
        user: { findFirst: async () => ({ id: "admin-1" }) },
        agentRun: { create: async () => ({ id: "run-1" }) },
      },
    },
  });

  const { runProactiveBookingAlerts } = await import("@/lib/agents/booking-alerts-proactive");

  // Scenario 1: mange ledige tider, ingen ventende forslag → ett forslag med lesbar tekst.
  const r1 = await runProactiveBookingAlerts();
  assert.equal(r1.planActionsWritten, 1);
  assert.equal(createCalls.length, 1);
  const { data } = createCalls[0];
  assert.equal(data.actionType, "PROACTIVE_BOOKING");
  assert.equal(data.agentName, "24-7-booking-alerts");
  assert.equal(data.userId, "admin-1");
  assert.equal(harLesbartForslag(data.suggestion), true, "forslaget skal ha lesbar tekst");
  assert.match(String(data.suggestion.forklaring), /13 ledige tider/);

  // Scenario 2: et ventende forslag finnes allerede → ingen ny rad (dette var lekkasjen: ett nytt hvert 20. minutt).
  venter = { id: "pa-1" };
  const r2 = await runProactiveBookingAlerts();
  assert.equal(r2.planActionsWritten, 0);
  assert.equal(createCalls.length, 1, "planAction.create skal ikke kalles når et forslag venter");

  // Scenario 3: under terskelen → ingenting, og planActionsWritten sier 0 (før sa den alltid 1).
  venter = null;
  availCount = 4;
  pending = 5;
  const r3 = await runProactiveBookingAlerts();
  assert.equal(r3.planActionsWritten, 0);
  assert.equal(createCalls.length, 1);
});

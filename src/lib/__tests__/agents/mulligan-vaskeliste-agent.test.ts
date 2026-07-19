// Tester for mulligan-vaskeliste-agent: runVaskelisteSjekk (bekreftet vs.
// ikke bekreftet-grensene) og bekreftVaskeliste (skriver riktig
// AgentRun-output). Se .claude/rules/mulligan-drift.md for regelen.
//
// Samme mock-mønster som gfgk-ballplukking-agent.test.ts: t.mock.module()
// på prisma + agent-notify FØR modulen under test importeres dynamisk — og
// (samme fallgruve som der) modulen under test importeres KUN ÉN GANG per
// fil, siden en senere import av samme spesifikator ikke rebindes til nye
// mocks. Derfor: ett oppsett, flere scenarioer sekvensielt med mutérbar
// mock-tilstand i stedet for separate test()-blokker med hver sin import.
//
// Kjør med: npm test

import { test } from "node:test";
import assert from "node:assert/strict";

type AgentRunCreateArgs = {
  data: {
    agentName: string;
    userId: string | null;
    status: string;
    duration: number;
    output?: unknown;
    error?: string;
  };
};

test("mulligan-vaskeliste-agent — runVaskelisteSjekk og bekreftVaskeliste", async (t) => {
  let bekreftelser: { createdAt: Date }[] = [];
  const agentRunCalls: AgentRunCreateArgs[] = [];
  const varsleCalls: unknown[] = [];

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        agentRun: {
          findMany: async () => bekreftelser,
          create: async (args: AgentRunCreateArgs) => {
            agentRunCalls.push(args);
            return { id: `run-${agentRunCalls.length}` };
          },
        },
        user: {
          findFirst: async () => ({ id: "admin-1", role: "ADMIN" }),
        },
      },
    },
  });

  t.mock.module("@/lib/agents/agent-notify", {
    namedExports: {
      varsleAgentFunn: async (v: unknown) => {
        varsleCalls.push(v);
      },
    },
  });

  const { runVaskelisteSjekk, bekreftVaskeliste } = await import(
    "@/lib/agents/mulligan-vaskeliste-agent"
  );

  const mandag = new Date("2026-07-20T08:00:00Z"); // uke 30

  // Scenario 1: ingen bekreftelse denne uka → ett varsel til Anders (ADMIN),
  // som kun ber ham koordinere med Christoffer — påstår aldri hvem sin tur
  // det er.
  bekreftelser = [];
  const result1 = await runVaskelisteSjekk(mandag);

  assert.equal(varsleCalls.length, 1, "Anders skal varsles én gang når uka ikke er bekreftet");
  const varsel = varsleCalls[0] as { coachId: string; tittel: string; tekst: string };
  assert.equal(varsel.coachId, "admin-1");
  assert.match(varsel.tekst, /Christoffer/);
  assert.doesNotMatch(
    varsel.tekst,
    /Anders har|Christoffer har/,
    "agenten skal ALDRI påstå hvem sin tur det er — kun be Anders koordinere",
  );
  assert.deepEqual(result1.output, { varslet: true, uke: 30 });
  assert.equal(agentRunCalls.length, 1, "runAgent skal logge sjekk-kjøringen");
  assert.equal(agentRunCalls[0].data.agentName, "mulligan-vaskeliste-sjekk");
  assert.equal(agentRunCalls[0].data.status, "OK");

  // Scenario 2: bekreftelse finnes for samme Oslo-uke → ingen varsling.
  varsleCalls.length = 0;
  agentRunCalls.length = 0;
  bekreftelser = [{ createdAt: new Date("2026-07-21T09:00:00Z") }];

  const result2 = await runVaskelisteSjekk(mandag);

  assert.equal(varsleCalls.length, 0, "ingen varsling når uka allerede er bekreftet");
  assert.deepEqual(result2.output, { varslet: false, aarsak: "allerede bekreftet" });

  // Scenario 3: bekreftVaskeliste med navngitt ansvarlig.
  agentRunCalls.length = 0;
  const svar1 = await bekreftVaskeliste("Christoffer", mandag);

  assert.equal(agentRunCalls.length, 1);
  assert.equal(agentRunCalls[0].data.agentName, "vaskeliste-bekreftet");
  assert.equal(agentRunCalls[0].data.userId, "admin-1");
  assert.deepEqual(agentRunCalls[0].data.output, { ansvarlig: "Christoffer", uke: 30 });
  assert.match(svar1, /Christoffer/);
  assert.match(svar1, /uke 30/);

  // Scenario 4: bekreftVaskeliste uten navn — fortsatt gyldig bekreftelse.
  agentRunCalls.length = 0;
  const svar2 = await bekreftVaskeliste(undefined, mandag);

  assert.equal(agentRunCalls.length, 1);
  assert.deepEqual(agentRunCalls[0].data.output, { ansvarlig: null, uke: 30 });
  assert.match(svar2, /Vaskeliste bekreftet for uke 30/);
});
